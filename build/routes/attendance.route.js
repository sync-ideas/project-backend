import express from 'express';
import AttendanceController from '../controllers/attendance.controller.js';
import passport from '../middlewares/auth.mid.js';
const attendanceRouter = express.Router();
attendanceRouter.post('/attendance/register/:studentId', ///:subjectId',
passport.authenticate('userJWT', { session: false }), AttendanceController.register);
attendanceRouter.get('/attendance/getByStudent/:studentId', passport.authenticate('userJWT', { session: false }), AttendanceController.getNotAttendedByStudent);
attendanceRouter.put('/attendance/update/:nonAttendanceId/:type', passport.authenticate('userJWT', { session: false }), AttendanceController.updateNotAttendedById);
export default attendanceRouter;
//# sourceMappingURL=attendance.route.js.map