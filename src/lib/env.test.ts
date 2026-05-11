import { describe, it, expect, beforeEach, afterEach } from "vitest";

const VALID_ENV = {
  TURSO_DATABASE_URL: "libsql://test.turso.io",
  TURSO_AUTH_TOKEN: "token123",
  BETTER_AUTH_SECRET: "a-very-long-secret-that-is-at-least-32-chars!",
  FDC_API_KEY: "abc123",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
};

describe("env validation", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.resetModules();
  });

  it("parses valid environment without throwing", async () => {
    Object.assign(process.env, VALID_ENV);
    const { getEnv } = await import("./env");
    const env = getEnv();
    expect(env.TURSO_DATABASE_URL).toBe(VALID_ENV.TURSO_DATABASE_URL);
    expect(env.FDC_API_KEY).toBe("abc123");
  });

  it("throws when TURSO_DATABASE_URL is missing", async () => {
    const incomplete = { ...VALID_ENV };
    delete (incomplete as Partial<typeof VALID_ENV>).TURSO_DATABASE_URL;
    Object.assign(process.env, incomplete);
    delete process.env.TURSO_DATABASE_URL;
    const { getEnv } = await import("./env");
    expect(() => getEnv()).toThrow();
  });

  it("throws when BETTER_AUTH_SECRET is too short", async () => {
    Object.assign(process.env, { ...VALID_ENV, BETTER_AUTH_SECRET: "short" });
    const { getEnv } = await import("./env");
    expect(() => getEnv()).toThrow();
  });

  it("throws when NEXT_PUBLIC_APP_URL is not a URL", async () => {
    Object.assign(process.env, { ...VALID_ENV, NEXT_PUBLIC_APP_URL: "not-a-url" });
    const { getEnv } = await import("./env");
    expect(() => getEnv()).toThrow();
  });

  it("error message lists all invalid fields", async () => {
    delete process.env.TURSO_DATABASE_URL;
    delete process.env.TURSO_AUTH_TOKEN;
    delete process.env.FDC_API_KEY;
    const { getEnv } = await import("./env");
    try {
      getEnv();
    } catch (e) {
      expect((e as Error).message).toContain("TURSO_DATABASE_URL");
    }
  });
});
