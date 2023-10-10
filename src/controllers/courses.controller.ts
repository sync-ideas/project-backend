import { Request, Response } from "express-serve-static-core";
import { prisma } from "../config/prisma.client.js";

const CoursesController = {
  create: async (req: Request, res: Response) => {
    try {
      const { level, number, letter } = req.body;
      if (!level || !number || !letter) {
        return res.status(400).json({ message: "Level is required" });
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
    const id = req.query.id as string;
    const { level, number, letter } = req.body;
    if (!id) {
      return res.status(400).json({
        result: false,
        message: 'ID is required',
      });
    }
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
        },
        data: {
          level,
          number,
          letter,
          updatedAt: new Date
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
      const id = req.query.id as string;
      if (!req.query.id) {
        return res.status(400).json({
          result: false,
          message: "Id is required",
        });
      }
      const course = await prisma.course.delete({
        where: {
          id
        },
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
};

export default CoursesController;
