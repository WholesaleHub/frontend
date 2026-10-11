import { adminNavItems } from "./adminNav";
import { retailerNavItems } from "./retailerNav";
import { wholesalerNavItems } from "./wholesalerNav";

export function getOperationsNavigation(role?: string) {
  if (role === "ADMIN") {
    return {
      isAdmin: true,
      canManageInventory: true,
      canManageOrders: true,
      navItems: adminNavItems,
      dashboardPath: "/dashboard/admin",
      productsPath: "/dashboard/admin/products",
      newProductPath: "/dashboard/admin/products/new",
      editProductPath: (productId: number) =>
        `/dashboard/admin/products/${productId}/edit`,
      categoriesPath: "/dashboard/admin/categories",
      ordersPath: "/dashboard/admin/orders",
      orderDetailsPath: (orderId: number) =>
        `/dashboard/admin/orders/${orderId}`,
    };
  }

  if (role === "WHOLESALER") {
    return {
      isAdmin: false,
      canManageInventory: true,
      canManageOrders: true,
      navItems: wholesalerNavItems,
      dashboardPath: "/dashboard/wholesaler",
      productsPath: "/dashboard/wholesaler/products",
      newProductPath: "/dashboard/wholesaler/products/new",
      editProductPath: (productId: number) =>
        `/dashboard/wholesaler/products/${productId}/edit`,
      categoriesPath: "/dashboard/wholesaler/categories",
      ordersPath: "/dashboard/wholesaler/orders",
      orderDetailsPath: (orderId: number) =>
        `/dashboard/wholesaler/orders/${orderId}`,
    };
  }

  return {
    isAdmin: false,
    canManageInventory: false,
    canManageOrders: false,
    navItems: retailerNavItems,
    dashboardPath: "/dashboard/retailer",
    productsPath: "/dashboard/retailer/browse",
    newProductPath: "",
    editProductPath: () => "",
    categoriesPath: "",
    ordersPath: "/dashboard/retailer/orders",
    orderDetailsPath: (orderId: number) =>
      `/dashboard/retailer/orders/${orderId}`,
  };
}
