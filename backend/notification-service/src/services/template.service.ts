import Handlebars from 'handlebars';
import { logger } from '@/utils/logger';
import { storage, generateId } from '@/models';
import { 
  NotificationTemplate, 
  CreateTemplateRequest, 
  UpdateTemplateRequest,
  NotificationType,
  NotificationChannel
} from '@/types';

export class TemplateService {
  private templateCache: Map<string, NotificationTemplate> = new Map();
  private compiledTemplates: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor() {
    this.initializeHandlebars();
    this.loadTemplates();
  }

  private initializeHandlebars(): void {
    // Register custom helpers
    Handlebars.registerHelper('formatDate', (date: Date, format: string) => {
      if (!date) return '';
      
      const d = new Date(date);
      switch (format) {
        case 'short':
          return d.toLocaleDateString();
        case 'long':
          return d.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
        case 'time':
          return d.toLocaleTimeString();
        default:
          return d.toISOString();
      }
    });

    Handlebars.registerHelper('capitalize', (str: string) => {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
    });

    Handlebars.registerHelper('uppercase', (str: string) => {
      if (!str) return '';
      return str.toUpperCase();
    });

    Handlebars.registerHelper('lowercase', (str: string) => {
      if (!str) return '';
      return str.toLowerCase();
    });

    Handlebars.registerHelper('truncate', (str: string, length: number) => {
      if (!str) return '';
      if (str.length <= length) return str;
      return str.substring(0, length) + '...';
    });

    Handlebars.registerHelper('pluralize', (count: number, singular: string, plural: string) => {
      return count === 1 ? singular : plural;
    });

    Handlebars.registerHelper('eq', (a: any, b: any) => a === b);
    Handlebars.registerHelper('ne', (a: any, b: any) => a !== b);
    Handlebars.registerHelper('gt', (a: number, b: number) => a > b);
    Handlebars.registerHelper('lt', (a: number, b: number) => a < b);
    Handlebars.registerHelper('gte', (a: number, b: number) => a >= b);
    Handlebars.registerHelper('lte', (a: number, b: number) => a <= b);

    Handlebars.registerHelper('if_eq', function(a: any, b: any, options: any) {
      if (a === b) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    Handlebars.registerHelper('unless_eq', function(a: any, b: any, options: any) {
      if (a !== b) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    logger.info('Handlebars helpers registered');
  }

  private async loadTemplates(): Promise<void> {
    try {
      // Load default templates
      await this.createDefaultTemplates();
      logger.info('Templates loaded successfully');
    } catch (error) {
      logger.error('Error loading templates', { error: error.message });
    }
  }

  private async createDefaultTemplates(): Promise<void> {
    const defaultTemplates = [
      // Learning Reminder Templates
      {
        name: 'daily_learning_reminder',
        type: NotificationType.LEARNING_REMINDER,
        channel: NotificationChannel.EMAIL,
        language: 'en',
        subject: 'Time for your daily Chinese practice! 🈳',
        title: 'Daily Learning Reminder',
        content: 'Hi {{user.displayName}}! It\'s time for your daily Chinese practice. Keep your streak alive!',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3B82F6;">Time for your daily Chinese practice! 🈳</h2>
            <p>Hi {{user.displayName}}!</p>
            <p>It's time for your daily Chinese practice. Keep your streak alive!</p>
            <p>Current streak: <strong>{{user.streak}} days</strong></p>
            <a href="{{app.url}}/practice" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Start Practice</a>
          </div>
        `,
        variables: ['user.displayName', 'user.streak', 'app.url']
      },
      {
        name: 'daily_learning_reminder',
        type: NotificationType.LEARNING_REMINDER,
        channel: NotificationChannel.PUSH,
        language: 'en',
        title: 'Daily Practice Time! 🈳',
        content: 'Hi {{user.displayName}}! Time for your daily Chinese practice. Keep your {{user.streak}}-day streak alive!',
        variables: ['user.displayName', 'user.streak']
      },
      {
        name: 'streak_warning',
        type: NotificationType.STREAK_WARNING,
        channel: NotificationChannel.EMAIL,
        language: 'en',
        subject: 'Don\'t lose your streak! ⚠️',
        title: 'Streak Warning',
        content: 'Hi {{user.displayName}}! You haven\'t practiced in {{daysSinceLastPractice}} days. Don\'t lose your {{user.streak}}-day streak!',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #F59E0B;">Don't lose your streak! ⚠️</h2>
            <p>Hi {{user.displayName}}!</p>
            <p>You haven't practiced in {{daysSinceLastPractice}} days. Don't lose your {{user.streak}}-day streak!</p>
            <a href="{{app.url}}/practice" style="background-color: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Continue Practice</a>
          </div>
        `,
        variables: ['user.displayName', 'daysSinceLastPractice', 'user.streak', 'app.url']
      },
      // Achievement Templates
      {
        name: 'achievement_unlocked',
        type: NotificationType.ACHIEVEMENT_UNLOCKED,
        channel: NotificationChannel.EMAIL,
        language: 'en',
        subject: 'Achievement Unlocked! 🏆',
        title: 'Achievement Unlocked',
        content: 'Congratulations {{user.displayName}}! You\'ve unlocked the "{{achievement.title}}" achievement!',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10B981;">Achievement Unlocked! 🏆</h2>
            <p>Congratulations {{user.displayName}}!</p>
            <p>You've unlocked the "<strong>{{achievement.title}}</strong>" achievement!</p>
            <p>{{achievement.description}}</p>
            <a href="{{app.url}}/achievements" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Achievements</a>
          </div>
        `,
        variables: ['user.displayName', 'achievement.title', 'achievement.description', 'app.url']
      },
      // Social Templates
      {
        name: 'friend_request',
        type: NotificationType.FRIEND_REQUEST,
        channel: NotificationChannel.EMAIL,
        language: 'en',
        subject: 'New Friend Request 👥',
        title: 'New Friend Request',
        content: '{{sender.displayName}} sent you a friend request!',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #8B5CF6;">New Friend Request 👥</h2>
            <p>{{sender.displayName}} sent you a friend request!</p>
            <a href="{{app.url}}/friends" style="background-color: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Request</a>
          </div>
        `,
        variables: ['sender.displayName', 'app.url']
      },
      // System Templates
      {
        name: 'system_update',
        type: NotificationType.SYSTEM_UPDATE,
        channel: NotificationChannel.EMAIL,
        language: 'en',
        subject: 'System Update Available 🔄',
        title: 'System Update',
        content: 'A new version of WriteWave is available with exciting new features!',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6B7280;">System Update Available 🔄</h2>
            <p>A new version of WriteWave is available with exciting new features!</p>
            <ul>
              {{#each features}}
              <li>{{this}}</li>
              {{/each}}
            </ul>
            <a href="{{app.url}}/update" style="background-color: #6B7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Learn More</a>
          </div>
        `,
        variables: ['features', 'app.url']
      }
    ];

    for (const templateData of defaultTemplates) {
      try {
        const existingTemplate = await storage.getTemplateByName(
          templateData.name,
          templateData.type,
          templateData.channel,
          templateData.language
        );

        if (!existingTemplate) {
          const template: NotificationTemplate = {
            id: generateId(),
            name: templateData.name,
            type: templateData.type,
            channel: templateData.channel,
            language: templateData.language,
            subject: templateData.subject,
            title: templateData.title,
            content: templateData.content,
            htmlContent: templateData.htmlContent,
            variables: templateData.variables,
            isActive: true,
            version: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'system'
          };

          await storage.createTemplate(template);
          this.templateCache.set(template.id, template);
        }
      } catch (error) {
        logger.error('Error creating default template', { 
          name: templateData.name, 
          error: error.message 
        });
      }
    }
  }

  async createTemplate(templateData: CreateTemplateRequest): Promise<{ success: boolean; template?: NotificationTemplate; error?: string }> {
    try {
      logger.info('Creating template', { name: templateData.name });

      const template: NotificationTemplate = {
        id: generateId(),
        name: templateData.name,
        type: templateData.type,
        channel: templateData.channel,
        language: templateData.language,
        subject: templateData.subject,
        title: templateData.title,
        content: templateData.content,
        htmlContent: templateData.htmlContent,
        variables: templateData.variables,
        isActive: true,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user'
      };

      await storage.createTemplate(template);
      this.templateCache.set(template.id, template);

      logger.info('Template created successfully', { templateId: template.id });
      return { success: true, template };

    } catch (error) {
      logger.error('Error creating template', { 
        name: templateData.name, 
        error: error.message 
      });
      return { success: false, error: error.message };
    }
  }

  async getTemplate(templateId: string): Promise<NotificationTemplate | null> {
    try {
      // Check cache first
      if (this.templateCache.has(templateId)) {
        return this.templateCache.get(templateId)!;
      }

      // Load from storage
      const template = await storage.getTemplate(templateId);
      if (template) {
        this.templateCache.set(templateId, template);
      }

      return template;

    } catch (error) {
      logger.error('Error getting template', { templateId, error: error.message });
      return null;
    }
  }

  async getTemplateByName(
    name: string, 
    type: NotificationType, 
    channel: NotificationChannel, 
    language: string
  ): Promise<NotificationTemplate | null> {
    try {
      return await storage.getTemplateByName(name, type, channel, language);
    } catch (error) {
      logger.error('Error getting template by name', { 
        name, 
        type, 
        channel, 
        language, 
        error: error.message 
      });
      return null;
    }
  }

  async updateTemplate(
    templateId: string, 
    updates: UpdateTemplateRequest
  ): Promise<{ success: boolean; template?: NotificationTemplate; error?: string }> {
    try {
      logger.info('Updating template', { templateId });

      const existingTemplate = await storage.getTemplate(templateId);
      if (!existingTemplate) {
        return { success: false, error: 'Template not found' };
      }

      const updatedTemplate = await storage.updateTemplate(templateId, {
        ...updates,
        version: existingTemplate.version + 1
      });

      if (updatedTemplate) {
        this.templateCache.set(templateId, updatedTemplate);
        // Clear compiled template cache
        this.compiledTemplates.delete(templateId);
      }

      logger.info('Template updated successfully', { templateId });
      return { success: true, template: updatedTemplate };

    } catch (error) {
      logger.error('Error updating template', { templateId, error: error.message });
      return { success: false, error: error.message };
    }
  }

  async deleteTemplate(templateId: string): Promise<boolean> {
    try {
      logger.info('Deleting template', { templateId });

      const success = await storage.deleteTemplate(templateId);
      if (success) {
        this.templateCache.delete(templateId);
        this.compiledTemplates.delete(templateId);
      }

      return success;

    } catch (error) {
      logger.error('Error deleting template', { templateId, error: error.message });
      return false;
    }
  }

  async renderTemplate(
    template: NotificationTemplate, 
    variables: any = {}
  ): Promise<{ subject?: string; title: string; content: string; htmlContent?: string }> {
    try {
      // Get compiled template
      let compiledTemplate = this.compiledTemplates.get(template.id);
      if (!compiledTemplate) {
        compiledTemplate = Handlebars.compile(template.content);
        this.compiledTemplates.set(template.id, compiledTemplate);
      }

      // Render content
      const renderedContent = compiledTemplate(variables);

      // Render HTML content if available
      let renderedHtmlContent;
      if (template.htmlContent) {
        let compiledHtmlTemplate = this.compiledTemplates.get(`${template.id}_html`);
        if (!compiledHtmlTemplate) {
          compiledHtmlTemplate = Handlebars.compile(template.htmlContent);
          this.compiledTemplates.set(`${template.id}_html`, compiledHtmlTemplate);
        }
        renderedHtmlContent = compiledHtmlTemplate(variables);
      }

      // Render subject if available
      let renderedSubject;
      if (template.subject) {
        let compiledSubjectTemplate = this.compiledTemplates.get(`${template.id}_subject`);
        if (!compiledSubjectTemplate) {
          compiledSubjectTemplate = Handlebars.compile(template.subject);
          this.compiledTemplates.set(`${template.id}_subject`, compiledSubjectTemplate);
        }
        renderedSubject = compiledSubjectTemplate(variables);
      }

      return {
        subject: renderedSubject,
        title: template.title,
        content: renderedContent,
        htmlContent: renderedHtmlContent
      };

    } catch (error) {
      logger.error('Error rendering template', { 
        templateId: template.id, 
        error: error.message 
      });
      throw error;
    }
  }

  async getTemplatesByType(
    type: NotificationType, 
    channel: NotificationChannel, 
    language: string
  ): Promise<NotificationTemplate[]> {
    try {
      return await storage.getTemplatesByType(type, channel, language);
    } catch (error) {
      logger.error('Error getting templates by type', { 
        type, 
        channel, 
        language, 
        error: error.message 
      });
      return [];
    }
  }

  async validateTemplate(template: NotificationTemplate): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check required fields
    if (!template.name) errors.push('Name is required');
    if (!template.type) errors.push('Type is required');
    if (!template.channel) errors.push('Channel is required');
    if (!template.language) errors.push('Language is required');
    if (!template.title) errors.push('Title is required');
    if (!template.content) errors.push('Content is required');

    // Check content length
    if (template.content && template.content.length > 1000) {
      errors.push('Content is too long (max 1000 characters)');
    }

    // Check HTML content if provided
    if (template.htmlContent && template.htmlContent.length > 10000) {
      errors.push('HTML content is too long (max 10000 characters)');
    }

    // Validate variables
    if (template.variables && template.variables.length > 20) {
      errors.push('Too many variables (max 20)');
    }

    // Check for valid variable names
    if (template.variables) {
      const invalidVariables = template.variables.filter(v => 
        !/^[a-zA-Z][a-zA-Z0-9._]*$/.test(v)
      );
      if (invalidVariables.length > 0) {
        errors.push(`Invalid variable names: ${invalidVariables.join(', ')}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async testTemplate(
    template: NotificationTemplate, 
    testVariables: any = {}
  ): Promise<{ success: boolean; rendered?: any; error?: string }> {
    try {
      const rendered = await this.renderTemplate(template, testVariables);
      return { success: true, rendered };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async cloneTemplate(
    templateId: string, 
    newName: string
  ): Promise<{ success: boolean; template?: NotificationTemplate; error?: string }> {
    try {
      const originalTemplate = await storage.getTemplate(templateId);
      if (!originalTemplate) {
        return { success: false, error: 'Template not found' };
      }

      const clonedTemplate: NotificationTemplate = {
        id: generateId(),
        name: newName,
        type: originalTemplate.type,
        channel: originalTemplate.channel,
        language: originalTemplate.language,
        subject: originalTemplate.subject,
        title: originalTemplate.title,
        content: originalTemplate.content,
        htmlContent: originalTemplate.htmlContent,
        variables: [...originalTemplate.variables],
        isActive: true,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user'
      };

      await storage.createTemplate(clonedTemplate);
      this.templateCache.set(clonedTemplate.id, clonedTemplate);

      return { success: true, template: clonedTemplate };

    } catch (error) {
      logger.error('Error cloning template', { templateId, error: error.message });
      return { success: false, error: error.message };
    }
  }

  async getTemplateStats(): Promise<any> {
    try {
      // This would typically fetch from database
      // For now, return mock data
      return {
        totalTemplates: this.templateCache.size,
        activeTemplates: Array.from(this.templateCache.values()).filter(t => t.isActive).length,
        templatesByType: {},
        templatesByChannel: {},
        templatesByLanguage: {}
      };
    } catch (error) {
      logger.error('Error getting template stats', { error: error.message });
      return {};
    }
  }

  async clearCache(): Promise<void> {
    this.templateCache.clear();
    this.compiledTemplates.clear();
    logger.info('Template cache cleared');
  }
}

export const templateService = new TemplateService();
