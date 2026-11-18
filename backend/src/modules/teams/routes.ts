import { Router } from 'express';
import { teamController } from './controller';
import { createTeamSchema, updateTeamSchema, assignLeaderSchema, addMemberSchema } from './schema';
import { validateRequest } from '../../middleware/validate.middleware';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', teamController.listTeams);
router.post('/', requireRole('ADMIN'), validateRequest({ body: createTeamSchema }), teamController.createTeam);

router.get('/:id', teamController.getTeamById);
router.patch('/:id', requireRole('ADMIN', 'MANAGER', 'TEAM_LEADER'), validateRequest({ body: updateTeamSchema }), teamController.updateTeam);

router.patch('/:id/leader', requireRole('ADMIN', 'MANAGER'), validateRequest({ body: assignLeaderSchema }), teamController.assignLeader);

router.post('/:id/members', requireRole('ADMIN', 'MANAGER', 'TEAM_LEADER'), validateRequest({ body: addMemberSchema }), teamController.addMember);
router.delete('/:id/members/:userId', requireRole('ADMIN', 'MANAGER', 'TEAM_LEADER'), teamController.removeMember);

export const teamRoutes = router;
