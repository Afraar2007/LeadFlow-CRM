import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import app from './app.js';
import connectDB from './database/connectDB.js';
import logger from './utils/logger.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    logger.warn('MongoDB connection failed - server will start without database', {
      message: error.message,
    });
  }

  try {
    const server = app.listen(PORT, () => {
      console.log(
        `\x1b[36m%s\x1b[0m`,
        `✓ Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`
      );
      console.log(
        `\x1b[90m%s\x1b[0m`,
        `  Health check: http://localhost:${PORT}/api/v1/health`
      );
    });

    // Graceful shutdown handler
    const gracefulShutdown = (signal) => {
      console.log(
        `\x1b[33m%s\x1b[0m`,
        `\n${signal} received. Shutting down gracefully...`
      );

      server.close(() => {
        console.log(
          `\x1b[33m%s\x1b[0m`,
          '✓ HTTP server closed.'
        );
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error(
          `\x1b[31m%s\x1b[0m`,
          '✗ Forced shutdown after timeout.'
        );
        process.exit(1);
      }, 10000);
    };

    // Handle process signals
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection', {
        reason: reason.message,
        stack: reason.stack,
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', {
        message: error.message,
        stack: error.stack,
      });
      process.exit(1);
    });

    return server;
  } catch (error) {
    logger.error('Failed to start server', {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

startServer();

export default startServer;