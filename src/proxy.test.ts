import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Must be hoisted before any imports that transitively touch next/server
vi.mock("next/server", () => ({
  NextResponse: {
    next: vi.fn(() => ({ _type: "next" })),
    redirect: vi.fn((url: URL) => ({ _type: "redirect", url: url.toString() })),
  },
}));

vi.mock("@/lib/auth/server", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";
import { proxy } from "./proxy";

const mockNext = vi.mocked(NextResponse.next);
const mockRedirect = vi.mocked(NextResponse.redirect);
const mockGetSession = vi.mocked(auth.api.getSession);

function makeRequest(pathname: string): NextRequest {
  return {
    nextUrl: { pathname },
    headers: new Headers(),
    url: `http://localhost${pathname}`,
  } as unknown as NextRequest;
}

describe("proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("E2E_AUTH_BYPASS guard", () => {
    afterEach(() => {
      delete process.env.E2E_AUTH_BYPASS;
    });

    it("bypasses auth when E2E_AUTH_BYPASS=true in non-production", async () => {
      process.env.E2E_AUTH_BYPASS = "true";
      // NODE_ENV is 'test' in vitest, so bypass should be active
      await proxy(makeRequest("/today"));
      expect(mockNext).toHaveBeenCalledOnce();
      expect(mockGetSession).not.toHaveBeenCalled();
    });

    it("does NOT bypass in production even if E2E_AUTH_BYPASS=true (Issue 1 regression)", async () => {
      process.env.E2E_AUTH_BYPASS = "true";
      vi.stubEnv("NODE_ENV", "production");
      mockGetSession.mockResolvedValue({ user: { id: "u1" }, session: {} } as never);

      await proxy(makeRequest("/today"));

      vi.unstubAllEnvs();

      // In production the bypass is ignored — auth is checked
      expect(mockGetSession).toHaveBeenCalled();
    });

    it("does not bypass when E2E_AUTH_BYPASS is absent", async () => {
      mockGetSession.mockResolvedValue({ user: { id: "u1" }, session: {} } as never);
      await proxy(makeRequest("/today"));
      expect(mockGetSession).toHaveBeenCalled();
    });

    it("does not bypass when E2E_AUTH_BYPASS is 'false'", async () => {
      process.env.E2E_AUTH_BYPASS = "false";
      mockGetSession.mockResolvedValue({ user: { id: "u1" }, session: {} } as never);
      await proxy(makeRequest("/today"));
      expect(mockGetSession).toHaveBeenCalled();
    });
  });

  describe("unprotected routes", () => {
    it("allows /sign-in without auth check", async () => {
      await proxy(makeRequest("/sign-in"));
      expect(mockNext).toHaveBeenCalledOnce();
      expect(mockGetSession).not.toHaveBeenCalled();
    });

    it("allows / (root) without auth check", async () => {
      await proxy(makeRequest("/"));
      expect(mockNext).toHaveBeenCalledOnce();
      expect(mockGetSession).not.toHaveBeenCalled();
    });

    it("allows /api/auth/sign-up without auth check", async () => {
      await proxy(makeRequest("/api/auth/sign-up"));
      expect(mockNext).toHaveBeenCalledOnce();
      expect(mockGetSession).not.toHaveBeenCalled();
    });
  });

  describe("protected routes — authenticated", () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({ user: { id: "u1" }, session: {} } as never);
    });

    it("allows /today with a valid session", async () => {
      await proxy(makeRequest("/today"));
      expect(mockNext).toHaveBeenCalledOnce();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it("allows /foods with a valid session", async () => {
      await proxy(makeRequest("/foods"));
      expect(mockNext).toHaveBeenCalledOnce();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it("allows /plans with a valid session", async () => {
      await proxy(makeRequest("/plans"));
      expect(mockNext).toHaveBeenCalledOnce();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it("allows /athlete with a valid session", async () => {
      await proxy(makeRequest("/athlete"));
      expect(mockNext).toHaveBeenCalledOnce();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it("allows /today/some/sub-path with a valid session", async () => {
      await proxy(makeRequest("/today/2026-05-07"));
      expect(mockNext).toHaveBeenCalledOnce();
    });
  });

  describe("protected routes — unauthenticated", () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue(null);
    });

    it("redirects /today to /sign-in when no session", async () => {
      await proxy(makeRequest("/today"));
      expect(mockRedirect).toHaveBeenCalledOnce();
      const redirectUrl: URL = vi.mocked(mockRedirect).mock.calls[0][0] as URL;
      expect(redirectUrl.pathname).toBe("/sign-in");
    });

    it("redirects /foods to /sign-in when no session", async () => {
      await proxy(makeRequest("/foods"));
      expect(mockRedirect).toHaveBeenCalledOnce();
    });

    it("redirects /plans to /sign-in when no session", async () => {
      await proxy(makeRequest("/plans"));
      expect(mockRedirect).toHaveBeenCalledOnce();
    });

    it("redirects /athlete to /sign-in when no session", async () => {
      await proxy(makeRequest("/athlete"));
      expect(mockRedirect).toHaveBeenCalledOnce();
    });
  });
});
