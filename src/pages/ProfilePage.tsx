import { useState } from "react";
import { User, Mail, Building2, Save } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import { wholesalerNavItems } from "../config/wholesalerNav";
import { retailerNavItems } from "../config/retailerNav";

function ProfilePage() {
  const { user } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [businessName, setBusinessName] = useState(user?.businessName || "");
  const [saved, setSaved] = useState(false);

  const navItems = user?.role === "wholesaler" ? wholesalerNavItems : retailerNavItems;

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashboardLayout navItems={navItems}>
      <h1 className="text-2xl font-bold text-[#003049] mb-6">My Profile</h1>

      <div className="bg-white rounded-lg shadow p-6 max-w-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-[#f77f00] flex items-center justify-center text-white">
            <User size={32} />
          </div>
          <div>
            <p className="font-semibold text-[#003049]">{user?.fullName}</p>
            <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>

        {saved && (
          <p className="bg-green-100 text-green-700 text-sm p-2 rounded mb-4">
            Profile updated successfully!
          </p>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm"
              />
            </div>
          </div>

          {user?.role === "wholesaler" && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Business Name</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-[#f77f00] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#d62828] transition-colors mt-2"
          >
            <Save size={16} />
            Save Changes
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default ProfilePage;
