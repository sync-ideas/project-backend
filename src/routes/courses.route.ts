import express from 'express';
import CoursesController from '../controllers/courses.controller.js';

const cursesRouter = express.Router();

cursesRouter.post(
    '/curses/register',
    CoursesController.create
);

cursesRouter.delete(
    '/curses/delete',
    CoursesController.delete
);

export default cursesRouter;
