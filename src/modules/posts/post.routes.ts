import { Router } from 'express';
import { authenticate } from '../../common/middlewares/authenticate';
import { validate } from '../../common/middlewares/validate';
import { idParam } from '../../common/utils/objectId';
import { paginationQuery } from '../../common/utils/pagination';
import * as postController from './post.controller';
import { createPostSchema, updatePostSchema, userIdParam } from './post.validation';

const router = Router();

router.use(authenticate);

router.get(
  '/user/:userId',
  validate({ params: userIdParam, query: paginationQuery }),
  postController.listByUser,
);

router
  .route('/')
  .get(validate({ query: paginationQuery }), postController.list)
  .post(validate({ body: createPostSchema }), postController.create);

router
  .route('/:id')
  .get(validate({ params: idParam }), postController.getById)
  .patch(validate({ params: idParam, body: updatePostSchema }), postController.update)
  .delete(validate({ params: idParam }), postController.remove);

export default router;
