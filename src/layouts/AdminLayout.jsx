import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Bike, 
  ShoppingBag, 
  LogOut,
  Bell,
  Settings
} from 'lucide-react';
import './AdminLayout.css';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('somame_token');
    localStorage.removeItem('somame_user');
    navigate('/admin/login');
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-small">S</div>
          <h2>Somame Admin</h2>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/admin/vendors" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Store size={20} /> Vendors
          </NavLink>
          <NavLink to="/admin/riders" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Bike size={20} /> Riders
          </NavLink>
          <NavLink to="/admin/customers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Users size={20} /> Customers
          </NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <ShoppingBag size={20} /> Orders
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
            {/* Search or breadcrumbs could go here */}
            <h2 className="page-title">Admin Portal</h2>
          </div>
          <div className="topbar-actions">
            <button className="icon-btn">
              <Bell size={20} />
            </button>
            <button className="icon-btn">
              <Settings size={20} />
            </button>
            <div className="user-avatar">
              <img src="https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff" alt="Admin" />
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

export default AdminLayout;
