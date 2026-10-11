import { Router } from 'express';
import { authenticate } from '../../common/middlewares/authenticate';
import { authorize } from '../../common/middlewares/authorize';
import { validate } from '../../common/middlewares/validate';
import { idParam } from '../../common/utils/objectId';
import { paginationQuery } from '../../common/utils/pagination';
import * as userController from './user.controller';
import { createUserSchema, updateProfileSchema, updateUserSchema } from './user.validation';

const router = Router();

router.use(authenticate);

router.get('/me', userController.getMe);
router.patch('/me', validate({ body: updateProfileSchema }), userController.updateMe);

router.use(authorize('admin'));

router
  .route('/')
  .get(validate({ query: paginationQuery }), userController.list)
  .post(validate({ body: createUserSchema }), userController.create);

router
  .route('/:id')
  .get(validate({ params: idParam }), userController.getById)
  .patch(validate({ params: idParam, body: updateUserSchema }), userController.update)
  .delete(validate({ params: idParam }), userController.remove);

export default router;
