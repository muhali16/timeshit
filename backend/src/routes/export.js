const exportController = require('../controllers/exportController');
const authMiddleware = require('../middleware/auth');

const exportExcelSchema = {
  tags: ['Export'],
  summary: 'Export timesheet to Excel',
  description: 'Generate and download an Excel file containing timesheet entries. Supports custom column selection and ordering via the columns query parameter (comma-separated list of column keys in desired order).',
  querystring: {
    type: 'object',
    properties: {
      date_from: { type: 'string', format: 'date', description: 'Start date (YYYY-MM-DD)' },
      date_to: { type: 'string', format: 'date', description: 'End date (YYYY-MM-DD)' },
      columns: { type: 'string', description: 'Comma-separated column keys in desired order. Available: tanggal, hari, jam_mulai, jam_selesai, istirahat, durasi, lokasi, aktivitas, jumlah_evidence, link_evidence' },
    },
  },
  response: {
    200: {
      description: 'Excel file stream',
      type: 'string',
      format: 'binary',
    },
    401: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
    500: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        error: { type: 'string' },
      },
    },
  },
};

async function exportRoutes(fastify, options) {
  fastify.get('/export/excel', {
    preHandler: [authMiddleware],
    schema: exportExcelSchema,
    handler: exportController.exportExcel.bind(exportController),
  });
}

module.exports = exportRoutes;
