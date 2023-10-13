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

enum Roles {
  ADMIN,
  USER,
  TEACHER,
}

const UsersController = {

  login: async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        result: false,
        message: 'Email and password are required'
      });
    }
    try {
      const user = await prisma.user.findUniqueOrThrow({
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
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        result: false,
        message: 'Internal server error'
      })
    }
  },

  register: async (req: Request, res: Response) => {
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
        return res.status(400).json({
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
            message:
              'User created successfully, Please check your email to activate your account',
            user,
          });
        }

        return res.status(400).json({
          result: false,
          message: 'Confirmation email not sent',
        })
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

  // Confirmacion de cuenta: recibe token que fue enviado por email
  confirm: async (req: Request, res: Response) => {
    const { token } = req.params
    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        result: false,
        message: 'Token is required',
      });
    }
    const decodedToken = jwt.verify(token, jwt_secret) as { email: string } | null;
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
    } catch (error) {
      console.log(error);
      res.status(500).json({
        result: false,
        message: 'Internal server error',
      });
    }
  },

  // Recuperacion de contraseña: envia email para recuperar la contraseña
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
      const emailResponse = await sendEmail({
        from: 'Asistencias',
        to: email,
        subject: 'Recuperacion de contraseña',
        text: `Por favor, haz click en el siguiente link para recuperar tu contraseña: ${fronend_url}/api/auth/reset?token=${token}`,
        html: `<p>Por favor, haz click en el siguiente link para recuperar tu contraseña: <a href="${fronend_url}/api/auth/reset?token=${token}">${fronend_url}/api/auth/reset?token=${token}</a></p>`
      })
      if (!emailResponse.result) {
        return res.status(400).json({
          result: false,
          message: 'Email not sent',
        })
      }
      return res.status(200).json({
        result: true,
        message: 'Email sent',
      })
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        result: false,
        message: 'Internal server error'
      });
    }
  },

  // Recupera la contraseña: recibe token y nueva contraseña. El token lo obtiene el frontend del email de recuperacion
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

  getUsers: async (req: Request, res: Response) => {
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
    const id = req.params.user_id as string;
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

  assignRole: async (req: Request, res: Response) => {
    const id = req.params.user_id as string;
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
    } catch (error) {
      let message = 'Internal server error'
      if (error.code === 'P2025') {
        message = 'User not found'
      }
      res.status(500).json({
        result: false,
        message: message
      })
    }
  }

};

export default UsersController;
