import { verifyToken } from '../utils/jwt.js';
import { AUTH_COOKIE_NAME } from '../utils/cookies.util.js';
import { toSessionDTO } from '../dto/user.dto.js';
import { UnauthorizedError } from '../utils/errors.util.js';

// Formato del header Authorization, tolerante a espacios extra y mayúsculas en "Bearer"
const BEARER_REGEX = /^\s*Bearer\s+(\S+)\s*$/i;

// Obtiene el token de la cookie de sesión o, en su defecto, del header
// Authorization: Bearer <token> (útil para clientes que no manejan cookies).
function extraerToken(req) {
  const desdeCookie = req.cookies?.[AUTH_COOKIE_NAME];
  if (typeof desdeCookie === 'string' && desdeCookie.length > 0) {
    return desdeCookie;
  }

  const coincidencia = BEARER_REGEX.exec(req.headers.authorization ?? '');
  return coincidencia ? coincidencia[1] : null;
}

/**
 * Middleware de autenticación: verifica el JWT y deja los datos mínimos del
 * usuario en req.user como { id, email, role }. Responde 401 "No autenticado"
 * ante cualquier falla (sin token, firma inválida, token manipulado o expirado),
 * sin dar detalles que ayuden a un atacante.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function auth(req, res, next) {
  const token = extraerToken(req);

  if (!token) {
    return next(new UnauthorizedError('No autenticado'));
  }

  try {
    const payload = verifyToken(token);
    req.user = toSessionDTO(payload);
    return next();
  } catch {
    return next(new UnauthorizedError('No autenticado'));
  }
}
