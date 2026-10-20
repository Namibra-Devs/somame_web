import { useState, useEffect, useRef } from 'react';
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
  Settings,
  Bell,
  CheckCheck,
  Trash2
} from 'lucide-react';
import api from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';
import './AdminLayout.css';

const VendorLayout = () => {
  const navigate = useNavigate();
  const [vendor, setVendor] = useState({
    name: 'KFC East Legon',
    is_open: true,
    logo_url: ''
  });
  const [togglingStatus, setTogglingStatus] = useState(false);

  // Real-time notifications state
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('somame_vendor_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [bellOpen, setBellOpen] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const bellRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    api
      .get('/api/vendors/me')
      .then((res) => {
        if (isMounted && res.data?.data) {
          setVendor(res.data.data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Connect to Socket.io for real-time Web Notifications
  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return undefined;

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);

    const onNotification = (payload) => {
      const item = {
        id: payload.id || `${Date.now()}`,
        title: payload.title || 'New Notification',
        body: payload.body || '',
        data: payload.data || {},
        read: false,
        created_at: payload.created_at || new Date().toISOString()
      };

      setNotifications((prev) => {
        const updated = [item, ...prev].slice(0, 30);
        localStorage.setItem('somame_vendor_notifications', JSON.stringify(updated));
        return updated;
      });
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('notification', onNotification);

    if (socket.connected) {
      queueMicrotask(() => setSocketConnected(true));
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('notification', onNotification);
    };
  }, []);

  // Close bell dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setBellOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      localStorage.setItem('somame_vendor_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('somame_vendor_notifications');
  };

  const handleClickNotification = (notif) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n));
      localStorage.setItem('somame_vendor_notifications', JSON.stringify(updated));
      return updated;
    });
    setBellOpen(false);
    if (notif.data?.orderId || notif.data?.type?.includes('order') || notif.data?.type?.includes('rider')) {
      navigate('/vendor/orders');
    }
  };

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
    disconnectSocket();
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

            {/* Real-Time Notifications Bell */}
            <div className="notif-wrapper" ref={bellRef}>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setBellOpen((prev) => !prev)}
                title="Notifications"
                style={{ position: 'relative' }}
              >
                <Bell size={19} />
                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
              </button>

              {bellOpen && (
                <div className="notif-dropdown">
                  <div className="notif-dropdown-header">
                    <div>
                      <h4>Notifications</h4>
                      <span className="notif-socket-status">
                        <span
                          className="notif-socket-dot"
                          style={{ backgroundColor: socketConnected ? '#059669' : '#94a3b8' }}
                        />
                        {socketConnected ? 'Real-time connected' : 'Listening'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          className="notif-action-btn"
                          onClick={handleMarkAllRead}
                          title="Mark all as read"
                        >
                          <CheckCheck size={14} /> Read all
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          type="button"
                          className="notif-action-btn"
                          onClick={handleClearNotifications}
                          title="Clear notifications"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="notif-dropdown-list">
                    {notifications.length === 0 ? (
                      <div className="notif-empty">
                        No notifications yet. New orders and rider updates will appear here in real time.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`notif-item ${!n.read ? 'unread' : ''}`}
                          onClick={() => handleClickNotification(n)}
                        >
                          <div className="notif-item-top">
                            <strong>{n.title}</strong>
                            <span>
                              {n.created_at
                                ? new Date(n.created_at).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : ''}
                            </span>
                          </div>
                          <p>{n.body}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

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
