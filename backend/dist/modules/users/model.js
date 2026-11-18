"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
        type: String,
        enum: [
            'ADMIN',
            'MANAGER',
            'TEAM_LEADER',
            'TEAM_LEAD',
            'DEVELOPER',
            'QA',
            'EMPLOYEE',
        ],
        default: 'EMPLOYEE',
        index: true,
    },
    teamIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Team' }],
    title: { type: String, default: 'Software Engineer' },
    department: { type: String, default: 'Engineering' },
    avatarUrl: { type: String },
    isActive: { type: Boolean, default: true, index: true },
}, {
    timestamps: true,
    toJSON: {
        transform(_doc, ret) {
            delete ret.passwordHash;
            ret.id = ret._id;
            delete ret.__v;
            return ret;
        },
    },
});
exports.UserModel = (0, mongoose_1.model)('User', userSchema);
