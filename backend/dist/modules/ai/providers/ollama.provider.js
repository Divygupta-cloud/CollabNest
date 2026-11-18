"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaProvider = void 0;
const env_1 = require("../../../config/env");
class OllamaProvider {
    name = 'ollama';
    async classifyTicket(input) {
        const prompt = `You are a Jira issue classifier. Classify this ticket into exactly one category: BUG, FEATURE, IMPROVEMENT, DOCUMENTATION, TASK, OTHER.
Return ONLY valid JSON matching this schema:
{
  "category": "BUG" | "FEATURE" | "IMPROVEMENT" | "DOCUMENTATION" | "TASK" | "OTHER",
  "confidence": number between 0.0 and 1.0,
  "reason": "short explanation",
  "suggestedTags": ["tag1", "tag2"]
}

Ticket Title: ${input.title}
Ticket Description: ${input.description}
`;
        const url = `${env_1.env.OLLAMA_BASE_URL}/api/generate`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: env_1.env.LLM_MODEL || 'llama3',
                prompt,
                format: 'json',
                stream: false,
            }),
        });
        if (!response.ok) {
            throw new Error(`Ollama HTTP error ${response.status}: ${await response.text()}`);
        }
        const data = await response.json();
        const parsed = JSON.parse(data.response);
        const validCategories = ['BUG', 'FEATURE', 'IMPROVEMENT', 'DOCUMENTATION', 'TASK', 'OTHER'];
        const category = validCategories.includes(parsed.category) ? parsed.category : 'OTHER';
        return {
            category,
            confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.85,
            reason: parsed.reason || 'Classified via Ollama',
            suggestedTags: Array.isArray(parsed.suggestedTags) ? parsed.suggestedTags : [],
        };
    }
}
exports.OllamaProvider = OllamaProvider;
