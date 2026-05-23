import { env } from './config/env';
import { connectDB } from './config/db';
import { connectRedis } from './config/redis';
import logger from './utils/logger';
import app from './app';

async function start(): Promise<void> {
  try {
    await connectDB();
    await connectRedis();

    const server = app.listen(Number(env.PORT), () => {
      logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    });

    const shutdown = (): void => {
      logger.info('Shutting down gracefully...');
      server.close(() => {
        logger.info('Server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    process.on('uncaughtException', (err: Error) => {
      logger.error('Uncaught exception', { err });
      process.exit(1);
    });

    process.on('unhandledRejection', (reason: unknown) => {
      logger.error('Unhandled rejection', { reason });
      process.exit(1);
    });
  } catch (err) {
    logger.error('Failed to start server', { err });
    process.exit(1);
  }
}

start();
