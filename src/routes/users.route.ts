import express from 'express';
import UsersController from '../controllers/users.controller.js';

const usersRouter = express.Router();

usersRouter.post(
  '/users/login',
  UsersController.login
);

usersRouter.post(
  '/users/register',
  UsersController.register
);

usersRouter.post(
  '/users/forgotpassword',
  UsersController.forgotPassword
);

usersRouter.post(
  '/users/resetpassword',
  UsersController.resetPassword
)

usersRouter.put(
  '/users/confirm',
  UsersController.confirm
);

usersRouter.get(
  '/users',
  // middleware de auth, 
  UsersController.getUsers
);

usersRouter.delete(
  '/users/delete',
  // middleware de auth,
  UsersController.delete
);

export default usersRouter