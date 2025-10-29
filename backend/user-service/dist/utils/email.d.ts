import { EmailTemplate } from '../types';
export declare class EmailService {
    private transporter;
    constructor();
    sendEmail(to: string, subject: string, html: string, text?: string): Promise<void>;
    sendEmailWithTemplate(to: string, template: EmailTemplate): Promise<void>;
    sendWelcomeEmail(to: string, firstName: string, verificationToken: string): Promise<void>;
    sendEmailVerificationEmail(to: string, firstName: string, verificationToken: string): Promise<void>;
    sendPasswordResetEmail(to: string, firstName: string, resetToken: string): Promise<void>;
    sendPasswordChangedNotification(to: string, firstName: string): Promise<void>;
    sendAccountDeactivatedNotification(to: string, firstName: string): Promise<void>;
    sendAccountReactivatedNotification(to: string, firstName: string): Promise<void>;
    verifyEmailConfiguration(): Promise<boolean>;
    private generateWelcomeEmailHtml;
    private generateWelcomeEmailText;
    private generateEmailVerificationHtml;
    private generateEmailVerificationText;
    private generatePasswordResetHtml;
    private generatePasswordResetText;
    private generatePasswordChangedHtml;
    private generatePasswordChangedText;
    private generateAccountDeactivatedHtml;
    private generateAccountDeactivatedText;
    private generateAccountReactivatedHtml;
    private generateAccountReactivatedText;
    private htmlToText;
}
export declare const emailService: EmailService;
export declare const sendEmail: (to: string, subject: string, html: string, text?: string) => Promise<void>;
export declare const sendWelcomeEmail: (to: string, firstName: string, verificationToken: string) => Promise<void>;
export declare const sendEmailVerificationEmail: (to: string, firstName: string, verificationToken: string) => Promise<void>;
export declare const sendPasswordResetEmail: (to: string, firstName: string, resetToken: string) => Promise<void>;
export declare const sendPasswordChangedNotification: (to: string, firstName: string) => Promise<void>;
export declare const sendAccountDeactivatedNotification: (to: string, firstName: string) => Promise<void>;
export declare const sendAccountReactivatedNotification: (to: string, firstName: string) => Promise<void>;
export default emailService;
//# sourceMappingURL=email.d.ts.map