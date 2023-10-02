import express from 'express';
import UsersController from '../controllers/users.controller.js';

import passport from '../middlewares/auth.js';

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
  // passport.authenticate('adminJWT'),
  UsersController.getUsers
);

usersRouter.delete(
  '/users/delete',
  // passport.authenticate('adminJWT'),
  UsersController.delete
);

export default usersRouter