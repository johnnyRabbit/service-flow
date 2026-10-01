import { z } from 'zod';

// Zod schemas for AI output validation
export const IntentSchema = z.object({
  intent: z.enum(['REQUEST_SERVICE', 'FAQ', 'APPOINTMENT', 'GREETING', 'COMPLAINT', 'UNKNOWN']),
  confidence: z.number().min(0).max(1),
  service: z.string().optional(),
  urgency: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  extractedFields: z.record(z.string(), z.string()),
  missingFields: z.array(z.string()),
  suggestedReply: z.string(),
  requiresHuman: z.boolean(),
  triggerRule: z.string().optional(),
});

export const ToolCallSchema = z.object({
  toolName: z.string(),
  parameters: z.record(z.string(), z.any()),
  result: z.any(),
  executionTime: z.number(),
  success: z.boolean(),
  error: z.string().optional(),
});

export const AIResponseSchema = z.object({
  intent: IntentSchema,
  toolCalls: z.array(ToolCallSchema).optional(),
  totalProcessingTime: z.number(),
  tokensUsed: z.number(),
  model: z.string(),
});

export type AIIntent = z.infer<typeof IntentSchema>;
export type ToolCall = z.infer<typeof ToolCallSchema>;
export type AIResponse = z.infer<typeof AIResponseSchema>;
