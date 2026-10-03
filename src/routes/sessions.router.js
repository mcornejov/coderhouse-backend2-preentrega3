import { Router } from 'express';
import UsersDao from '../dao/users.dao.js';
import UsersRepository from '../repositories/users.repository.js';
import SessionsService from '../services/sessions.service.js';
import SessionsController from '../controllers/sessions.controller.js';
import { auth } from '../middlewares/auth.middleware.js';

// Composición de la cadena de capas del recurso sessions:
// router → controller → service → repository → dao → modelo User
const controller = new SessionsController(
  new SessionsService(new UsersRepository(new UsersDao()))
);

const router = Router();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/current', auth, controller.current);
router.post('/logout', controller.logout);

export default router;
