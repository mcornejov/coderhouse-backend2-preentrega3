import { NotFoundError } from '../utils/errors.util.js';

// Capa de negocio: reglas de la plataforma de eventos. No conoce HTTP ni
// detalles de persistencia; recibe y devuelve valores planos.
export default class EventsService {
  constructor(repository) {
    this.repository = repository;
  }

  async listar() {
    return this.repository.getAll();
  }

  async obtenerPorId(id) {
    const evento = await this.repository.getById(id);
    if (!evento) {
      throw new NotFoundError(`No existe un evento con id ${id}`);
    }
    return evento;
  }
}
