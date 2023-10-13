import express from 'express';
import StudentsController from '../controllers/students.controller.js';
import passport from '../middlewares/auth.js';
const studentsRouter = express.Router();
studentsRouter.get('/students', passport.authenticate('userJWT', { session: false }), StudentsController.getStudents);
studentsRouter.post('/students/register', passport.authenticate('userJWT', { session: false }), StudentsController.register);
studentsRouter.put('/students/update/:student_id', passport.authenticate('userJWT', { session: false }), StudentsController.update);
studentsRouter.delete('/students/delete/:student_id', passport.authenticate('userJWT', { session: false }), StudentsController.delete);
studentsRouter.get('/students/deleted', passport.authenticate('userJWT', { session: false }), StudentsController.getDeleted);
studentsRouter.put('/students/restore/:student_id', passport.authenticate('userJWT', { session: false }), StudentsController.restore);
export default studentsRouter;
//# sourceMappingURL=students.route.js.map