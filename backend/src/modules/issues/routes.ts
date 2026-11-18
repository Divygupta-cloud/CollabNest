import { Router } from 'express';
import { issueController } from './controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createIssueSchema,
  updateIssueSchema,
  updateStatusSchema,
  overrideCategorySchema,
} from './schema';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => issueController.getAll(req, res).catch(next));
router.get('/key/:key', (req, res, next) => issueController.getByKey(req, res).catch(next));
router.post('/ai-classify', (req, res, next) => issueController.aiClassify(req, res).catch(next));
router.get('/:id', (req, res, next) => issueController.getById(req, res).catch(next));

router.post('/', validate(createIssueSchema), (req, res, next) =>
  issueController.create(req, res).catch(next)
);

router.put('/:id', validate(updateIssueSchema), (req, res, next) =>
  issueController.update(req, res).catch(next)
);

router.patch('/:id', validate(updateIssueSchema), (req, res, next) =>
  issueController.update(req, res).catch(next)
);

router.patch('/:id/status', validate(updateStatusSchema), (req, res, next) =>
  issueController.updateStatus(req, res).catch(next)
);

router.patch(
  '/:id/category',
  requireRole(['ADMIN', 'MANAGER', 'TEAM_LEADER']),
  validate(overrideCategorySchema),
  (req, res, next) => issueController.overrideCategory(req, res).catch(next)
);

router.post(
  '/:id/reclassify',
  requireRole(['ADMIN', 'MANAGER', 'TEAM_LEADER']),
  (req, res, next) => issueController.reclassify(req, res).catch(next)
);

router.delete(
  '/:id',
  requireRole(['ADMIN', 'MANAGER', 'TEAM_LEADER']),
  (req, res, next) => issueController.delete(req, res).catch(next)
);

export const issueRoutes = router;
