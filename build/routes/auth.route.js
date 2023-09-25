import express from 'express';
import AuthController from '../controllers/auth.controller.js';
const authRouter = express.Router();
authRouter.post('/auth/checkemail', 
// middleware de auth,
(req, res) => {
    AuthController.checkEmail(req, res);
});
authRouter.post('/auth/forgotpassword', 
// middleware de auth,
(req, res) => {
    AuthController.forgotPassword(req, res);
});
authRouter.post('/auth/resetpassword', 
// middleware de auth,
(req, res) => {
    AuthController.resetPassword(req, res);
});
export default authRouter;
//# sourceMappingURL=auth.route.js.map