import express from 'express';
import CoursesController from '../controllers/courses.controller.js';
const coursesRouter = express.Router();
coursesRouter.post('/courses/register', CoursesController.create);
coursesRouter.put('/courses/update', CoursesController.update);
coursesRouter.delete('/courses/delete', CoursesController.delete);
export default coursesRouter;
//# sourceMappingURL=courses.route.js.map