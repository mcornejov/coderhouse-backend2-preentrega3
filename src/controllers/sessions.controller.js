import { signToken } from '../utils/jwt.js';
import { AUTH_COOKIE_NAME, authCookieOptions, clearAuthCookieOptions } from '../utils/cookies.util.js';
import { responderExito, responderCreado, responderMensaje } from '../utils/responses.util.js';

// Controlador de sesiones: extrae datos de la petición, delega en el servicio y
// responde en HTTP (códigos, cookie de sesión). No contiene reglas de negocio.
export default class SessionsController {
  constructor(service) {
    this.service = service;
  }

  register = async (req, res, next) => {
    try {
      const usuario = await this.service.register(req.body);
      return responderCreado(res, usuario);
    } catch (error) {
      return next(error);
    }
  };

  // El servicio verifica las credenciales; aquí se emite el JWT y se guarda en
  // una cookie httpOnly. El token no viaja en el cuerpo de la respuesta.
  login = async (req, res, next) => {
    try {
      const usuario = await this.service.login(req.body);
      const token = signToken(usuario);
      res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions());
      return responderMensaje(res, 'Login correcto');
    } catch (error) {
      return next(error);
    }
  };

  // Protegida por auth.middleware: req.user ya contiene { id, email, role }
  current = (req, res) => {
    return responderExito(res, req.user);
  };

  logout = (req, res) => {
    res.clearCookie(AUTH_COOKIE_NAME, clearAuthCookieOptions());
    return responderMensaje(res, 'Sesión cerrada');
  };
}
