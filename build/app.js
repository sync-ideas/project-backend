import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.route.js';
import { PORT } from './config/environment.js';
const app = express();
// ---------- Middlewares ----------
app.use(cors());
// ---------- Routes ---------------
app.use('/', authRouter);
// ---------- Start server ---------
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=app.js.map