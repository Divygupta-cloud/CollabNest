"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
exports.disconnectDatabase = disconnectDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const logger_1 = require("./logger");
async function connectDatabase() {
    try {
        mongoose_1.default.set('strictQuery', true);
        await mongoose_1.default.connect(env_1.env.MONGODB_URI);
        logger_1.logger.info(`Connected to MongoDB successfully at ${env_1.env.MONGODB_URI}`);
    }
    catch (err) {
        logger_1.logger.error('Failed to connect to MongoDB database', err);
        process.exit(1);
    }
    mongoose_1.default.connection.on('error', (err) => {
        logger_1.logger.error('MongoDB runtime connection error', err);
    });
    mongoose_1.default.connection.on('disconnected', () => {
        logger_1.logger.warn('MongoDB connection disconnected');
    });
}
async function disconnectDatabase() {
    try {
        await mongoose_1.default.disconnect();
        logger_1.logger.info('MongoDB connection closed gracefully');
    }
    catch (err) {
        logger_1.logger.error('Error during MongoDB disconnection', err);
    }
}
