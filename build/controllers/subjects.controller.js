import { prisma } from '../config/prisma.client.js';
const SubjectsController = {
    create: async (req, res) => {
        try {
            const { name, courseId } = req.body;
            if (!name || !courseId) {
                return res
                    .status(400)
                    .json({
                    result: false,
                    message: 'All fields are required'
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
            const subject = await prisma.subject.create({
                data: {
                    name,
                    courseId,
                },
            });
            return res.status(201).json({
                result: true,
                subject: subject,
            });
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },
    //!Error 404
    update: async (req, res) => {
        try {
            const id = parseInt(req.params.subject_id);
            if (!id) {
                return res.status(400).json({
                    result: false,
                    message: 'Id is required',
                });
            }
            const { name, courseId, teacherId } = req.body;
            if (!name || !courseId || !teacherId) {
                return res.status(400).json({
                    result: false,
                    message: 'All fields are required',
                });
            }
            const subject = await prisma.subject.update({
                where: {
                    id: id,
                },
                data: {
                    name,
                    courseId,
                    teacherId,
                    updatedAt: new Date(),
                },
            });
            if (subject) {
                return res.status(200).json({
                    result: true,
                    message: 'Subject updated',
                    subject,
                });
            }
        }
        catch (error) {
            console.log(error);
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
                const fillteredsubjects = await prisma.subject.findMany({
                    where: {
                        active: true,
                        courseId,
                    },
                });
                if (!fillteredsubjects) {
                    return res.status(404).json({
                        result: false,
                        message: 'Subjects not found',
                    });
                }
                else {
                    return res.status(200).json({
                        result: true,
                        message: 'Subjects found',
                        fillteredsubjects,
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
    assignCourse: async (req, res) => {
        const id = parseInt(req.params.subject_id);
        console.log(req.params);
        const { courseID } = req.body;
        const course = parseInt(courseID);
        let courseFilter;
        if (!id) {
            return res.status(400).json({
                result: false,
                message: 'Id is required',
            });
        }
        if (!courseID) { // agregar que si no se envia el course el subject queda sin asignar
            return res.status(400).json({
                result: false,
                message: 'Course field is required',
            });
        }
        if (courseID) {
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
        }
        catch (error) {
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
//# sourceMappingURL=subjects.controller.js.map