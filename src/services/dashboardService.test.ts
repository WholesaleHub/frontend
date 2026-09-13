import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getAdminDashboardStats,
  getAdminRecentOrders,
  getCustomerAnalytics,
  getLowStockProducts,
  getSalesAnalytics,
  getTopProducts,
} from "./dashboardService";

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

describe("admin dashboard service", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("requests every admin reporting endpoint with authorization", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async () => jsonResponse({}));

    await getAdminDashboardStats("admin-token");
    await getSalesAnalytics("admin-token");
    await getTopProducts("admin-token");
    await getLowStockProducts("admin-token");
    await getCustomerAnalytics("admin-token");
    await getAdminRecentOrders("admin-token");

    const requestOptions = {
      headers: {
        Authorization: "Bearer admin-token",
      },
    };

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("/dashboard/admin/stats"),
      requestOptions,
    );

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("/dashboard/sales"),
      requestOptions,
    );

    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining("/dashboard/top-products"),
      requestOptions,
    );

    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      expect.stringContaining("/dashboard/low-stock"),
      requestOptions,
    );

    expect(fetchMock).toHaveBeenNthCalledWith(
      5,
      expect.stringContaining("/dashboard/customers"),
      requestOptions,
    );

    expect(fetchMock).toHaveBeenNthCalledWith(
      6,
      expect.stringContaining("/dashboard/recent-orders"),
      requestOptions,
    );
  });

  it("sends date-range parameters to supported analytics endpoints", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async () => jsonResponse({}));

    const range = {
      startDate: "2026-09-01",
      endDate: "2026-09-10",
    };

    await getSalesAnalytics("admin-token", range);
    await getCustomerAnalytics("admin-token", range);

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining(
        "/dashboard/sales?startDate=2026-09-01&endDate=2026-09-10",
      ),
      {
        headers: {
          Authorization: "Bearer admin-token",
        },
      },
    );

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining(
        "/dashboard/customers?startDate=2026-09-01&endDate=2026-09-10",
      ),
      {
        headers: {
          Authorization: "Bearer admin-token",
        },
      },
    );
  });

  it("omits the query string when no date range is supplied", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async () => jsonResponse({}));

    await getSalesAnalytics("admin-token");

    const requestedUrl = String(fetchMock.mock.calls[0][0]);

    expect(requestedUrl).toMatch(/\/dashboard\/sales$/);
    expect(requestedUrl).not.toContain("?");
  });

  it("surfaces meaningful backend errors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(
        {
          message: "You are not authorized to view analytics.",
        },
        403,
      ),
    );

    await expect(getAdminDashboardStats("admin-token")).rejects.toThrow(
      "You are not authorized to view analytics.",
    );
  });
});
