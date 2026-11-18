"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIProvider = void 0;
const env_1 = require("../../../config/env");
class OpenAIProvider {
    name = 'openai';
    async classifyTicket(input) {
        if (!env_1.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY is not configured');
        }
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${env_1.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: env_1.env.LLM_MODEL || 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'Classify Jira tickets into exactly one of: BUG, FEATURE, IMPROVEMENT, DOCUMENTATION, TASK, OTHER. Respond only in JSON with fields category, confidence (0.0-1.0), reason, suggestedTags (array of strings).',
                    },
                    {
                        role: 'user',
                        content: `Title: ${input.title}\nDescription: ${input.description}`,
                    },
                ],
                response_format: { type: 'json_object' },
            }),
        });
        if (!response.ok) {
            throw new Error(`OpenAI HTTP error ${response.status}: ${await response.text()}`);
        }
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        const parsed = JSON.parse(content);
        const validCategories = ['BUG', 'FEATURE', 'IMPROVEMENT', 'DOCUMENTATION', 'TASK', 'OTHER'];
        const category = validCategories.includes(parsed.category) ? parsed.category : 'OTHER';
        return {
            category,
            confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.9,
            reason: parsed.reason || 'Classified via OpenAI',
            suggestedTags: Array.isArray(parsed.suggestedTags) ? parsed.suggestedTags : [],
        };
    }
}
exports.OpenAIProvider = OpenAIProvider;
