import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';
import { config } from './config';
import webControlRouter from './routes/web-control.routes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const app = express();
app.use(helmet());
app.use(express.json({ limit: '2mb' }));

const mediaDir = path.join(config.uploadPath, 'web-media');
fs.mkdirSync(mediaDir, { recursive: true });
app.use('/uploads', express.static(config.uploadPath));

app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', service: config.serviceName } });
});

app.use('/web-control', webControlRouter);
app.use(errorHandler);

app.listen(config.port, () => {
  logger.info(`${config.serviceName} service running on port ${config.port}`);
});
