import { LayoutGrid, ShoppingBag, ClipboardList } from "lucide-react";

export const retailerNavItems = [
  { path: "/dashboard/retailer", label: "Overview", icon: LayoutGrid },
  { path: "/dashboard/retailer/browse", label: "Browse Products", icon: ShoppingBag },
  { path: "/dashboard/retailer/orders", label: "My Orders", icon: ClipboardList },
];