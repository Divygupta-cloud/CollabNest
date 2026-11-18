import { Router } from 'express';
import { commentController } from './controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createCommentSchema, updateCommentSchema } from './schema';

const router = Router();

router.use(authenticate);

router.get('/issue/:issueId', (req, res, next) =>
  commentController.getByIssue(req, res).catch(next)
);

router.post('/', validate(createCommentSchema), (req, res, next) =>
  commentController.create(req, res).catch(next)
);

router.put('/:id', validate(updateCommentSchema), (req, res, next) =>
  commentController.update(req, res).catch(next)
);

router.delete('/:id', (req, res, next) =>
  commentController.delete(req, res).catch(next)
);

export const commentRoutes = router;
