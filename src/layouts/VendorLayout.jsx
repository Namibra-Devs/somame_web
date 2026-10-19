import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  MenuSquare,
  LogOut,
  Bell,
  Settings,
  Store
} from 'lucide-react';
// We can reuse AdminLayout CSS for identical sidebar layout
import './AdminLayout.css'; 

const VendorLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-small" style={{ background: 'linear-gradient(135deg, #ec4899, #f43f5e)'}}>V</div>
          <h2>Somame Vendor</h2>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/vendor/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/vendor/orders" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <ShoppingBag size={20} /> Active Orders
          </NavLink>
          <NavLink to="/vendor/menu" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MenuSquare size={20} /> Menu Items
          </NavLink>
          <NavLink to="/vendor/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Store size={20} /> Store Profile
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Header */}
        <header className="topbar">
          <div className="topbar-search">
            <h2 className="page-title">Vendor Portal</h2>
          </div>
          <div className="topbar-actions">
            <button className="icon-btn">
              <Bell size={20} />
            </button>
            <button className="icon-btn">
              <Settings size={20} />
            </button>
            <div className="user-avatar">
              <img src="https://ui-avatars.com/api/?name=KFC+Madina&background=ec4899&color=fff" alt="Vendor" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default VendorLayout;
