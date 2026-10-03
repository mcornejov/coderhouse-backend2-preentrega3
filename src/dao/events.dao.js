// DAO de eventos con almacenamiento en memoria. Es la única capa que conoce
// cómo se guardan los datos; en la próxima entrega se reemplaza por una
// implementación con Mongoose sin tocar repositories, services ni controllers.
export default class EventsDao {
  #eventos = [];

  async getAll() {
    return [...this.#eventos];
  }

  async getById(id) {
    return this.#eventos.find((evento) => evento.id === id) ?? null;
  }
}
