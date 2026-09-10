import { Building2, ScrollText, UserRoundCog } from "lucide-react";

export const adminNavItems = [
  {
    path: "/dashboard/admin/customers",
    label: "Customers",
    icon: Building2,
  },
  {
    path: "/dashboard/admin/users",
    label: "Users",
    icon: UserRoundCog,
  },
  {
    path: "/dashboard/admin/audit",
    label: "Audit Log",
    icon: ScrollText,
  },
];
