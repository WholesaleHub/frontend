import { describe, expect, it } from "vitest";
import { getOperationsNavigation } from "./operationsNavigation";

describe("getOperationsNavigation", () => {
  it("gives administrators platform-management routes and permissions", () => {
    const navigation = getOperationsNavigation("ADMIN");

    expect(navigation.isAdmin).toBe(true);
    expect(navigation.canManageInventory).toBe(true);
    expect(navigation.canManageOrders).toBe(true);
    expect(navigation.dashboardPath).toBe("/dashboard/admin");
    expect(navigation.productsPath).toBe("/dashboard/admin/products");
    expect(navigation.newProductPath).toBe("/dashboard/admin/products/new");
    expect(navigation.editProductPath(17)).toBe(
      "/dashboard/admin/products/17/edit",
    );
    expect(navigation.categoriesPath).toBe("/dashboard/admin/categories");
    expect(navigation.ordersPath).toBe("/dashboard/admin/orders");
    expect(navigation.orderDetailsPath(42)).toBe("/dashboard/admin/orders/42");

    expect(navigation.navItems.map((item) => item.label)).toEqual([
      "Overview",
      "Users",
      "Products",
      "Categories",
      "Orders",
      "Receipts",
      "Monthly Statements",
      "Audit Log",
    ]);

    expect(
      navigation.navItems.find((item) => item.label === "Receipts"),
    ).toMatchObject({
      comingSoon: true,
    });

    expect(
      navigation.navItems.find((item) => item.label === "Monthly Statements"),
    ).toMatchObject({
      comingSoon: true,
    });
  });

  it("preserves wholesaler inventory and order routes", () => {
    const navigation = getOperationsNavigation("WHOLESALER");

    expect(navigation.isAdmin).toBe(false);
    expect(navigation.canManageInventory).toBe(true);
    expect(navigation.canManageOrders).toBe(true);
    expect(navigation.productsPath).toBe("/dashboard/wholesaler/products");
    expect(navigation.newProductPath).toBe(
      "/dashboard/wholesaler/products/new",
    );
    expect(navigation.editProductPath(17)).toBe(
      "/dashboard/wholesaler/products/17/edit",
    );
    expect(navigation.ordersPath).toBe("/dashboard/wholesaler/orders");
    expect(navigation.orderDetailsPath(42)).toBe(
      "/dashboard/wholesaler/orders/42",
    );
  });

  it("keeps retailers read-only for operational management", () => {
    const navigation = getOperationsNavigation("RETAILER");

    expect(navigation.isAdmin).toBe(false);
    expect(navigation.canManageInventory).toBe(false);
    expect(navigation.canManageOrders).toBe(false);
    expect(navigation.productsPath).toBe("/dashboard/retailer/browse");
    expect(navigation.newProductPath).toBe("");
    expect(navigation.editProductPath(17)).toBe("");
    expect(navigation.categoriesPath).toBe("");
    expect(navigation.ordersPath).toBe("/dashboard/retailer/orders");
    expect(navigation.orderDetailsPath(42)).toBe(
      "/dashboard/retailer/orders/42",
    );
  });
});
