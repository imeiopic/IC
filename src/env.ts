import { z } from "zod";

// Variables required in ALL environments
const baseSchema = z.object({
  VITE_FIREBASE_API_KEY: z.string().min(1, "VITE_FIREBASE_API_KEY is required"),
  VITE_FIREBASE_AUTH_DOMAIN: z
    .string()
    .min(1, "VITE_FIREBASE_AUTH_DOMAIN is required"),
  VITE_FIREBASE_PROJECT_ID: z
    .string()
    .min(1, "VITE_FIREBASE_PROJECT_ID is required"),
  VITE_FIREBASE_STORAGE_BUCKET: z
    .string()
    .min(1, "VITE_FIREBASE_STORAGE_BUCKET is required"),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z
    .string()
    .min(1, "VITE_FIREBASE_MESSAGING_SENDER_ID is required"),
  VITE_FIREBASE_APP_ID: z.string().min(1, "VITE_FIREBASE_APP_ID is required"),
  VITE_FIREBASE_MEASUREMENT_ID: z
    .string()
    .min(1, "VITE_FIREBASE_MEASUREMENT_ID is required"),
  VITE_FIREBACK_PORT: z.coerce.number().int().min(1).max(65535),
  VITE_FIREBACK_HOST: z.string().default("localhost"),
});

const serverSchema = z.object({
  FIREBACK_ADMIN_TOKEN: z.string().min(1, "FIREBACK_ADMIN_TOKEN is required"),
});

// Variables specific to Development
const devSchema = baseSchema
  .extend({
    VITE_SSL_STRATEGY: z.enum(["devcert", "custom"]).optional(),
    VITE_SSL_KEY_PATH: z.string().optional(),
    VITE_SSL_CERT_PATH: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.VITE_SSL_STRATEGY === "custom" ||
      data.VITE_SSL_STRATEGY === "devcert"
    ) {
      if (!data.VITE_SSL_KEY_PATH) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "VITE_SSL_KEY_PATH is required when VITE_SSL_STRATEGY is 'custom'",
          path: ["VITE_SSL_KEY_PATH"],
        });
      }
      if (!data.VITE_SSL_CERT_PATH) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "VITE_SSL_CERT_PATH is required when VITE_SSL_STRATEGY is 'custom'",
          path: ["VITE_SSL_CERT_PATH"],
        });
      }
    }
  });

// This function merges public and private schemas for validation in vite.config.ts
export const getEnvSchema = (mode: string) => {
  const base = mode === "production" ? baseSchema : devSchema;
  return base; // Do NOT enforce backend secrets on the Vite frontend
};

// Function to validate environment variables in a Cloud Function context
export const validateServerEnv = () => {
  const result = baseSchema.merge(serverSchema).safeParse(process.env);
  if (!result.success) {
    console.error(
      "❌ Invalid Server Environment Variables:",
      result.error.format(),
    );
    throw new Error("Invalid environment configuration");
  }
  return result.data;
};

// Exported type ONLY includes the VITE_ prefixed variables for the frontend
export type EnvSchema = z.infer<typeof devSchema>;
