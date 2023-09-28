import { Request, Response } from 'express-serve-static-core';
import { prisma } from '../config/prisma.client.js';

const StudentsController = {

  getStudents: async (req: Request, res: Response) => {
    try {
      if (req.query.id) {
        const id = req.query.id as string
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

  register: async (req: Request, res: Response) => {
    try {
      const { id, name, subjects } = req.body
      if (!id || !name || !subjects) {
        return res.status(400).json({ message: 'All fields are required' })
      }
      let student = await prisma.student.findUnique({
        where: {
          id: id
        }
      })
      if (student) {
        return res.status(400).json({
          result: false,
          message: 'Id already exists'
        })
      }
      student = await prisma.student.create({
        data: {
          id,
          name,
          subjects
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
      const { id, name, subjects } = req.body
      if (!id || !name || !subjects) {
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
          name,
          subjects
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
      const id = req.query.id as string
      const student = await prisma.student.update({
        where: {
          id: id
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
      console.log(error)
      let message = 'Internal server error'
      if (error.code === 'P2025') {
        message = 'Student not found'
      }
      res.status(500).json({
        result: false,
        message: message
      })
    }
  }

}

export default StudentsController