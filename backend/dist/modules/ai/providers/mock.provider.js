"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockLLMProvider = void 0;
class MockLLMProvider {
    name = 'mock';
    async classifyTicket(input) {
        const text = `${input.title} ${input.description}`.toLowerCase();
        let category = 'FEATURE';
        let confidence = 0.92;
        let reason = 'Request describes new capability or extension.';
        let suggestedTags = ['feature', 'backend'];
        if (text.includes('crash') ||
            text.includes('error') ||
            text.includes('500') ||
            text.includes('fail') ||
            text.includes('bug') ||
            text.includes('leak') ||
            text.includes('exception') ||
            text.includes('broken')) {
            category = 'BUG';
            confidence = 0.97;
            reason = 'Issue describes unexpected failure, exception, or broken application behavior.';
            suggestedTags = ['bug', 'investigation', 'fix'];
        }
        else if (text.includes('doc') ||
            text.includes('guide') ||
            text.includes('readme') ||
            text.includes('playbook') ||
            text.includes('wiki')) {
            category = 'DOCUMENTATION';
            confidence = 0.96;
            reason = 'Item concerns documentation, technical guidelines, or developer handbooks.';
            suggestedTags = ['documentation', 'guidelines'];
        }
        else if (text.includes('optimize') ||
            text.includes('speed') ||
            text.includes('performance') ||
            text.includes('refactor') ||
            text.includes('improve') ||
            text.includes('cleanup')) {
            category = 'IMPROVEMENT';
            confidence = 0.91;
            reason = 'Issue describes enhancement, performance optimization, or codebase refactoring.';
            suggestedTags = ['optimization', 'refactoring'];
        }
        else if (text.includes('test') ||
            text.includes('setup') ||
            text.includes('config') ||
            text.includes('infra') ||
            text.includes('deploy')) {
            category = 'TASK';
            confidence = 0.89;
            reason = 'General engineering or operational task.';
            suggestedTags = ['task', 'operations'];
        }
        return {
            category,
            confidence,
            reason,
            suggestedTags,
        };
    }
}
exports.MockLLMProvider = MockLLMProvider;
