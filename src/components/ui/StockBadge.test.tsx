import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import StockBadge from "./StockBadge";

describe("StockBadge", () => {
  it("uses a valid status supplied by the API", () => {
    render(<StockBadge stockStatus="IN_STOCK" stockQuantity={0} />);

    expect(screen.getByText("In Stock")).toHaveClass(
      "bg-green-100",
      "text-green-700",
    );
  });

  it("derives low-stock status from the quantity", () => {
    render(<StockBadge stockQuantity={10} />);

    expect(screen.getByText("Low Stock")).toHaveClass(
      "bg-yellow-100",
      "text-yellow-700",
    );
  });

  it("derives out-of-stock status when quantity is zero", () => {
    render(<StockBadge stockQuantity={0} />);

    expect(screen.getByText("Out of Stock")).toHaveClass(
      "bg-red-100",
      "text-red-700",
    );
  });

  it("derives in-stock status when quantity is above twenty", () => {
    render(<StockBadge stockQuantity={21} />);

    expect(screen.getByText("In Stock")).toBeInTheDocument();
  });

  it("falls back to the quantity when the API status is invalid", () => {
    render(<StockBadge stockStatus="UNKNOWN" stockQuantity={5} />);

    expect(screen.getByText("Low Stock")).toBeInTheDocument();
  });
});
