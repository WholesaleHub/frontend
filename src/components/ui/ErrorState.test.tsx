import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ErrorState from "./ErrorState";

describe("ErrorState", () => {
  it("displays the default title and supplied message", () => {
    render(<ErrorState message="Products could not be loaded." />);

    expect(
      screen.getByRole("heading", { name: "Something went wrong" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Products could not be loaded."),
    ).toBeInTheDocument();
  });

  it("displays a custom title", () => {
    render(
      <ErrorState
        title="Unable to load products"
        message="Please try again."
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Unable to load products" }),
    ).toBeInTheDocument();
  });

  it("does not display a retry button without a retry handler", () => {
    render(<ErrorState message="Request failed." />);

    expect(
      screen.queryByRole("button", { name: "Try Again" }),
    ).not.toBeInTheDocument();
  });

  it("calls the retry handler when the user clicks Try Again", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<ErrorState message="Request failed." onRetry={onRetry} />);

    await user.click(screen.getByRole("button", { name: "Try Again" }));

    expect(onRetry).toHaveBeenCalledOnce();
  });
});
