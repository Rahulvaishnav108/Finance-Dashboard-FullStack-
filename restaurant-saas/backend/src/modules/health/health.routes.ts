import { Router } from 'express';
import { getHealth, getReady, getVersion } from './health.controller';

export const healthRouter = Router();

healthRouter.get('/health', getHealth);
healthRouter.get('/ready', getReady);
healthRouter.get('/version', getVersion);
