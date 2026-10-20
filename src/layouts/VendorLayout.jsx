import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Tag,
  Users,
  BarChart3,
  Store,
  LogOut,
  Settings
} from 'lucide-react';
import api from '../services/api';
import './AdminLayout.css';

const VendorLayout = () => {
  const navigate = useNavigate();
  const [vendor, setVendor] = useState({
    name: 'KFC East Legon',
    is_open: true,
    logo_url: ''
  });
  const [togglingStatus, setTogglingStatus] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/vendors/me');
        if (isMounted && res.data?.data) {
          setVendor(res.data.data);
        }
      } catch {
        // Keep clean fallback store profile when in preview mode
      }
    };
    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleStoreOpen = async () => {
    const nextState = !vendor.is_open;
    setTogglingStatus(true);
    setVendor((prev) => ({ ...prev, is_open: nextState }));
    try {
      const res = await api.put('/api/vendors/me', { is_open: nextState });
      if (res.data?.data) {
        setVendor(res.data.data);
      }
    } catch {
      // Preview mode fallback keeps optimistic state
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('somame_token');
    localStorage.removeItem('somame_user');
    navigate('/vendor/login');
  };

  const initials = (vendor.name || 'S V')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-small" style={{ backgroundColor: 'var(--color-vendor)' }}>
            V
          </div>
          <div>
            <h2>Somame Vendor</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Merchant Workspace</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/vendor/dashboard"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={19} /> Dashboard
          </NavLink>
          <NavLink
            to="/vendor/orders"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <ShoppingBag size={19} /> Orders
          </NavLink>
          <NavLink
            to="/vendor/menu"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <UtensilsCrossed size={19} /> Menu &amp; Catalog
          </NavLink>
          <NavLink
            to="/vendor/promotions"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Tag size={19} /> Promotions
          </NavLink>
          <NavLink
            to="/vendor/customers"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Users size={19} /> Customers
          </NavLink>
          <NavLink
            to="/vendor/analytics"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <BarChart3 size={19} /> Analytics
          </NavLink>
          <NavLink
            to="/vendor/profile"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Store size={19} /> Store Settings
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={19} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-search" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h2 className="page-title">{vendor.name || 'Vendor Portal'}</h2>
          </div>

          <div className="topbar-actions">
            <button
              type="button"
              onClick={handleToggleStoreOpen}
              disabled={togglingStatus}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4375rem 0.875rem',
                borderRadius: 'var(--radius-full)',
                border: `1px solid ${vendor.is_open ? '#a7f3d0' : '#fecaca'}`,
                backgroundColor: vendor.is_open ? '#ecfdf5' : '#fef2f2',
                color: vendor.is_open ? '#059669' : '#dc2626',
                fontSize: '0.8125rem',
                fontWeight: 600
              }}
              title="Toggle Store Open/Closed status"
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: vendor.is_open ? '#059669' : '#dc2626'
                }}
              />
              {vendor.is_open ? 'Store Open' : 'Store Closed'}
            </button>

            <Link to="/vendor/profile" className="icon-btn" title="Store Settings">
              <Settings size={19} />
            </Link>

            <div
              className="user-avatar"
              style={{
                backgroundColor: 'var(--color-brand)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8125rem'
              }}
            >
              {vendor.logo_url ? <img src={vendor.logo_url} alt={vendor.name} /> : initials}
            </div>
          </div>
        </header>

        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default VendorLayout;
