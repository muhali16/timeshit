const holidayController = require('../controllers/holidayController');
const authMiddleware = require('../middleware/auth');

async function holidayRoutes(fastify, options) {
  fastify.get('/holidays', {
    preHandler: [authMiddleware],
    handler: holidayController.listHolidays.bind(holidayController),
  });
  fastify.post('/holidays/sync', {
    preHandler: [authMiddleware],
    handler: holidayController.syncFromApi.bind(holidayController),
  });
  fastify.post('/holidays/upload', {
    preHandler: [authMiddleware],
    handler: holidayController.uploadExcel.bind(holidayController),
  });
  fastify.delete('/holidays/:id', {
    preHandler: [authMiddleware],
    handler: holidayController.deleteHoliday.bind(holidayController),
  });
}

module.exports = holidayRoutes;
