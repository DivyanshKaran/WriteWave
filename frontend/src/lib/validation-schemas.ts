/**
 * Validation schemas using Zod
 */
import { z } from "zod";

// User profile validation
export const userProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  email: z.string().email("Invalid email address"),
  location: z
    .string()
    .max(100, "Location must be less than 100 characters")
    .optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
});

export const updateProfileSchema = userProfileSchema.partial();

// Article validation
export const articleSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  excerpt: z
    .string()
    .max(500, "Excerpt must be less than 500 characters")
    .optional(),
  content: z
    .string()
    .min(100, "Content must be at least 100 characters")
    .max(50000, "Content must be less than 50,000 characters"),
  tags: z
    .array(z.string())
    .min(1, "At least one tag is required")
    .max(10, "Maximum 10 tags allowed")
    .refine(
      (tags) => tags.every((tag) => tag.length >= 2 && tag.length <= 30),
      "Each tag must be between 2 and 30 characters"
    ),
});

export const createArticleSchema = articleSchema;
export const updateArticleSchema = articleSchema.partial();

// Authentication validation
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(100, "Name must be less than 100 characters"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be less than 30 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      ),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(12, "Password must be at least 12 characters")
      .max(128, "Password must be less than 128 characters")
      .regex(
        /^(?=.*[a-z])/,
        "Password must contain at least one lowercase letter"
      )
      .regex(
        /^(?=.*[A-Z])/,
        "Password must contain at least one uppercase letter"
      )
      .regex(/^(?=.*\d)/, "Password must contain at least one number")
      .regex(
        /^(?=.*[@$!%*?&#^()_+=\-\[\]{}|\\:;"'<>,.\/~`])/,
        "Password must contain at least one special character"
      )
      .refine(
        (val) => !/(.)\1{2,}/.test(val),
        "Password cannot contain repeated characters (3+ times)"
      )
      .refine(
        (val) =>
          !["password", "12345", "qwerty", "admin"].some((common) =>
            val.toLowerCase().includes(common)
          ),
        "Password contains common words or patterns"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(12, "Password must be at least 12 characters")
      .max(128, "Password must be less than 128 characters")
      .regex(
        /^(?=.*[a-z])/,
        "Password must contain at least one lowercase letter"
      )
      .regex(
        /^(?=.*[A-Z])/,
        "Password must contain at least one uppercase letter"
      )
      .regex(/^(?=.*\d)/, "Password must contain at least one number")
      .regex(
        /^(?=.*[@$!%*?&#^()_+=\-\[\]{}|\\:;"'<>,.\/~`])/,
        "Password must contain at least one special character"
      )
      .refine(
        (val) => !/(.)\1{2,}/.test(val),
        "Password cannot contain repeated characters (3+ times)"
      )
      .refine(
        (val) =>
          !["password", "12345", "qwerty", "admin"].some((common) =>
            val.toLowerCase().includes(common)
          ),
        "Password contains common words or patterns"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Settings validation
export const notificationSettingsSchema = z.object({
  dailyReminder: z.boolean(),
  achievements: z.boolean(),
  community: z.boolean(),
  newsletter: z.boolean(),
});

export const learningPreferencesSchema = z.object({
  dailyGoal: z.number().min(5).max(180), // 5 minutes to 3 hours
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  audioPlayback: z.boolean(),
  strokeOrder: z.boolean(),
});

export const appearanceSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  fontSize: z.enum(["small", "medium", "large"]),
});

export const languageSettingsSchema = z.object({
  interfaceLanguage: z.enum(["en", "ja", "es", "fr"]),
  romanization: z.enum(["hepburn", "kunrei", "nihon"]),
});

export const privacySettingsSchema = z.object({
  profilePublic: z.boolean(),
  showProgress: z.boolean(),
});

// Search and filter validation
export const searchSchema = z.object({
  query: z
    .string()
    .max(100, "Search query must be less than 100 characters")
    .optional(),
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),
  trending: z.boolean().optional(),
});

// Comment validation
export const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment must be less than 1000 characters"),
});

// Study session validation
export const studySessionSchema = z.object({
  characterType: z.enum(["hiragana", "katakana", "kanji"]),
  characters: z.array(z.string()).min(1, "At least one character is required"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  accuracy: z.number().min(0).max(100),
});

// Export types
export type UserProfileFormData = z.infer<typeof userProfileSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type ArticleFormData = z.infer<typeof articleSchema>;
export type CreateArticleFormData = z.infer<typeof createArticleSchema>;
export type UpdateArticleFormData = z.infer<typeof updateArticleSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type NotificationSettingsFormData = z.infer<
  typeof notificationSettingsSchema
>;
export type LearningPreferencesFormData = z.infer<
  typeof learningPreferencesSchema
>;
export type AppearanceSettingsFormData = z.infer<
  typeof appearanceSettingsSchema
>;
export type LanguageSettingsFormData = z.infer<typeof languageSettingsSchema>;
export type PrivacySettingsFormData = z.infer<typeof privacySettingsSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
export type CommentFormData = z.infer<typeof commentSchema>;
export type StudySessionFormData = z.infer<typeof studySessionSchema>;
