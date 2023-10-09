import { Request, Response } from 'express-serve-static-core';
import { prisma } from '../config/prisma.client.js';

const StudentsController = {

  getStudents: async (req: Request, res: Response) => {
    try {
      if (req.query.id) {
        const id = parseInt(req.query.id as string)
        const student = await prisma.student.findUnique({
          where: {
            id: id,
            active: true
          }
        })
        if (student) {
          return res.status(200).json({
            result: true,
            message: 'Student found',
            student
          })
        }
        return res.status(404).json({
          result: false,
          message: 'Student not found'
        })
      }
      const students = await prisma.student.findMany({
        where: {
          active: true
        }
      })
      if (students && students.length > 0) {
        return res.status(200).json({
          result: true,
          message: 'Students found',
          students
        })
      }
      return res.status(404).json({
        result: false,
        message: 'Students not found'
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({
        result: false,
        message: 'Internal server error'
      })
    }
  },

  register: async (req: Request, res: Response) => {
    try {
      const { fullname, manual_id, contact_phone } = req.body
      if (!fullname) {
        return res.status(400).json({ message: 'A fullname is required' })
      }
      if (manual_id) {
        const student = await prisma.student.findFirst({
          where: {
            manual_id
          }
        })
        if (student) {
          return res.status(400).json({
            result: false,
            message: 'Manual id already exists'
          })
        }
      }
      const student = await prisma.student.create({
        data: {
          fullname,
          manual_id: manual_id || '',
          contact_phone: contact_phone || ''
        }
      })
      if (student) {
        return res.status(201).json({
          result: true,
          message: 'Student created',
          student
        })
      }
      return res.status(400).json({
        result: false,
        message: 'Student not created'
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({
        result: false,
        message: 'Internal server error'
      })
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const { id, manual_id, fullname, contact_phone } = req.body
      if (!id || manual_id === undefined || !fullname || contact_phone === undefined) {
        console.log(id, manual_id, fullname, contact_phone)
        return res.status(400).json({
          result: false,
          message: 'All fields are required'
        })
      }
      const student = await prisma.student.update({
        where: {
          id: id
        },
        data: {
          manual_id,
          fullname,
          contact_phone
        }
      })
      if (student) {
        return res.status(200).json({
          result: true,
          message: 'Student updated',
          student
        })
      }

    } catch (error) {
      console.log(error)
      res.status(500).json({
        result: false,
        message: 'Internal server error'
      })
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      if (!req.query.id) {
        return res.status(400).json({
          result: false,
          message: 'Id is required'
        })
      }
      const id = parseInt(req.query.id as string)
      if (isNaN(id)) {
        return res.status(400).json({
          result: false,
          message: 'Id is not valid'
        })
      }
      const student = await prisma.student.update({
        where: {
          id: id,
          active: true
        },
        data: {
          active: false
        }
      })
      if (student) {
        return res.status(200).json({
          result: true,
          message: 'Student deleted',
          student
        })
      }
      return res.status(404).json({
        result: false,
        message: 'Student not found'
      })
    } catch (error) {
      let message = 'Internal server error'
      if (error.code === 'P2025') {
        message = 'Student not found'
      }
      res.status(500).json({
        result: false,
        message: message
      })
    }
  },

  getDeleted: async (req: Request, res: Response) => {
    try {
      const students = await prisma.student.findMany({
        where: {
          active: false
        }
      })
      if (students) {
        return res.status(200).json({
          result: true,
          message: 'Students found',
          students
        })
      }
      return res.status(404).json({
        result: false,
        message: 'Students not found'
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
      if (!req.query.id) {
        return res.status(400).json({
          result: false,
          message: 'Id is required'
        })
      }
      const id = parseInt(req.query.id as string)
      const student = await prisma.student.update({
        where: {
          id: id,
          active: false
        },
        data: {
          active: true
        }
      })
      if (student) {
        return res.status(200).json({
          result: true,
          message: 'Student restored'
        })
      }
      return res.status(404).json({
        result: false,
        message: 'Student not found'
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({
        result: false,
        message: 'Internal server error'
      })
    }
  }

}

export default StudentsController