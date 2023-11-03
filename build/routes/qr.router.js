import express from 'express';
import QRController from '../controllers/qr.controller.js';
const qrRouter = express.Router();
qrRouter.post('/qr/create', QRController.create);
export default qrRouter;
//# sourceMappingURL=qr.router.js.map