import { prisma } from '../config/prisma.client.js';
import studentHelper from '../helpers/student.helper.js';
const StudentsController = {
    getStudents: async (req, res) => {
        try {
            if (req.query.id) {
                const id = parseInt(req.query.id);
                const student = await prisma.student.findUnique({
                    where: {
                        id: id,
                        active: true
                    }
                });
                if (student) {
                    return res.status(200).json({
                        result: true,
                        message: 'Student found',
                        student
                    });
                }
                return res.status(404).json({
                    result: false,
                    message: 'Student not found'
                });
            }
            const students = await prisma.student.findMany({
                where: {
                    active: true
                }
            });
            if (students && students.length > 0) {
                return res.status(200).json({
                    result: true,
                    message: 'Students found',
                    students
                });
            }
            return res.status(404).json({
                result: false,
                message: 'Students not found'
            });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({
                result: false,
                message: 'Internal server error'
            });
        }
    },
    register: async (req, res) => {
        try {
            const checkData = await studentHelper.checkData(req.body);
            if (!checkData.result) {
                return res.status(400).json({
                    result: false,
                    message: checkData.message
                });
            }
            const { internal_id, name, surname, password, personal_id, birthdate, contact_email, contact_phone, subject_id } = req.body;
            const student = await prisma.student.create({
                data: {
                    name,
                    surname,
                    personal_id: personal_id ? personal_id : null,
                    birthdate: birthdate ? new Date(birthdate) : null,
                    internal_id: internal_id ? internal_id : null,
                    contact_phone: contact_phone ? contact_phone : null,
                    contact_email: contact_email ? contact_email : null,
                }
            });
            if (subject_id && student) {
                await prisma.student.update({
                    where: { id: student.id },
                    data: {
                        subjects: { connect: subject_id }
                    }
                });
            }
            if (student) {
                return res.status(201).json({
                    result: true,
                    message: 'Student created',
                    student
                });
            }
            return res.status(400).json({
                result: false,
                message: 'Student not created'
            });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({
                result: false,
                message: 'Internal server error'
            });
        }
    },
    excelImport: async (req, res) => {
        try {
            if (!req.file || !req.body.name || !req.body.surname) {
                return res.status(400).json({
                    result: false,
                    message: 'File and column name and surname are required'
                });
            }
            const studentsStatus = [];
            const students = await studentHelper.registerFromExcel(req.file, { ...req.body });
            const promises = students.map(async (student) => {
                const checkData = await studentHelper.checkData(student);
                if (!checkData.result) {
                    studentsStatus.push({ ...student, status: checkData.message });
                }
                else {
                    studentsStatus.push({ ...student, status: 'created' });
                    await prisma.student.create({ data: student });
                }
                return await prisma.student.create({ data: student });
            });
            await Promise.all(promises);
            return res.status(201).json({
                result: true,
                message: 'Students created',
                studentsStatus
            });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({
                result: false,
                message: 'Internal server error'
            });
        }
    },
    update: async (req, res) => {
        try {
            const id = parseInt(req.params.student_id);
            if (!id) {
                return res.status(400).json({
                    result: false,
                    message: 'Id is required',
                });
            }
            const { internal_id, name, surname, password, personal_id, birthdate, contact_email, contact_phone } = req.body;
            const data = {
                internal_id: internal_id || null,
                name: name || null,
                surname: surname || null,
                password: password || null,
                personal_id: personal_id || null,
                birthdate: new Date(birthdate) || null,
                contact_email: contact_email || null,
                contact_phone: contact_phone || null
            };
            const student = await prisma.student.update({
                where: { id: id },
                data
            });
            if (student) {
                return res.status(200).json({
                    result: true,
                    message: 'Student updated',
                    student
                });
            }
        }
        catch (error) {
            console.log(error);
            res.status(500).json({
                result: false,
                message: 'Internal server error'
            });
        }
    },
    delete: async (req, res) => {
        try {
            const id = parseInt(req.params.student_id);
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
            });
            if (student) {
                return res.status(200).json({
                    result: true,
                    message: 'Student deleted',
                    student
                });
            }
            return res.status(404).json({
                result: false,
                message: 'Student not found'
            });
        }
        catch (error) {
            let message = 'Internal server error';
            if (error.code === 'P2025') {
                message = 'Student not found';
            }
            res.status(500).json({
                result: false,
                message: message
            });
        }
    },
    getDeleted: async (req, res) => {
        try {
            const students = await prisma.student.findMany({
                where: {
                    active: false
                }
            });
            if (students) {
                return res.status(200).json({
                    result: true,
                    message: 'Students found',
                    students
                });
            }
            return res.status(404).json({
                result: false,
                message: 'Students not found'
            });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({
                result: false,
                message: 'Internal server error'
            });
        }
    },
    restore: async (req, res) => {
        try {
            const id = parseInt(req.params.student_id);
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
            });
            if (student) {
                return res.status(200).json({
                    result: true,
                    message: 'Student restored'
                });
            }
            return res.status(404).json({
                result: false,
                message: 'Student not found'
            });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({
                result: false,
                message: 'Internal server error'
            });
        }
    }
};
export default StudentsController;
//# sourceMappingURL=students.controller.js.map