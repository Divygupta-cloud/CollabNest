"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamController = exports.TeamController = void 0;
const service_1 = require("./service");
const api_response_1 = require("../../utils/api-response");
class TeamController {
    async listTeams(req, res, next) {
        try {
            const teams = await service_1.teamService.listTeams();
            return (0, api_response_1.sendSuccess)(res, teams, 200);
        }
        catch (err) {
            next(err);
        }
    }
    async getTeamById(req, res, next) {
        try {
            const team = await service_1.teamService.getTeamById(req.params.id);
            return (0, api_response_1.sendSuccess)(res, team, 200);
        }
        catch (err) {
            next(err);
        }
    }
    async createTeam(req, res, next) {
        try {
            const team = await service_1.teamService.createTeam(req.body, req.user.id);
            return (0, api_response_1.sendSuccess)(res, team, 201);
        }
        catch (err) {
            next(err);
        }
    }
    async updateTeam(req, res, next) {
        try {
            const team = await service_1.teamService.updateTeam(req.params.id, req.body, req.user.id, req.user.role);
            return (0, api_response_1.sendSuccess)(res, team, 200);
        }
        catch (err) {
            next(err);
        }
    }
    async assignLeader(req, res, next) {
        try {
            const team = await service_1.teamService.assignLeader(req.params.id, req.body.leaderId, req.user.id);
            return (0, api_response_1.sendSuccess)(res, team, 200);
        }
        catch (err) {
            next(err);
        }
    }
    async addMember(req, res, next) {
        try {
            const team = await service_1.teamService.addMember(req.params.id, req.body.userId, req.user.id, req.user.role);
            return (0, api_response_1.sendSuccess)(res, team, 200);
        }
        catch (err) {
            next(err);
        }
    }
    async removeMember(req, res, next) {
        try {
            const team = await service_1.teamService.removeMember(req.params.id, req.params.userId, req.user.id, req.user.role);
            return (0, api_response_1.sendSuccess)(res, team, 200);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.TeamController = TeamController;
exports.teamController = new TeamController();
