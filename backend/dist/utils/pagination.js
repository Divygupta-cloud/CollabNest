"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePaginationParams = void 0;
exports.getPaginationOptions = getPaginationOptions;
function getPaginationOptions(query, defaultSortBy = 'createdAt') {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const requestedLimit = parseInt(query.limit, 10) || 20;
    const limit = Math.min(100, Math.max(1, requestedLimit));
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy || defaultSortBy;
    const order = query.order === 'asc' || query.sortOrder === 'asc' ? 'asc' : 'desc';
    return { page, limit, skip, sortBy, order, sortOrder: order };
}
exports.parsePaginationParams = getPaginationOptions;
