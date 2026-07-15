import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Menu, X, User, LogOut, Bell, type LucideIcon } from "lucide-react";
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

const notifications = [
  { id: 1, text: "3 orders are pending approval", time: "10 min ago" },
  { id: 2, text: "Rice 50kg is running low on stock", time: "1 hour ago" },
  { id: 3, text: "New order received", time: "3 hours ago" },
];

function DashboardLayout({ children, navItems }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex bg-[#f5f7fb]">
      <aside
        className={`bg-[#003049] text-white transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-0"
        } overflow-hidden flex flex-col`}
      >
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-[#fcbf49]">WholesaleHub</h2>
        </div>
        <nav className="flex-1 p-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors mb-1"
            >
              <item.icon size={18} />
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-red-300 hover:text-red-200"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 hover:text-gray-900"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-gray-600 hover:text-gray-900"
              >
                <Bell size={22} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#d62828] text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border z-20">
                  <div className="p-3 border-b font-semibold text-sm text-[#003049]">
                    Notifications
                  </div>
                  <ul>
                    {notifications.map((note) => (
                      <li key={note.id} className="p-3 border-b last:border-b-0 hover:bg-gray-50">
                        <p className="text-sm text-gray-700">{note.text}</p>
                        <p className="text-xs text-gray-400 mt-1">{note.time}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Link
              to="/profile"
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
            >
              <span className="text-sm font-medium">{user?.fullName}</span>
              <div className="w-9 h-9 rounded-full bg-[#f77f00] flex items-center justify-center text-white">
                <User size={18} />
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
