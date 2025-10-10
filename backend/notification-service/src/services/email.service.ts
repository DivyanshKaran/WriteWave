import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import AWS from 'aws-sdk';
import { logger } from '@/utils/logger';
import { EmailData, EmailAttachment } from '@/types';
import { TemplateService } from './template.service';

export class EmailService {
  private transporter: nodemailer.Transporter;
  private templateService: TemplateService;
  private provider: string;

  constructor() {
    this.templateService = new TemplateService();
    this.provider = process.env.EMAIL_PROVIDER || 'sendgrid';
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    switch (this.provider) {
      case 'sendgrid':
        this.initializeSendGrid();
        break;
      case 'ses':
        this.initializeSES();
        break;
      case 'smtp':
        this.initializeSMTP();
        break;
      default:
        throw new Error(`Unsupported email provider: ${this.provider}`);
    }
  }

  private initializeSendGrid(): void {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY is required');
    }
    
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    logger.info('SendGrid email service initialized');
  }

  private initializeSES(): void {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS credentials are required for SES');
    }

    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });

    this.transporter = nodemailer.createTransporter({
      SES: new AWS.SES({ apiVersion: '2010-12-01' })
    });

    logger.info('AWS SES email service initialized');
  }

  private initializeSMTP(): void {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    logger.info('SMTP email service initialized');
  }

  async sendEmail(emailData: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      logger.info('Sending email', { to: emailData.to, subject: emailData.subject });

      let result;

      switch (this.provider) {
        case 'sendgrid':
          result = await this.sendViaSendGrid(emailData);
          break;
        case 'ses':
        case 'smtp':
          result = await this.sendViaTransporter(emailData);
          break;
        default:
          throw new Error(`Unsupported email provider: ${this.provider}`);
      }

      logger.info('Email sent successfully', { to: emailData.to, messageId: result.messageId });
      return { success: true, messageId: result.messageId };

    } catch (error) {
      logger.error('Error sending email', { to: emailData.to, error: error.message });
      return { success: false, error: error.message };
    }
  }

  private async sendViaSendGrid(emailData: EmailData): Promise<{ messageId: string }> {
    const msg = {
      to: emailData.to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'noreply@writewave.com',
        name: process.env.SENDGRID_FROM_NAME || 'WriteWave'
      },
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html,
      replyTo: emailData.replyTo,
      cc: emailData.cc,
      bcc: emailData.bcc,
      attachments: emailData.attachments?.map(att => ({
        filename: att.filename,
        content: att.content.toString('base64'),
        type: att.contentType,
        disposition: att.disposition
      }))
    };

    const response = await sgMail.send(msg);
    return { messageId: response[0].headers['x-message-id'] || 'unknown' };
  }

  private async sendViaTransporter(emailData: EmailData): Promise<{ messageId: string }> {
    const mailOptions = {
      from: process.env.SES_FROM_EMAIL || process.env.SMTP_FROM_EMAIL || 'noreply@writewave.com',
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html,
      replyTo: emailData.replyTo,
      cc: emailData.cc,
      bcc: emailData.bcc,
      attachments: emailData.attachments
    };

    const result = await this.transporter.sendMail(mailOptions);
    return { messageId: result.messageId };
  }

  async sendTemplateEmail(
    to: string, 
    templateId: string, 
    variables: any = {}, 
    options: Partial<EmailData> = {}
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      logger.info('Sending template email', { to, templateId });

      // Get template
      const template = await this.templateService.getTemplate(templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }

      // Render template
      const rendered = await this.templateService.renderTemplate(template, variables);

      // Send email
      const emailData: EmailData = {
        to,
        subject: rendered.subject || template.subject,
        html: rendered.htmlContent || template.htmlContent,
        text: rendered.content || template.content,
        ...options
      };

      return await this.sendEmail(emailData);

    } catch (error) {
      logger.error('Error sending template email', { to, templateId, error: error.message });
      return { success: false, error: error.message };
    }
  }

  async sendBulkEmail(emails: EmailData[]): Promise<{ success: boolean; results: any[]; errors: any[] }> {
    const results = [];
    const errors = [];

    logger.info('Sending bulk emails', { count: emails.length });

    // Process emails in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      
      const batchResults = await Promise.allSettled(
        batch.map(email => this.sendEmail(email))
      );

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          errors.push({
            email: batch[index].to,
            error: result.reason
          });
        }
      });

      // Add delay between batches to respect rate limits
      if (i + batchSize < emails.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    logger.info('Bulk email sending completed', { 
      total: emails.length, 
      successful: results.length, 
      failed: errors.length 
    });

    return {
      success: errors.length === 0,
      results,
      errors
    };
  }

  async validateEmail(email: string): Promise<boolean> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async checkDeliveryStatus(messageId: string): Promise<{ status: string; details?: any }> {
    try {
      switch (this.provider) {
        case 'sendgrid':
          return await this.checkSendGridStatus(messageId);
        case 'ses':
          return await this.checkSESStatus(messageId);
        default:
          return { status: 'unknown' };
      }
    } catch (error) {
      logger.error('Error checking delivery status', { messageId, error: error.message });
      return { status: 'error', details: error.message };
    }
  }

  private async checkSendGridStatus(messageId: string): Promise<{ status: string; details?: any }> {
    // SendGrid doesn't provide a direct API to check delivery status
    // You would need to use webhooks for real-time delivery status
    return { status: 'sent' };
  }

  private async checkSESStatus(messageId: string): Promise<{ status: string; details?: any }> {
    const ses = new AWS.SES({ apiVersion: '2010-12-01' });
    
    try {
      const result = await ses.getSendQuota().promise();
      return { 
        status: 'sent', 
        details: { 
          maxSendRate: result.MaxSendRate,
          max24HourSend: result.Max24HourSend,
          sentLast24Hours: result.SentLast24Hours
        }
      };
    } catch (error) {
      return { status: 'error', details: error.message };
    }
  }

  async getBounceList(): Promise<string[]> {
    try {
      switch (this.provider) {
        case 'sendgrid':
          return await this.getSendGridBounces();
        case 'ses':
          return await this.getSESBounces();
        default:
          return [];
      }
    } catch (error) {
      logger.error('Error getting bounce list', { error: error.message });
      return [];
    }
  }

  private async getSendGridBounces(): Promise<string[]> {
    // SendGrid API call to get bounces
    // This would require implementing the SendGrid API client
    return [];
  }

  private async getSESBounces(): Promise<string[]> {
    const ses = new AWS.SES({ apiVersion: '2010-12-01' });
    
    try {
      const result = await ses.listBouncedRecipients().promise();
      return result.bouncedRecipients?.map(r => r.emailAddress) || [];
    } catch (error) {
      logger.error('Error getting SES bounces', { error: error.message });
      return [];
    }
  }

  async addToSuppressionList(email: string, reason: string = 'unsubscribe'): Promise<boolean> {
    try {
      switch (this.provider) {
        case 'sendgrid':
          return await this.addToSendGridSuppression(email, reason);
        case 'ses':
          return await this.addToSESSuppression(email, reason);
        default:
          return false;
      }
    } catch (error) {
      logger.error('Error adding to suppression list', { email, reason, error: error.message });
      return false;
    }
  }

  private async addToSendGridSuppression(email: string, reason: string): Promise<boolean> {
    // SendGrid API call to add to suppression list
    // This would require implementing the SendGrid API client
    return true;
  }

  private async addToSESSuppression(email: string, reason: string): Promise<boolean> {
    const ses = new AWS.SES({ apiVersion: '2010-12-01' });
    
    try {
      await ses.putSuppressedDestination({
        EmailAddress: email,
        Reason: reason.toUpperCase()
      }).promise();
      
      return true;
    } catch (error) {
      logger.error('Error adding to SES suppression', { email, reason, error: error.message });
      return false;
    }
  }

  async removeFromSuppressionList(email: string): Promise<boolean> {
    try {
      switch (this.provider) {
        case 'sendgrid':
          return await this.removeFromSendGridSuppression(email);
        case 'ses':
          return await this.removeFromSESSuppression(email);
        default:
          return false;
      }
    } catch (error) {
      logger.error('Error removing from suppression list', { email, error: error.message });
      return false;
    }
  }

  private async removeFromSendGridSuppression(email: string): Promise<boolean> {
    // SendGrid API call to remove from suppression list
    return true;
  }

  private async removeFromSESSuppression(email: string): Promise<boolean> {
    const ses = new AWS.SES({ apiVersion: '2010-12-01' });
    
    try {
      await ses.deleteSuppressedDestination({
        EmailAddress: email
      }).promise();
      
      return true;
    } catch (error) {
      logger.error('Error removing from SES suppression', { email, error: error.message });
      return false;
    }
  }

  async getEmailStats(startDate: Date, endDate: Date): Promise<any> {
    try {
      switch (this.provider) {
        case 'sendgrid':
          return await this.getSendGridStats(startDate, endDate);
        case 'ses':
          return await this.getSESStats(startDate, endDate);
        default:
          return {};
      }
    } catch (error) {
      logger.error('Error getting email stats', { error: error.message });
      return {};
    }
  }

  private async getSendGridStats(startDate: Date, endDate: Date): Promise<any> {
    // SendGrid API call to get stats
    return {};
  }

  private async getSESStats(startDate: Date, endDate: Date): Promise<any> {
    const ses = new AWS.SES({ apiVersion: '2010-12-01' });
    
    try {
      const result = await ses.getSendQuota().promise();
      return {
        maxSendRate: result.MaxSendRate,
        max24HourSend: result.Max24HourSend,
        sentLast24Hours: result.SentLast24Hours
      };
    } catch (error) {
      logger.error('Error getting SES stats', { error: error.message });
      return {};
    }
  }
}

export const emailService = new EmailService();
