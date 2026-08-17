import { ClipboardList, LayoutGrid, Package, Tag } from "lucide-react";
export const wholesalerNavItems = [
  {
    path: "/dashboard/wholesaler",
    label: "Overview",
    icon: LayoutGrid,
  },
  {
    path: "/dashboard/wholesaler/products",
    label: "Products",
    icon: Package,
  },
  {
    path: "/dashboard/wholesaler/categories",
    label: "Categories",
    icon: Tag,
  },
  {
    path: "/dashboard/wholesaler/orders",
    label: "Orders",
    icon: ClipboardList,
  },
];
