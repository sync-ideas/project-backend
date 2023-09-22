import { Request, Response } from 'express-serve-static-core';
import { prisma } from '../config/prisma.client.js';
import jwt from 'jsonwebtoken';

import { AuthHelper } from '../helpers/auth.helper.js';
import sendEmail from '../email/email.js';
import { jwt_secret } from '../config/environment.js';

const AuthController = {

  // Recibe un JWT en el query para comprobar el email
  checkEmail: async (req: Request, res: Response) => {
    try {
      const token = req.query.email
      if (!token) {
        return res.status(401).json({
          result: false,
          message: 'Token not found'
        });
      }
      const decodedEmail = jwt.verify(token, jwt_secret);
      let response = await prisma.users.findUnique({
        where: {
          email: decodedEmail
        }
      })
      if (response !== null) {
        response = await prisma.users.update({
          where: {
            email: decodedEmail
          },
          data: {
            active: true
          }
        })
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
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        result: false,
        message: 'Internal server error'
      });
    }
  },

  // Envia un email con un enlace para recuperar la contrasena
  forgotPassword: async (req: Request, res: Response) => {
    try {
      const email = req.body.email
      if (!email) {
        return res.status(400).json({
          result: false,
          message: 'Email is required'
        });
      }
      const user = await prisma.users.findUnique({
        where: {
          email: email
        }
      })
      if (user === null) {
        return res.status(404).json({
          result: false,
          message: 'User not found'
        });
      }
      const token = jwt.sign({ email: email, recovery: true }, jwt_secret);
      const response = await sendEmail({
        from: 'Asistencias',
        to: email,
        subject: 'Recuperacion de contraseña',
        text: `Por favor, haz click en el siguiente link para recuperar tu contraseña: ${process.env.FRONTEND_URL}/reset/${token}`,
        html: `<p>Por favor, haz click en el siguiente link para recuperar tu contraseña: <a href="${process.env.FRONTEND_URL}/reset/${token}">${process.env.FRONTEND_URL}/reset/${token}</a></p>`
      })
      // Falta logica de error al enviar el email
      return res.status(200).json({
        result: true,
        message: 'Email sent',
        response
      })
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        result: false,
        message: 'Internal server error'
      });
    }
  },

}

export default AuthController