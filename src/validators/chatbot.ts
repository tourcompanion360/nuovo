import { z } from 'zod';
import { TEXT } from '@/constants/text';

// Chatbot validation schema
export const createChatbotValidator = z.object({
  name: z
    .string()
    .min(1, TEXT.CHATBOT.NAME_REQUIRED)
    .max(100, 'Name must be less than 100 characters'),
  
  description: z
    .string()
    .min(1, TEXT.CHATBOT.DESCRIPTION_REQUIRED)
    .max(500, 'Description must be less than 500 characters'),
  
  language: z
    .string()
    .min(1, 'Language is required'),
  
  welcome_message: z
    .string()
    .min(1, TEXT.CHATBOT.WELCOME_MESSAGE_REQUIRED)
    .max(500, 'Welcome message must be less than 500 characters'),
  
  fallback_message: z
    .string()
    .min(1, TEXT.CHATBOT.FALLBACK_MESSAGE_REQUIRED)
    .max(500, 'Fallback message must be less than 500 characters'),
  
  primary_color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, TEXT.CHATBOT.INVALID_COLOR),
  
  widget_style: z
    .enum(['modern', 'classic', 'minimal', 'bubble', 'card']),
  
  position: z
    .enum(['bottom_right', 'bottom_left', 'top_right', 'top_left', 'center']),
  
  avatar_url: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  
  brand_logo_url: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  
  knowledge_base_text: z
    .string()
    .max(10000, 'Knowledge base text must be less than 10,000 characters')
    .optional(),
  
  response_style: z
    .enum(['friendly', 'professional', 'casual', 'formal', 'helpful']),
  
  max_questions: z
    .number()
    .min(1, TEXT.CHATBOT.MAX_QUESTIONS_INVALID)
    .max(50, TEXT.CHATBOT.MAX_QUESTIONS_INVALID),
  
  conversation_limit: z
    .number()
    .min(1, 'Conversation limit must be at least 1')
    .max(1000, 'Conversation limit must be less than 1000'),
  
  status: z
    .enum(['active', 'inactive', 'draft']),
});

// Update chatbot validator (all fields optional except id)
export const updateChatbotValidator = createChatbotValidator.partial().extend({
  id: z.string().min(1, 'Chatbot ID is required'),
});

// File upload validator
export const fileUploadValidator = z.object({
  files: z
    .array(z.instanceof(File))
    .max(10, 'Maximum 10 files allowed')
    .refine(
      (files) => files.every(file => file.size <= 10 * 1024 * 1024), // 10MB limit
      'Each file must be less than 10MB'
    )
    .refine(
      (files) => files.every(file => 
        ['text/plain', 'application/pdf', 'text/markdown', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)
      ),
      'Only text, PDF, and Word documents are allowed'
    ),
});

// Statistics date range validator
export const statisticsDateRangeValidator = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
}).refine(
  (data) => {
    if (data.start_date && data.end_date) {
      return new Date(data.start_date) <= new Date(data.end_date);
    }
    return true;
  },
  {
    message: 'Start date must be before end date',
    path: ['end_date'],
  }
);

// Export types
export type CreateChatbotInput = z.infer<typeof createChatbotValidator>;
export type UpdateChatbotInput = z.infer<typeof updateChatbotValidator>;
export type FileUploadInput = z.infer<typeof fileUploadValidator>;
export type StatisticsDateRangeInput = z.infer<typeof statisticsDateRangeValidator>;








