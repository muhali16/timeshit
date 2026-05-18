const templateController = require('../controllers/templateController');
const authMiddleware = require('../middleware/auth');

async function templateRoutes(fastify, options) {
  fastify.post('/export/template', {
    preHandler: [authMiddleware],
    handler: templateController.uploadTemplate.bind(templateController),
  });

  fastify.get('/export/template', {
    preHandler: [authMiddleware],
    handler: templateController.getTemplate.bind(templateController),
  });

  fastify.get('/export/template/download', {
    preHandler: [authMiddleware],
    handler: templateController.downloadTemplate.bind(templateController),
  });

  fastify.delete('/export/template', {
    preHandler: [authMiddleware],
    handler: templateController.deleteTemplate.bind(templateController),
  });
}

module.exports = templateRoutes;
