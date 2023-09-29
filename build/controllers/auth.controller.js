import { prisma } from '../config/prisma.client.js';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sendEmail from '../email/email.js';
import { jwt_secret, bcrypt_rounds, fronend_url } from '../config/environment.js';
const password_salt = bcrypt.genSaltSync(bcrypt_rounds);
const AuthController = {
    // Recibe un JWT en el query para comprobar el email (luego utilizara el jwt del header)
    checkEmail: async (req, res) => {
        try {
            const token = req.query.email;
            if (!token) {
                return res.status(401).json({
                    result: false,
                    message: 'Token not found'
                });
            }
            const decodedEmail = jwt.verify(token, jwt_secret);
            let response = await prisma.user.findUnique({
                where: {
                    email: decodedEmail
                }
            });
            if (response !== null) {
                response = await prisma.user.update({
                    where: {
                        email: decodedEmail
                    },
                    data: {
                        active: true
                    }
                });
                if (response !== null)
                    return res.status(200).json({
                        result: true,
                        response: response
                    });
            }
            return res.status(404).json({
                result: false,
                message: 'User not found'
            });
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({
                result: false,
                message: 'Internal server error'
            });
        }
    },
    // Envia un email con un enlace para recuperar la contrasena (luego recuperara el email del jwt del header)
    forgotPassword: async (req, res) => {
        try {
            const email = req.body.email;
            if (!email) {
                return res.status(400).json({
                    result: false,
                    message: 'Email is required'
                });
            }
            const user = await prisma.user.findUnique({
                where: {
                    email: email
                }
            });
            if (user === null) {
                return res.status(404).json({
                    result: false,
                    message: 'User not found'
                });
            }
            const token = jwt.sign({ email: email }, jwt_secret, { expiresIn: '1h' });
            const response = await sendEmail({
                from: 'Asistencias',
                to: email,
                subject: 'Recuperacion de contraseña',
                text: `Por favor, haz click en el siguiente link para recuperar tu contraseña: ${fronend_url}/api/auth/reset?token=${token}`,
                html: `<p>Por favor, haz click en el siguiente link para recuperar tu contraseña: <a href="${fronend_url}/api/auth/reset?token=${token}">${fronend_url}/api/auth/reset?token=${token}</a></p>`
            });
            // Falta logica de error al enviar el email
            if (response === null) {
                return res.status(500).json({
                    result: false,
                    message: 'Internal server error'
                });
            }
            return res.status(200).json({
                result: true,
                message: 'Email sent',
                response
            });
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({
                result: false,
                message: 'Internal server error'
            });
        }
    },
    // Recupera la contrasena recibe token y nueva contrasena (cuando reciba el token por headers no va a se necesario pasarlo por body)
    resetPassword: async (req, res) => {
        try {
            const { token, password } = req.body;
            if (!token || !password) {
                return res.status(400).json({
                    result: false,
                    message: 'Token and password are required'
                });
            }
            const decodedToken = jwt.verify(token, jwt_secret);
            const encryptedPassword = await bcrypt.hash(password, password_salt);
            const user = await prisma.user.findUnique({
                where: {
                    email: decodedToken.email
                }
            });
            if (user === null) {
                return res.status(404).json({
                    result: false,
                    message: 'User not found'
                });
            }
            const response = await prisma.user.update({
                where: {
                    email: decodedToken.email
                },
                data: {
                    password: encryptedPassword
                }
            });
            if (response === null) {
                return res.status(500).json({
                    result: false,
                    message: 'Internal server error'
                });
            }
            delete response.password;
            return res.status(200).json({
                result: true,
                message: 'Password updated',
                response
            });
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({
                result: false,
                message: 'Internal server error'
            });
        }
    }
};
export default AuthController;
//# sourceMappingURL=auth.controller.js.map