import { LayoutGrid, Package, ClipboardList, BarChart3, Tag, Users, Settings } from "lucide-react";

export const wholesalerNavItems = [
  { path: "/dashboard/wholesaler", label: "Overview", icon: LayoutGrid },
  { path: "/dashboard/wholesaler/products", label: "Products", icon: Package },
  { path: "/dashboard/wholesaler/categories", label: "Categories", icon: Tag },
  { path: "/dashboard/wholesaler/orders", label: "Orders", icon: ClipboardList },
  { path: "/dashboard/wholesaler/customers", label: "Customers", icon: Users },
  { path: "/dashboard/wholesaler/reports", label: "Reports", icon: BarChart3 },
  { path: "/dashboard/wholesaler/settings", label: "Settings", icon: Settings },
];