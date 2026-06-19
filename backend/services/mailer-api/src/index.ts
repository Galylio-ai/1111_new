import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import { config } from './config';
import mailerRouter from './routes/mailer.routes';
import { errorHandler } from './middleware/errorHandler';
import { connectRabbitMQ } from './utils/rabbitmq';
import { logger } from './utils/logger';

const app = express();
app.use(helmet());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', service: config.serviceName } });
});

app.use('/mail', mailerRouter);
app.use(errorHandler);

async function start(): Promise<void> {
  try {
    await connectRabbitMQ();
  } catch (err) {
    logger.warn('RabbitMQ unavailable at startup; test-send and retry will log skips until reconnected', {
      error: (err as Error).message,
    });
  }

  app.listen(config.port, () => {
    logger.info(`${config.serviceName} service running on port ${config.port}`);
  });
}

start();
