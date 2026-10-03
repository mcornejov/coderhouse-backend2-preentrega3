import express from 'express';
import cookieParser from 'cookie-parser';
import apiRouter from './routes/index.js';
import { notFound } from './middlewares/notFound.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';

// Configura la aplicación de Express. No levanta el servidor: eso lo hace
// server.js, lo que permite reutilizar la app en tests sin abrir un puerto.
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Deja las cookies de la petición disponibles en req.cookies (la cookie de sesión currentUser)
app.use(cookieParser());

app.use('/api', apiRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
