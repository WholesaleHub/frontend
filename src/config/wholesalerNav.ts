import { LayoutGrid, Package, ClipboardList, BarChart3 } from "lucide-react";

export const wholesalerNavItems = [
  { path: "/dashboard/wholesaler", label: "Overview", icon: LayoutGrid },
  { path: "/dashboard/wholesaler/products", label: "Products", icon: Package },
  { path: "/dashboard/wholesaler/orders", label: "Orders", icon: ClipboardList },
  { path: "/dashboard/wholesaler/reports", label: "Reports", icon: BarChart3 },
];
