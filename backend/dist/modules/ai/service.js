"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiClassificationService = exports.aiService = void 0;
const openrouter_provider_1 = require("./providers/openrouter.provider");
const tag_normalizer_1 = require("./tag-normalizer");
const logger_1 = require("../../config/logger");
const model_1 = require("../issues/model");
const model_2 = require("../activity/model");
class AIClassificationService {
    provider;
    constructor() {
        this.provider = new openrouter_provider_1.OpenRouterProvider();
        logger_1.logger.info(`AIClassificationService initialized with provider: ${this.provider.name}`);
    }
    setProvider(provider) {
        this.provider = provider;
    }
    async classifyTicket(title, description) {
        const rawResult = await this.provider.classifyTicket({ title, description });
        return {
            category: rawResult.category,
            confidence: Math.min(1, Math.max(0, rawResult.confidence)),
            reason: rawResult.reason,
            suggestedTags: (0, tag_normalizer_1.normalizeTags)(rawResult.suggestedTags),
        };
    }
    async classifyIssue(issueId, actorId) {
        const issue = await model_1.IssueModel.findById(issueId);
        if (!issue)
            return null;
        // AI Classification must ONLY run for Stories and Subtasks (NOT for Epics)
        if (issue.issueType === 'EPIC') {
            logger_1.logger.info(`Skipping AI classification for issue ${issue.issueKey}: Epics are not eligible for AI classification.`);
            return null;
        }
        try {
            await model_1.IssueModel.findByIdAndUpdate(issueId, { aiStatus: 'PROCESSING' });
            const result = await this.classifyTicket(issue.title, issue.description);
            await model_1.IssueModel.findByIdAndUpdate(issueId, {
                aiCategory: result.category,
                aiConfidence: result.confidence,
                aiReason: result.reason,
                aiStatus: 'COMPLETED',
                // If finalCategory is not yet explicitly overridden, default it to aiCategory
                ...(issue.finalCategory ? {} : { finalCategory: result.category }),
            });
            // Audit log activity
            await model_2.ActivityModel.create({
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
            logger_1.logger.info(`Issue ${issue.issueKey} (${issue.issueType}) classified as ${result.category} (${result.confidence})`);
            return result;
        }
        catch (err) {
            logger_1.logger.error(`AI classification failed for issue ${issue.issueKey}`, err);
            await model_1.IssueModel.findByIdAndUpdate(issueId, {
                aiStatus: 'FAILED',
                aiCategory: 'others',
                aiReason: 'AI service temporarily unavailable or provider failed',
            });
            return null;
        }
    }
    // Non-blocking background worker
    classifyIssueInBackground(issueId, actorId) {
        setImmediate(() => {
            this.classifyIssue(issueId, actorId).catch((err) => {
                logger_1.logger.error(`Background AI classification error for ${issueId}`, err);
            });
        });
    }
}
exports.aiService = new AIClassificationService();
exports.aiClassificationService = exports.aiService;
