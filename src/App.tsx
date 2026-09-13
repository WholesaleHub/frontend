import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterPage from "./pages/Register/RegisterPage";
import LoginPage from "./pages/Login/LoginPage";
import WholesalerDashboard from "./pages/dashboards/WholesalerDashboard";
import WholesalerProducts from "./pages/wholesaler/WholesalerProducts";
import ProductFormPage from "./pages/wholesaler/ProductFormPage";
import CategoriesPage from "./pages/wholesaler/CategoriesPage";
import RetailerDashboard from "./pages/dashboards/RetailerDashboard";
import RetailerOrders from "./pages/retailer/RetailerOrders";
import OrderDetailsPage from "./pages/retailer/OrderDetailsPage";
import ProductListingPage from "./pages/products/ProductListingPage";
import ProductDetailsPage from "./pages/products/ProductDetailsPage";
import ShoppingCartPage from "./pages/cart/ShoppingCartPage";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminCustomersPage from "./pages/admin/AdminCustomersPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminAuditLogPage from "./pages/admin/AdminAuditLogPage";
import WholesalerOrders from "./pages/wholesaler/WholesalerOrders";
import ForgotPasswordPage from "./pages/ForgotPassword/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPassword/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmail/VerifyEmailPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        <Route
          path="/dashboard/wholesaler"
          element={
            <ProtectedRoute allowedRoles={["WHOLESALER"]}>
              <WholesalerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/wholesaler/products"
          element={
            <ProtectedRoute allowedRoles={["WHOLESALER"]}>
              <WholesalerProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/wholesaler/products/new"
          element={
            <ProtectedRoute allowedRoles={["WHOLESALER"]}>
              <ProductFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/wholesaler/products/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["WHOLESALER"]}>
              <ProductFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/wholesaler/categories"
          element={
            <ProtectedRoute allowedRoles={["WHOLESALER"]}>
              <CategoriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/wholesaler/orders"
          element={
            <ProtectedRoute allowedRoles={["WHOLESALER"]}>
              <WholesalerOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/wholesaler/orders/:id"
          element={
            <ProtectedRoute allowedRoles={["WHOLESALER"]}>
              <OrderDetailsPage />
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
              <ProductListingPage />
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
          path="/products/:id"
          element={
            <ProtectedRoute>
              <ProductDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute allowedRoles={["RETAILER"]}>
              <ShoppingCartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute allowedRoles={["RETAILER"]}>
              <CheckoutPage />
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
        <Route
          path="/dashboard/retailer/orders/:id"
          element={
            <ProtectedRoute allowedRoles={["RETAILER"]}>
              <OrderDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminCustomersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/customers"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminCustomersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/users"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin/audit"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminAuditLogPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
