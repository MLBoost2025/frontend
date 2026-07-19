import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TermsPage from "./page";

describe("Terms page", () => {
  it("publishes the billing and privacy policy links without requiring app state", () => {
    render(<TermsPage />);
    expect(screen.getByRole("heading", { name: "Terms of use" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Billing terms" })[0]).toHaveAttribute("href", "/billing-terms");
    expect(screen.getByRole("link", { name: "Refund policy" })).toHaveAttribute("href", "/refunds");
  });
});
