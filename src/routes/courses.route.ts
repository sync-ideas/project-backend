import express from 'express';
import CoursesController from '../controllers/courses.controller.js';

const coursesRouter = express.Router();

coursesRouter.get(
    '/courses',
    CoursesController.getAll
)

coursesRouter.post(
    '/courses/register',
    CoursesController.create
);

coursesRouter.put(
    '/courses/update',
    CoursesController.update
)

coursesRouter.delete(
    '/courses/delete',
    CoursesController.delete
);

coursesRouter.get(
    '/courses/deleted',
    CoursesController.getDeleted
)

coursesRouter.put(
    '/courses/restore',
    CoursesController.restore
)

export default coursesRouter;
