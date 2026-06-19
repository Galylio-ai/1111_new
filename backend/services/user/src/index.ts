import 'dotenv/config';
import path from 'path';
import express from 'express';
import helmet from 'helmet';
import { config } from './config';
import userRouter from './routes/user.routes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import fs from 'fs';

const app = express();
app.use(helmet());
app.use(express.json());

// Serve uploaded avatars
const avatarsDir = path.join(config.uploadPath, 'avatars');
fs.mkdirSync(avatarsDir, { recursive: true });
app.use('/uploads', express.static(config.uploadPath));

app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', service: 'user' } });
});

app.use('/users', userRouter);
app.use(errorHandler);

app.listen(config.port, () => {
  logger.info(`User service running on port ${config.port}`);
});
