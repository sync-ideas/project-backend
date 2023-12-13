import { Request, Response } from 'express-serve-static-core';
import { prisma } from '../config/prisma.client.js';


const SubjectsController = {

  create: async (req: Request, res: Response) => {
    try {
      const { name, courseId } = req.body;
      if (!name || !courseId) {
        return res
          .status(400)
          .json({
            result: false,
            message: 'Fields name and courseId are required',
          });
      } else {
        const subject = await prisma.subject.findFirst({
          where: {
            name,
            courseId,
          }
        });
        if (subject) {
          return res.status(403).json({
            result: false,
            message: 'Subject already exists',
          });
        }
      }
      const subject = await prisma.subject.create({
        data: {
          name,
          courseId,
        },
      });

      // Actualiza el curso para añadir el nuevo subject
      await prisma.course.update({
        where: {
          id: courseId,
        },
        data: {
          subjects: {
            connect: {
              id: subject.id,
            },
          },
        },
      });

      return res.status(201).json({
        result: true,
        subject: subject,
      });

    } catch (error) {
      return res.status(500).json({ error: error.message });
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
      const { name, courseId, teacherId } = req.body;
      if (!name || !courseId) {
        return res.status(400).json({
          result: false,
          message: 'Fields name and courseId are required',
        });
      }

      // Obtener el courseId actual
      const currentSubject = await prisma.subject.findUnique({
        where: {
          id: id,
        },
        select: {
          courseId: true,
        }
      });

      // Actualizar el subject
      const subject = await prisma.subject.update({
        where: {
          id: id,
        },
        data: {
          name,
          courseId,
          teacherId: teacherId ? teacherId : null,
          updatedAt: new Date(),
        },
      });

      if (subject) {
        // Si el courseId ha cambiado, actualiza los subjects de los cursos
        if (currentSubject && currentSubject.courseId !== courseId) {
          await prisma.$transaction([
            // Desconecta el subject del curso anterior
            prisma.course.update({
              where: {
                id: currentSubject.courseId,
              },
              data: {
                subjects: {
                  disconnect: {
                    id: id,
                  },
                },
              },
            }),
            // Conecta el subject al nuevo curso
            prisma.course.update({
              where: {
                id: courseId,
              },
              data: {
                subjects: {
                  connect: {
                    id: id,
                  },
                },
              },
            }),
          ]);
        }

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
        return res.status(202).json({
          result: true,
          message: 'Subject deleted',
          subject,
        });
      }
    } catch (error) {
      res.status(500).json({
        result: false,
        message: 'Internal server error',
        error: error,
      });
    }
  },

  getAll: async (req: Request, res: Response) => {
    const courseId = parseInt(req.query.courseId as string);
    try {
      if (courseId) {
        const subjects = await prisma.subject.findMany({
          where: {
            active: true,
            courseId,
          },
        });
        if (!subjects || subjects.length === 0) {
          return res.status(404).json({
            result: false,
            message: 'Subjects not found',
          });
        } else {
          return res.status(200).json({
            result: true,
            message: 'Subjects found',
            subjects,
          });
        }
      } else {
        const subjects = await prisma.subject.findMany({
          where: {
            active: true,
          },
        });
        if (subjects && subjects.length > 0) {
          return res.status(200).json({
            result: true,
            message: 'Subjects found',
            subjects,
          });
        }
        return res.status(404).json({
          result: false,
          message: 'Subjects not found',
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

  // ESTA FUNCION NO ES NECESARIA, SE PUEDE USAR UPDATE
  assignCourse: async (req: Request, res: Response) => {
    const id = parseInt(req.params.subject_id as string);
    const { courseId } = req.body;
    const course = parseInt(courseId)
    let courseFilter;
    if (!id) {
      return res.status(400).json({
        result: false,
        message: 'Id is required',
      });
    }
    if (!courseId) { // agregar que si no se envia el course el subject queda sin asignar
      return res.status(400).json({
        result: false,
        message: 'Course field is required',
      });
    }
    if (courseId) {
      courseFilter = await prisma.course.findFirst({
        where: {
          id: course, // asumiendo que el level del curso es único
        },
      });
    }
    if (!courseFilter) {
      return res.status(400).json({
        result: false,
        message: `Course not found`,
      });
    }
    try {
      const subject = await prisma.subject
        .update({
          where: {
            id: id,
          },
          data: {
            courseId: courseFilter.id,
            updatedAt: new Date(),
          },
        })
        .course();
      if (subject) {
        return res.status(200).json({
          result: true,
          message: 'Course successfully assigned',
          subject,
        });
      }
    } catch (error) {
      let message = 'Internal server error';
      if (error.code === 'P2025') {
        message = 'Subject not found';
      }
      res.status(500).json({
        result: false,
        message: message,
      });
    }
  },
};

export default SubjectsController;
