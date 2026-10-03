import mongoose from 'mongoose';

// Roles posibles en la plataforma. El valor por defecto es el de menor privilegio;
// organizer y admin solo se asignan por un proceso controlado, nunca desde el registro.
export const USER_ROLES = ['user', 'organizer', 'admin'];

const userSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Siempre almacena el hash generado con bcrypt, nunca la contraseña original
    password: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, default: 'user' },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
