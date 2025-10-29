"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userServiceClient = exports.UserServiceClient = void 0;
const http_client_1 = require("./http-client");
class UserServiceClient {
    constructor(baseURL = http_client_1.ServiceUrls.USER) {
        this.client = new http_client_1.HttpClient({ baseURL });
    }
    async getCurrentUser(accessToken) {
        const res = await this.client.get('/api/v1/auth/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        ensureOk(res, 'Failed to fetch current user');
        return res.data;
    }
    async getUserByIdAdmin(userId, adminToken) {
        const res = await this.client.get(`/api/v1/users/admin/users/${encodeURIComponent(userId)}`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });
        ensureOk(res, 'Failed to fetch user by id');
        return res.data;
    }
    async getProfile(accessToken) {
        const res = await this.client.get('/api/v1/users/profile', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        ensureOk(res, 'Failed to fetch user profile');
        return res.data;
    }
    async getSettings(accessToken) {
        const res = await this.client.get('/api/v1/users/settings', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        ensureOk(res, 'Failed to fetch user settings');
        return res.data;
    }
}
exports.UserServiceClient = UserServiceClient;
function ensureOk(res, message) {
    if (res.status < 200 || res.status >= 300) {
        const errDetail = typeof res.data === 'object' ? JSON.stringify(res.data) : String(res.data);
        throw new Error(`${message}: ${res.status} ${errDetail}`);
    }
}
exports.userServiceClient = new UserServiceClient();
//# sourceMappingURL=user-service-client.js.map