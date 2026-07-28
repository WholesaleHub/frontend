import DashboardLayout from "../../layouts/DashboardLayout";
import { wholesalerNavItems } from "../../config/wholesalerNav";

export default function SettingsPage() {
  return (
    <DashboardLayout navItems={wholesalerNavItems}>
      <h1 className="text-2xl font-bold text-[#003049] mb-6">Settings</h1>
      <div className="bg-white rounded-lg shadow p-10 text-center text-gray-400">
        Coming soon.
      </div>
    </DashboardLayout>
  );
}
