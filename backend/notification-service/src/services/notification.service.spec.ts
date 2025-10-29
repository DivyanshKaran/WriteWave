import { NotificationService } from './notification.service';
import { NotificationChannel, NotificationPriority, NotificationStatus, NotificationType } from '../types';

// Mocks for storage, queue, and user-service-client
const created: any[] = [];
const storageMock = {
  createNotification: jest.fn(async (n: any) => { created.push(n); return n; }),
  getNotification: jest.fn(async (_id: string) => created.find(n => n.id === _id) || null),
  updateNotification: jest.fn(async (id: string, updates: any) => {
    const idx = created.findIndex(n => n.id === id);
    if (idx === -1) return null;
    created[idx] = { ...created[idx], ...updates };
    return created[idx];
  }),
  deleteNotification: jest.fn(async (id: string) => {
    const idx = created.findIndex(n => n.id === id);
    if (idx === -1) return false;
    created.splice(idx, 1);
    return true;
  }),
  getNotificationsByUser: jest.fn(async (userId: string) => created.filter(n => n.userId === userId)),
  getNotificationsByStatus: jest.fn(async (status: NotificationStatus) => created.filter(n => n.status === status)),
  getNotificationStats: jest.fn(async () => ({ total: created.length })),
  cleanupOldData: jest.fn(async () => {}),
};

jest.mock('../models', () => ({
  storage: storageMock,
  generateId: () => `id_${Math.random().toString(36).slice(2,8)}`,
}));

const queueAdd = jest.fn(async (_d: any) => {});
jest.mock('../workers/queue', () => ({ QueueService: { addNotification: (...args: any[]) => queueAdd(...args) } }));

const userGet = jest.fn(async (id: string, _t: string) => ({ id, settings: {} }));
jest.mock('../../../shared/utils/user-service-client', () => ({ userServiceClient: { getUserByIdAdmin: (...args: any[]) => userGet(...args) } }));

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    created.length = 0;
    process.env.USER_SERVICE_ADMIN_TOKEN = 'admin';
  });

  it('creates notification and enqueues when immediate', async () => {
    const service = new NotificationService();
    const { success, notification } = await service.createNotification({
      userId: 'u1',
      type: NotificationType.SYSTEM_UPDATE,
      channel: NotificationChannel.IN_APP,
      title: 'Hello',
      content: 'World',
      priority: NotificationPriority.NORMAL,
    });
    expect(success).toBe(true);
    expect(notification?.status).toBe(NotificationStatus.PENDING);
    expect(queueAdd).toHaveBeenCalled();
  });

  it('skips notification if user prefs disable channel', async () => {
    (userGet as jest.Mock).mockResolvedValueOnce({ id: 'u2', settings: { notificationsEnabled: true, pushNotifications: false } });
    const service = new NotificationService();
    const { success, notification } = await service.createNotification({
      userId: 'u2',
      type: NotificationType.SYSTEM_UPDATE,
      channel: NotificationChannel.PUSH,
      title: 'Title',
      content: 'Content',
    });
    expect(success).toBe(true);
    expect(notification?.status).toBe(NotificationStatus.CANCELLED);
    expect((notification as any).metadata?.skipReason).toBe('channel_disabled');
    expect(queueAdd).not.toHaveBeenCalled();
  });

  it('returns error if user not found in user-service', async () => {
    (userGet as jest.Mock).mockRejectedValueOnce(new Error('not found'));
    const service = new NotificationService();
    const res = await service.createNotification({
      userId: 'missing', type: NotificationType.SYSTEM_UPDATE, channel: NotificationChannel.IN_APP, title: 't', content: 'c'
    });
    expect(res.success).toBe(false);
    expect(res.error).toBe('USER_NOT_FOUND');
  });
});


