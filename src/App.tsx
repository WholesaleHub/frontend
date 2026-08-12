import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterPage from "./pages/Register/RegisterPage";
import LoginPage from "./pages/Login/LoginPage";
import WholesalerDashboard from "./pages/dashboards/WholesalerDashboard";
import WholesalerProducts from "./pages/wholesaler/WholesalerProducts";
import ProductFormPage from "./pages/wholesaler/ProductFormPage";
import CategoriesPage from "./pages/wholesaler/CategoriesPage";
import CustomersPage from "./pages/wholesaler/CustomersPage";
import SettingsPage from "./pages/wholesaler/SettingsPage";
import WholesalerOrders from "./pages/wholesaler/WholesalerOrders";
import WholesalerReports from "./pages/wholesaler/WholesalerReports";
import RetailerDashboard from "./pages/dashboards/RetailerDashboard";
import RetailerOrders from "./pages/retailer/RetailerOrders";
import ProductListingPage from "./pages/products/ProductListingPage";
import ProductDetailsPage from "./pages/products/ProductDetailsPage";
import ShoppingCartPage from "./pages/cart/ShoppingCartPage";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/ProtectedRoute";
import CustomerDetailsPage from "./pages/wholesaler/CustomerDetailsPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/dashboard/wholesaler" element={<ProtectedRoute allowedRoles={["WHOLESALER"]}><WholesalerDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/wholesaler/products" element={<ProtectedRoute allowedRoles={["WHOLESALER"]}><WholesalerProducts /></ProtectedRoute>} />
        <Route path="/dashboard/wholesaler/products/new" element={<ProtectedRoute allowedRoles={["WHOLESALER"]}><ProductFormPage /></ProtectedRoute>} />
        <Route path="/dashboard/wholesaler/products/:id/edit" element={<ProtectedRoute allowedRoles={["WHOLESALER"]}><ProductFormPage /></ProtectedRoute>} />
        <Route path="/dashboard/wholesaler/categories" element={<ProtectedRoute allowedRoles={["WHOLESALER"]}><CategoriesPage /></ProtectedRoute>} />
        <Route path="/dashboard/wholesaler/customers" element={<ProtectedRoute allowedRoles={["WHOLESALER"]}><CustomersPage /></ProtectedRoute>} />
        <Route path="/dashboard/wholesaler/settings" element={<ProtectedRoute allowedRoles={["WHOLESALER"]}><SettingsPage /></ProtectedRoute>} />
        <Route path="/dashboard/wholesaler/orders" element={<ProtectedRoute allowedRoles={["WHOLESALER"]}><WholesalerOrders /></ProtectedRoute>} />
        <Route path="/dashboard/wholesaler/reports" element={<ProtectedRoute allowedRoles={["WHOLESALER"]}><WholesalerReports /></ProtectedRoute>} />

        <Route path="/dashboard/retailer" element={<ProtectedRoute allowedRoles={["RETAILER"]}><RetailerDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/retailer/browse" element={<ProtectedRoute allowedRoles={["RETAILER"]}><ProductListingPage /></ProtectedRoute>} />
        <Route path="/dashboard/retailer/orders" element={<ProtectedRoute allowedRoles={["RETAILER"]}><RetailerOrders /></ProtectedRoute>} />

        <Route path="/products/:id" element={<ProtectedRoute><ProductDetailsPage /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute allowedRoles={["RETAILER"]}><ShoppingCartPage /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute allowedRoles={["RETAILER"]}><CheckoutPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/dashboard/retailer/orders/:id" element={<ProtectedRoute allowedRoles={["RETAILER"]}><OrderDetailsPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/dashboard/wholesaler/customers/:id" element={<ProtectedRoute allowedRoles={["WHOLESALER"]}><CustomerDetailsPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;