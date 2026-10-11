import { Router } from 'express';
import { authenticate } from '../../common/middlewares/authenticate';
import { authorize } from '../../common/middlewares/authorize';
import { validate } from '../../common/middlewares/validate';
import { idParam } from '../../common/utils/objectId';
import { paginationQuery } from '../../common/utils/pagination';
import * as noteController from './note.controller';
import { allNotesQuery, createNoteSchema, updateNoteSchema } from './note.validation';

const router = Router();

router.use(authenticate);

router.get('/all', authorize('admin'), validate({ query: allNotesQuery }), noteController.listAll);

router
  .route('/')
  .get(validate({ query: paginationQuery }), noteController.listMine)
  .post(validate({ body: createNoteSchema }), noteController.create);

router
  .route('/:id')
  .get(validate({ params: idParam }), noteController.getById)
  .patch(validate({ params: idParam, body: updateNoteSchema }), noteController.update)
  .delete(validate({ params: idParam }), noteController.remove);

export default router;
