import { LayoutDashboard, Users } from "lucide-react";

export const adminNavItems = [
  {
    path: "/dashboard/admin",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    path: "/dashboard/admin/customers",
    label: "Customers",
    icon: Users,
  },
];
