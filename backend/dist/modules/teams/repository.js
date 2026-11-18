"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamRepository = exports.TeamRepository = void 0;
const model_1 = require("./model");
class TeamRepository {
    async findAll() {
        return model_1.TeamModel.find()
            .populate('leaderId', 'name username email avatarUrl role title')
            .populate('memberIds', 'name username email avatarUrl role title department')
            .populate('projectIds', 'name key category iconBgColor');
    }
    async findById(id) {
        return model_1.TeamModel.findById(id)
            .populate('leaderId', 'name username email avatarUrl role title')
            .populate('memberIds', 'name username email avatarUrl role title department')
            .populate('projectIds', 'name key category iconBgColor');
    }
    async create(data) {
        return model_1.TeamModel.create(data);
    }
    async update(id, updates) {
        return model_1.TeamModel.findByIdAndUpdate(id, updates, { new: true })
            .populate('leaderId', 'name username email avatarUrl role title')
            .populate('memberIds', 'name username email avatarUrl role title department')
            .populate('projectIds', 'name key category iconBgColor');
    }
    async delete(id) {
        return model_1.TeamModel.findByIdAndDelete(id);
    }
}
exports.TeamRepository = TeamRepository;
exports.teamRepository = new TeamRepository();
