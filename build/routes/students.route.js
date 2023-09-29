import express from 'express';
import StudentsController from '../controllers/students.controller.js';
const studentsRouter = express.Router();
studentsRouter.get('/students', 
// middleware de auth, 
StudentsController.getStudents);
studentsRouter.post('/students/register', 
// middleware de auth,
StudentsController.register);
studentsRouter.put('/students/update', 
// middleware de auth,
StudentsController.update);
studentsRouter.delete('/students/delete', 
// middleware de auth,
StudentsController.delete);
export default studentsRouter;
//# sourceMappingURL=students.route.js.map