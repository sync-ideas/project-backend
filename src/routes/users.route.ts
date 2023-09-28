import express from 'express';
import UsersController from '../controllers/users.controller.js';

const usersRouter = express.Router();

usersRouter.get(
  '/users',
  // middleware de auth, 
  UsersController.getUsers
)

export default usersRouter