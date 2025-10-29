"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const isDevelopment = process.env.NODE_ENV === 'development';
const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');
const requestIdFormat = winston_1.default.format((info) => {
    const reqId = global.requestId;
    if (reqId) {
        info.requestId = reqId;
    }
    return info;
});
exports.logger = winston_1.default.createLogger({
    level: logLevel,
    format: isDevelopment
        ? winston_1.default.format.combine(requestIdFormat(), winston_1.default.format.colorize(), winston_1.default.format.timestamp(), winston_1.default.format.printf(({ level, message, timestamp, ...meta }) => {
            const req = meta.requestId ? ` [req:${meta.requestId}]` : '';
            return `${timestamp} ${level}${req}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        }))
        : winston_1.default.format.combine(requestIdFormat(), winston_1.default.format.timestamp(), winston_1.default.format.json()),
    transports: [new winston_1.default.transports.Console()],
});
const requestLogger = (req, _res, next) => {
    global.requestId = req.id || req.headers['x-request-id'];
    next();
};
exports.requestLogger = requestLogger;
//# sourceMappingURL=logger.js.map