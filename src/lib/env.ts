import { z } from "zod";

const envSchema = z.object({
  TURSO_DATABASE_URL: z.string().min(1, "TURSO_DATABASE_URL is required"),
  TURSO_AUTH_TOKEN: z.string().min(1, "TURSO_AUTH_TOKEN is required"),
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  FDC_API_KEY: z.string().min(1, "FDC_API_KEY is required"),
  NEXT_PUBLIC_APP_URL: z.string().url("NEXT_PUBLIC_APP_URL must be a valid URL"),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const formatted = result.error.issues
      .map((i) => `  ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`❌ Invalid environment variables:\n${formatted}`);
  }
  return result.data;
}

let _env: Env | undefined;

/** Lazily validates and returns the environment. Throws on first call if vars are invalid. */
export function getEnv(): Env {
  if (!_env) _env = parseEnv();
  return _env;
}

/** @internal Reset the cached env (for testing only). */
export function _resetEnvCache(): void {
  _env = undefined;
}
