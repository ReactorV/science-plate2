import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { getEnv } from "@/lib/env";

let _db: ReturnType<typeof drizzle> | undefined;

export function getDb(): ReturnType<typeof drizzle> {
  if (!_db) {
    const env = getEnv();
    const client = createClient({
      url: env.TURSO_DATABASE_URL,
      authToken: env.TURSO_AUTH_TOKEN,
    });
    _db = drizzle(client);
  }
  return _db;
}

/** Convenience re-export for callers that need a direct reference at module load. */
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_, prop: string | symbol) {
    return getDb()[prop as keyof ReturnType<typeof drizzle>];
  },
});
