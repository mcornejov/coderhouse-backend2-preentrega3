import { randomUUID } from 'node:crypto';
import { BadRequestError, ConflictError, UnauthorizedError } from '../utils/errors.util.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import {
  isNonEmptyString,
  isValidEmail,
  isPasswordTooLong,
  normalizeEmail,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_BYTES,
} from '../utils/validators.js';

// Campos que el registro público acepta del cliente. El rol NO está en la lista:
// siempre se asigna el valor por defecto del modelo (menor privilegio).
const CAMPOS_REGISTRO = ['first_name', 'last_name', 'email', 'password'];
const CAMPOS_LOGIN = ['email', 'password'];

// Hash señuelo: se genera una sola vez a partir de un valor aleatorio y no
// corresponde a ningún usuario. Sirve para que el login tarde lo mismo exista o
// no el email, evitando que el tiempo de respuesta delate qué correos están registrados.
let hashSenueloPromesa = null;
function obtenerHashSenuelo() {
  hashSenueloPromesa ??= hashPassword(randomUUID());
  return hashSenueloPromesa;
}

// Capa de negocio de sesiones: reglas de identidad (validación, unicidad,
// protección de contraseñas, verificación de credenciales). No conoce HTTP ni Mongoose.
export default class SessionsService {
  constructor(usersRepository) {
    this.usersRepository = usersRepository;
  }

  /**
   * Registra un usuario con rol por defecto. Lanza BadRequestError (400) si faltan
   * campos o no cumplen formato/largo, y ConflictError (409) si el email ya existe.
   * @param {{ first_name?: string, last_name?: string, email?: string, password?: string }} datos
   * @returns {Promise<{ id: string, first_name: string, last_name: string, email: string, role: string }>}
   */
  async register(datos = {}) {
    // 1. Presencia de campos obligatorios
    const faltantes = CAMPOS_REGISTRO.filter((campo) => !isNonEmptyString(datos[campo]));
    if (faltantes.length > 0) {
      throw new BadRequestError('Faltan campos obligatorios');
    }

    // 2. Formato de email y longitud mínima de contraseña
    if (!isValidEmail(datos.email)) {
      throw new BadRequestError('El email no tiene un formato válido');
    }
    if (datos.password.length < PASSWORD_MIN_LENGTH) {
      throw new BadRequestError(`La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`);
    }
    if (isPasswordTooLong(datos.password)) {
      throw new BadRequestError(`La contraseña no puede superar los ${PASSWORD_MAX_BYTES} bytes`);
    }

    // 3. Normalización y unicidad del email
    const email = normalizeEmail(datos.email);
    if (await this.usersRepository.existsByEmail(email)) {
      throw new ConflictError('El email ya está registrado');
    }

    // 4. La contraseña nunca se persiste en texto plano
    const password = await hashPassword(datos.password);

    // 5. Persistencia con whitelist de campos (el rol queda en su valor por defecto)
    return this.usersRepository.create({
      first_name: datos.first_name.trim(),
      last_name: datos.last_name.trim(),
      email,
      password,
    });
  }

  /**
   * Verifica las credenciales y devuelve los datos mínimos del usuario autenticado.
   * Lanza BadRequestError (400) si falta email o password y UnauthorizedError (401)
   * con un mensaje genérico ante cualquier discrepancia: no se revela si el email
   * existe o si falló la contraseña.
   * @param {{ email?: string, password?: string }} datos
   * @returns {Promise<{ id: string, email: string, role: string }>}
   */
  async login(datos = {}) {
    const faltantes = CAMPOS_LOGIN.filter((campo) => !isNonEmptyString(datos[campo]));
    if (faltantes.length > 0) {
      throw new BadRequestError('Faltan campos obligatorios');
    }

    const credenciales = await this.usersRepository.findCredentialsByEmail(
      normalizeEmail(datos.email)
    );

    // Se compara aunque el usuario no exista (ver hash señuelo más arriba)
    const hash = credenciales?.passwordHash ?? (await obtenerHashSenuelo());
    const coincide = await comparePassword(datos.password, hash);

    if (!credenciales || !coincide) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    return credenciales.user;
  }
}
