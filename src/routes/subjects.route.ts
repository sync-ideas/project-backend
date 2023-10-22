import express from "express";
import SubjectsController from "../controllers/subjects.controller.js";
import passport from "../middlewares/auth.js";

const subjectsRouter = express.Router();

subjectsRouter.delete(
  '/subjects/delete/:subject_id',
  passport.authenticate('userJWT', { session: false }),
  SubjectsController.delete
)

export default subjectsRouter;