import express from 'express';
import cors from 'cors';
import { PORT } from './config/environment.js';
import studentsRouter from './routes/students.route.js';
import usersRouter from './routes/users.route.js';
import coursesRouter from './routes/courses.route.js';
const app = express();
// ---------- Middlewares ----------
app.use(express.json());
app.use(cors());
// ---------- Routes ---------------
app.use('/api', studentsRouter);
app.use('/api', usersRouter);
app.use('/api', coursesRouter);
// ---------- Start server ---------
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=app.js.map