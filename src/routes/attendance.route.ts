import express from 'express';

import AttendanceController from '../controllers/attendance.controller.js';
import passport from '../middlewares/auth.mid.js';

const attendanceRouter = express.Router();

attendanceRouter.post(
  '/attendance/register/:studentId', ///:subjectId',
  passport.authenticate('userJWT', { session: false }),
  AttendanceController.register
);

export default attendanceRouter