require('dotenv').config();

const fs = require('fs');
const path = require('path');
const Fastify = require('fastify');
const cors = require('@fastify/cors');
const helmet = require('@fastify/helmet');
const multipart = require('@fastify/multipart');
const swagger = require('@fastify/swagger');
const swaggerUi = require('@fastify/swagger-ui');
const jwt = require('@fastify/jwt');
const cookie = require('@fastify/cookie');
const fastifyStatic = require('@fastify/static');

const timesheetRoutes = require('./routes/timesheet');
const authRoutes = require('./routes/auth');
const settingsRoutes = require('./routes/settings');
const exportRoutes = require('./routes/export');
const templateRoutes = require('./routes/template');
const absenceRoutes = require('./routes/absence');
const holidayRoutes = require('./routes/holiday');
const { createSwaggerAuthMiddleware } = require('./middleware/swaggerAuth');

async function buildApp() {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
  });

  await fastify.register(cors, {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:5173',
      'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  await fastify.register(helmet);

  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'fallback-secret-change-me',
  });

  await fastify.register(cookie);

  await fastify.register(multipart, {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB max per file
      files: 10, // max 10 files
    },
  });

  // Register Swagger (OpenAPI spec)
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'TimeShit API',
        description: 'API documentation for TimeShit timesheet application',
        version: '1.0.0',
      },
      servers: [
        {
          url: process.env.API_URL || 'http://localhost:3000/api',
          description: 'Local development server',
        },
      ],
      tags: [
        { name: 'Auth', description: 'Authentication endpoints' },
        { name: 'Timesheet', description: 'Timesheet entry endpoints' },
        { name: 'Settings', description: 'User settings endpoints' },
        { name: 'Export', description: 'Export and report endpoints' },
        { name: 'Absence', description: 'Absence and leave management endpoints' },
        { name: 'Holiday', description: 'National holidays management endpoints' },
        { name: 'System', description: 'System and health endpoints' },
      ],
    },
  });

  // Register Swagger UI under /internal/docs with basic auth
  const swaggerUsername = process.env.SWAGGER_USERNAME;
  const swaggerPassword = process.env.SWAGGER_PASSWORD;

  await fastify.register(swaggerUi, {
    routePrefix: '/internal/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject) => swaggerObject,
    transformSpecificationClone: true,
  });

  // Add basic auth to /internal/docs and its assets
  if (swaggerUsername && swaggerPassword) {
    const swaggerAuthMiddleware = createSwaggerAuthMiddleware(swaggerUsername, swaggerPassword);
    fastify.addHook('onRequest', async (req, reply) => {
      if (req.url.startsWith('/internal/docs')) {
        await swaggerAuthMiddleware(req, reply);
      }
    });
  }

  // Serve static uploads manually
  const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');

  fastify.get('/uploads/*', async (req, reply) => {
    const relativePath = req.params['*'];
    const filePath = path.join(uploadDir, relativePath);

    // Prevent directory traversal
    if (!filePath.startsWith(uploadDir)) {
      return reply.status(403).send({ success: false, message: 'Forbidden' });
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      return reply.status(404).send({ success: false, message: 'File not found' });
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.txt': 'text/plain',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };

    reply.type(mimeTypes[ext] || 'application/octet-stream');
    return fs.createReadStream(filePath);
  });

  // Register routes with prefix /api
  await fastify.register(authRoutes, { prefix: '/api' });
  await fastify.register(timesheetRoutes, { prefix: '/api' });
  await fastify.register(settingsRoutes, { prefix: '/api' });
  await fastify.register(exportRoutes, { prefix: '/api' });
  await fastify.register(templateRoutes, { prefix: '/api' });
  await fastify.register(absenceRoutes, { prefix: '/api' });
  await fastify.register(holidayRoutes, { prefix: '/api' });

  // Health check
  fastify.get('/health', async () => ({ status: 'ok' }));

  // Serve built frontend static files (PWA)
  const frontendDistPath = process.env.FRONTEND_DIST_PATH;
  if (frontendDistPath && fs.existsSync(frontendDistPath)) {
    await fastify.register(fastifyStatic, {
      root: frontendDistPath,
      prefix: '/',
      wildcard: true,
    });

    // SPA fallback: serve index.html for non-API routes
    fastify.setNotFoundHandler(async (req, reply) => {
      if (
        req.url.startsWith('/api') ||
        req.url.startsWith('/uploads') ||
        req.url.startsWith('/internal')
      ) {
        return reply.status(404).send({ success: false, message: 'Not found' });
      }
      return reply.sendFile('index.html', frontendDistPath);
    });
  }

  return fastify;
}

module.exports = buildApp;
