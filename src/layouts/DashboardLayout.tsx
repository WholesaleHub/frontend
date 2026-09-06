import {
  LogOut,
  Menu,
  ShoppingCart,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

type NavItem = {
  path: string;
  label: string;
  icon: LucideIcon;
};

type DashboardLayoutProps = {
  children: ReactNode;
  navItems: NavItem[];
};

export default function DashboardLayout({
  children,
  navItems,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();

  const isRetailer = user?.role === "RETAILER";
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="relative flex min-h-screen bg-[#f5f7fb]">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#003049] text-white transition-transform duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <h2 className="text-lg font-bold text-[#fcbf49]">WholesaleHub</h2>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="text-white/70 hover:text-white md:hidden"
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-2">
          {navItems.map((item) => {
            const active =
              location.pathname === item.path ||
              (item.path !== "/dashboard/admin" &&
                location.pathname.startsWith(`${item.path}/`));

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`mb-1 flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${
                  active
                    ? "bg-white/15 text-white"
                    : "text-white/85 hover:bg-white/10"
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 text-sm text-red-300 hover:text-red-200"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between bg-white px-4 py-4 shadow-sm sm:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen((current) => !current)}
            className="text-gray-600 hover:text-gray-900 md:hidden"
            aria-label="Open navigation"
          >
            <Menu size={22} />
          </button>

          <div className="hidden md:block" />

          <div className="flex items-center gap-4">
            {isRetailer && (
              <Link
                to="/cart"
                className="relative text-gray-600 hover:text-gray-900"
                aria-label={`Shopping cart with ${cartCount} items`}
              >
                <ShoppingCart size={22} />

                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f77f00] px-1 text-xs text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {isAdmin ? (
              <div className="flex items-center gap-2 text-gray-700">
                <span className="hidden text-sm font-medium sm:inline">
                  {user?.fullName}
                </span>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f77f00] text-white">
                  <User size={18} />
                </div>
              </div>
            ) : (
              <Link
                to="/profile"
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
              >
                <span className="hidden text-sm font-medium sm:inline">
                  {user?.fullName}
                </span>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f77f00] text-white">
                  <User size={18} />
                </div>
              </Link>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
