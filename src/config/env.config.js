import dotenv from 'dotenv';

// Carga las variables de entorno lo antes posible en el ciclo de vida de la app
dotenv.config({ quiet: true });

// Variables obligatorias para que la aplicación pueda iniciar.
// JWT_SECRET es obligatoria desde el login: sin ella no se pueden firmar ni verificar tokens.
const REQUERIDAS = ['PORT', 'NODE_ENV', 'MONGO_URL', 'JWT_SECRET'];

// Validación Fail-Fast: si falta alguna variable obligatoria, la app no arranca
const faltantes = REQUERIDAS.filter((clave) => !process.env[clave]);

if (faltantes.length > 0) {
  console.error(
    `Error de configuración: faltan variables de entorno obligatorias: ${faltantes.join(', ')}.`
  );
  console.error('Revisa tu archivo .env tomando como referencia .env.example.');
  process.exit(1);
}

const port = Number(process.env.PORT);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`Error de configuración: PORT debe ser un entero entre 1 y 65535 (valor recibido: "${process.env.PORT}").`);
  process.exit(1);
}

// Expiración del JWT en el formato que acepta jsonwebtoken: segundos ("3600") o
// duración con unidad ("15m", "1h", "7d"). Por defecto una hora, igual que la cookie.
const JWT_EXPIRES_IN_REGEX = /^\d+\s*(ms|s|m|h|d|w|y)?$/i;
const jwtExpiresIn = (process.env.JWT_EXPIRES_IN || '1h').trim();

if (!JWT_EXPIRES_IN_REGEX.test(jwtExpiresIn)) {
  console.error(`Error de configuración: JWT_EXPIRES_IN no es válida (valor recibido: "${jwtExpiresIn}"). Ejemplos: 3600, 15m, 1h, 7d.`);
  process.exit(1);
}

const config = {
  port,
  nodeEnv: process.env.NODE_ENV,
  isProduction: process.env.NODE_ENV === 'production',
  mongoUrl: process.env.MONGO_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn,
};

export default config;
