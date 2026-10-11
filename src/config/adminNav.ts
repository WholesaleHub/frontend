import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Package,
  ReceiptText,
  ScrollText,
  Tags,
  UserRoundCog,
} from "lucide-react";

export const adminNavItems = [
  {
    path: "/dashboard/admin",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    path: "/dashboard/admin/users",
    label: "Users",
    icon: UserRoundCog,
  },
  {
    path: "/dashboard/admin/products",
    label: "Products",
    icon: Package,
  },
  {
    path: "/dashboard/admin/categories",
    label: "Categories",
    icon: Tags,
  },
  {
    path: "/dashboard/admin/orders",
    label: "Orders",
    icon: ClipboardList,
  },
  {
    path: "/dashboard/admin/receipts",
    label: "Receipts",
    icon: ReceiptText,
    comingSoon: true,
  },
  {
    path: "/dashboard/admin/statements",
    label: "Monthly Statements",
    icon: CalendarDays,
    comingSoon: true,
  },
  {
    path: "/dashboard/admin/audit",
    label: "Audit Log",
    icon: ScrollText,
  },
];
