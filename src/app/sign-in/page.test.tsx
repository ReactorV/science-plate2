import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/auth/client", () => ({
  authClient: {
    signIn: {
      email: vi.fn(),
    },
  },
}));

import SignInPage from "./page";
import { authClient } from "@/lib/auth/client";

const mockSignIn = vi.mocked(authClient.signIn.email);

describe("SignInPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignIn.mockResolvedValue({ data: { user: { id: "u1" } }, error: null } as never);
  });

  describe("rendering", () => {
    it("renders 'Sign in' heading", () => {
      render(<SignInPage />);
      expect(screen.getByRole("heading", { name: /sign in/i })).toBeTruthy();
    });

    it("renders email input with label", () => {
      render(<SignInPage />);
      const input = screen.getByLabelText(/email/i);
      expect(input).toBeTruthy();
      expect(input.getAttribute("type")).toBe("email");
    });

    it("renders password input with label", () => {
      render(<SignInPage />);
      const input = screen.getByLabelText(/password/i);
      expect(input).toBeTruthy();
      expect(input.getAttribute("type")).toBe("password");
    });

    it("renders submit button with 'Sign in' text", () => {
      render(<SignInPage />);
      expect(screen.getByRole("button", { name: /sign in/i })).toBeTruthy();
    });

    it("renders 'Create account' link pointing to /onboarding", () => {
      render(<SignInPage />);
      const link = screen.getByRole("link", { name: /create account/i });
      expect(link).toBeTruthy();
      expect(link.getAttribute("href")).toBe("/onboarding");
    });

    it("email input has 'required' attribute", () => {
      render(<SignInPage />);
      expect(screen.getByLabelText(/email/i).hasAttribute("required")).toBe(true);
    });

    it("password input has 'required' attribute", () => {
      render(<SignInPage />);
      expect(screen.getByLabelText(/password/i).hasAttribute("required")).toBe(true);
    });

    it("does not show error message initially", () => {
      render(<SignInPage />);
      expect(screen.queryByText(/sign in failed/i)).toBeNull();
      expect(screen.queryByText(/invalid/i)).toBeNull();
    });
  });

  describe("successful sign-in", () => {
    it("calls authClient.signIn.email with email and password on submit", async () => {
      render(<SignInPage />);
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      });
      fireEvent.submit(
        screen.getByRole("button", { name: /sign in/i }).closest("form")!,
      );

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledOnce();
        expect(mockSignIn).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password123",
        });
      });
    });

    it("redirects to /today via router.push on success", async () => {
      render(<SignInPage />);
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      });
      fireEvent.submit(
        screen.getByRole("button", { name: /sign in/i }).closest("form")!,
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/today");
      });
    });

    it("does not show error on successful sign-in", async () => {
      render(<SignInPage />);
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      });
      fireEvent.submit(
        screen.getByRole("button", { name: /sign in/i }).closest("form")!,
      );

      await waitFor(() => expect(mockPush).toHaveBeenCalled());
      expect(screen.queryByText(/sign in failed/i)).toBeNull();
    });
  });

  describe("failed sign-in", () => {
    it("shows inline error message from authClient error", async () => {
      mockSignIn.mockResolvedValue({
        data: null,
        error: { message: "Invalid credentials" },
      } as never);

      render(<SignInPage />);
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "wrong@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "wrongpass" },
      });
      fireEvent.submit(
        screen.getByRole("button", { name: /sign in/i }).closest("form")!,
      );

      await waitFor(() => {
        expect(screen.getByText("Invalid credentials")).toBeTruthy();
      });
    });

    it("falls back to default message when error.message is absent", async () => {
      mockSignIn.mockResolvedValue({
        data: null,
        error: {},
      } as never);

      render(<SignInPage />);
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "a@b.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "pass" },
      });
      fireEvent.submit(
        screen.getByRole("button", { name: /sign in/i }).closest("form")!,
      );

      await waitFor(() => {
        expect(screen.getByText(/sign in failed/i)).toBeTruthy();
      });
    });

    it("does NOT call router.push when sign-in fails", async () => {
      mockSignIn.mockResolvedValue({
        data: null,
        error: { message: "Bad credentials" },
      } as never);

      render(<SignInPage />);
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "a@b.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "pass" },
      });
      fireEvent.submit(
        screen.getByRole("button", { name: /sign in/i }).closest("form")!,
      );

      await waitFor(() => screen.getByText("Bad credentials"));
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("dev auth bypass", () => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("navigates to /today without calling authClient when bypass is active", async () => {
      vi.stubEnv("NEXT_PUBLIC_DEV_AUTH_BYPASS", "true");

      render(<SignInPage />);
      fireEvent.submit(
        screen.getByRole("button", { name: /sign in/i }).closest("form")!,
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/today");
      });
      expect(mockSignIn).not.toHaveBeenCalled();
    });

    it("calls authClient when bypass flag is not set", async () => {
      render(<SignInPage />);
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      });
      fireEvent.submit(
        screen.getByRole("button", { name: /sign in/i }).closest("form")!,
      );

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledOnce();
      });
    });

    it("does not bypass when NODE_ENV is production", async () => {
      vi.stubEnv("NEXT_PUBLIC_DEV_AUTH_BYPASS", "true");
      vi.stubEnv("NODE_ENV", "production");

      render(<SignInPage />);
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      });
      fireEvent.submit(
        screen.getByRole("button", { name: /sign in/i }).closest("form")!,
      );

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledOnce();
      });
    });
  });
});
