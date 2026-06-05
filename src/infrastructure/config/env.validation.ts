import * as Joi from 'joi';

const durationPattern = /^(\d+)(s|m|h|d)$/i;

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  APP_PORT: Joi.number().port().default(3000),
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info'),

  DB_HOST: Joi.string().hostname().required(),
  DB_PORT: Joi.number().port().default(3306),
  DB_USERNAME: Joi.string().min(1).required(),
  DB_PASSWORD: Joi.string().allow('').default(''),
  DB_NAME: Joi.string().min(1).required(),
  DB_SSL: Joi.string().valid('true', 'false').default('false'),
  DB_CONNECTION_LIMIT: Joi.number().default(10),
  DB_ROOT_PASSWORD: Joi.string().optional(),

  REDIS_ENABLED: Joi.string().valid('true', 'false').default('true'),
  REDIS_URL: Joi.when('REDIS_ENABLED', {
    is: 'true',
    then: Joi.string().uri().required(),
    otherwise: Joi.string().uri().optional(),
  }),
  PERMISSION_CACHE_TTL_SEC: Joi.number().default(60),

  OTEL_ENABLED: Joi.string().valid('true', 'false').default('false'),

  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().pattern(durationPattern).default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().pattern(durationPattern).default('7d'),

  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
  THROTTLE_TTL: Joi.number().default(60),
  THROTTLE_LIMIT: Joi.number().default(60),
  LOGIN_THROTTLE_TTL: Joi.number().default(60),
  LOGIN_THROTTLE_LIMIT: Joi.number().default(5),

  SWAGGER_ENABLED: Joi.string().valid('true', 'false').default('false'),

  SEED_ADMIN_EMAIL: Joi.string().email().optional(),
  SEED_ADMIN_PASSWORD: Joi.string().min(8).optional(),
});
