import { Request, Response } from 'express-serve-static-core';
import { prisma } from '../config/prisma.client.js';

const AttendanceController = {

  register: async (req: Request, res: Response) => {
    try {
      const studentId = parseInt(req.params.studentId as string)
      const subjectId = 67 //parseInt(req.params.subjectId as string)
      if (!studentId || !subjectId) {
        return res.status(400).json({
          result: false,
          message: 'Valid studentId and subjectId is required',
        })
      }
      const student = await prisma.student.findUnique({
        where: {
          id: studentId,
          active: true
        },
        select: {
          name: true,
          surname: true
        }

      })
      if (!student) {
        return res.status(404).json({
          result: false,
          message: 'Student not found',
        })
      }
      await prisma.attendance.create({
        data: {
          date: new Date(),
          subjectId,
          studentId,
        }
      })
      return res.status(201).json({
        result: true,
        student: student.name,
      })

    } catch (error) {
      return res.status(500).json({ error: error.message });
    }

  },

  getNotAttendedByStudent: async (req: Request, res: Response) => {
    try {
      const studentId = parseInt(req.params.studentId as string)
      const nonattendances = await prisma.nonattendance.findMany({
        where: {
          studentId
        },
        orderBy: {
          date: 'asc'
        }
      })
      return res.status(200).json({
        result: true,
        nonattendances
      })
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  updateNotAttendedById: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.nonAttendanceId as string)
      const type = req.params.type as 'UNJUSTIFIED' | 'JUSTIFIED' | 'LATE' | 'DELETED'
      const notAttended = await prisma.nonattendance.update({
        where: {
          id
        },
        data: {
          type
        }
      })
      return res.status(200).json({
        result: true,
        notAttended
      })
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

}

export default AttendanceController