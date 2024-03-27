import express from 'express';
import CronController from '../controllers/cron.controller.js';
const cronRouter = express.Router();
cronRouter.get('/cron/updateAttendance', CronController.updateAttendance);
export default cronRouter;
//# sourceMappingURL=cron.route.js.map