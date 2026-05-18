require('dotenv').config();

const buildApp = require('./app');

async function start() {
  try {
    const fastify = await buildApp();
    const port = parseInt(process.env.API_PORT, 10) || 3000;
    const host = process.env.API_HOST || '0.0.0.0';

    await fastify.listen({ port, host });
    fastify.log.info(`Server listening on http://${host}:${port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

start();
