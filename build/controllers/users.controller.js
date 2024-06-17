import { prisma } from '../config/prisma.client.js';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sendEmail from '../handlers/email.handler.js';
import emailTemplates from '../templates/email.templates.js';
import userHelper from '../helpers/user.helper.js';
import { jwt_secret, bcrypt_rounds } from '../config/environment.js';
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
            const remainingAttempts = await userHelper.getLoginAttempts(email);
            if (remainingAttempts === -1) {
                return res.status(401).json({
                    result: false,
                    message: 'Too many attempts. Please try again later.'
                });
            }
            const user = await prisma.user.findUnique({
                where: {
                    email,
                    active: true
                },
            });
            if (!user) {
                return res.status(404).json({
                    result: false,
                    message: 'User not found or not activated.',
                });
            }
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({
                    result: false,
                    message: 'Incorrect password.',
                    remainingAttempts
                });
            }
            const token = jwt.sign({ id: user.id }, jwt_secret, { expiresIn: "36000s" });
            userHelper.deleteLoginAttempts(email);
            return res.status(200).json({
                token,
                result: true,
                user: { ...user, password: null },
            });
        }
        catch (error) {
            return res.status(500).json({
                result: false,
                message: 'Internal server error.'
            });
        }
    },
    register: async (req, res) => {
        try {
            const { email, fullname, username, password } = req.body;
            if (!email || !fullname || !username || !password) {
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
                    message: 'Email already exists.',
                });
            }
            const hashPassword = await bcrypt.hash(password, passwordSalt);
            user = await prisma.user.create({
                data: {
                    email,
                    fullname,
                    username,
                    password: hashPassword,
                },
            });
            const code = await userHelper.getEmailSendCode(email);
            if (user) {
                const template = await emailTemplates.confirmEmail(email, fullname, code);
                const emailResponse = await sendEmail(template);
                if (emailResponse.result) {
                    return res.status(201).json({
                        result: true,
                        message: 'User created successfully. User will check email to get the confirmation code to activate the account.',
                        user: { ...user, password: null },
                    });
                }
                return res.status(400).json({
                    result: false,
                    message: 'Confirmation email not sent.',
                });
            }
            return res.status(400).json({
                result: false,
                message: 'User not created.',
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
    // Confirmacion de cuenta: recibe code que fue enviado por email
    confirm: async (req, res) => {
        try {
            const { code } = req.params;
            if (!code) {
                return res.status(400).json({
                    result: false,
                    message: 'Code is required.',
                });
            }
            const checkEmailCode = await userHelper.checkEmailCode(code);
            if (!checkEmailCode.success) {
                return res.status(400).json({
                    result: false,
                    message: checkEmailCode.message
                });
            }
            const user = await prisma.user.update({
                where: {
                    email: checkEmailCode.email
                },
                data: {
                    active: true
                }
            });
            return res.status(200).json({
                result: true,
                message: 'Email confirmed successfully.',
                user: { ...user, password: null }
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
                    message: 'Email is required.'
                });
            }
            const user = await prisma.user.findUnique({ where: { email } });
            if (user === null) {
                return res.status(404).json({
                    result: false,
                    message: 'User not found.'
                });
            }
            const code = await userHelper.getEmailSendCode(email);
            const template = await emailTemplates.forgotPassword(email, code);
            const emailResponse = await sendEmail(template);
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
    // Recupera la contraseña: recibe code y nueva contraseña.
    resetPassword: async (req, res) => {
        try {
            const { email, code, password } = req.body;
            if (!email || !code || !password) {
                return res.status(400).json({
                    result: false,
                    message: 'Email, code and password are required!'
                });
            }
            const checkEmailCode = await userHelper.checkEmailCode(code);
            if (!checkEmailCode.success) {
                return res.status(400).json({
                    result: false,
                    message: checkEmailCode.message
                });
            }
            if (checkEmailCode.email !== email) {
                return res.status(400).json({
                    result: false,
                    message: 'Invalid email.'
                });
            }
            const hashPassword = await bcrypt.hash(password, passwordSalt);
            const user = await prisma.user.update({
                where: {
                    email: checkEmailCode.email
                },
                data: {
                    password: hashPassword
                }
            });
            return res.status(200).json({
                result: true,
                message: 'Password updated successfully',
                user: { ...user, password: null }
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
    getById: async (req, res) => {
        const id = parseInt(req.params.user_id);
        if (!id) {
            return res.status(400).json({
                result: false,
                message: 'Id is required',
            });
        }
        try {
            const user = await prisma.user.findUnique({
                where: {
                    id: id
                },
                select: {
                    id: true,
                    createdAt: true,
                    fullname: true,
                    username: true,
                    email: true,
                    role: true
                }
            });
            if (user) {
                return res.status(200).json({
                    result: true,
                    message: 'User found.',
                    user
                });
            }
            return res.status(404).json({
                result: false,
                message: 'User not found.',
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
        const { user_id, fullname, username, email, password } = req.body;
        if (!user_id) {
            return res.status(400).json({
                result: false,
                message: 'User id is required.',
            });
        }
        if (!fullname && !username && !email && !password) {
            return res.status(400).json({
                result: false,
                message: 'At least one field must be updated.',
            });
        }
        try {
            const user = await prisma.user.findUnique({
                where: {
                    id: id,
                },
            });
            if (!user) {
                return res.status(400).json({
                    result: false,
                    message: 'User not found',
                });
            }
            let updatedUser = {};
            const updatedData = {};
            if (fullname)
                updatedData.fullname = fullname;
            if (username)
                updatedData.username = username;
            if (email)
                updatedData.email = email;
            if (password)
                updatedData.password = await bcrypt.hash(password, passwordSalt);
            ;
            if (user.role !== 'ADMIN' && user_id !== id) {
                return res.status(400).json({
                    result: false,
                    message: 'You are not authorized to update this user.',
                });
            }
            updatedUser = await prisma.user.update({ where: { id: user_id }, data: updatedData });
            if (email) {
                const code = await userHelper.getEmailSendCode(email);
                const template = await emailTemplates.confirmEmail(email, fullname, code);
                const emailResponse = await sendEmail(template);
                if (!emailResponse.result) {
                    return res.status(500).json({
                        result: false,
                        message: 'Verification email could not be sent.',
                    });
                }
            }
            return res.status(202).json({
                result: true,
                message: 'User updated successfully',
                updated: { ...updatedUser, password: undefined },
            });
        }
        catch (error) {
            res.status(500).json({
                result: false,
                message: 'Internal server error'
            });
        }
    },
    updateByAdmin: async (req, res) => {
        const user_id = parseInt(req.params.user_id);
        const { fullname, username, email, role } = req.body;
        if (!user_id) {
            return res.status(400).json({
                result: false,
                message: 'User id is required.',
            });
        }
        if (!fullname && !username && !email && !role) {
            return res.status(400).json({
                result: false,
                message: 'At least one field is required',
            });
        }
        try {
            const updated = {};
            if (fullname)
                updated.fullname = fullname;
            if (username)
                updated.username = username;
            if (role)
                updated.role = role;
            if (email)
                updated.email = email;
            const updatedUser = await prisma.user.update({
                where: {
                    id: user_id,
                },
                data: {
                    ...updated,
                    updatedAt: new Date()
                },
            });
            // falta enviar notificacion por email al usuario
            return res.status(202).json({
                result: true,
                message: 'User updated successfully',
                updated: { ...updatedUser, password: null }
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