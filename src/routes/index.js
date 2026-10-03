import { Router } from 'express';
import healthRouter from './health.router.js';
import eventsRouter from './events.router.js';
import sessionsRouter from './sessions.router.js';

// Router principal de la API: agrupa todos los recursos bajo /api
const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/events', eventsRouter);
apiRouter.use('/sessions', sessionsRouter);

export default apiRouter;
