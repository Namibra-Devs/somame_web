import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  Users,
  Store,
  Bike,
  ShoppingBag,
  Wallet,
  Headphones,
  Sliders,
  LogOut,
  Bell,
  Settings,
  CheckCheck,
  Trash2,
  Menu,
  X,
  ShieldCheck
} from 'lucide-react';
import api from '../services/api';
import { formatTimeAgo } from '../utils/timeAgo';
import { connectSocket, disconnectSocket } from '../services/socket';
import './AdminLayout.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('somame_user');
      return saved ? JSON.parse(saved) : { first_name: 'System', last_name: 'Admin' };
    } catch {
      return { first_name: 'System', last_name: 'Admin' };
    }
  });

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('somame_admin_notifications');
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
      .get('/api/users/profile')
      .then((res) => {
        if (isMounted && res.data?.data) {
          setAdminUser(res.data.data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return undefined;

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);

    const onNotification = (payload) => {
      const item = {
        id: payload.id || `${Date.now()}`,
        title: payload.title || 'Platform Alert',
        body: payload.body || '',
        data: payload.data || {},
        read: false,
        created_at: payload.created_at || new Date().toISOString()
      };

      setNotifications((prev) => {
        const updated = [item, ...prev].slice(0, 30);
        localStorage.setItem('somame_admin_notifications', JSON.stringify(updated));
        return updated;
      });
      toast.success(item.body ? `${item.title}: ${item.body}` : item.title);
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
      localStorage.setItem('somame_admin_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('somame_admin_notifications');
    toast.success('Admin notifications cleared');
  };

  const handleLogout = () => {
    disconnectSocket();
    localStorage.removeItem('somame_token');
    localStorage.removeItem('somame_user');
    toast.success('Signed out of Admin Console');
    navigate('/admin/login');
  };

  const displayName =
    [adminUser?.first_name, adminUser?.last_name].filter(Boolean).join(' ') || 'System Admin';
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className="app-container">
      {/* Mobile Sidebar Backdrop */}
      {mobileMenuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar admin-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', minWidth: 0 }}>
            <div className="logo-small" style={{ flexShrink: 0 }}>
              S
            </div>
            <div style={{ minWidth: 0 }}>
              <h2>Somame Admin</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Operations Console
              </span>
            </div>
          </div>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/admin/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) => `nav-item admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={19} /> Dashboard
          </NavLink>
          <NavLink
            to="/admin/vendors"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) => `nav-item admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <Store size={19} /> Vendors &amp; Categories
          </NavLink>
          <NavLink
            to="/admin/riders"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) => `nav-item admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <Bike size={19} /> Riders &amp; KYC
          </NavLink>
          <NavLink
            to="/admin/customers"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) => `nav-item admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <Users size={19} /> Customers
          </NavLink>
          <NavLink
            to="/admin/orders"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) => `nav-item admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <ShoppingBag size={19} /> Orders &amp; Parcels
          </NavLink>
          <NavLink
            to="/admin/payouts"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) => `nav-item admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <Wallet size={19} /> Payouts &amp; Finance
          </NavLink>
          <NavLink
            to="/admin/support"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) => `nav-item admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <Headphones size={19} /> Support Helpdesk
          </NavLink>
          <NavLink
            to="/admin/settings"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) => `nav-item admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <Sliders size={19} /> System Settings
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
          <div
            className="topbar-search"
            style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}
          >
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={21} />
            </button>
            <h2 className="page-title">Admin Operations Console</h2>
          </div>

          <div className="topbar-actions">
            <span
              className="store-status-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.4rem 0.875rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid #d3e3fd',
                backgroundColor: '#f0f7ff',
                color: 'var(--color-brand)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                whiteSpace: 'nowrap'
              }}
            >
              <ShieldCheck size={15} />
              <span className="store-status-label">Super Admin</span>
            </span>

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
                      <h4>System Notifications</h4>
                      <span className="notif-socket-status">
                        <span
                          className="notif-socket-dot"
                          style={{ backgroundColor: socketConnected ? '#0b57d0' : '#94a3b8' }}
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
                        No system alerts yet. Real-time order, rider, and support events appear here.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className={`notif-item ${!n.read ? 'unread' : ''}`}>
                          <div className="notif-item-top">
                            <strong>{n.title}</strong>
                            <span>{formatTimeAgo(n.created_at)}</span>
                          </div>
                          <p>{n.body}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link to="/admin/settings" className="icon-btn" title="System Settings">
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
              title={displayName}
            >
              {adminUser?.profile_picture ? (
                <img src={adminUser.profile_picture} alt={displayName} />
              ) : (
                initials
              )}
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

export default AdminLayout;
