"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamService = exports.TeamService = void 0;
const repository_1 = require("./repository");
const model_1 = require("../users/model");
const model_2 = require("../activity/model");
const model_3 = require("../notifications/model");
const errors_1 = require("../../utils/errors");
const mongoose_1 = require("mongoose");
class TeamService {
    async listTeams() {
        return repository_1.teamRepository.findAll();
    }
    async getTeamById(id) {
        const team = await repository_1.teamRepository.findById(id);
        if (!team)
            throw new errors_1.NotFoundError('Team not found');
        return team;
    }
    async createTeam(input, actorId) {
        const leader = await model_1.UserModel.findById(input.leaderId);
        if (!leader || !leader.isActive) {
            throw new errors_1.BadRequestError('Assigned leader must be an active user');
        }
        const memberIds = input.memberIds ? [...new Set(input.memberIds)] : [input.leaderId];
        if (!memberIds.includes(input.leaderId)) {
            memberIds.push(input.leaderId);
        }
        const team = await repository_1.teamRepository.create({
            name: input.name,
            description: input.description || '',
            leaderId: new mongoose_1.Types.ObjectId(input.leaderId),
            memberIds: memberIds.map((id) => new mongoose_1.Types.ObjectId(id)),
            projectIds: (input.projectIds || []).map((id) => new mongoose_1.Types.ObjectId(id)),
            department: input.department || 'Engineering',
        });
        // Sync user.teamIds
        await model_1.UserModel.updateMany({ _id: { $in: memberIds } }, { $addToSet: { teamIds: team._id } });
        await model_2.ActivityModel.create({
            actorId,
            entityType: 'TEAM',
            entityId: team._id.toString(),
            action: 'TEAM_CREATED',
            newValue: team.name,
        });
        return team;
    }
    async updateTeam(id, updates, actorId, actorRole) {
        const team = await repository_1.teamRepository.findById(id);
        if (!team)
            throw new errors_1.NotFoundError('Team not found');
        if ((actorRole === 'TEAM_LEADER' || actorRole === 'TEAM_LEAD') &&
            team.leaderId.toString() !== actorId) {
            throw new errors_1.ForbiddenError('Team leaders can only update their own team details');
        }
        return repository_1.teamRepository.update(id, updates);
    }
    async assignLeader(teamId, leaderId, actorId) {
        const team = await repository_1.teamRepository.findById(teamId);
        if (!team)
            throw new errors_1.NotFoundError('Team not found');
        const leader = await model_1.UserModel.findById(leaderId);
        if (!leader || !leader.isActive) {
            throw new errors_1.BadRequestError('User does not exist or is inactive');
        }
        const oldLeaderId = team.leaderId.toString();
        // Update team leader and ensure leader is in memberIds
        const updated = await repository_1.teamRepository.update(teamId, {
            leaderId: new mongoose_1.Types.ObjectId(leaderId),
            $addToSet: { memberIds: new mongoose_1.Types.ObjectId(leaderId) },
        });
        // Sync user's teamIds
        await model_1.UserModel.findByIdAndUpdate(leaderId, { $addToSet: { teamIds: team._id } });
        // Activity log
        await model_2.ActivityModel.create({
            actorId,
            entityType: 'TEAM',
            entityId: teamId,
            action: 'TEAM_LEADER_ASSIGNED',
            oldValue: oldLeaderId,
            newValue: leaderId,
            metadata: { leaderName: leader.name, teamName: team.name },
        });
        // Notify new team leader
        await model_3.NotificationModel.create({
            recipientId: new mongoose_1.Types.ObjectId(leaderId),
            type: 'TEAM_LEADER_ASSIGNED',
            title: 'Assigned as Team Leader',
            message: `You have been appointed Team Leader of ${team.name}`,
            entityType: 'TEAM',
            entityId: teamId,
            link: `/teams/${teamId}`,
        });
        return updated;
    }
    async addMember(teamId, userId, actorId, actorRole) {
        const team = await repository_1.teamRepository.findById(teamId);
        if (!team)
            throw new errors_1.NotFoundError('Team not found');
        if ((actorRole === 'TEAM_LEADER' || actorRole === 'TEAM_LEAD') &&
            team.leaderId.toString() !== actorId) {
            throw new errors_1.ForbiddenError('Team leaders can only manage members of their own team');
        }
        const user = await model_1.UserModel.findById(userId);
        if (!user || !user.isActive) {
            throw new errors_1.BadRequestError('User does not exist or is inactive');
        }
        const isAlreadyMember = team.memberIds.some((m) => m._id.toString() === userId);
        if (isAlreadyMember) {
            throw new errors_1.ConflictError('User is already a member of this team');
        }
        const updated = await repository_1.teamRepository.update(teamId, {
            $addToSet: { memberIds: new mongoose_1.Types.ObjectId(userId) },
        });
        await model_1.UserModel.findByIdAndUpdate(userId, { $addToSet: { teamIds: team._id } });
        await model_3.NotificationModel.create({
            recipientId: new mongoose_1.Types.ObjectId(userId),
            type: 'TEAM_ASSIGNED',
            title: 'Added to Team',
            message: `You have been added to ${team.name}`,
            entityType: 'TEAM',
            entityId: teamId,
            link: `/teams/${teamId}`,
        });
        return updated;
    }
    async removeMember(teamId, userId, actorId, actorRole) {
        const team = await repository_1.teamRepository.findById(teamId);
        if (!team)
            throw new errors_1.NotFoundError('Team not found');
        if ((actorRole === 'TEAM_LEADER' || actorRole === 'TEAM_LEAD') &&
            team.leaderId.toString() !== actorId) {
            throw new errors_1.ForbiddenError('Team leaders can only manage members of their own team');
        }
        if (team.leaderId.toString() === userId) {
            throw new errors_1.BadRequestError('Cannot remove the Team Leader. Please reassign the team leader first.');
        }
        const updated = await repository_1.teamRepository.update(teamId, {
            $pull: { memberIds: new mongoose_1.Types.ObjectId(userId) },
        });
        await model_1.UserModel.findByIdAndUpdate(userId, { $pull: { teamIds: team._id } });
        return updated;
    }
}
exports.TeamService = TeamService;
exports.teamService = new TeamService();
