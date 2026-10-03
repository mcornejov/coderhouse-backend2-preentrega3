import User from '../models/User.js';

// DAO de usuarios: única capa que conoce Mongoose y el modelo User.
export default class UsersDao {
  async create(userData) {
    const user = await User.create(userData);
    return user.toObject();
  }

  async findByEmail(email) {
    return User.findOne({ email }).lean();
  }

  async findById(id) {
    return User.findById(id).lean();
  }
}
