import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterPage from "./pages/Register/RegisterPage";
import LoginPage from "./pages/Login/LoginPage";
import WholesalerDashboard from "./pages/dashboards/WholesalerDashboard";
import WholesalerProducts from "./pages/wholesaler/WholesalerProducts";
import WholesalerOrders from "./pages/wholesaler/WholesalerOrders";
import WholesalerReports from "./pages/wholesaler/WholesalerReports";
import RetailerDashboard from "./pages/dashboards/RetailerDashboard";
import RetailerBrowse from "./pages/retailer/RetailerBrowse";
import RetailerOrders from "./pages/retailer/RetailerOrders";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard/wholesaler"
          element={
            <ProtectedRoute allowedRoles={["wholesaler"]}>
              <WholesalerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/wholesaler/products"
          element={
            <ProtectedRoute allowedRoles={["wholesaler"]}>
              <WholesalerProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/wholesaler/orders"
          element={
            <ProtectedRoute allowedRoles={["wholesaler"]}>
              <WholesalerOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/wholesaler/reports"
          element={
            <ProtectedRoute allowedRoles={["wholesaler"]}>
              <WholesalerReports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/retailer"
          element={
            <ProtectedRoute allowedRoles={["RETAILER"]}>
              <RetailerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/retailer/browse"
          element={
            <ProtectedRoute allowedRoles={["RETAILER"]}>
              <RetailerBrowse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/retailer/orders"
          element={
            <ProtectedRoute allowedRoles={["RETAILER"]}>
              <RetailerOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;