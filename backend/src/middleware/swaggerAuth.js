// Simple basic auth middleware for Swagger docs
function createSwaggerAuthMiddleware(username, password) {
  return async function swaggerAuth(req, reply) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      reply.header('WWW-Authenticate', 'Basic realm="API Docs"');
      return reply.status(401).send({
        success: false,
        message: 'Autentikasi diperlukan',
      });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [providedUser, providedPass] = credentials.split(':');

    if (providedUser !== username || providedPass !== password) {
      reply.header('WWW-Authenticate', 'Basic realm="API Docs"');
      return reply.status(401).send({
        success: false,
        message: 'Kredensial tidak valid',
      });
    }
  };
}

module.exports = { createSwaggerAuthMiddleware };
