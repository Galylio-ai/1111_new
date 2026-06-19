import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import { config } from './config';
import engagementRouter from './routes/engagement.routes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const app = express();
app.use(helmet());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', service: config.serviceName } });
});

app.use('/engagement', engagementRouter);
app.use(errorHandler);

app.listen(config.port, () => {
  logger.info(`${config.serviceName} service running on port ${config.port}`);
});
