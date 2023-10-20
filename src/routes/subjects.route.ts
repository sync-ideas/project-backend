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

export default subjectsRouter;
