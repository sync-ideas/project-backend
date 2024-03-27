import { Request, Response } from 'express-serve-static-core';
import { prisma } from '../config/prisma.client.js';
import { Attendance } from '@prisma/client';

const CronController = {

  updateAttendance: async (_: Request, res: Response) => {
    console.log('Cron running')
    res.status(200).json({
      result: true,
      message: 'Cron running',
    })

    // Obtener estudiantes inactivos
    const inactiveStudents = await prisma.student.findMany({ select: { id: true }, where: { active: false } })
    // Registrar asistencias de estudiantes inactivos
    const idsToUpdate = inactiveStudents.map(student => student.id)
    await prisma.attendance.updateMany({
      where: {
        "studentId": {
          in: idsToUpdate
        },
        registered: false
      },
      data: {
        registered: true
      }
    })

    // Obtener todos los id de estudiantes
    const students = await prisma.student.findMany({ select: { id: true }, where: { active: true } })

    // Obtener todas las fechas con registro de asistencias no registradas
    const dates: [{ day: Date }] = await prisma.$queryRaw`
      SELECT
        DATE(date) AS day
      FROM attendances
      WHERE registered = false
      GROUP BY day
    `
    // Verificar asistencias de las fechas con registro para todos los estudiantes
    for (const date of dates) {
      for (const student of students) { // Estudiantes activos
        const attendance: [Attendance] = await prisma.$queryRaw`
          SELECT
            *
          FROM attendances
          WHERE
            DATE(date) = ${date.day} AND
            "studentId" = ${student.id} AND
            registered = false
        `
        if (attendance.length < 1) { // No hay asistencia registrada
          await prisma.nonattendance.create({
            data: {
              date: new Date(date.day),
              subjectId: 67,
              studentId: student.id
            }
          })
        }
        if (attendance.length > 0) {
          // Borrar registros de asistencia duplicados
          const idsToDelete = attendance.slice(1).map(attendance => attendance.id)
          await prisma.attendance.deleteMany({
            where: {
              id: {
                in: idsToDelete
              }
            }
          })
          // actualizar asistencia registrada
          await prisma.attendance.updateMany({
            where: {
              id: attendance[0].id
            },
            data: {
              registered: true
            }
          })
        }
      }

    }

  }


}

export default CronController