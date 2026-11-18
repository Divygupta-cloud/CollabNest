"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenRouterProvider = void 0;
const env_1 = require("../../../config/env");
const tag_normalizer_1 = require("../tag-normalizer");
class OpenRouterProvider {
    name = 'openrouter';
    async classifyTicket(input) {
        const apiKey = env_1.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            // Local fallback heuristic when OPENROUTER_API_KEY is not set yet
            const fallbackTag = (0, tag_normalizer_1.normalizeAITag)(`${input.title} ${input.description}`);
            return {
                category: fallbackTag,
                confidence: 0.9,
                reason: `Auto-classified based on ticket content (Configure OPENROUTER_API_KEY in .env for live LLM predictions).`,
                suggestedTags: [fallbackTag],
            };
        }
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
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
                'HTTP-Referer': env_1.env.CLIENT_URL || 'http://localhost:5173',
                'X-Title': 'Jira Clone AI Classifier',
            },
            body: JSON.stringify({
                model: env_1.env.LLM_MODEL || 'poolside/laguna-s-2.1:free',
                messages: [
                    { role: 'system', content: prompt },
                    { role: 'user', content: `Title: ${input.title}\n\nDescription: ${input.description || 'No description provided'}` },
                ],
                temperature: 0.1,
            }),
        });
        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`OpenRouter HTTP error ${response.status}: ${errText}`);
        }
        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content || '{}';
        const cleaned = rawContent.replace(/```json\n?|```/g, '').trim();
        let parsed = {};
        try {
            parsed = JSON.parse(cleaned);
        }
        catch {
            parsed = { category: cleaned };
        }
        const finalTag = (0, tag_normalizer_1.normalizeAITag)(parsed.category || `${input.title} ${input.description}`);
        return {
            category: finalTag,
            confidence: typeof parsed.confidence === 'number' ? Math.min(1, Math.max(0, parsed.confidence)) : 0.92,
            reason: parsed.reason || `Classified as ${finalTag}`,
            suggestedTags: [finalTag],
        };
    }
}
exports.OpenRouterProvider = OpenRouterProvider;
