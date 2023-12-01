import { prisma } from '../config/prisma.client.js';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sendEmail from '../handlers/email.handler.js';
import { jwt_secret, bcrypt_rounds, fronend_url, backend_url } from '../config/environment.js';
const passwordSalt = bcrypt.genSaltSync(bcrypt_rounds);
var Roles;
(function (Roles) {
    Roles[Roles["ADMIN"] = 0] = "ADMIN";
    Roles[Roles["USER"] = 1] = "USER";
    Roles[Roles["TEACHER"] = 2] = "TEACHER";
})(Roles || (Roles = {}));
const UsersController = {
    login: async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                result: false,
                message: 'Email and password are required'
            });
        }
        try {
            const user = await prisma.user.findUnique({
                where: {
                    email,
                },
            });
            if (!user) {
                return res.status(404).json({
                    result: false,
                    message: 'User not found'
                });
            }
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({
                    result: false,
                    message: 'Incorrect password'
                });
            }
            const token = jwt.sign({ id: user.id }, jwt_secret, { expiresIn: "36000s" });
            return res.status(200).json({
                token,
                result: true
            });
        }
        catch (error) {
            return res.status(500).json({
                result: false,
                message: 'Internal server error'
            });
        }
    },
    register: async (req, res) => {
        try {
            const { email, fullname, password } = req.body;
            if (!email || !fullname || !password) {
                return res.status(400).json({
                    message: 'All fields are required.',
                    result: false
                });
            }
            let user = await prisma.user.findUnique({
                where: {
                    email: email,
                },
            });
            if (user) {
                return res.status(401).json({
                    result: false,
                    message: 'Email already exists',
                });
            }
            const newPassword = await bcrypt.hash(password, passwordSalt);
            user = await prisma.user.create({
                data: {
                    email,
                    fullname,
                    password: newPassword,
                },
            });
            const token = jwt.sign({ email: email }, jwt_secret, { expiresIn: '1h' });
            if (user) {
                // Por el momento el enlace es al backend, luego cuando se integre el frontend se enviara alli
                const emailResponse = await sendEmail({
                    from: '"Asistencias - Administrador de Asistencias"',
                    to: email,
                    subject: 'Asistencias - Confirma tu cuenta',
                    text: 'Confirma tu cuenta en Asistencias',
                    html: `<p>Hola ${fullname}, Confirma tu cuenta en Asistencias</p>
              <p>
                  Tu cuenta ya esta casi lista, solo debes confirmarla
                  en el siguiente enlace: <a href="${backend_url}/api/users/confirm/${token}">Confirmar cuenta</a>
              </p>
              <p>Si no es tu cuenta puedes ignorar el mensaje.</p>`,
                });
                if (emailResponse.result) {
                    return res.status(201).json({
                        result: true,
                        message: 'User created successfully. Please check your email to activate your account.',
                        user,
                    });
                }
                return res.status(400).json({
                    result: false,
                    message: 'Confirmation email not sent',
                });
            }
            return res.status(400).json({
                result: false,
                message: 'User not created',
            });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({
                result: false,
                message: 'Internal server error',
            });
        }
    },
    // Confirmacion de cuenta: recibe token que fue enviado por email
    confirm: async (req, res) => {
        const { token } = req.params;
        if (!token || typeof token !== 'string') {
            return res.status(400).json({
                result: false,
                message: 'Token is required',
            });
        }
        const decodedToken = jwt.verify(token, jwt_secret);
        const userConfirm = await prisma.user.findUnique({
            where: {
                email: decodedToken?.email || null,
            },
        });
        if (!userConfirm) {
            return res.status(404).json({
                result: false,
                message: 'Invalid token',
            });
        }
        try {
            const user = await prisma.user.update({
                where: {
                    email: decodedToken.email,
                },
                data: {
                    active: true,
                },
            });
            return res.status(200).json({
                result: true,
                message: 'User account Activated successfully',
                user,
            });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({
                result: false,
                message: 'Internal server error',
            });
        }
    },
    // Recuperacion de contraseña: envia email para recuperar la contraseña
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
            const emailResponse = await sendEmail({
                from: 'Asistencias',
                to: email,
                subject: 'Recuperacion de contraseña',
                text: `Por favor, haz click en el siguiente link para recuperar tu contraseña: ${fronend_url}/api/auth/reset?token=${token}`,
                html: `<p>Por favor, haz click en el siguiente link para recuperar tu contraseña: <a href="${fronend_url}/api/auth/reset?token=${token}">${fronend_url}/api/auth/reset?token=${token}</a></p>`
            });
            if (!emailResponse.result) {
                return res.status(400).json({
                    result: false,
                    message: 'Email not sent',
                });
            }
            return res.status(200).json({
                result: true,
                message: 'Email sent',
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
    // Recupera la contraseña: recibe token y nueva contraseña. El token lo obtiene el frontend del email de recuperacion
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
            const encryptedPassword = await bcrypt.hash(password, passwordSalt);
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
    },
    getUsers: async (req, res) => {
        try {
            const users = await prisma.user.findMany({
                where: {
                    active: true
                },
                select: {
                    id: true,
                    createdAt: true,
                    fullname: true,
                    email: true,
                    role: true
                }
            });
            if (users) {
                return res.status(200).json({
                    result: true,
                    message: 'Users found',
                    users
                });
            }
            return res.status(404).json({
                result: false,
                message: 'Users not found'
            });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({
                result: false,
                message: 'Internal server error'
            });
        }
    },
    delete: async (req, res) => {
        const id = parseInt(req.params.user_id);
        if (!id) {
            return res.status(400).json({
                result: false,
                message: 'Id is required',
            });
        }
        try {
            const user = await prisma.user.update({
                where: {
                    id: id,
                },
                data: {
                    active: false,
                    updatedAt: new Date()
                },
            });
            if (user) {
                return res.status(200).json({
                    result: true,
                    message: 'User deleted successfully',
                    user,
                });
            }
        }
        catch (error) {
            console.log(error);
            let message = 'Internal server error';
            if (error.code === 'P2025') {
                message = 'User not found';
            }
            res.status(500).json({
                result: false,
                message: message
            });
        }
    },
    assignRole: async (req, res) => {
        const id = parseInt(req.params.user_id);
        const { role } = req.body;
        if (!id) {
            return res.status(400).json({
                result: false,
                message: 'Id is required',
            });
        }
        if (!role) {
            return res.status(400).json({
                result: false,
                message: 'Role field is required',
            });
        }
        if (!(role in Roles)) {
            return res.status(400).json({
                result: false,
                message: `${role} is not an assignable role`,
            });
        }
        try {
            const user = await prisma.user.update({
                where: {
                    id: id,
                },
                data: {
                    role: role,
                    updatedAt: new Date()
                },
            });
            if (user) {
                return res.status(200).json({
                    result: true,
                    message: 'Role successfully assigned',
                    user,
                });
            }
        }
        catch (error) {
            let message = 'Internal server error';
            if (error.code === 'P2025') {
                message = 'User not found';
            }
            res.status(500).json({
                result: false,
                message: message
            });
        }
    },
    update: async (req, res) => {
        const id = parseInt(req.user.id);
        const { fullname, email } = req.body;
        if (!id) {
            return res.status(400).json({
                result: false,
                message: 'Id is required',
            });
        }
        if (!fullname && !email) {
            return res.status(400).json({
                result: false,
                message: 'At least one field is required',
            });
        }
        try {
            let user, updated;
            if (fullname) {
                user = await prisma.user.update({
                    where: {
                        id: id,
                    },
                    data: {
                        fullname: fullname,
                        updatedAt: new Date()
                    },
                });
                if (user) {
                    updated = {
                        fullname: fullname
                    };
                }
                else {
                    return res.status(400).json({
                        result: false,
                        message: 'User not found',
                    });
                }
            }
            if (email) {
                updated = {
                    ...updated,
                    email: email
                };
                if (!user) {
                    user = await prisma.user.findFirst({
                        where: {
                            id: id,
                        }
                    });
                }
                if (user?.email === email) {
                    return res.status(400).json({
                        result: false,
                        message: 'Email is the same.',
                    });
                }
                if (!user) {
                    return res.status(400).json({
                        result: false,
                        message: 'User not found',
                    });
                }
                const token = jwt.sign({ email: user.email }, jwt_secret, { expiresIn: '1h' });
                const emailResponse = await sendEmail({
                    from: '"Asistencias - Administrador de Asistencias"',
                    to: email,
                    subject: 'Asistencias - Confirma tu nuevo email',
                    text: 'Confirma tu nuevo email en Asistencias',
                    html: `<p>Hola ${fullname}, Confirma tu nuevo email en Asistencias</p>
                <p>
                  Tu email se actualizara a ${email}, solo debes confirmarlo
                  en el siguiente enlace: <a href="${backend_url}/api/users/update-email/${token}/${email}">Confirmar email</a>
                </p>
                <p>Si no es tu cuenta puedes ignorar el mensaje.</p>`,
                });
                if (!emailResponse.result) {
                    return res.status(500).json({
                        result: false,
                        message: 'Email not sent, check your email settings',
                    });
                }
            }
            return res.status(202).json({
                result: true,
                message: 'User updated successfully',
                updated
            });
        }
        catch (error) {
            res.status(500).json({
                result: false,
                message: 'Internal server error'
            });
        }
    },
    updateEmail: async (req, res) => {
        const { token, email } = req.params;
        if (!token) {
            return res.status(400).json({
                result: false,
                message: 'Token is required',
            });
        }
        if (!email) {
            return res.status(400).json({
                result: false,
                message: 'Email is required',
            });
        }
        try {
            const decodedToken = jwt.verify(token, jwt_secret);
            const userUpdated = await prisma.user.update({
                where: {
                    email: decodedToken?.email || null,
                },
                data: {
                    email: email,
                    updatedAt: new Date()
                },
            });
            if (userUpdated) {
                return res.status(202).json({
                    result: true,
                    message: 'Email updated successfully',
                });
            }
            res.status(500).json({
                result: false,
                message: 'Internal server error'
            });
        }
        catch (error) {
            res.status(500).json({
                result: false,
                message: 'Internal server error'
            });
        }
    },
};
export default UsersController;
//# sourceMappingURL=users.controller.js.map