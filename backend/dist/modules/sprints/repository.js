"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sprintRepository = exports.SprintRepository = void 0;
const model_1 = require("./model");
class SprintRepository {
    async findByProjectId(projectId) {
        return model_1.SprintModel.find({ projectId })
            .populate({
            path: 'issueIds',
            populate: [
                { path: 'assigneeId', select: 'name username avatarUrl role' },
                { path: 'reporterId', select: 'name username avatarUrl role' },
            ],
        })
            .sort({ createdAt: 1 });
    }
    async findById(id) {
        return model_1.SprintModel.findById(id).populate({
            path: 'issueIds',
            populate: [
                { path: 'assigneeId', select: 'name username avatarUrl role' },
                { path: 'reporterId', select: 'name username avatarUrl role' },
            ],
        });
    }
    async findActiveSprint(projectId) {
        return model_1.SprintModel.findOne({ projectId, status: 'ACTIVE' });
    }
    async create(data) {
        return model_1.SprintModel.create(data);
    }
    async update(id, updates) {
        return model_1.SprintModel.findByIdAndUpdate(id, updates, { new: true }).populate({
            path: 'issueIds',
            populate: [
                { path: 'assigneeId', select: 'name username avatarUrl role' },
                { path: 'reporterId', select: 'name username avatarUrl role' },
            ],
        });
    }
    async delete(id) {
        return model_1.SprintModel.findByIdAndDelete(id);
    }
}
exports.SprintRepository = SprintRepository;
exports.sprintRepository = new SprintRepository();
