import { LLMProvider, TicketClassificationResult } from './types';
import { OpenRouterProvider } from './providers/openrouter.provider';
import { normalizeTags } from './tag-normalizer';
import { logger } from '../../config/logger';
import { IssueModel } from '../issues/model';
import { ActivityModel } from '../activity/model';

class AIClassificationService {
  private provider: LLMProvider;

  constructor() {
    this.provider = new OpenRouterProvider();
    logger.info(`AIClassificationService initialized with provider: ${this.provider.name}`);
  }

  public setProvider(provider: LLMProvider) {
    this.provider = provider;
  }

  async classifyTicket(title: string, description: string): Promise<TicketClassificationResult> {
    const rawResult = await this.provider.classifyTicket({ title, description });
    return {
      category: rawResult.category,
      confidence: Math.min(1, Math.max(0, rawResult.confidence)),
      reason: rawResult.reason,
      suggestedTags: normalizeTags(rawResult.suggestedTags),
    };
  }

  async classifyIssue(issueId: string, actorId?: string): Promise<TicketClassificationResult | null> {
    const issue = await IssueModel.findById(issueId);
    if (!issue) return null;

    // AI Classification must ONLY run for Stories and Subtasks (NOT for Epics)
    if (issue.issueType === 'EPIC') {
      logger.info(`Skipping AI classification for issue ${issue.issueKey}: Epics are not eligible for AI classification.`);
      return null;
    }

    try {
      await IssueModel.findByIdAndUpdate(issueId, { aiStatus: 'PROCESSING' });

      const result = await this.classifyTicket(issue.title, issue.description);

      await IssueModel.findByIdAndUpdate(issueId, {
        aiCategory: result.category,
        aiConfidence: result.confidence,
        aiReason: result.reason,
        aiStatus: 'COMPLETED',
        // If finalCategory is not yet explicitly overridden, default it to aiCategory
        ...(issue.finalCategory ? {} : { finalCategory: result.category }),
      });

      // Audit log activity
      await ActivityModel.create({
        actorId: actorId || issue.reporterId,
        entityType: 'ISSUE',
        entityId: issue._id.toString(),
        action: 'AI_CLASSIFIED',
        oldValue: issue.aiCategory,
        newValue: result.category,
        metadata: {
          confidence: result.confidence,
          reason: result.reason,
          suggestedTags: result.suggestedTags,
        },
      });

      logger.info(`Issue ${issue.issueKey} (${issue.issueType}) classified as ${result.category} (${result.confidence})`);
      return result;
    } catch (err: any) {
      logger.error(`AI classification failed for issue ${issue.issueKey}`, err);

      await IssueModel.findByIdAndUpdate(issueId, {
        aiStatus: 'FAILED',
        aiCategory: 'others',
        aiReason: 'AI service temporarily unavailable or provider failed',
      });

      return null;
    }
  }

  // Non-blocking background worker
  classifyIssueInBackground(issueId: string, actorId?: string): void {
    setImmediate(() => {
      this.classifyIssue(issueId, actorId).catch((err) => {
        logger.error(`Background AI classification error for ${issueId}`, err);
      });
    });
  }
}

export const aiService = new AIClassificationService();
export const aiClassificationService = aiService;
