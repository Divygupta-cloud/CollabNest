"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALLOWED_TAGS = void 0;
exports.normalizeAITag = normalizeAITag;
exports.normalizeTags = normalizeTags;
exports.ALLOWED_TAGS = [
    'Bug',
    'feature',
    'docuementation',
    'Refactor',
    'others',
];
function normalizeAITag(raw = '') {
    const lower = (raw || '').toLowerCase().trim();
    if (lower.includes('bug') ||
        lower.includes('error') ||
        lower.includes('crash') ||
        lower.includes('fail') ||
        lower.includes('defect') ||
        lower.includes('fix')) {
        return 'Bug';
    }
    if (lower.includes('doc') ||
        lower.includes('guide') ||
        lower.includes('readme') ||
        lower.includes('wiki')) {
        return 'docuementation';
    }
    if (lower.includes('refactor') ||
        lower.includes('clean') ||
        lower.includes('optimize') ||
        lower.includes('improve') ||
        lower.includes('speed') ||
        lower.includes('perf')) {
        return 'Refactor';
    }
    if (lower.includes('feature') ||
        lower.includes('feat') ||
        lower.includes('add') ||
        lower.includes('implement') ||
        lower.includes('support') ||
        lower.includes('story')) {
        return 'feature';
    }
    return 'others';
}
function normalizeTags(rawTags = []) {
    // If an array of tags is passed, find the first matching allowed tag, or default to others
    for (const tag of rawTags) {
        const matched = normalizeAITag(tag);
        if (matched !== 'others') {
            return [matched];
        }
    }
    if (rawTags.length > 0) {
        return [normalizeAITag(rawTags[0])];
    }
    return ['others'];
}
