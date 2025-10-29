import { logger } from '../utils/logger';
import { prisma } from '../models';
import { createConsumer, Topics } from '../../../shared/utils/kafka';
import { userServiceClient } from '../../../shared/utils/user-service-client';

/**
 * Service to sync user data from user-service via Kafka events
 * Listens to user.updated events and updates denormalized fields in community-service
 */
export class UserSyncService {
  private consumer: any;
  private isRunning: boolean = false;

  constructor() {
    if (process.env.ENABLE_KAFKA === 'true') {
      this.startConsumer().catch((error) => {
        logger.error('Failed to start user sync consumer', { error: error.message });
      });
    }
  }

  private async startConsumer(): Promise<void> {
    try {
      this.consumer = await createConsumer('community-service-user-sync-group');

      await this.consumer.subscribe({
        topics: [Topics.USER_EVENTS],
        fromBeginning: false,
      });

      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }: any) => {
          try {
            const event = JSON.parse(message.value.toString());
            await this.handleUserEvent(event);
          } catch (error: any) {
            logger.error('Error processing user event', {
              topic,
              partition,
              error: error.message,
            });
          }
        },
      });

      this.isRunning = true;
      logger.info('User sync Kafka consumer started');
    } catch (error: any) {
      logger.error('Failed to initialize user sync consumer', { error: error.message });
      throw error;
    }
  }

  private async handleUserEvent(event: any): Promise<void> {
    try {
      if (event.type === 'user.updated' || event.type === 'user.created') {
        // Event data may be nested in event.data or be the event itself
        const eventData = event.data || event;
        await this.syncUserData(eventData);
      }
    } catch (error: any) {
      logger.error('Error handling user event', {
        eventType: event.type,
        error: error.message,
      });
    }
  }

  /**
   * Sync user data from user-service event
   * Updates denormalized readonly fields: username, displayName, avatar
   */
  async syncUserData(eventData: any): Promise<void> {
    try {
      // Handle both user.created and user.updated event formats
      const externalUserId = eventData.id || eventData.userId;
      const username = eventData.username;
      const firstName = eventData.firstName || eventData.changes?.firstName;
      const lastName = eventData.lastName || eventData.changes?.lastName;
      const profile = eventData.profile || eventData.changes?.profile;

      if (!externalUserId) {
        logger.warn('User event missing userId', { eventData });
        return;
      }

      // Compute displayName from firstName/lastName
      const displayName = [firstName, lastName].filter(Boolean).join(' ') || username || null;

      // Get avatar from profile if available
      const avatar = profile?.avatar || null;
      const usernameToSync = username || null;

      // Update or create user record in community-service
      await prisma.user.upsert({
        where: { externalUserId },
        update: {
          username: usernameToSync,
          displayName,
          avatar,
          updatedAt: new Date(),
        },
        create: {
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          externalUserId,
          username: usernameToSync || `user_${externalUserId.substring(0, 8)}`,
          displayName,
          avatar,
          reputation: 0,
          isModerator: false,
          isBanned: false,
        },
      });

      logger.info('User data synced successfully', {
        externalUserId,
        username: usernameToSync,
        hasAvatar: !!avatar,
      });
    } catch (error: any) {
      logger.error('Failed to sync user data', {
        userId: eventData.id || eventData.userId,
        error: error.message,
      });
      // Don't throw - allow service to continue processing other events
    }
  }

  /**
   * Manual sync method for backfilling data or on-demand sync
   */
  async syncUserById(externalUserId: string, userData: {
    username?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  }): Promise<void> {
    try {
      const displayName = [userData.firstName, userData.lastName].filter(Boolean).join(' ') || 
                         userData.username || 
                         null;

      await prisma.user.upsert({
        where: { externalUserId },
        update: {
          username: userData.username || undefined,
          displayName,
          avatar: userData.avatar || undefined,
          updatedAt: new Date(),
        },
        create: {
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          externalUserId,
          username: userData.username || `user_${externalUserId.substring(0, 8)}`,
          displayName,
          avatar: userData.avatar || null,
          reputation: 0,
          isModerator: false,
          isBanned: false,
        },
      });

      logger.info('Manual user sync completed', { externalUserId });
    } catch (error: any) {
      logger.error('Manual user sync failed', {
        externalUserId,
        error: error.message,
      });
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.consumer && this.isRunning) {
      await this.consumer.disconnect();
      this.isRunning = false;
      logger.info('User sync Kafka consumer stopped');
    }
  }
}

export const userSyncService = new UserSyncService();

