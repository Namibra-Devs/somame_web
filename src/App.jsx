import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import VendorLayout from './layouts/VendorLayout';
import LandingPage from './pages/LandingPage';
import VendorLogin from './pages/vendor/VendorLogin';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorOrders from './pages/vendor/VendorOrders';
import VendorMenu from './pages/vendor/VendorMenu';
import VendorPromotions from './pages/vendor/VendorPromotions';
import VendorCustomers from './pages/vendor/VendorCustomers';
import VendorAnalytics from './pages/vendor/VendorAnalytics';
import VendorProfile from './pages/vendor/VendorProfile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Entry Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Dedicated Separate Login Routes */}
        <Route path="/vendor/login" element={<VendorLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Legacy /login redirect */}
        <Route path="/login" element={<Navigate to="/" replace />} />

        {/* Admin Protected Portal Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
        </Route>

        {/* Vendor Protected Portal Routes */}
        <Route path="/vendor" element={<VendorLayout />}>
          <Route index element={<Navigate to="/vendor/dashboard" replace />} />
          <Route path="dashboard" element={<VendorDashboard />} />
          <Route path="orders" element={<VendorOrders />} />
          <Route path="menu" element={<VendorMenu />} />
          <Route path="promotions" element={<VendorPromotions />} />
          <Route path="customers" element={<VendorCustomers />} />
          <Route path="analytics" element={<VendorAnalytics />} />
          <Route path="profile" element={<VendorProfile />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
