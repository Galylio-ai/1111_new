import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import { config } from './config';
import categoryRouter from './routes/category.routes';
import brandRouter from './routes/brand.routes';
import shopRouter from './routes/shop.routes';
import productRouter from './routes/product.routes';
import analyticsRouter from './routes/analytics.routes';
import importRouter from './routes/import.routes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const app = express();
app.use(helmet());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', service: config.serviceName } });
});

app.use('/categories', categoryRouter);
app.use('/brands', brandRouter);
app.use('/shops', shopRouter);
app.use('/products', productRouter);
app.use('/analytics', analyticsRouter);
app.use('/imports', importRouter);
app.use(errorHandler);

app.listen(config.port, () => {
  logger.info(`${config.serviceName} service running on port ${config.port}`);
});
