import { Request, Response } from 'express-serve-static-core';
import { prisma } from '../config/prisma.client.js';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sendEmail from '../email/email.js';
import {
  jwt_secret,
  bcrypt_rounds,
  fronend_url,
} from '../config/environment.js';

const passwordSalt = bcrypt.genSaltSync(bcrypt_rounds);

const UsersController = {
  register: async (req: Request, res: Response) => {
    try {
      const { email, name, password } = req.body;
      if (!email || !name || !password) {
        return res.status(400).json({ message: 'All fields are required 1' });
      }
      let user = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });
      if (user) {
        return res.status(400).json({
          result: false,
          message: 'Email already exists',
        });
      }
      const newPassword = await bcrypt.hash(password, passwordSalt);
      user = await prisma.user.create({
        data: {
          email,
          name,
          password: newPassword,
        },
      });
      const token = jwt.sign({ email: email }, jwt_secret, { expiresIn: '1h' });
      if (user) {
        sendEmail({
          from: '"Asistencias - Administrador de Asistencias"',
          to: email,
          subject: 'Asistencias - Confirma tu cuenta',
          text: 'Confirma tu cuenta en Asistencias',
          html: `<p>Hola ${name}, Confirma tu cuenta en Asistencias</p>
              <p>
                  Tu cuenta ya esta casi lista, solo debes confirmarla
                  en el siguiente enlace: <a href="${fronend_url}/api/users/confirm?token=${token}">Confirmar cuenta</a>
              </p>
              <p>Si no es tu cuenta puedes ignorar el mensaje.</p>`,
        });

        return res.status(201).json({
          result: true,
          message:
            'User created successfully, Please check your email to activate your account',
          user,
        });
      }
      return res.status(400).json({
        result: false,
        message: 'User not created',
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        result: false,
        message: 'Internal server error',
      });
    }
  },
  confirm: async (req: Request, res: Response) => {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({
        result: false,
        message: 'Token is required',
      });
    }
    const decodedToken = jwt.verify(token, jwt_secret);
    const userConfirm = await prisma.user.findUnique({
      where: {
        email: decodedToken.email,
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
    } catch (error) {
      console.log(error);
      res.status(500).json({
        result: false,
        message: 'Internal server error',
      });
    }
  },
};

export default UsersController;
