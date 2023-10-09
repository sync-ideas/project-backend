import { Request, Response } from "express-serve-static-core";
import { prisma } from "../config/prisma.client.js";

const CoursesController = {
  create: async (req: Request, res: Response) => {
    try {
      const { level, number, letter } = req.body;
      if (!level) {
        return res.status(400).json({ message: "Level is required" });
      }
      let course = await prisma.student.findFirst({
        where: {
          level,
        },
      });
      if (course) {
        return res.status(400).json({
          result: false,
          message: "Id already exists",
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
  delete: async (req: Request, res: Response) => {
    try {
      const { level, number, letter } = req.body;
      if (!level) {
        return res.status(400).json({ message: "Level is required" });
      }
      let course = await prisma.student.findFirst({
        where: {
          level,
        },
      });
      if (course) {
        return res.status(400).json({
          result: false,
          message: "Id already exists",
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
};

export default CoursesController;
