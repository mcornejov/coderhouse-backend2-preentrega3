import { responderExito } from '../utils/responses.util.js';

// Controlador de eventos: extrae datos de la petición, delega en el servicio
// y responde en HTTP. Los errores se envían al middleware global con next().
export default class EventsController {
  constructor(service) {
    this.service = service;
  }

  listar = async (req, res, next) => {
    try {
      const eventos = await this.service.listar();
      return responderExito(res, eventos);
    } catch (error) {
      return next(error);
    }
  };

  obtenerPorId = async (req, res, next) => {
    try {
      const evento = await this.service.obtenerPorId(req.params.eid);
      return responderExito(res, evento);
    } catch (error) {
      return next(error);
    }
  };
}
