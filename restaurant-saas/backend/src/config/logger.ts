import winston from 'winston';
import { env } from './env';

const SENSITIVE_KEYS = /password|secret|token|authorization|cookie|apikey|api_key|jwt|refresh/i;

function redactSensitive(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(redactSensitive);
  }

  const redacted: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    redacted[key] = SENSITIVE_KEYS.test(key) ? '[REDACTED]' : redactSensitive(entry);
  }
  return redacted;
}

const redactFormat = winston.format((info) => {
  for (const [key, value] of Object.entries(info)) {
    if (key === 'level' || key === 'message' || key === 'timestamp') {
      continue;
    }

    if (SENSITIVE_KEYS.test(key)) {
      info[key] = '[REDACTED]';
      continue;
    }

    info[key] = redactSensitive(value);
  }

  return info;
});

const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  redactFormat(),
  winston.format.printf(({ level, message, timestamp, requestId, stack, ...meta }) => {
    const base = `${timestamp} [${level}]${requestId ? ` [${String(requestId)}]` : ''} ${message}`;
    const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return stack ? `${base}\n${stack}${extra}` : `${base}${extra}`;
  }),
);

const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  redactFormat(),
  winston.format.json(),
);

const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  defaultMeta: { service: 'restaurant-automation-backend' },
  format: env.isProduction ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ],
});

export { logger };
export default logger;
