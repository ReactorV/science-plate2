import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EvidenceDrawer } from "./EvidenceDrawer";

const noop = vi.fn();

describe("EvidenceDrawer", () => {
  describe("when open", () => {
    it("has role='dialog'", () => {
      render(<EvidenceDrawer open onClose={noop} />);
      expect(screen.getByRole("dialog")).toBeTruthy();
    });

    it("has aria-modal='true'", () => {
      render(<EvidenceDrawer open onClose={noop} />);
      const dialog = screen.getByRole("dialog");
      expect(dialog.getAttribute("aria-modal")).toBe("true");
    });

    it("has aria-label 'Evidence inspector'", () => {
      render(<EvidenceDrawer open onClose={noop} />);
      expect(screen.getByRole("dialog", { name: /evidence inspector/i })).toBeTruthy();
    });

    it("has aria-describedby pointing to #evidence-drawer-description", () => {
      render(<EvidenceDrawer open onClose={noop} />);
      const dialog = screen.getByRole("dialog");
      expect(dialog.getAttribute("aria-describedby")).toBe("evidence-drawer-description");
      expect(document.getElementById("evidence-drawer-description")).not.toBeNull();
    });

    it("close button is accessible with aria-label", () => {
      render(<EvidenceDrawer open onClose={noop} />);
      expect(screen.getByRole("button", { name: /close evidence inspector/i })).toBeTruthy();
    });

    it("pressing Escape calls onClose", () => {
      const onClose = vi.fn();
      render(<EvidenceDrawer open onClose={onClose} />);
      fireEvent.keyDown(document, { key: "Escape" });
      expect(onClose).toHaveBeenCalledOnce();
    });

    it("clicking the close button calls onClose", () => {
      const onClose = vi.fn();
      render(<EvidenceDrawer open onClose={onClose} />);
      fireEvent.click(screen.getByRole("button", { name: /close evidence inspector/i }));
      expect(onClose).toHaveBeenCalledOnce();
    });

    it("displays rule results when provided", () => {
      const ruleResults = [
        {
          ruleId: "fe-vitc",
          ruleVersion: "1.0.0",
          evidenceRefs: ["Hallberg1989"],
          kind: "synergy" as const,
          affects: ["iron"],
          humanReason: "VitC enhances iron absorption.",
          mealIndex: 0,
          strength: 0.7,
        },
      ];
      render(<EvidenceDrawer open onClose={noop} ruleResults={ruleResults} />);
      expect(screen.getByText("fe-vitc")).toBeTruthy();
      expect(screen.getByText("VitC enhances iron absorption.")).toBeTruthy();
    });

    it("formats the calculation hash as a short display", () => {
      const hash = "3f9ca14b02e8d7f6a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718";
      render(<EvidenceDrawer open onClose={noop} hash={hash} />);
      // shortHash = slice(0,4)·slice(4,8)·slice(8,12) = "3f9c·a14b·02e8"
      expect(screen.getByText(/3f9c.a14b.02e8/)).toBeTruthy();
    });

    it("shows '—' when no hash provided", () => {
      render(<EvidenceDrawer open onClose={noop} />);
      expect(screen.getByText("—")).toBeTruthy();
    });
  });

  describe("when closed", () => {
    it("dialog is present in DOM but visually toggled (open prop = false)", () => {
      render(<EvidenceDrawer open={false} onClose={noop} />);
      // Dialog must remain in DOM for transition (CSS toggles visibility)
      expect(screen.getByRole("dialog")).toBeTruthy();
    });

    it("Escape does NOT call onClose when closed", () => {
      const onClose = vi.fn();
      render(<EvidenceDrawer open={false} onClose={onClose} />);
      fireEvent.keyDown(document, { key: "Escape" });
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
