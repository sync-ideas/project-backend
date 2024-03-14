import { Request, Response } from 'express-serve-static-core';
import { prisma } from '../config/prisma.client.js';

const AttendanceController = {

  register: async (req: Request, res: Response) => {
    try {
      const studentId = parseInt(req.params.studentId as string)
      const subjectId = parseInt(req.params.subjectId as string)
      if (!studentId || !subjectId) {
        return res.status(400).json({
          result: false,
          message: 'Valid studentId and subjectId is required',
        })
      }
      const student = await prisma.student.findUnique({
        where: {
          id: studentId
        },
        select: {
          fullname: true
        }


      })
      await prisma.attendance.create({
        data: {
          date: new Date(),
          subjectId,
          studentId,
        }
      })
      return res.status(201).json({
        result: true,
        student: student.fullname,
      })

    } catch (error) {
      return res.status(500).json({ error: error.message });
    }

  }

}

export default AttendanceController