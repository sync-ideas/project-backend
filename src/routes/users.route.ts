import express from 'express';
import UsersController from '../controllers/users.controller.js';

const usersRouter = express.Router();

usersRouter.post(
  '/users/register',
  UsersController.register
);
usersRouter.post(
  '/users/confirm',
  UsersController.confirm
);
export default usersRouter