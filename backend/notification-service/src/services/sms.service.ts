import twilio from 'twilio';
import { logger } from '@/utils/logger';
import { SMSData } from '@/types';

export class SMSService {
  private client: twilio.Twilio;
  private provider: string;

  constructor() {
    this.provider = process.env.SMS_PROVIDER || 'twilio';
    this.initializeClient();
  }

  private initializeClient(): void {
    switch (this.provider) {
      case 'twilio':
        this.initializeTwilio();
        break;
      default:
        throw new Error(`Unsupported SMS provider: ${this.provider}`);
    }
  }

  private initializeTwilio(): void {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error('Twilio credentials are required');
    }

    this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    logger.info('Twilio SMS service initialized');
  }

  async sendSMS(smsData: SMSData): Promise<{ success: boolean; sid?: string; error?: string }> {
    try {
      logger.info('Sending SMS', { to: smsData.to });

      let result;

      switch (this.provider) {
        case 'twilio':
          result = await this.sendViaTwilio(smsData);
          break;
        default:
          throw new Error(`Unsupported SMS provider: ${this.provider}`);
      }

      logger.info('SMS sent successfully', { to: smsData.to, sid: result.sid });
      return { success: true, sid: result.sid };

    } catch (error) {
      logger.error('Error sending SMS', { to: smsData.to, error: error.message });
      return { success: false, error: error.message };
    }
  }

  private async sendViaTwilio(smsData: SMSData): Promise<{ sid: string }> {
    const message = await this.client.messages.create({
      body: smsData.message,
      from: smsData.from || process.env.TWILIO_PHONE_NUMBER,
      to: smsData.to,
      mediaUrl: smsData.mediaUrl
    });

    return { sid: message.sid };
  }

  async sendBulkSMS(smsList: SMSData[]): Promise<{ success: boolean; results: any[]; errors: any[] }> {
    const results = [];
    const errors = [];

    logger.info('Sending bulk SMS', { count: smsList.length });

    // Process SMS in batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < smsList.length; i += batchSize) {
      const batch = smsList.slice(i, i + batchSize);
      
      const batchResults = await Promise.allSettled(
        batch.map(sms => this.sendSMS(sms))
      );

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          errors.push({
            to: batch[index].to,
            error: result.reason
          });
        }
      });

      // Add delay between batches to respect rate limits
      if (i + batchSize < smsList.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    logger.info('Bulk SMS sending completed', { 
      total: smsList.length, 
      successful: results.length, 
      failed: errors.length 
    });

    return {
      success: errors.length === 0,
      results,
      errors
    };
  }

  async validatePhoneNumber(phoneNumber: string): Promise<boolean> {
    // Basic phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }

  async checkDeliveryStatus(sid: string): Promise<{ status: string; details?: any }> {
    try {
      switch (this.provider) {
        case 'twilio':
          return await this.checkTwilioStatus(sid);
        default:
          return { status: 'unknown' };
      }
    } catch (error) {
      logger.error('Error checking SMS delivery status', { sid, error: error.message });
      return { status: 'error', details: error.message };
    }
  }

  private async checkTwilioStatus(sid: string): Promise<{ status: string; details?: any }> {
    try {
      const message = await this.client.messages(sid).fetch();
      return { 
        status: message.status, 
        details: {
          direction: message.direction,
          from: message.from,
          to: message.to,
          body: message.body,
          dateCreated: message.dateCreated,
          dateUpdated: message.dateUpdated,
          errorCode: message.errorCode,
          errorMessage: message.errorMessage
        }
      };
    } catch (error) {
      return { status: 'error', details: error.message };
    }
  }

  async getSMSStats(): Promise<any> {
    try {
      switch (this.provider) {
        case 'twilio':
          return await this.getTwilioStats();
        default:
          return {};
      }
    } catch (error) {
      logger.error('Error getting SMS stats', { error: error.message });
      return {};
    }
  }

  private async getTwilioStats(): Promise<any> {
    try {
      // Get account usage
      const usage = await this.client.usage.records.list({
        category: 'sms',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        endDate: new Date()
      });

      // Get recent messages
      const messages = await this.client.messages.list({
        limit: 100,
        dateSentAfter: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      });

      const totalSent = messages.length;
      const delivered = messages.filter(m => m.status === 'delivered').length;
      const failed = messages.filter(m => m.status === 'failed').length;

      return {
        totalSent,
        delivered,
        failed,
        deliveryRate: totalSent > 0 ? (delivered / totalSent) * 100 : 0,
        failureRate: totalSent > 0 ? (failed / totalSent) * 100 : 0,
        usage: usage.map(u => ({
          period: u.period,
          count: u.count,
          price: u.price
        }))
      };
    } catch (error) {
      logger.error('Error getting Twilio stats', { error: error.message });
      return {};
    }
  }

  async sendVerificationCode(phoneNumber: string): Promise<{ success: boolean; sid?: string; error?: string }> {
    try {
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      const smsData: SMSData = {
        to: phoneNumber,
        message: `Your WriteWave verification code is: ${verificationCode}. This code will expire in 10 minutes.`
      };

      const result = await this.sendSMS(smsData);
      
      if (result.success) {
        // Store verification code with expiration (you would typically use Redis or database)
        logger.info('Verification code sent', { phoneNumber, sid: result.sid });
      }

      return result;

    } catch (error) {
      logger.error('Error sending verification code', { phoneNumber, error: error.message });
      return { success: false, error: error.message };
    }
  }

  async sendOTP(phoneNumber: string, otp: string): Promise<{ success: boolean; sid?: string; error?: string }> {
    try {
      const smsData: SMSData = {
        to: phoneNumber,
        message: `Your WriteWave OTP is: ${otp}. Do not share this code with anyone.`
      };

      return await this.sendSMS(smsData);

    } catch (error) {
      logger.error('Error sending OTP', { phoneNumber, error: error.message });
      return { success: false, error: error.message };
    }
  }

  async sendAlert(phoneNumber: string, message: string): Promise<{ success: boolean; sid?: string; error?: string }> {
    try {
      const smsData: SMSData = {
        to: phoneNumber,
        message: `ALERT: ${message}`
      };

      return await this.sendSMS(smsData);

    } catch (error) {
      logger.error('Error sending alert', { phoneNumber, error: error.message });
      return { success: false, error: error.message };
    }
  }

  async sendReminder(phoneNumber: string, message: string): Promise<{ success: boolean; sid?: string; error?: string }> {
    try {
      const smsData: SMSData = {
        to: phoneNumber,
        message: `Reminder: ${message}`
      };

      return await this.sendSMS(smsData);

    } catch (error) {
      logger.error('Error sending reminder', { phoneNumber, error: error.message });
      return { success: false, error: error.message };
    }
  }

  async getMessageHistory(phoneNumber?: string, limit: number = 50): Promise<any[]> {
    try {
      switch (this.provider) {
        case 'twilio':
          return await this.getTwilioMessageHistory(phoneNumber, limit);
        default:
          return [];
      }
    } catch (error) {
      logger.error('Error getting message history', { phoneNumber, error: error.message });
      return [];
    }
  }

  private async getTwilioMessageHistory(phoneNumber?: string, limit: number = 50): Promise<any[]> {
    try {
      const messages = await this.client.messages.list({
        to: phoneNumber,
        limit
      });

      return messages.map(message => ({
        sid: message.sid,
        from: message.from,
        to: message.to,
        body: message.body,
        status: message.status,
        direction: message.direction,
        dateCreated: message.dateCreated,
        dateUpdated: message.dateUpdated,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage
      }));
    } catch (error) {
      logger.error('Error getting Twilio message history', { error: error.message });
      return [];
    }
  }

  async blockNumber(phoneNumber: string): Promise<boolean> {
    try {
      switch (this.provider) {
        case 'twilio':
          return await this.blockTwilioNumber(phoneNumber);
        default:
          return false;
      }
    } catch (error) {
      logger.error('Error blocking number', { phoneNumber, error: error.message });
      return false;
    }
  }

  private async blockTwilioNumber(phoneNumber: string): Promise<boolean> {
    try {
      // Twilio doesn't have a direct block API, but you can implement this logic
      // by maintaining a block list in your database
      logger.info('Number blocked', { phoneNumber });
      return true;
    } catch (error) {
      logger.error('Error blocking Twilio number', { phoneNumber, error: error.message });
      return false;
    }
  }

  async unblockNumber(phoneNumber: string): Promise<boolean> {
    try {
      // Implement unblock logic
      logger.info('Number unblocked', { phoneNumber });
      return true;
    } catch (error) {
      logger.error('Error unblocking number', { phoneNumber, error: error.message });
      return false;
    }
  }
}

export const smsService = new SMSService();
