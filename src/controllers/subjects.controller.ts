import { Request, Response } from 'express-serve-static-core';
import { prisma } from '../config/prisma.client.js';

const SubjectsController = {

  create: async (res: Response, req: Request) => {
    try {
      const { name, level, teacher, course } = req.body;
      console.log(name, level);
      if (!name || !level) {
        return res
          .status(400)
          .json({ message: 'Name, level and teacher is required' });
      }
      if (name) {
        const subject = prisma.subject.findMany({
          where: {
            name,
            level,
          },
        });
        if (subject) {
          return res.status(400).json({
            result: false,
            message: 'Subject already exists',
          });
        }
      }

      const subject = await prisma.subject.create({
        data: {
          name,
          level,
          teacher,
          course,
          startSubjet: 'startSubjet',
          endSubject: 'endSubject',
        },
      });

      if (subject) {
        return res.status(201).json({
          result: true,
          message: 'Subject created',
        });
      } else {
        return res.status(400).json({
          result: false,
          message: 'Subject not created',
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        result: false,
        message: 'Internal server error',
      });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.subject_id as string);
      if (!id) {
        return res.status(400).json({
          result: false,
          message: 'Id is required',
        });
      }
      const { name, level, teacher } = req.body;
      if (name === undefined || !level || teacher === undefined) {
        return res.status(400).json({
          result: false,
          message: 'All fields are required',
        });
      }
      const subject = await prisma.subject.update({
        where: {
          id: id,
        },
        data: {
          name,
          level,
          teacher,
          updatedAt: new Date(),
        },
      });
      if (subject) {
        return res.status(200).json({
          result: true,
          message: 'Subject updated',
          subject,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        result: false,
        message: 'Internal server error',
      });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.subject_id as string);
      if (!id) {
        return res.status(400).json({
          result: false,
          message: 'Id is required',
        });
      }
      const subject = await prisma.subject.update({
        where: {
          id: id,
          active: true,
        },
        data: {
          active: false,
          updatedAt: new Date(),
        },
      });
      if (subject) {
        return res.status(200).json({
          result: true,
          message: 'Subject deleted',
          subject,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        result: false,
        message: 'Internal server error',
      });
    }
  },
};

export default SubjectsController;
