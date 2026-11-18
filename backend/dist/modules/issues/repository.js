"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueRepository = exports.IssueRepository = void 0;
const model_1 = require("./model");
class IssueRepository {
    async findAll(filter = {}, pagination) {
        const query = {
            isDeleted: filter.isDeleted ?? false,
        };
        if (filter.projectId)
            query.projectId = filter.projectId;
        if (filter.sprintId !== undefined)
            query.sprintId = filter.sprintId;
        if (filter.assigneeId)
            query.assigneeId = filter.assigneeId;
        if (filter.reporterId)
            query.reporterId = filter.reporterId;
        if (filter.teamId)
            query.teamId = filter.teamId;
        if (filter.issueType)
            query.issueType = filter.issueType;
        if (filter.status)
            query.status = filter.status;
        if (filter.priority)
            query.priority = filter.priority;
        if (filter.aiCategory)
            query.aiCategory = filter.aiCategory;
        if (filter.finalCategory)
            query.finalCategory = filter.finalCategory;
        if (filter.search) {
            query.$or = [
                { title: { $regex: filter.search, $options: 'i' } },
                { issueKey: { $regex: filter.search, $options: 'i' } },
                { description: { $regex: filter.search, $options: 'i' } },
                { labels: { $regex: filter.search, $options: 'i' } },
            ];
        }
        const total = await model_1.IssueModel.countDocuments(query);
        let mongoQuery = model_1.IssueModel.find(query)
            .populate('assigneeId', 'name username email avatarUrl role title')
            .populate('reporterId', 'name username email avatarUrl role title')
            .populate('projectId', 'name key iconBgColor')
            .populate('teamId', 'name department');
        if (pagination?.sortBy) {
            const sortOrder = pagination.sortOrder === 'desc' ? -1 : 1;
            mongoQuery = mongoQuery.sort({ [pagination.sortBy]: sortOrder });
        }
        else {
            mongoQuery = mongoQuery.sort({ rank: 1, createdAt: -1 });
        }
        if (pagination) {
            const skip = (pagination.page - 1) * pagination.limit;
            mongoQuery = mongoQuery.skip(skip).limit(pagination.limit);
        }
        const issues = await mongoQuery.exec();
        return { issues, total };
    }
    async findById(id) {
        return model_1.IssueModel.findOne({ _id: id, isDeleted: false })
            .populate('assigneeId', 'name username email avatarUrl role title')
            .populate('reporterId', 'name username email avatarUrl role title')
            .populate('projectId', 'name key iconBgColor')
            .populate('teamId', 'name department')
            .populate('sprintId', 'name status');
    }
    async findByKey(issueKey) {
        return model_1.IssueModel.findOne({ issueKey: issueKey.toUpperCase(), isDeleted: false })
            .populate('assigneeId', 'name username email avatarUrl role title')
            .populate('reporterId', 'name username email avatarUrl role title')
            .populate('projectId', 'name key iconBgColor')
            .populate('teamId', 'name department')
            .populate('sprintId', 'name status');
    }
    async create(data) {
        return model_1.IssueModel.create(data);
    }
    async update(id, updates) {
        return model_1.IssueModel.findByIdAndUpdate(id, updates, { new: true })
            .populate('assigneeId', 'name username email avatarUrl role title')
            .populate('reporterId', 'name username email avatarUrl role title')
            .populate('projectId', 'name key iconBgColor')
            .populate('teamId', 'name department')
            .populate('sprintId', 'name status');
    }
    async softDelete(id, userId) {
        return model_1.IssueModel.findByIdAndUpdate(id, {
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy: userId,
        }, { new: true });
    }
    async count(query = {}) {
        return model_1.IssueModel.countDocuments({ isDeleted: false, ...query });
    }
}
exports.IssueRepository = IssueRepository;
exports.issueRepository = new IssueRepository();
