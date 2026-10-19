import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteCategory } from "./categoryService";

const mockedFetch = vi.fn<typeof fetch>();

describe("category service", () => {
  beforeEach(() => {
    mockedFetch.mockReset();
    vi.stubGlobal("fetch", mockedFetch);
  });

  it("deletes a category using its ID", async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
      status: 204,
    } as Response);

    await expect(deleteCategory("admin-token", 14)).resolves.toBeUndefined();

    expect(mockedFetch).toHaveBeenCalledWith(
      expect.stringContaining("/categories/14"),
      {
        method: "DELETE",
        headers: {
          Authorization: "Bearer admin-token",
        },
      },
    );
  });

  it("preserves deletion errors returned by the backend", async () => {
    mockedFetch.mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({
        message: "Category is currently assigned to products",
      }),
    } as unknown as Response);

    await expect(deleteCategory("admin-token", 14)).rejects.toThrow(
      "Category is currently assigned to products",
    );
  });
});
