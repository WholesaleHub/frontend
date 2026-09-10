import { afterEach, describe, expect, it, vi } from "vitest";
import { getAuditLogs } from "./auditService";

describe("auditService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends pagination and action filters", async () => {
    const responseData = {
      data: [],
      pagination: {
        page: 2,
        limit: 10,
        total: 12,
        totalPages: 2,
      },
    };

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(responseData), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(
      getAuditLogs("admin-token", {
        page: 2,
        limit: 10,
        action: "USER_STATUS_UPDATED",
      }),
    ).resolves.toEqual(responseData);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(
        "/audit?page=2&limit=10&action=USER_STATUS_UPDATED",
      ),
      {
        headers: {
          Authorization: "Bearer admin-token",
        },
      },
    );
  });

  it("omits an empty action filter", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    await getAuditLogs("admin-token", {
      page: 1,
      limit: 10,
      action: "",
    });

    const requestedUrl = String(fetchMock.mock.calls[0][0]);

    expect(requestedUrl).toContain("/audit?page=1&limit=10");
    expect(requestedUrl).not.toContain("action=");
  });

  it("surfaces audit API errors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "Forbidden resource" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(getAuditLogs("admin-token")).rejects.toThrow(
      "Forbidden resource",
    );
  });
});
