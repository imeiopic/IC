import { z } from 'zod';

/**
 * Schema for documents in the 'email_logs' collection.
 */
export const emailLogSchema = z.object({
  status: z.enum(['Success', 'Failure', 'Pending']),
  byteSize: z.coerce.number().int().nonnegative().default(0),
  timestamp: z.any(), // Validated as Firestore Timestamp
  recipient: z.string().email().optional(),
});

export type EmailLog = z.infer<typeof emailLogSchema>;

/**
 * Schema for documents in the 'access_requests' collection.
 */
export const accessRequestSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email(),
  requestedRole: z.string().min(1),
  status: z.enum(['Pending', 'Approved', 'Denied']),
  timestamp: z.any().optional(), // Validated as Firestore Timestamp
  denialReason: z.string().optional(),
  currentClaims: z.record(z.any()).optional(),
});

export type AccessRequest = z.infer<typeof accessRequestSchema>;

/**
 * Schema for admin actions via Express API.
 */
export const adminActionSchema = z.object({
  action: z.string().min(1),
  payload: z.record(z.any()).optional(),
});

export type AdminAction = z.infer<typeof adminActionSchema>;
