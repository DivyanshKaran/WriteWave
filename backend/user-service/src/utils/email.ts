import nodemailer from 'nodemailer';
import { config } from '../config';
import { logger, emailLogger } from '../config/logger';
import { EmailTemplate } from '../types';

// Email service class
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    if (config.email.user && config.email.pass) {
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.port === 465,
        auth: {
          user: config.email.user,
          pass: config.email.pass,
        },
      });
    } else {
      // Lazy init on first use
      this.transporter = nodemailer.createTransport({ jsonTransport: true } as any);
      logger.warn('Email transport not fully configured; falling back to jsonTransport');
    }
  }

  // Send email
  async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string
  ): Promise<void> {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }
      const mailOptions = {
        from: `"${config.email.fromName}" <${config.email.from}>`,
        to,
        subject,
        html,
        text: text || this.htmlToText(html),
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      emailLogger('sent', to, {
        messageId: result.messageId,
        subject,
        accepted: result.accepted,
        rejected: result.rejected,
      });

      logger.info('Email sent successfully', {
        to,
        subject,
        messageId: result.messageId,
      });
    } catch (error) {
      emailLogger('failed', to, {
        error: error.message,
        subject,
      });

      logger.error('Email sending failed', {
        to,
        subject,
        error: error.message,
      });
      throw new Error('Email sending failed');
    }
  }

  // Send email with template
  async sendEmailWithTemplate(
    to: string,
    template: EmailTemplate
  ): Promise<void> {
    try {
      await this.sendEmail(to, template.subject, template.html, template.text);
    } catch (error) {
      logger.error('Email template sending failed', {
        to,
        subject: template.subject,
        error: error.message,
      });
      throw error;
    }
  }

  // Send welcome email
  async sendWelcomeEmail(
    to: string,
    firstName: string,
    verificationToken: string
  ): Promise<void> {
    try {
      const verificationUrl = `${config.frontend.verifyEmailUrl}?token=${verificationToken}`;
      
      const template: EmailTemplate = {
        subject: 'Welcome to WriteWave!',
        html: this.generateWelcomeEmailHtml(firstName, verificationUrl, to),
        text: this.generateWelcomeEmailText(firstName, verificationUrl),
      };

      await this.sendEmailWithTemplate(to, template);
    } catch (error) {
      logger.error('Welcome email sending failed', {
        to,
        firstName,
        error: error.message,
      });
      throw error;
    }
  }

  // Send email verification email
  async sendEmailVerificationEmail(
    to: string,
    firstName: string,
    verificationToken: string
  ): Promise<void> {
    try {
      const verificationUrl = `${config.frontend.verifyEmailUrl}?token=${verificationToken}`;
      
      const template: EmailTemplate = {
        subject: 'Verify your email address',
        html: this.generateEmailVerificationHtml(firstName, verificationUrl),
        text: this.generateEmailVerificationText(firstName, verificationUrl),
      };

      await this.sendEmailWithTemplate(to, template);
    } catch (error) {
      logger.error('Email verification email sending failed', {
        to,
        firstName,
        error: error.message,
      });
      throw error;
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(
    to: string,
    firstName: string,
    resetToken: string
  ): Promise<void> {
    try {
      const resetUrl = `${config.frontend.resetPasswordUrl}?token=${resetToken}`;
      
      const template: EmailTemplate = {
        subject: 'Reset your password',
        html: this.generatePasswordResetHtml(firstName, resetUrl),
        text: this.generatePasswordResetText(firstName, resetUrl),
      };

      await this.sendEmailWithTemplate(to, template);
    } catch (error) {
      logger.error('Password reset email sending failed', {
        to,
        firstName,
        error: error.message,
      });
      throw error;
    }
  }

  // Send password changed notification
  async sendPasswordChangedNotification(
    to: string,
    firstName: string
  ): Promise<void> {
    try {
      const template: EmailTemplate = {
        subject: 'Your password has been changed',
        html: this.generatePasswordChangedHtml(firstName),
        text: this.generatePasswordChangedText(firstName),
      };

      await this.sendEmailWithTemplate(to, template);
    } catch (error) {
      logger.error('Password changed notification sending failed', {
        to,
        firstName,
        error: error.message,
      });
      throw error;
    }
  }

  // Send account deactivated notification
  async sendAccountDeactivatedNotification(
    to: string,
    firstName: string
  ): Promise<void> {
    try {
      const template: EmailTemplate = {
        subject: 'Your account has been deactivated',
        html: this.generateAccountDeactivatedHtml(firstName),
        text: this.generateAccountDeactivatedText(firstName),
      };

      await this.sendEmailWithTemplate(to, template);
    } catch (error) {
      logger.error('Account deactivated notification sending failed', {
        to,
        firstName,
        error: error.message,
      });
      throw error;
    }
  }

  // Send account reactivated notification
  async sendAccountReactivatedNotification(
    to: string,
    firstName: string
  ): Promise<void> {
    try {
      const template: EmailTemplate = {
        subject: 'Your account has been reactivated',
        html: this.generateAccountReactivatedHtml(firstName),
        text: this.generateAccountReactivatedText(firstName),
      };

      await this.sendEmailWithTemplate(to, template);
    } catch (error) {
      logger.error('Account reactivated notification sending failed', {
        to,
        firstName,
        error: error.message,
      });
      throw error;
    }
  }

  // Verify email configuration
  async verifyEmailConfiguration(): Promise<boolean> {
    try {
      await this.transporter.verify();
      logger.info('Email configuration verified successfully');
      return true;
    } catch (error) {
      logger.error('Email configuration verification failed', { error: error.message });
      return false;
    }
  }

  // Generate welcome email HTML
  private generateWelcomeEmailHtml(firstName: string, verificationUrl: string, to: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to WriteWave</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to WriteWave!</h1>
            </div>
            <div class="content">
              <h2>Hello ${firstName}!</h2>
              <p>Welcome to WriteWave, your personal Japanese character learning companion!</p>
              <p>We're excited to help you on your journey to master Japanese characters. To get started, please verify your email address by clicking the button below:</p>
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p><a href="${verificationUrl}">${verificationUrl}</a></p>
              <p>This link will expire in 24 hours for security reasons.</p>
              <p>If you didn't create an account with WriteWave, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>© 2024 WriteWave. All rights reserved.</p>
              <p>This email was sent to ${to}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Generate welcome email text
  private generateWelcomeEmailText(firstName: string, verificationUrl: string): string {
    return `
      Welcome to WriteWave!
      
      Hello ${firstName}!
      
      Welcome to WriteWave, your personal Japanese character learning companion!
      
      We're excited to help you on your journey to master Japanese characters. To get started, please verify your email address by visiting this link:
      
      ${verificationUrl}
      
      This link will expire in 24 hours for security reasons.
      
      If you didn't create an account with WriteWave, you can safely ignore this email.
      
      Best regards,
      The WriteWave Team
      
      © 2024 WriteWave. All rights reserved.
    `;
  }

  // Generate email verification HTML
  private generateEmailVerificationHtml(firstName: string, verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verify Your Email</h1>
            </div>
            <div class="content">
              <h2>Hello ${firstName}!</h2>
              <p>Please verify your email address to complete your account setup.</p>
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p><a href="${verificationUrl}">${verificationUrl}</a></p>
              <p>This link will expire in 24 hours for security reasons.</p>
            </div>
            <div class="footer">
              <p>© 2024 WriteWave. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Generate email verification text
  private generateEmailVerificationText(firstName: string, verificationUrl: string): string {
    return `
      Verify Your Email
      
      Hello ${firstName}!
      
      Please verify your email address to complete your account setup.
      
      Visit this link to verify your email:
      ${verificationUrl}
      
      This link will expire in 24 hours for security reasons.
      
      Best regards,
      The WriteWave Team
    `;
  }

  // Generate password reset HTML
  private generatePasswordResetHtml(firstName: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reset Your Password</h1>
            </div>
            <div class="content">
              <h2>Hello ${firstName}!</h2>
              <p>We received a request to reset your password for your WriteWave account.</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p><a href="${resetUrl}">${resetUrl}</a></p>
              <div class="warning">
                <strong>Important:</strong> This link will expire in 1 hour for security reasons. If you didn't request a password reset, you can safely ignore this email.
              </div>
            </div>
            <div class="footer">
              <p>© 2024 WriteWave. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Generate password reset text
  private generatePasswordResetText(firstName: string, resetUrl: string): string {
    return `
      Reset Your Password
      
      Hello ${firstName}!
      
      We received a request to reset your password for your WriteWave account.
      
      Visit this link to reset your password:
      ${resetUrl}
      
      Important: This link will expire in 1 hour for security reasons. If you didn't request a password reset, you can safely ignore this email.
      
      Best regards,
      The WriteWave Team
    `;
  }

  // Generate password changed HTML
  private generatePasswordChangedHtml(firstName: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Changed</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #28a745; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
            .info { background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Changed Successfully</h1>
            </div>
            <div class="content">
              <h2>Hello ${firstName}!</h2>
              <p>Your password has been successfully changed.</p>
              <div class="info">
                <strong>Security Notice:</strong> If you didn't make this change, please contact our support team immediately.
              </div>
              <p>Thank you for keeping your account secure!</p>
            </div>
            <div class="footer">
              <p>© 2024 WriteWave. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Generate password changed text
  private generatePasswordChangedText(firstName: string): string {
    return `
      Password Changed Successfully
      
      Hello ${firstName}!
      
      Your password has been successfully changed.
      
      Security Notice: If you didn't make this change, please contact our support team immediately.
      
      Thank you for keeping your account secure!
      
      Best regards,
      The WriteWave Team
    `;
  }

  // Generate account deactivated HTML
  private generateAccountDeactivatedHtml(firstName: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Deactivated</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Account Deactivated</h1>
            </div>
            <div class="content">
              <h2>Hello ${firstName}!</h2>
              <p>Your WriteWave account has been deactivated.</p>
              <p>If you have any questions or need assistance, please contact our support team.</p>
            </div>
            <div class="footer">
              <p>© 2024 WriteWave. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Generate account deactivated text
  private generateAccountDeactivatedText(firstName: string): string {
    return `
      Account Deactivated
      
      Hello ${firstName}!
      
      Your WriteWave account has been deactivated.
      
      If you have any questions or need assistance, please contact our support team.
      
      Best regards,
      The WriteWave Team
    `;
  }

  // Generate account reactivated HTML
  private generateAccountReactivatedHtml(firstName: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Reactivated</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #28a745; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Account Reactivated</h1>
            </div>
            <div class="content">
              <h2>Hello ${firstName}!</h2>
              <p>Your WriteWave account has been reactivated.</p>
              <p>Welcome back! You can now access all your learning progress and continue your Japanese character journey.</p>
            </div>
            <div class="footer">
              <p>© 2024 WriteWave. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Generate account reactivated text
  private generateAccountReactivatedText(firstName: string): string {
    return `
      Account Reactivated
      
      Hello ${firstName}!
      
      Your WriteWave account has been reactivated.
      
      Welcome back! You can now access all your learning progress and continue your Japanese character journey.
      
      Best regards,
      The WriteWave Team
    `;
  }

  // Convert HTML to text
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }
}

// Export email service instance
export const emailService = new EmailService();

// Email sending utilities
export const sendEmail = (
  to: string,
  subject: string,
  html: string,
  text?: string
) => {
  return emailService.sendEmail(to, subject, html, text);
};

export const sendWelcomeEmail = (
  to: string,
  firstName: string,
  verificationToken: string
) => {
  return emailService.sendWelcomeEmail(to, firstName, verificationToken);
};

export const sendEmailVerificationEmail = (
  to: string,
  firstName: string,
  verificationToken: string
) => {
  return emailService.sendEmailVerificationEmail(to, firstName, verificationToken);
};

export const sendPasswordResetEmail = (
  to: string,
  firstName: string,
  resetToken: string
) => {
  return emailService.sendPasswordResetEmail(to, firstName, resetToken);
};

export const sendPasswordChangedNotification = (
  to: string,
  firstName: string
) => {
  return emailService.sendPasswordChangedNotification(to, firstName);
};

export const sendAccountDeactivatedNotification = (
  to: string,
  firstName: string
) => {
  return emailService.sendAccountDeactivatedNotification(to, firstName);
};

export const sendAccountReactivatedNotification = (
  to: string,
  firstName: string
) => {
  return emailService.sendAccountReactivatedNotification(to, firstName);
};

// Export default
export default emailService;
