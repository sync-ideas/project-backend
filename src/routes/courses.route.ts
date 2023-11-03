import express from 'express';
import CoursesController from '../controllers/courses.controller.js';
import passport from '../middlewares/auth.mid.js';

const coursesRouter = express.Router();

coursesRouter.get(
    '/courses',
    passport.authenticate('adminJWT', { session: false }),
    CoursesController.getAll
)

coursesRouter.post(
    '/courses/register',
    passport.authenticate('adminJWT', { session: false }),
    CoursesController.create
);

coursesRouter.put(
    '/courses/update/:course_id',
    passport.authenticate('adminJWT', { session: false }),
    CoursesController.update
)

coursesRouter.delete(
    '/courses/delete/:course_id',
    passport.authenticate('adminJWT', { session: false }),
    CoursesController.delete
);

coursesRouter.get(
    '/courses/deleted',
    passport.authenticate('adminJWT', { session: false }),
    CoursesController.getDeleted
)

coursesRouter.put(
    '/courses/restore/:course_id',
    passport.authenticate('adminJWT', { session: false }),
    CoursesController.restore
)

export default coursesRouter;
