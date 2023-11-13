import { Request, Response } from 'express-serve-static-core';
import { prisma } from '../config/prisma.client.js';
import xlsx from 'xlsx';

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
      const { fullname, internal_id, contact_phone } = req.body
      if (!fullname) {
        return res.status(400).json({ message: 'A fullname is required' })
      }
      if (internal_id) {
        const student = await prisma.student.findFirst({
          where: {
            internal_id
          }
        })
        if (student) {
          return res.status(400).json({
            result: false,
            message: 'Internal id already exists'
          })
        }
      }
      const student = await prisma.student.create({
        data: {
          fullname,
          internal_id: internal_id || '',
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

  excelImport: async (req: Request, res: Response) => {
    try {
      const file = req.file
      const { fullname, internal_id, contact_phone } = req.body

      if (!file || !fullname || !contact_phone) {
        return res.status(400).json({
          result: false,
          message: 'File and column names are required'
        })
      }

      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const excelData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
      const columns: string[] = Array.isArray(excelData[0]) ? excelData[0] : [];
      const fullname_index = columns.findIndex((col) => col.trim() === fullname);
      const internal_id_index = internal_id ? columns.findIndex((col) => col.trim() === internal_id) : -1;
      const contact_phone_index = columns.findIndex((col) => col.trim() === contact_phone);

      const createdStudents = [];
      for (let i = 1; i < excelData.length; i++) {
        const student = excelData[i];
        const studentData = {
          fullname: student[fullname_index],
          internal_id: internal_id ? student[internal_id_index] : '',
          contact_phone: String(student[contact_phone_index])
        }
        const createdStudent = await prisma.student.create({
          data: studentData
        })
        if (createdStudent) {
          createdStudents.push(createdStudent)
        }
      }
      return res.status(201).json({
        result: true,
        message: 'Students created',
        createdStudents
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
      const id = parseInt(req.params.student_id as string);
      if (!id) {
        return res.status(400).json({
          result: false,
          message: 'Id is required',
        });
      }
      const { internal_id, fullname, contact_phone } = req.body
      if (internal_id === undefined || !fullname || contact_phone === undefined) {
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
          internal_id,
          fullname,
          contact_phone,
          updatedAt: new Date()
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
      const id = parseInt(req.params.student_id as string);
      if (!id) {
        return res.status(400).json({
          result: false,
          message: 'Id is required',
        });
      }
      const student = await prisma.student.update({
        where: {
          id: id,
          active: true
        },
        data: {
          active: false,
          updatedAt: new Date()
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
      const id = parseInt(req.params.student_id as string);
      if (!id) {
        return res.status(400).json({
          result: false,
          message: 'Id is required',
        });
      }
      const student = await prisma.student.update({
        where: {
          id: id,
          active: false
        },
        data: {
          active: true,
          updatedAt: new Date()
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