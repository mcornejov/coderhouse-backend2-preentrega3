import { Router } from 'express';
import EventsDao from '../dao/events.dao.js';
import EventsRepository from '../repositories/events.repository.js';
import EventsService from '../services/events.service.js';
import EventsController from '../controllers/events.controller.js';

// Composición de la cadena de capas del recurso events:
// router → controller → service → repository → dao
const controller = new EventsController(
  new EventsService(new EventsRepository(new EventsDao()))
);

const router = Router();

router.get('/', controller.listar);
router.get('/:eid', controller.obtenerPorId);

export default router;
