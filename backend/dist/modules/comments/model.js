"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentModel = void 0;
const mongoose_1 = require("mongoose");
const commentSchema = new mongoose_1.Schema({
    issueId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Issue', required: true, index: true },
    authorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, required: true, trim: true },
    isEdited: { type: Boolean, default: false },
}, {
    timestamps: true,
    toJSON: {
        transform(_doc, ret) {
            ret.id = ret._id;
            delete ret.__v;
            return ret;
        },
    },
});
exports.CommentModel = (0, mongoose_1.model)('Comment', commentSchema);
