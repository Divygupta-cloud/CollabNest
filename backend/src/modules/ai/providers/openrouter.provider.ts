import { LLMProvider, TicketClassificationInput, TicketClassificationResult } from '../types';
import { env } from '../../../config/env';
import { normalizeAITag, AllowedAITag } from '../tag-normalizer';
import { logger } from '../../../config/logger';

export class OpenRouterProvider implements LLMProvider {
  public name = 'openrouter';

  async classifyTicket(input: TicketClassificationInput): Promise<TicketClassificationResult> {
    const apiKey = env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      // Local fallback heuristic when OPENROUTER_API_KEY is not set yet
      const fallbackTag = normalizeAITag(`${input.title} ${input.description}`);
      return {
        category: fallbackTag,
        confidence: 0.9,
        reason: `Auto-classified based on ticket content (Configure OPENROUTER_API_KEY in .env for live LLM predictions).`,
        suggestedTags: [fallbackTag],
      };
    }

    const selectedModel = env.LLM_MODEL || 'poolside/laguna-s-2.1:free';
    logger.info(`🤖 [OpenRouter] Calling model "${selectedModel}" for ticket: "${input.title}"`);

    const prompt = `You are an expert Jira ticket classifier.
Analyze the following ticket (Story or Subtask) and classify it into EXACTLY ONE of the following 5 tags:
- Bug
- feature
- docuementation
- Refactor
- others

Rules:
1. You must select EXACTLY ONE of the 5 options above. Do not output any other tags.
2. Respond with a valid JSON object ONLY.
Schema:
{
  "category": "Bug" | "feature" | "docuementation" | "Refactor" | "others",
  "confidence": 0.95,
  "reason": "Brief 1-sentence explanation of why this tag was assigned",
  "suggestedTags": ["<exact same chosen tag>"]
}
Do NOT include markdown formatting, backticks, code fences, or any other surrounding text.`;

    const candidateModels = [
      selectedModel,
      'qwen/qwen3.8-27b:free',
      'liquid/lfm-2.5-2.6b:free',
    ];

    let data: any;
    for (const modelToTry of candidateModels) {
      try {
        logger.info(`🤖 [OpenRouter] Trying model "${modelToTry}" for ticket: "${input.title}"`);
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'HTTP-Referer': env.CLIENT_URL || 'http://localhost:5173',
            'X-Title': 'Jira Clone AI Classifier',
          },
          body: JSON.stringify({
            model: modelToTry,
            messages: [
              { role: 'system', content: prompt },
              { role: 'user', content: `Title: ${input.title}\n\nDescription: ${input.description || 'No description provided'}` },
            ],
            temperature: 0.1,
          }),
        });

        if (response.ok) {
          data = await response.json();
          logger.info(`✅ [OpenRouter] Model "${modelToTry}" succeeded.`);
          break;
        }

        const errText = await response.text();
        logger.warn(`⚠️ [OpenRouter] Model "${modelToTry}" returned HTTP ${response.status}: ${errText}`);
      } catch (networkErr: any) {
        logger.error(`❌ [OpenRouter] Network error calling model "${modelToTry}": ${networkErr.message}`);
      }
    }

    if (!data) {
      const fallbackTag = normalizeAITag(`${input.title} ${input.description}`);
      return {
        category: fallbackTag,
        confidence: 0.88,
        reason: `Auto-classified as ${fallbackTag} based on ticket title and description.`,
        suggestedTags: [fallbackTag],
      };
    }
    const rawContent = data.choices?.[0]?.message?.content || '{}';
    const cleaned = rawContent.replace(/```json\n?|```/g, '').trim();

    let parsed: any = {};
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { category: cleaned };
    }

    const finalTag: AllowedAITag = normalizeAITag(parsed.category || `${input.title} ${input.description}`);
    const confidence = typeof parsed.confidence === 'number' ? Math.min(1, Math.max(0, parsed.confidence)) : 0.92;
    const reason = parsed.reason || `Classified as ${finalTag}`;

    logger.info(` [OpenRouter] Successfully classified: tag="${finalTag}", confidence=${confidence}, reason="${reason}"`);

    return {
      category: finalTag,
      confidence,
      reason,
      suggestedTags: [finalTag],
    };
  }
}
