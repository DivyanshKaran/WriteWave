"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAccountReactivatedNotification = exports.sendAccountDeactivatedNotification = exports.sendPasswordChangedNotification = exports.sendPasswordResetEmail = exports.sendEmailVerificationEmail = exports.sendWelcomeEmail = exports.sendEmail = exports.emailService = exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../config");
const logger_1 = require("../config/logger");
class EmailService {
    constructor() {
        if (config_1.config.email.user && config_1.config.email.pass) {
            this.transporter = nodemailer_1.default.createTransport({
                host: config_1.config.email.host,
                port: config_1.config.email.port,
                secure: config_1.config.email.port === 465,
                auth: {
                    user: config_1.config.email.user,
                    pass: config_1.config.email.pass,
                },
            });
        }
        else {
            this.transporter = nodemailer_1.default.createTransport({ jsonTransport: true });
            logger_1.logger.warn('Email transport not fully configured; falling back to jsonTransport');
        }
    }
    async sendEmail(to, subject, html, text) {
        try {
            if (!this.transporter) {
                throw new Error('Email transporter not initialized');
            }
            const mailOptions = {
                from: `"${config_1.config.email.fromName}" <${config_1.config.email.from}>`,
                to,
                subject,
                html,
                text: text || this.htmlToText(html),
            };
            const result = await this.transporter.sendMail(mailOptions);
            (0, logger_1.emailLogger)('sent', to, {
                messageId: result.messageId,
                subject,
                accepted: result.accepted,
                rejected: result.rejected,
            });
            logger_1.logger.info('Email sent successfully', {
                to,
                subject,
                messageId: result.messageId,
            });
        }
        catch (error) {
            (0, logger_1.emailLogger)('failed', to, {
                error: error.message,
                subject,
            });
            logger_1.logger.error('Email sending failed', {
                to,
                subject,
                error: error.message,
            });
            throw new Error('Email sending failed');
        }
    }
    async sendEmailWithTemplate(to, template) {
        try {
            await this.sendEmail(to, template.subject, template.html, template.text);
        }
        catch (error) {
            logger_1.logger.error('Email template sending failed', {
                to,
                subject: template.subject,
                error: error.message,
            });
            throw error;
        }
    }
    async sendWelcomeEmail(to, firstName, verificationToken) {
        try {
            const verificationUrl = `${config_1.config.frontend.verifyEmailUrl}?token=${verificationToken}`;
            const template = {
                subject: 'Welcome to WriteWave!',
                html: this.generateWelcomeEmailHtml(firstName, verificationUrl, to),
                text: this.generateWelcomeEmailText(firstName, verificationUrl),
            };
            await this.sendEmailWithTemplate(to, template);
        }
        catch (error) {
            logger_1.logger.error('Welcome email sending failed', {
                to,
                firstName,
                error: error.message,
            });
            throw error;
        }
    }
    async sendEmailVerificationEmail(to, firstName, verificationToken) {
        try {
            const verificationUrl = `${config_1.config.frontend.verifyEmailUrl}?token=${verificationToken}`;
            const template = {
                subject: 'Verify your email address',
                html: this.generateEmailVerificationHtml(firstName, verificationUrl),
                text: this.generateEmailVerificationText(firstName, verificationUrl),
            };
            await this.sendEmailWithTemplate(to, template);
        }
        catch (error) {
            logger_1.logger.error('Email verification email sending failed', {
                to,
                firstName,
                error: error.message,
            });
            throw error;
        }
    }
    async sendPasswordResetEmail(to, firstName, resetToken) {
        try {
            const resetUrl = `${config_1.config.frontend.resetPasswordUrl}?token=${resetToken}`;
            const template = {
                subject: 'Reset your password',
                html: this.generatePasswordResetHtml(firstName, resetUrl),
                text: this.generatePasswordResetText(firstName, resetUrl),
            };
            await this.sendEmailWithTemplate(to, template);
        }
        catch (error) {
            logger_1.logger.error('Password reset email sending failed', {
                to,
                firstName,
                error: error.message,
            });
            throw error;
        }
    }
    async sendPasswordChangedNotification(to, firstName) {
        try {
            const template = {
                subject: 'Your password has been changed',
                html: this.generatePasswordChangedHtml(firstName),
                text: this.generatePasswordChangedText(firstName),
            };
            await this.sendEmailWithTemplate(to, template);
        }
        catch (error) {
            logger_1.logger.error('Password changed notification sending failed', {
                to,
                firstName,
                error: error.message,
            });
            throw error;
        }
    }
    async sendAccountDeactivatedNotification(to, firstName) {
        try {
            const template = {
                subject: 'Your account has been deactivated',
                html: this.generateAccountDeactivatedHtml(firstName),
                text: this.generateAccountDeactivatedText(firstName),
            };
            await this.sendEmailWithTemplate(to, template);
        }
        catch (error) {
            logger_1.logger.error('Account deactivated notification sending failed', {
                to,
                firstName,
                error: error.message,
            });
            throw error;
        }
    }
    async sendAccountReactivatedNotification(to, firstName) {
        try {
            const template = {
                subject: 'Your account has been reactivated',
                html: this.generateAccountReactivatedHtml(firstName),
                text: this.generateAccountReactivatedText(firstName),
            };
            await this.sendEmailWithTemplate(to, template);
        }
        catch (error) {
            logger_1.logger.error('Account reactivated notification sending failed', {
                to,
                firstName,
                error: error.message,
            });
            throw error;
        }
    }
    async verifyEmailConfiguration() {
        try {
            await this.transporter.verify();
            logger_1.logger.info('Email configuration verified successfully');
            return true;
        }
        catch (error) {
            logger_1.logger.error('Email configuration verification failed', { error: error.message });
            return false;
        }
    }
    generateWelcomeEmailHtml(firstName, verificationUrl, to) {
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
    generateWelcomeEmailText(firstName, verificationUrl) {
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
    generateEmailVerificationHtml(firstName, verificationUrl) {
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
    generateEmailVerificationText(firstName, verificationUrl) {
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
    generatePasswordResetHtml(firstName, resetUrl) {
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
    generatePasswordResetText(firstName, resetUrl) {
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
    generatePasswordChangedHtml(firstName) {
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
    generatePasswordChangedText(firstName) {
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
    generateAccountDeactivatedHtml(firstName) {
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
    generateAccountDeactivatedText(firstName) {
        return `
      Account Deactivated
      
      Hello ${firstName}!
      
      Your WriteWave account has been deactivated.
      
      If you have any questions or need assistance, please contact our support team.
      
      Best regards,
      The WriteWave Team
    `;
    }
    generateAccountReactivatedHtml(firstName) {
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
    generateAccountReactivatedText(firstName) {
        return `
      Account Reactivated
      
      Hello ${firstName}!
      
      Your WriteWave account has been reactivated.
      
      Welcome back! You can now access all your learning progress and continue your Japanese character journey.
      
      Best regards,
      The WriteWave Team
    `;
    }
    htmlToText(html) {
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
exports.EmailService = EmailService;
exports.emailService = new EmailService();
const sendEmail = (to, subject, html, text) => {
    return exports.emailService.sendEmail(to, subject, html, text);
};
exports.sendEmail = sendEmail;
const sendWelcomeEmail = (to, firstName, verificationToken) => {
    return exports.emailService.sendWelcomeEmail(to, firstName, verificationToken);
};
exports.sendWelcomeEmail = sendWelcomeEmail;
const sendEmailVerificationEmail = (to, firstName, verificationToken) => {
    return exports.emailService.sendEmailVerificationEmail(to, firstName, verificationToken);
};
exports.sendEmailVerificationEmail = sendEmailVerificationEmail;
const sendPasswordResetEmail = (to, firstName, resetToken) => {
    return exports.emailService.sendPasswordResetEmail(to, firstName, resetToken);
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendPasswordChangedNotification = (to, firstName) => {
    return exports.emailService.sendPasswordChangedNotification(to, firstName);
};
exports.sendPasswordChangedNotification = sendPasswordChangedNotification;
const sendAccountDeactivatedNotification = (to, firstName) => {
    return exports.emailService.sendAccountDeactivatedNotification(to, firstName);
};
exports.sendAccountDeactivatedNotification = sendAccountDeactivatedNotification;
const sendAccountReactivatedNotification = (to, firstName) => {
    return exports.emailService.sendAccountReactivatedNotification(to, firstName);
};
exports.sendAccountReactivatedNotification = sendAccountReactivatedNotification;
exports.default = exports.emailService;
//# sourceMappingURL=email.js.map