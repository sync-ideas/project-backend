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

usersRouter.get(
  '/users/confirm/:token',
  UsersController.confirm
);

usersRouter.post(
  '/users/forgotpassword',
  UsersController.forgotPassword
);

usersRouter.post(
  '/users/resetpassword',
  UsersController.resetPassword
)

usersRouter.get(
  '/users',
  passport.authenticate('adminJWT', { session: false }),
  UsersController.getUsers
);

usersRouter.delete(
  '/users/delete/:user_id',
  passport.authenticate('adminJWT', { session: false }),
  UsersController.delete
);

usersRouter.put(
  '/users/assignrole/:user_id',
  passport.authenticate('adminJWT', { session: false }),
  UsersController.assignRole
);

export default usersRouter