"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamModel = void 0;
const mongoose_1 = require("mongoose");
const teamSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: '' },
    leaderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    memberIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    projectIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Project' }],
    department: { type: String, default: 'Engineering' },
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
exports.TeamModel = (0, mongoose_1.model)('Team', teamSchema);
