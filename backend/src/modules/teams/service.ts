import { teamRepository } from './repository';
import { UserModel } from '../users/model';
import { ActivityModel } from '../activity/model';
import { NotificationModel } from '../notifications/model';
import { NotFoundError, BadRequestError, ConflictError, ForbiddenError } from '../../utils/errors';
import { Types } from 'mongoose';

export class TeamService {
  async listTeams() {
    return teamRepository.findAll();
  }

  async getTeamById(id: string) {
    const team = await teamRepository.findById(id);
    if (!team) throw new NotFoundError('Team not found');
    return team;
  }

  async createTeam(input: any, actorId: string) {
    const leader = await UserModel.findById(input.leaderId);
    if (!leader || !leader.isActive) {
      throw new BadRequestError('Assigned leader must be an active user');
    }

    const memberIds = input.memberIds ? [...new Set(input.memberIds)] : [input.leaderId];
    if (!memberIds.includes(input.leaderId)) {
      memberIds.push(input.leaderId);
    }

    const team = await teamRepository.create({
      name: input.name,
      description: input.description || '',
      leaderId: new Types.ObjectId(input.leaderId),
      memberIds: memberIds.map((id) => new Types.ObjectId(id)),
      projectIds: (input.projectIds || []).map((id: string) => new Types.ObjectId(id)),
      department: input.department || 'Engineering',
    });

    // Sync user.teamIds
    await UserModel.updateMany({ _id: { $in: memberIds } }, { $addToSet: { teamIds: team._id } });

    await ActivityModel.create({
      actorId,
      entityType: 'TEAM',
      entityId: team._id.toString(),
      action: 'TEAM_CREATED',
      newValue: team.name,
    });

    return team;
  }

  async updateTeam(id: string, updates: any, actorId?: string, actorRole?: string) {
    const team = await teamRepository.findById(id);
    if (!team) throw new NotFoundError('Team not found');

    if (
      (actorRole === 'TEAM_LEADER' || actorRole === 'TEAM_LEAD') &&
      team.leaderId.toString() !== actorId
    ) {
      throw new ForbiddenError('Team leaders can only update their own team details');
    }

    return teamRepository.update(id, updates);
  }

  async assignLeader(teamId: string, leaderId: string, actorId: string) {
    const team = await teamRepository.findById(teamId);
    if (!team) throw new NotFoundError('Team not found');

    const leader = await UserModel.findById(leaderId);
    if (!leader || !leader.isActive) {
      throw new BadRequestError('User does not exist or is inactive');
    }

    const oldLeaderId = team.leaderId.toString();

    // Update team leader and ensure leader is in memberIds
    const updated = await teamRepository.update(teamId, {
      leaderId: new Types.ObjectId(leaderId),
      $addToSet: { memberIds: new Types.ObjectId(leaderId) },
    } as any);

    // Sync user's teamIds
    await UserModel.findByIdAndUpdate(leaderId, { $addToSet: { teamIds: team._id } });

    // Activity log
    await ActivityModel.create({
      actorId,
      entityType: 'TEAM',
      entityId: teamId,
      action: 'TEAM_LEADER_ASSIGNED',
      oldValue: oldLeaderId,
      newValue: leaderId,
      metadata: { leaderName: leader.name, teamName: team.name },
    });

    // Notify new team leader
    await NotificationModel.create({
      recipientId: new Types.ObjectId(leaderId),
      type: 'TEAM_LEADER_ASSIGNED',
      title: 'Assigned as Team Leader',
      message: `You have been appointed Team Leader of ${team.name}`,
      entityType: 'TEAM',
      entityId: teamId,
      link: `/teams/${teamId}`,
    });

    return updated;
  }

  async addMember(teamId: string, userId: string, actorId: string, actorRole?: string) {
    const team = await teamRepository.findById(teamId);
    if (!team) throw new NotFoundError('Team not found');

    if (
      (actorRole === 'TEAM_LEADER' || actorRole === 'TEAM_LEAD') &&
      team.leaderId.toString() !== actorId
    ) {
      throw new ForbiddenError('Team leaders can only manage members of their own team');
    }

    const user = await UserModel.findById(userId);
    if (!user || !user.isActive) {
      throw new BadRequestError('User does not exist or is inactive');
    }

    const isAlreadyMember = team.memberIds.some((m) => m._id.toString() === userId);
    if (isAlreadyMember) {
      throw new ConflictError('User is already a member of this team');
    }

    const updated = await teamRepository.update(teamId, {
      $addToSet: { memberIds: new Types.ObjectId(userId) },
    } as any);

    await UserModel.findByIdAndUpdate(userId, { $addToSet: { teamIds: team._id } });

    await NotificationModel.create({
      recipientId: new Types.ObjectId(userId),
      type: 'TEAM_ASSIGNED',
      title: 'Added to Team',
      message: `You have been added to ${team.name}`,
      entityType: 'TEAM',
      entityId: teamId,
      link: `/teams/${teamId}`,
    });

    return updated;
  }

  async removeMember(teamId: string, userId: string, actorId: string, actorRole?: string) {
    const team = await teamRepository.findById(teamId);
    if (!team) throw new NotFoundError('Team not found');

    if (
      (actorRole === 'TEAM_LEADER' || actorRole === 'TEAM_LEAD') &&
      team.leaderId.toString() !== actorId
    ) {
      throw new ForbiddenError('Team leaders can only manage members of their own team');
    }

    if (team.leaderId.toString() === userId) {
      throw new BadRequestError('Cannot remove the Team Leader. Please reassign the team leader first.');
    }

    const updated = await teamRepository.update(teamId, {
      $pull: { memberIds: new Types.ObjectId(userId) },
    } as any);

    await UserModel.findByIdAndUpdate(userId, { $pull: { teamIds: team._id } });

    return updated;
  }
}

export const teamService = new TeamService();
