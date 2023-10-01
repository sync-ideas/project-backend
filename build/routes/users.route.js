import express from 'express';
import UsersController from '../controllers/users.controller.js';
const usersRouter = express.Router();
usersRouter.post('/users/register', UsersController.register);
usersRouter.put('/users/confirm', UsersController.confirm);
usersRouter.get('/users', 
// passport.authenticate('adminJWT'),
UsersController.getUsers);
usersRouter.delete('/users/delete', 
// passport.authenticate('adminJWT'),
UsersController.delete);
export default usersRouter;
//# sourceMappingURL=users.route.js.map