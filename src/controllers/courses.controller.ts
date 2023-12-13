import { Request, Response } from "express-serve-static-core";
import { prisma } from "../config/prisma.client.js";

const CoursesController = {

  getAll: async (req: Request, res: Response) => {
    try {
      const courses = await prisma.course.findMany({
        where: {
          active: true
        }
      });
      if (courses && courses.length > 0) {
        return res.status(200).json({
          result: true,
          message: 'Courses found',
          courses
        })
      }
      return res.status(404).json({
        result: false,
        message: 'Courses not found'
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({
        result: false,
        message: 'Internal server error'
      })
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const { level, number, letter } = req.body;
      if (!level || !number || !letter) {
        return res.status(400).json({ message: "Fields level, number and letter is required" });
      }
      let course = await prisma.course.findFirst({
        where: {
          level,
          number,
          letter
        },
      });
      if (course) {
        return res.status(400).json({
          result: false,
          message: "Course already exists",
        });
      }
      course = await prisma.course.create({
        data: {
          level,
          number,
          letter,
        },
      });
      if (course) {
        return res.status(201).json({
          result: true,
          message: "Course created",
          course,
        });
      }
      return res.status(400).json({
        result: false,
        message: "Course not created",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        result: false,
        message: "Internal server error",
      });
    }
  },

  update: async (req: Request, res: Response) => {
    const id = parseInt(req.params.course_id as string);
    if (!id) {
      return res.status(400).json({
        result: false,
        message: 'Id is required',
      });
    }
    const { level, number, letter } = req.body;
    if (!level || !number || !letter) {
      return res.status(400).json({
        result: false,
        message: 'All fields are required',
      });
    }
    try {
      const course = await prisma.course.update({
        where: {
          id: id,
          active: true,
        },
        data: {
          level,
          number,
          letter,
          updatedAt: new Date()
        },
      });
      if (course) {
        return res.status(200).json({
          result: true,
          message: 'Course updated successfully',
          course,
        });
      }
    } catch (error) {
      let message = 'Internal server error'
      if (error.code === 'P2025') {
        message = 'Course not found'
      }
      res.status(500).json({
        result: false,
        message: message
      })
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.course_id as string);
      if (!id) {
        return res.status(400).json({
          result: false,
          message: 'Id is required',
        });
      }
      const course = await prisma.course.update({
        where: {
          id,
          active: true,
        },
        data: {
          active: false,
          updatedAt: new Date()
        }
      });
      if (course) {
        return res.status(200).json({
          result: true,
          message: "Course deleted",
          course,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        result: false,
        message: "Internal server error",
      });
    }
  },

  getDeleted: async (req: Request, res: Response) => {
    try {
      const courses = await prisma.course.findMany({
        where: {
          active: false
        }
      });
      if (courses && courses.length > 0) {
        return res.status(200).json({
          result: true,
          message: 'Courses found',
          courses
        })
      }
      return res.status(404).json({
        result: false,
        message: 'Courses not found'
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({
        result: false,
        message: 'Internal server error'
      })
    }
  },

  restore: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.course_id as string);
      if (!id) {
        return res.status(400).json({
          result: false,
          message: 'Id is required',
        });
      }
      const course = await prisma.course.update({
        where: {
          id: id,
          active: false
        },
        data: {
          active: true,
          updatedAt: new Date()
        }
      });
      if (course) {
        return res.status(200).json({
          result: true,
          message: 'Course restored'
        })
      }
      return res.status(404).json({
        result: false,
        message: 'Course not found'
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({
        result: false,
        message: 'Internal server error'
      })
    }
  }

};

export default CoursesController;
