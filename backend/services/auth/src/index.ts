import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import { config } from './config';
import authRouter from './routes/auth.routes';
import { errorHandler } from './middleware/errorHandler';
import { connectRabbitMQ } from './utils/rabbitmq';
import { logger } from './utils/logger';

const app = express();
app.use(helmet());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', service: 'auth' } });
});

app.use('/auth', authRouter);
app.use(errorHandler);

async function start(): Promise<void> {
  try {
    await connectRabbitMQ();
  } catch (err) {
    logger.warn('RabbitMQ unavailable at startup — mails will be skipped until reconnected', {
      error: (err as Error).message,
    });
  }

  app.listen(config.port, () => {
    logger.info(`Auth service running on port ${config.port}`);
  });
}

start();
