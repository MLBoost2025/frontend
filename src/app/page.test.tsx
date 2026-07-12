import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

// The root route is public: logged-out visitors get the landing, authenticated
// users get their dashboard. Mock the heavy children + data layer so we test
// only the auth branch.
vi.mock("@/context/AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("./components/Landing", () => ({
  default: () => <div data-testid="landing" />,
}));
vi.mock("./components/MainLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dashboard">{children}</div>
  ),
}));
vi.mock("@/lib/api", () => ({
  fetchUserStats: vi.fn(() => new Promise(() => {})),
  fetchRecentActivity: vi.fn(() => new Promise(() => {})),
}));

import Home from "./page";
import { useAuth } from "@/context/AuthContext";

const mockedUseAuth = vi.mocked(useAuth);

afterEach(() => cleanup());

describe("root route (/)", () => {
  it("shows the landing page for logged-out visitors", () => {
    mockedUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false } as ReturnType<typeof useAuth>);
    render(<Home />);
    expect(screen.getByTestId("landing")).toBeTruthy();
    expect(screen.queryByTestId("dashboard")).toBeNull();
  });

  it("shows the dashboard for authenticated users", () => {
    mockedUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false } as ReturnType<typeof useAuth>);
    render(<Home />);
    expect(screen.getByTestId("dashboard")).toBeTruthy();
    expect(screen.queryByTestId("landing")).toBeNull();
  });

  it("shows neither while auth is still loading", () => {
    mockedUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: true } as ReturnType<typeof useAuth>);
    render(<Home />);
    expect(screen.queryByTestId("landing")).toBeNull();
    expect(screen.queryByTestId("dashboard")).toBeNull();
  });
});
