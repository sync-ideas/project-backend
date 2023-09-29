import express from 'express';
import AuthController from '../controllers/auth.controller.js';

const authRouter = express.Router();

authRouter.post(
  "/auth/login",
  // middleware de auth,
  AuthController.login
);


authRouter.post(
  '/auth/checkemail',
  // middleware de auth,
  AuthController.checkEmail
)

authRouter.post(
  '/auth/forgotpassword',
  // middleware de auth,
  AuthController.forgotPassword
)

authRouter.post(
  '/auth/resetpassword',
  // middleware de auth,
  AuthController.resetPassword
)




export default authRouter;
