import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { config } from './config';
import { STRICT_AUTH_RATE_LIMIT_PATHS } from './config/routes';
import { adminOnlyMiddleware, jwtMiddleware } from './middleware/auth';
import { rateLimiter, strictRateLimiter } from './middleware/rateLimit';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const ALLOWED_ORIGINS: ReadonlySet<string> = new Set(
  (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
);

const app = express();

app.use((req, _res, next) => {
  delete req.headers['x-user-id'];
  delete req.headers['x-user-role'];
  next();
});

app.use(helmet());

app.use(
  cors({
    origin(requestOrigin, callback) {
      if (!requestOrigin || ALLOWED_ORIGINS.has(requestOrigin)) {
        callback(null, true);
      } else {
        logger.warn('CORS: rejected origin', { origin: requestOrigin });
        callback(new Error(`CORS policy does not allow origin: ${requestOrigin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(rateLimiter);

app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', service: 'gateway' } });
});

app.use([...STRICT_AUTH_RATE_LIMIT_PATHS], strictRateLimiter);

app.use(jwtMiddleware);
app.use(adminOnlyMiddleware);

app.use(
  '/api/auth',
  createProxyMiddleware({
    target: config.authServiceUrl,
    changeOrigin: true,
    pathRewrite: (path) => `/auth${path}`,
    on: {
      error: (err, _req, res) => {
        logger.error('Auth proxy error', { error: (err as Error).message });
        (res as express.Response)
          .status(502)
          .json({ success: false, message: 'Auth service unavailable' });
      },
    },
  }),
);

app.use(
  '/api/users',
  createProxyMiddleware({
    target: config.userServiceUrl,
    changeOrigin: true,
    pathRewrite: (path) => `/users${path}`,
    on: {
      error: (err, _req, res) => {
        logger.error('User proxy error', { error: (err as Error).message });
        (res as express.Response)
          .status(502)
          .json({ success: false, message: 'User service unavailable' });
      },
    },
  }),
);

app.use(
  '/api/mail',
  createProxyMiddleware({
    target: config.mailerApiServiceUrl,
    changeOrigin: true,
    pathRewrite: (path) => `/mail${path}`,
    on: {
      error: (err, _req, res) => {
        logger.error('Mailer API proxy error', { error: (err as Error).message });
        (res as express.Response)
          .status(502)
          .json({ success: false, message: 'Mailer API service unavailable' });
      },
    },
  }),
);

function catalogProxy(target: string, serviceName: string) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path) => path,
    on: {
      error: (err, _req, res) => {
        logger.error(`${serviceName} catalog proxy error`, { error: (err as Error).message });
        (res as express.Response)
          .status(502)
          .json({ success: false, message: `${serviceName} catalog service unavailable` });
      },
    },
  });
}

app.use('/api/admin/catalog/retail', catalogProxy(config.retailServiceUrl, 'Retail'));
app.use('/api/admin/catalog/para', catalogProxy(config.paraServiceUrl, 'Para'));
app.use(
  '/api/admin/catalog/alimentation',
  catalogProxy(config.alimentationServiceUrl, 'Alimentation'),
);
app.use('/api/admin/catalog/fashion', catalogProxy(config.fashionServiceUrl, 'Fashion'));

app.use(
  '/api/engagement',
  createProxyMiddleware({
    target: config.engagementServiceUrl,
    changeOrigin: true,
    pathRewrite: (path) => `/engagement${path}`,
    on: {
      error: (err, _req, res) => {
        logger.error('Engagement proxy error', { error: (err as Error).message });
        (res as express.Response)
          .status(502)
          .json({ success: false, message: 'Engagement service unavailable' });
      },
    },
  }),
);

app.use(
  '/api/admin/web-control',
  createProxyMiddleware({
    target: config.webControlServiceUrl,
    changeOrigin: true,
    pathRewrite: (path) => `/web-control${path}`,
    on: {
      error: (err, _req, res) => {
        logger.error('Web-control proxy error', { error: (err as Error).message });
        (res as express.Response)
          .status(502)
          .json({ success: false, message: 'Web-control service unavailable' });
      },
    },
  }),
);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  logger.info(`Gateway running on port ${config.port}`, {
    allowedOrigins: [...ALLOWED_ORIGINS],
  });
});
