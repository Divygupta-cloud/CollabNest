"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
exports.sendPaginated = sendPaginated;
function sendSuccess(res, data, statusCode = 200, pagination) {
    const responseBody = {
        success: true,
        data,
        ...(pagination ? { pagination } : {}),
    };
    return res.status(statusCode).json(responseBody);
}
function sendError(res, message, statusCode = 500, code = 'ERROR', details) {
    const responseBody = {
        success: false,
        error: {
            code,
            message,
            ...(details ? { details } : {}),
        },
    };
    return res.status(statusCode).json(responseBody);
}
function sendPaginated(res, data, total, page, limit, statusCode = 200) {
    return sendSuccess(res, data, statusCode, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    });
}
