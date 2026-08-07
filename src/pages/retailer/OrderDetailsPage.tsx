import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Package } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { retailerNavItems } from "../../config/retailerNav";

export default function OrderDetailsPage() {
  const { id } = useParams();

  return (
    <DashboardLayout navItems={retailerNavItems}>
      <div className="mb-6">
        <Link
          to="/dashboard/retailer/orders"
          className="inline-flex items-center gap-2 text-[#003049] hover:text-[#f77f00]"
        >
          <ArrowLeft size={18} />
          Back to Orders
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="flex items-center gap-4 mb-6">
          <Package size={40} className="text-[#003049]" />

          <div>
            <h1 className="text-3xl font-bold text-[#003049]">
              Order #{id}
            </h1>

            <p className="text-gray-500">
              Order details will be loaded from the backend when the API is available.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <p>
              <strong>Status:</strong> Pending
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <p>
              <strong>Date:</strong> 2026-07-13
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <p>
              <strong>Total:</strong> Ksh 4,200
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <p>
              <strong>Items:</strong>
            </p>

            <ul className="list-disc list-inside mt-2 text-gray-600">
              <li>Rice 25kg × 2</li>
              <li>Sugar 2kg × 1</li>
              <li>Cooking Oil × 1</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}