"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const database_1 = require("./config/database");
async function bootstrap() {
    try {
        // 1. Connect to MongoDB
        await (0, database_1.connectDatabase)();
        // 2. Start HTTP server
        const server = app_1.app.listen(env_1.env.PORT, () => {
            logger_1.logger.info(`🚀 TaskFlow Backend API server running on port ${env_1.env.PORT}`);
            logger_1.logger.info(`🌐 Environment: ${env_1.env.NODE_ENV}`);
            logger_1.logger.info(`🤖 LLM Provider: ${env_1.env.LLM_PROVIDER}`);
        });
        // 3. Graceful shutdown handlers
        const shutdown = async (signal) => {
            logger_1.logger.info(`Received ${signal}. Gracefully shutting down...`);
            server.close(async () => {
                logger_1.logger.info('HTTP server closed.');
                await (0, database_1.disconnectDatabase)();
                process.exit(0);
            });
            // Force close after 10s if graceful shutdown hangs
            setTimeout(() => {
                logger_1.logger.error('Could not close connections in time, forcefully shutting down');
                process.exit(1);
            }, 10000);
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }
    catch (error) {
        logger_1.logger.error('Failed to start application', error);
        process.exit(1);
    }
}
bootstrap();
