import { Request, Response } from 'express-serve-static-core';
import { prisma } from '../config/prisma.client.js';
import jwt from 'jsonwebtoken';

import { AuthHelper } from '../helpers/auth.helper.js';
import { JWT_SECRET } from '../config/environment.js';

export namespace AuthController {

  export async function get(req: Request, res: Response) {
    try {
      if (AuthHelper.checkInfo(req, res)) {
        const example = await prisma.users.findMany();
        if (example !== null && example.length > 0) {
          res
            .status(200)
            .json(example);
        } else {
          res
            .status(404)
            .json({ message: 'Example not found' });
        }
      } else {
        res
          .status(401)
          .json({ message: 'Unauthorized' });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: 'Internal server error' });
    }
  }


  // Recibe un JWT en el query para comprobar el email
  export async function checkEmail(req: Request, res: Response) {
    try {
      const token = req.query.email
      if (!token) {
        return res
          .status(401)
          .json({ message: 'Token not found' });
      }
      const decodedEmail = jwt.verify(token, JWT_SECRET);
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
          return res
            .status(200)
            .json(response);
      }
      return res
        .status(404)
        .json({ message: 'User not found' });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ message: 'Internal server error' });
    }
  }


}