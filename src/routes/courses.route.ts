import express from 'express';
import CoursesController from '../controllers/courses.controller.js';

const coursesRouter = express.Router();

coursesRouter.post(
    '/ocurses/register',
    CoursesController.create
);

coursesRouter.delete(
    '/ocurses/delete',
    CoursesController.delete
);

export default coursesRouter;
