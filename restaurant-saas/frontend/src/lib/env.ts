import { z } from 'zod';

const envSchema = z.object({
  VITE_APP_NAME: z.string().default('Restaurant Automation'),
  VITE_APP_ENV: z.enum(['development', 'production', 'test']).default('development'),
  VITE_API_URL: z.string().url().default('http://localhost:5000/api/v1'),
  VITE_SOCKET_URL: z.string().url().default('http://localhost:5000'),
  VITE_SENTRY_DSN: z.string().optional(),
  VITE_ENABLE_NOTIFICATIONS: z.string().transform((value) => value === 'true').default('true'),
  VITE_ENABLE_ANALYTICS: z.string().transform((value) => value === 'true').default('false'),
  VITE_DEBUG_MODE: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  throw new Error('Invalid environment variables');
}

export const env = {
  appName: parsed.data.VITE_APP_NAME,
  mode: parsed.data.VITE_APP_ENV,
  apiUrl: parsed.data.VITE_API_URL,
  socketUrl: parsed.data.VITE_SOCKET_URL,
  sentryDsn: parsed.data.VITE_SENTRY_DSN ?? '',
  notificationsEnabled: parsed.data.VITE_ENABLE_NOTIFICATIONS,
  analyticsEnabled: parsed.data.VITE_ENABLE_ANALYTICS,
  debug: parsed.data.VITE_DEBUG_MODE ?? false,
};
