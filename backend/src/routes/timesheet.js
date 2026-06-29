const timesheetController = require('../controllers/timesheetController');
const authMiddleware = require('../middleware/auth');

const timesheetListSchema = {
  tags: ['Timesheet'],
  summary: 'List all timesheet entries',
  description: 'Retrieve a list of timesheet entries with optional date range filtering, pagination, and associated evidence files.',
  querystring: {
    type: 'object',
    properties: {
      date_from: { type: 'string', format: 'date' },
      date_to: { type: 'string', format: 'date' },
      limit: { type: 'integer', default: 50 },
      offset: { type: 'integer', default: 0 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'array' },
        total: { type: 'integer' },
        limit: { type: 'integer' },
        offset: { type: 'integer' },
      },
    },
  },
};

const timesheetCreateSchema = {
  tags: ['Timesheet'],
  summary: 'Create a new timesheet entry',
  description: 'Create a new timesheet entry (data only). Use POST /timesheet/:id/evidence to upload files separately.',
  body: {
    type: 'object',
    required: ['tanggal', 'jam_mulai', 'jam_selesai', 'lokasi', 'rincian_tugas'],
    properties: {
      tanggal: { type: 'string', format: 'date' },
      jam_mulai: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
      jam_selesai: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
      lokasi: { type: 'string' },
      rincian_tugas: { type: 'string' },
      tasks: { type: 'array', items: { type: 'object', additionalProperties: true } },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: { type: 'object', additionalProperties: true },
      },
    },
    400: {
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

const evidenceUploadSchema = {
  tags: ['Timesheet'],
  summary: 'Upload evidence files to a timesheet',
  description: 'Upload evidence files to Google Drive and link them to an existing timesheet entry. Files will be organized in folder YYYY-MM/.',
  consumes: ['multipart/form-data'],
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: { type: 'object', additionalProperties: true },
      },
    },
  },
};

async function timesheetRoutes(fastify, options) {
  fastify.get('/timesheet', {
    preHandler: [authMiddleware],
    schema: timesheetListSchema,
    handler: timesheetController.list.bind(timesheetController),
  });

  fastify.get('/timesheet/:id', {
    preHandler: [authMiddleware],
    schema: {
      tags: ['Timesheet'],
      summary: 'Get a single timesheet entry',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object', additionalProperties: true },
          },
        },
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
    handler: timesheetController.getById.bind(timesheetController),
  });

  fastify.post('/timesheet', {
    preHandler: [authMiddleware],
    schema: timesheetCreateSchema,
    handler: timesheetController.create.bind(timesheetController),
  });

  fastify.put('/timesheet/:id', {
    preHandler: [authMiddleware],
    schema: {
      tags: ['Timesheet'],
      summary: 'Update a timesheet entry',
      description: 'Update an existing timesheet entry. Only provided fields will be updated.',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        properties: {
          tanggal: { type: 'string', format: 'date' },
          jam_mulai: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
          jam_selesai: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
          lokasi: { type: 'string' },
          rincian_tugas: { type: 'string' },
          tasks: { type: 'array', items: { type: 'object', additionalProperties: true } },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object', additionalProperties: true },
          },
        },
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
        409: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
    handler: timesheetController.update.bind(timesheetController),
  });

  fastify.delete('/timesheet/:id', {
    preHandler: [authMiddleware],
    schema: {
      tags: ['Timesheet'],
      summary: 'Delete a timesheet entry',
      description: 'Delete an existing timesheet entry and its associated evidence files.',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
    handler: timesheetController.delete.bind(timesheetController),
  });

  fastify.delete('/timesheet/:id/evidence/:evidenceId', {
    preHandler: [authMiddleware],
    schema: {
      tags: ['Timesheet'],
      summary: 'Delete an evidence file',
      description: 'Delete an evidence file from the database and attempt to delete from Google Drive.',
      params: {
        type: 'object',
        required: ['id', 'evidenceId'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          evidenceId: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
    handler: timesheetController.deleteEvidence.bind(timesheetController),
  });

  fastify.post('/timesheet/:id/evidence', {
    preHandler: [authMiddleware],
    schema: evidenceUploadSchema,
    handler: timesheetController.uploadEvidence.bind(timesheetController),
  });
}

module.exports = timesheetRoutes;
