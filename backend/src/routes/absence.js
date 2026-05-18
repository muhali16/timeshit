const absenceController = require('../controllers/absenceController');
const authMiddleware = require('../middleware/auth');

async function absenceRoutes(fastify, options) {
  // Absence Reasons
  fastify.get('/absence-reasons', {
    preHandler: [authMiddleware],
    handler: absenceController.listReasons.bind(absenceController),
  });
  fastify.post('/absence-reasons', {
    preHandler: [authMiddleware],
    handler: absenceController.createReason.bind(absenceController),
  });
  fastify.put('/absence-reasons/:id', {
    preHandler: [authMiddleware],
    handler: absenceController.updateReason.bind(absenceController),
  });
  fastify.delete('/absence-reasons/:id', {
    preHandler: [authMiddleware],
    handler: absenceController.deleteReason.bind(absenceController),
  });

  // Absence Entries
  fastify.get('/absence', {
    preHandler: [authMiddleware],
    handler: absenceController.listEntries.bind(absenceController),
  });
  fastify.post('/absence', {
    preHandler: [authMiddleware],
    handler: absenceController.createEntry.bind(absenceController),
  });
  fastify.put('/absence/:id', {
    preHandler: [authMiddleware],
    handler: absenceController.updateEntry.bind(absenceController),
  });
  fastify.delete('/absence/:id', {
    preHandler: [authMiddleware],
    handler: absenceController.deleteEntry.bind(absenceController),
  });
  fastify.get('/absence/check', {
    preHandler: [authMiddleware],
    handler: absenceController.getByDate.bind(absenceController),
  });
}

module.exports = absenceRoutes;
