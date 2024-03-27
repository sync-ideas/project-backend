import { prisma } from '../config/prisma.client.js';
const CronController = {
    updateAttendance: async (_, res) => {
        console.log('Cron running');
        // Obtener todos los id de estudiantes
        const students = await prisma.student.findMany({ select: { id: true }, where: { active: true } });
        // Obtener todas las fechas con registro de asistencias
        const dates = await prisma.$queryRaw `
      SELECT
        DATE(date) AS day
      FROM attendances
      WHERE registered = false
      GROUP BY day
    `;
        console.log(dates);
        // Actualizar asistencias de las fechas con registro
        for (const date of dates) {
            for (const student of students) {
                const attendance = await prisma.$queryRaw `
          SELECT
            *
          FROM attendances
          WHERE
            DATE(date) = ${date.day} AND
            studentId = ${student.id} AND
            registered = false
        `;
                console.log(attendance);
            }
        }
        return res.status(200).json({
            result: true,
            message: 'Cron running',
        });
    }
};
export default CronController;
//# sourceMappingURL=cron.controller.js.map