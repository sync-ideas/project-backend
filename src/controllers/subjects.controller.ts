import { Request, Response } from 'express-serve-static-core';
import { prisma } from '../config/prisma.client.js';

const SubjectsController = {


  create : async (req: Request, res: Response) => {

    try {
      const { name, level, course } = req.body;
      if (!name || !level) {
        return res
          .status(400)
          .json({message: 'Name and level is required' });
      }else {
        const subject = await prisma.subject.findFirst({ 
          where: {
            name,
            level,
        }
      });
        
      if (subject) {
          return res.status(400).json({ result: false,
            message: 'Subject already exists',
          });
        }
      }
  
    const subject = await prisma.subject.create({
        data: {
          name,
          level,
          courseId: course,
        },
      });
      return res.status(200).json({ result: true,
        subject: subject,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }

  }
  ,
  //!Error 404

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
        error: error,
      });
    }
  },
  getAll: async (req: Request, res: Response) => {
    const course = req.query.course as string;
    let courseFilter;
    console.log(course);
    try {
      if (course) {
        courseFilter = await prisma.course.findFirst({
          where: {
            level: course, // asumiendo que el level del curso es único
          },
        });

        if (!courseFilter) {
          return res.status(404).json({
            result: false,
            message: 'Course not found',
          });
        }
      }
      const subjects = await prisma.subject.findMany({
        where: {

          active: true,

          course: courseFilter ? courseFilter : undefined
        },
      });
      if (subjects && subjects.length > 0) {
        return res.status(200).json({
          result: true,
          subjects,
        });
      }
      return res.status(404).json({
        result: false,
        message: 'Subjects not found',
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

export default SubjectsController;
