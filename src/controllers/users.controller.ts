import { Request, Response } from 'express-serve-static-core';
import { prisma } from '../config/prisma.client.js';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sendEmail from '../email/email.js';
import {
  jwt_secret,
  bcrypt_rounds,
  fronend_url,
  backend_url
} from '../config/environment.js';

const passwordSalt = bcrypt.genSaltSync(bcrypt_rounds);

const UsersController = {

  login: async (req: Request, res: Response) => {
    const email = req.body;
    const password = req.body;
    try {
      const usuario = await prisma.user.findUniqueOrThrow({
        where: {
          email,
        },
      });
      if (!usuario) {
        return res.status(404).json({
          msg: "Error: Usuario no encontrado",
        });
      }
      const passwordMatch = await bcrypt.compare(password, usuario.password);
      if (!passwordMatch) {
        return res.status(401).json({
          msg: "Error: Contraseña incorrecta",
        })
      }
      const token = jwt.sign({ id: usuario.id }, jwt_secret, { expiresIn: "36000s" });
      return res.status(200).json({ token });
    } catch (error) {
      console.error(error);
      return res.status(500).send("Error en el servidor");
    }
  },

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

  forgotPassword: async (req: Request, res: Response) => {
    try {
      const email = req.body.email
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
      })
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
      })
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
      })
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        result: false,
        message: 'Internal server error'
      });
    }
  },

  // Recupera la contrasena recibe token y nueva contrasena (cuando reciba el token por headers no va a se necesario pasarlo por body)
  resetPassword: async (req: Request, res: Response) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({
          result: false,
          message: 'Token and password are required'
        });
      }
      const decodedToken = jwt.verify(token, jwt_secret) as { email: string } | null;
      const encryptedPassword = await bcrypt.hash(password, passwordSalt);
      const user = await prisma.user.findUnique({
        where: {
          email: decodedToken.email
        }
      })
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
      })
      if (response === null) {
        return res.status(500).json({
          result: false,
          message: 'Internal server error'
        });
      }
      delete response.password
      return res.status(200).json({
        result: true,
        message: 'Password updated',
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

  confirm: async (req: Request, res: Response) => {
    const { token } = req.query
    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        result: false,
        message: 'Token is required',
      });
    }
    const decodedToken = jwt.verify(token, jwt_secret) as { email: string } | null;
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

  getUsers: async (req: Request, res: Response) => {
    try {
      const users = await prisma.user.findMany({
        where: {
          active: true
        }
      })
      if (users) {
        return res.status(200).json({
          result: true,
          message: 'Users found',
          users
        })
      }
      return res.status(404).json({
        result: false,
        message: 'Users not found'
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({
        result: false,
        message: 'Internal server error'
      })
    }
  },

  delete: async (req: Request, res: Response) => {
    const id = req.query.id as string;
    if (!req.query.id) {
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
        },
      });
      if (user) {
        return res.status(200).json({
          result: true,
          message: 'User deleted successfully',
          user,
        });
      }
    } catch (error) {
      console.log(error)
      let message = 'Internal server error'
      if (error.code === 'P2025') {
        message = 'User not found'
      }
      res.status(500).json({
        result: false,
        message: message
      })
    }
  },

};

export default UsersController;
