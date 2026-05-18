const settingsController = require('../controllers/settingsController');
const authMiddleware = require('../middleware/auth');

async function settingsRoutes(fastify, options) {
  fastify.get('/settings', {
    preHandler: [authMiddleware],
    schema: {
      tags: ['Settings'],
      summary: 'Get current user settings',
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
    handler: settingsController.get.bind(settingsController),
  });

  fastify.put('/settings', {
    preHandler: [authMiddleware],
    schema: {
      tags: ['Settings'],
      summary: 'Update user settings',
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          timezone: { type: 'string' },
          notificationEnabled: { type: 'boolean' },
          notificationTime: { type: 'string' },
          googleDriveFolderId: { type: 'string' },
          defaultStartTime: { type: 'string' },
          defaultEndTime: { type: 'string' },
          defaultBreakMinutes: { type: 'integer' },
          locations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                isDefault: { type: 'boolean' },
              },
            },
          },
          textFilter: {
            type: 'object',
            properties: {
              enabled: { type: 'boolean' },
              taskMarker: { type: 'string' },
              categories: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    keywords: { type: 'array', items: { type: 'string' } },
                    outputTemplate: { type: 'string' },
                    display: { type: 'string', enum: ['normal', 'muted'] },
                  },
                },
              },
              defaultCategory: { type: 'string' },
            },
          },
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
      },
    },
    handler: settingsController.update.bind(settingsController),
  });

  fastify.post('/settings/verify-folder', {
    preHandler: [authMiddleware],
    schema: {
      tags: ['Settings'],
      summary: 'Verify and save Google Drive folder ID',
      body: {
        type: 'object',
        required: ['folderId'],
        properties: {
          folderId: { type: 'string' },
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
      },
    },
    handler: settingsController.verifyFolder.bind(settingsController),
  });
}

module.exports = settingsRoutes;
