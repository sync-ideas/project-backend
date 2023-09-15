import express from 'express';
import cors from 'cors';
import { PORT } from './config/environment.js';
const app = express();
// ---------- Middlewares ----------
app.use(cors());
// ---------- Routes ---------------
console.log('Routes...');
// ---------- Start server ---------
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map