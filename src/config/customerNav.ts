import { LayoutGrid, ShoppingBag, ClipboardList } from "lucide-react";

export const customerNavItems = [
  { path: "/dashboard/customer", label: "Overview", icon: LayoutGrid },
  { path: "/dashboard/customer/browse", label: "Browse Products", icon: ShoppingBag },
  { path: "/dashboard/customer/orders", label: "My Orders", icon: ClipboardList },
];
