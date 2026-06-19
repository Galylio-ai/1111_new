import 'dotenv/config';

export const config = {
  port: parseInt(process.env.GATEWAY_PORT ?? '3000', 10),
  jwtSecret: process.env.JWT_SECRET ?? '',
  authServiceUrl: process.env.AUTH_SERVICE_URL ?? 'http://auth:3001',
  userServiceUrl: process.env.USER_SERVICE_URL ?? 'http://user:3002',
  retailServiceUrl: process.env.RETAIL_SERVICE_URL ?? 'http://retail:3003',
  paraServiceUrl: process.env.PARA_SERVICE_URL ?? 'http://para:3004',
  alimentationServiceUrl: process.env.ALIMENTATION_SERVICE_URL ?? 'http://alimentation:3005',
  fashionServiceUrl: process.env.FASHION_SERVICE_URL ?? 'http://fashion:3007',
  mailerApiServiceUrl: process.env.MAILER_API_SERVICE_URL ?? 'http://mailer-api:3006',
  engagementServiceUrl: process.env.ENGAGEMENT_SERVICE_URL ?? 'http://engagement:3008',
  webControlServiceUrl: process.env.WEB_CONTROL_SERVICE_URL ?? 'http://web-control:3009',
  rateLimitWindowMs: 15 * 60 * 1000,
  rateLimitMax: 100,
} as const;

if (!config.jwtSecret || config.jwtSecret.length < 32) {
  throw new Error(
    'JWT_SECRET is required and must be at least 32 characters (256-bit minimum)',
  );
}
