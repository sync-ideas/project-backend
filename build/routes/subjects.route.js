import express from 'express';
import passport from '../middlewares/auth.js';
import SubjectsController from '../controllers/subjects.controller.js';
const subjectsRouter = express.Router();
subjectsRouter.post('/subjects/register', passport.authenticate('adminJWT', { session: false }), SubjectsController.create);
subjectsRouter.put('/subjects/update/:subject_id', passport.authenticate('adminJWT', { session: false }), SubjectsController.update);
subjectsRouter.delete('/subjects/delete/:subject_id', passport.authenticate('adminJWT', { session: false }), SubjectsController.delete);
subjectsRouter.get('/subjects', // '/subjects' para traer todos los subjects y '/subjects?course=Secundaria' para traer los subjects filtadas por course
passport.authenticate('adminJWT', { session: false }), SubjectsController.getAll);
export default subjectsRouter;
//# sourceMappingURL=subjects.route.js.map