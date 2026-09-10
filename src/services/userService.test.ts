import { afterEach, describe, expect, it, vi } from "vitest";
import { getUsers, updateUserStatus } from "./userService";

describe("userService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends combined user filters", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await getUsers("admin-token", {
      search: "jane@example.com",
      role: "RETAILER",
      status: "ACTIVE",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(
        "/users?search=jane%40example.com&role=RETAILER&status=ACTIVE",
      ),
      {
        headers: {
          Authorization: "Bearer admin-token",
        },
      },
    );
  });

  it("updates a user's status", async () => {
    const updatedUser = {
      id: "user-2",
      full_name: "Jane Retailer",
      email: "jane@example.com",
      phone: null,
      role: "RETAILER",
      status: "INACTIVE",
      created_at: "2026-09-10T10:00:00.000Z",
    };

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(updatedUser), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(
      updateUserStatus("admin-token", "user-2", "INACTIVE"),
    ).resolves.toEqual(updatedUser);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/users/user-2/status"),
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer admin-token",
        },
        body: JSON.stringify({ status: "INACTIVE" }),
      },
    );
  });

  it("surfaces meaningful API errors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          message: "Cannot deactivate the only active administrator",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    await expect(
      updateUserStatus("admin-token", "admin-1", "INACTIVE"),
    ).rejects.toThrow("Cannot deactivate the only active administrator");
  });
});
