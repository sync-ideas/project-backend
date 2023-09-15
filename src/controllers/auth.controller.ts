import { Request, Response } from 'express-serve-static-core';
import { Prisma } from '@prisma/client';

import { prisma } from '../config/prisma.client.js';
import { AuthHelper } from '../helpers/auth.helper.js';

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

}