"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_service_client_1 = require("../../../shared/utils/user-service-client");
const profile_cache_1 = require("../../../shared/utils/profile-cache");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ success: false, error: 'Access token required' });
            return;
        }
        const token = authHeader.substring(7);
        if (!token) {
            res.status(401).json({ success: false, error: 'Access token required' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const remoteUser = await (0, profile_cache_1.getUserProfileCached)(`user:${decoded.userId}`, async () => {
            return await user_service_client_1.userServiceClient.getCurrentUser(token);
        });
        if (!remoteUser) {
            res.status(401).json({ success: false, error: 'User not found' });
            return;
        }
        req.user = {
            id: remoteUser.id,
            name: remoteUser.displayName || remoteUser.username || remoteUser.email,
            username: remoteUser.username || remoteUser.email,
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({ success: false, error: 'Access token expired' });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({ success: false, error: 'Invalid access token' });
            return;
        }
        res.status(500).json({ success: false, error: 'Authentication failed' });
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.js.map