import express from "express";
import { authController } from "../controllers/auth.controller.js";

const authRouter = express.Router();

//*Example route
authRouter.post(
  "/",
  // middleware de auth,
  (req, res) => {
    authController(req, res);
  }
);

export default authRouter;
