import express from 'express';
import passport from '../middlewares/auth.js';
import SubjectsController from '../controllers/subjects.controller.js';

const subjectsRouter = express.Router();

subjectsRouter.post(
    '/subjects/register',
    passport.authenticate('adminJWT', { session: false }),
    SubjectsController.create
);

subjectsRouter.put(
    '/subjects/update/:subjects_id',
    passport.authenticate('adminJWT', { session: false }),
    SubjectsController.update
)

subjectsRouter.delete(
  '/subjects/delete/:subject_id',
  passport.authenticate('userJWT', { session: false }),
  SubjectsController.delete
)

export default subjectsRouter;