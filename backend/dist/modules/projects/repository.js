"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectRepository = exports.ProjectRepository = void 0;
const model_1 = require("./model");
class ProjectRepository {
    async findAll(filter = {}) {
        return model_1.ProjectModel.find(filter)
            .populate('leadId', 'name username email avatarUrl role title')
            .populate('teamId', 'name department')
            .sort({ name: 1 });
    }
    async findById(id) {
        return model_1.ProjectModel.findById(id)
            .populate('leadId', 'name username email avatarUrl role title')
            .populate('teamId', 'name department');
    }
    async findByKey(key) {
        return model_1.ProjectModel.findOne({ key: key.toUpperCase() })
            .populate('leadId', 'name username email avatarUrl role title')
            .populate('teamId', 'name department');
    }
    async create(data) {
        return model_1.ProjectModel.create(data);
    }
    async update(id, updates) {
        return model_1.ProjectModel.findByIdAndUpdate(id, updates, { new: true })
            .populate('leadId', 'name username email avatarUrl role title')
            .populate('teamId', 'name department');
    }
    async delete(id) {
        return model_1.ProjectModel.findByIdAndDelete(id);
    }
    // Atomic counter increment for collision-safe issue key generation
    async getNextIssueNumber(projectId) {
        const updated = await model_1.ProjectModel.findByIdAndUpdate(projectId, { $inc: { nextIssueNumber: 1 } }, { new: true });
        return updated ? updated.nextIssueNumber - 1 : 101;
    }
}
exports.ProjectRepository = ProjectRepository;
exports.projectRepository = new ProjectRepository();
