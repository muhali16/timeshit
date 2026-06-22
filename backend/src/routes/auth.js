const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

async function authRoutes(fastify, options) {
  fastify.get('/auth/google', {
    schema: {
      tags: ['Auth'],
      summary: 'Redirect to Google OAuth consent screen',
      querystring: {
        type: 'object',
        properties: {
          login_hint: { type: 'string' },
        },
      },
    },
    handler: authController.googleRedirect.bind(authController),
  });

  fastify.get('/auth/google/callback', {
    schema: {
      tags: ['Auth'],
      summary: 'Handle Google OAuth callback',
      querystring: {
        type: 'object',
        properties: {
          code: { type: 'string' },
        },
      },
    },
    handler: authController.googleCallback.bind(authController),
  });

  fastify.get('/auth/me', {
    preHandler: [authMiddleware],
    schema: {
      tags: ['Auth'],
      summary: 'Get current authenticated user',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object', additionalProperties: true },
          },
        },
      },
    },
    handler: authController.me.bind(authController),
  });

  fastify.post('/auth/logout', {
    schema: {
      tags: ['Auth'],
      summary: 'Logout and clear JWT cookie',
    },
    handler: authController.logout.bind(authController),
  });
}

module.exports = authRoutes;
