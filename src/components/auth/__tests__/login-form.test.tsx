import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();
const loginMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/lib/hooks/use-auth", () => ({
  useAuth: () => ({ login: loginMock }),
}));

vi.mock("@/lib/config/features", () => ({
  features: { socialLogin: false },
}));

describe("LoginForm", () => {
  beforeEach(() => {
    pushMock.mockReset();
    loginMock.mockReset();
  });

  it("renders form fields", async () => {
    const { LoginForm } = await import("@/components/auth/login-form");
    render(<LoginForm locale="en" />);

    expect(screen.getByText("Email or Phone")).toBeInTheDocument();
    expect(screen.getByText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  });

  it("does not submit when required fields are empty", async () => {
    const user = userEvent.setup();
    const { LoginForm } = await import("@/components/auth/login-form");
    render(<LoginForm locale="en" />);

    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(loginMock).not.toHaveBeenCalled();
  });

  it("calls login and redirects on submit", async () => {
    loginMock.mockResolvedValue(undefined);
    const user = userEvent.setup();
    const { LoginForm } = await import("@/components/auth/login-form");
    render(<LoginForm locale="en" redirectTo="/en/account" />);

    await user.type(screen.getByLabelText("Email or Phone"), "demo@example.com");
    await user.type(screen.getByLabelText("Password"), "Password123!");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(loginMock).toHaveBeenCalledWith("demo@example.com", "Password123!");
    expect(pushMock).toHaveBeenCalledWith("/en/account");
  });

  it("shows error when login fails", async () => {
    loginMock.mockRejectedValue(new Error("bad credentials"));
    const user = userEvent.setup();
    const { LoginForm } = await import("@/components/auth/login-form");
    render(<LoginForm locale="en" />);

    await user.type(screen.getByLabelText("Email or Phone"), "demo@example.com");
    await user.type(screen.getByLabelText("Password"), "Password123!");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(
      await screen.findByText("Invalid credentials or verification required."),
    ).toBeInTheDocument();
  });
});
