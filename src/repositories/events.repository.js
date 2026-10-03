// El repositorio abstrae al resto de la app de cómo se accede a los datos.
// Acá se centralizará la transformación a DTO cuando el dominio crezca.
export default class EventsRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async getAll() {
    return this.dao.getAll();
  }

  async getById(id) {
    return this.dao.getById(id);
  }
}
