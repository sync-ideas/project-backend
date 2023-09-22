import express from 'express';
import AuthController from '../controllers/auth.controller.js';

const authRouter = express.Router();

authRouter.post(
  '/checkemail',
  (req, res) => {
    AuthController.checkEmail(req, res);
  }
)



export default authRouter