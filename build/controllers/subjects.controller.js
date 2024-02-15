import { prisma } from '../config/prisma.client.js';
const SubjectsController = {
    create: async (req, res) => {
        try {
            const { name, courseId, teacherId, schelude, startSubject, endSubject, students } = req.body;
            if (!name || !courseId) {
                return res
                    .status(400)
                    .json({
                    result: false,
                    message: 'Fields name and courseId are required',
                });
            }
            else {
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
            const subjectData = {
                name,
                courseId,
                teacherId: teacherId ? teacherId : null,
                schelude: schelude ? schelude : null,
                startSubjet: startSubject ? startSubject : null,
                endSubject: endSubject ? endSubject : null,
            };
            if (students) {
                subjectData['students'] = {
                    connect: students.map((studentId) => ({
                        id: studentId,
                    }))
                };
            }
            const subject = await prisma.subject.create({
                data: subjectData,
            });
            /*
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
            
                  // Actualiza el teacher para añadir el nuevo subject
                  if (teacherId) {
                    await prisma.user.update({
                      where: {
                        id: teacherId,
                      },
                      data: {
                        subjects: {
                          connect: {
                            id: subject.id,
                          },
                        },
                      },
                    });
                  }
            */
            return res.status(201).json({
                result: true,
                subject: subject,
            });
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },
    update: async (req, res) => {
        try {
            const id = parseInt(req.params.subject_id);
            if (!id) {
                return res.status(400).json({
                    result: false,
                    message: 'Id is required',
                });
            }
            const { name, teacherId, courseId, schelude, startSubject, endSubject, active, students } = req.body;
            // Preparar los datos para la actualización
            const data = {
                updatedAt: new Date(),
            };
            if (name !== undefined)
                data.name = name;
            if (teacherId !== undefined)
                data.teacherId = teacherId;
            if (courseId !== undefined)
                data.courseId = courseId;
            if (schelude !== undefined)
                data.schelude = schelude;
            if (startSubject !== undefined)
                data.startSubject = startSubject;
            if (endSubject !== undefined)
                data.endSubject = endSubject;
            if (active !== undefined)
                data.active = active;
            if (students !== undefined)
                data.students = { set: students.map((studentId) => ({ id: studentId })) };
            // Actualizar el subject
            const subject = await prisma.subject.update({
                where: {
                    id: id,
                },
                data,
            });
            return res.status(200).json({
                result: true,
                message: 'Subject updated',
                subject,
            });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({
                result: false,
                message: 'Internal server error',
            });
        }
    },
    addStudents: async (req, res) => {
        const subjectId = parseInt(req.params.subject_id);
        const { students } = req.body;
        if (!subjectId || !students) {
            return res.status(400).json({
                result: false,
                message: 'Fields subjectId and students are required',
            });
        }
        try {
            students.forEach(async (studentId) => {
                await prisma.subject.update({
                    where: {
                        id: subjectId
                    },
                    data: {
                        students: {
                            connect: {
                                id: studentId
                            }
                        }
                    }
                });
            });
            return res.status(200).json({
                result: true,
                message: 'Students added successfully',
            });
        }
        catch (error) {
            res.status(500).json({
                result: false,
                message: 'Internal server error',
            });
        }
    },
    delete: async (req, res) => {
        try {
            const id = parseInt(req.params.subject_id);
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
        }
        catch (error) {
            res.status(500).json({
                result: false,
                message: 'Internal server error',
                error: error,
            });
        }
    },
    getAll: async (req, res) => {
        const courseId = parseInt(req.query.courseId);
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
                }
                else {
                    return res.status(200).json({
                        result: true,
                        message: 'Subjects found',
                        subjects,
                    });
                }
            }
            else {
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
        }
        catch (error) {
            console.log(error);
            res.status(500).json({
                result: false,
                message: 'Internal server error',
                error: error,
            });
        }
    },
};
export default SubjectsController;
//# sourceMappingURL=subjects.controller.js.map