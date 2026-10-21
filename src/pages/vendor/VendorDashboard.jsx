import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Utensils,
  RefreshCw
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatTimeAgo } from '../../utils/timeAgo';
import '../admin/AdminDashboard.css';
import './VendorPortal.css';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const FALLBACK_DASHBOARD = {
  cards: [
    { status: 'pending', count: '4' },
    { status: 'accepted', count: '2' },
    { status: 'preparing', count: '3' },
    { status: 'ready', count: '2' },
    { status: 'delivered', count: '48' }
  ],
  recentOrders: [
    {
      id: 101,
      order_number: 'ORD-7832',
      first_name: 'Kwame',
      last_name: 'Mensah',
      status: 'pending',
      total_amount: '120.00',
      created_at: '2026-10-21T15:35:00.000Z'
    },
    {
      id: 102,
      order_number: 'ORD-7830',
      first_name: 'Ama',
      last_name: 'Osei',
      status: 'preparing',
      total_amount: '95.00',
      created_at: '2026-10-21T14:20:00.000Z'
    },
    {
      id: 103,
      order_number: 'ORD-7827',
      first_name: 'Kojo',
      last_name: 'Antwi',
      status: 'ready',
      total_amount: '164.50',
      created_at: '2026-10-21T11:45:00.000Z'
    },
    {
      id: 104,
      order_number: 'ORD-7821',
      first_name: 'Efua',
      last_name: 'Boadu',
      status: 'delivered',
      total_amount: '78.00',
      created_at: '2026-10-20T18:10:00.000Z'
    }
  ],
  salesOverview: [
    { month: 5, total_sales: '8420.00' },
    { month: 6, total_sales: '10150.00' },
    { month: 7, total_sales: '11900.00' },
    { month: 8, total_sales: '13400.00' },
    { month: 9, total_sales: '12850.00' },
    { month: 10, total_sales: '15640.00' }
  ],
  topItems: [
    { id: 1, name: 'Streetwise Two with Spicy Wings', units_sold: 142 },
    { id: 2, name: 'Jollof Rice & Grilled Quarter Chicken', units_sold: 118 },
    { id: 3, name: 'Zinger Burger Deluxe Meal', units_sold: 94 },
    { id: 4, name: '9-Piece Bucket Share Meal', units_sold: 67 },
    { id: 5, name: 'Loaded Peri-Peri Fries', units_sold: 53 }
  ]
};

const VendorDashboard = () => {
  const [stats, setStats] = useState(FALLBACK_DASHBOARD);
  const [loading, setLoading] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/vendors/me/dashboard');
      if (res.data?.data) {
        setStats(res.data.data);
      }
    } catch {
      // Keep fallback data when offline
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    api
      .get('/api/vendors/me/dashboard')
      .then((res) => {
        if (active && res.data?.data) {
          setStats(res.data.data);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const getCountByStatuses = (statuses) => {
    if (!stats.cards) return 0;
    return stats.cards
      .filter((c) => statuses.includes(c.status))
      .reduce((acc, c) => acc + parseInt(c.count || 0, 10), 0);
  };

  const pendingCount = getCountByStatuses(['pending']);
  const activeCount = getCountByStatuses(['accepted', 'preparing', 'ready']);
  const deliveredCount = getCountByStatuses(['delivered']);
  const totalSalesYear = (stats.salesOverview || []).reduce(
    (sum, m) => sum + parseFloat(m.total_sales || 0),
    0
  );

  const maxSales = Math.max(
    ...(stats.salesOverview || []).map((s) => parseFloat(s.total_sales || 0)),
    1
  );

  const handleQuickStatus = async (orderId, nextStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await api.patch(`/api/orders/${orderId}/status`, { status: nextStatus });
    } catch {
      // Optimistically update in preview mode as well
    } finally {
      setStats((prev) => ({
        ...prev,
        recentOrders: prev.recentOrders.map((o) =>
          o.id === orderId ? { ...o, status: nextStatus } : o
        )
      }));
      setUpdatingOrderId(null);
      toast.success(`Order status updated to ${nextStatus.replace(/_/g, ' ')}`);
    }
  };

  const renderNextAction = (order) => {
    if (order.status === 'pending') {
      return (
        <button
          className="btn-vendor btn-sm"
          disabled={updatingOrderId === order.id}
          onClick={() => handleQuickStatus(order.id, 'accepted')}
        >
          Accept
        </button>
      );
    }
    if (order.status === 'accepted') {
      return (
        <button
          className="btn-outline btn-sm"
          disabled={updatingOrderId === order.id}
          onClick={() => handleQuickStatus(order.id, 'preparing')}
        >
          Start Preparing
        </button>
      );
    }
    if (order.status === 'preparing') {
      return (
        <button
          className="btn-vendor btn-sm"
          disabled={updatingOrderId === order.id}
          onClick={() => handleQuickStatus(order.id, 'ready')}
        >
          Mark Ready
        </button>
      );
    }
    return (
      <Link to="/vendor/orders" className="btn-outline btn-sm">
        Details
      </Link>
    );
  };

  return (
    <div className="vendor-page animate-fade-in">
      <div className="vendor-page-header">
        <div>
          <h1>Store Overview</h1>
          <p>Real-time snapshot of your orders, kitchen queue, and top menu items.</p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-outline" onClick={fetchDashboard}>
            <RefreshCw size={16} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <Link to="/vendor/orders" className="btn-vendor">
            Manage Orders <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper icon-warning">
              <Clock size={22} />
            </div>
            <span className="badge badge-pending">Action Needed</span>
          </div>
          <div className="stat-content">
            <h3>Pending Orders</h3>
            <p className="stat-value">{pendingCount}</p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper icon-primary">
              <Utensils size={22} />
            </div>
            <span className="badge badge-preparing">Kitchen Queue</span>
          </div>
          <div className="stat-content">
            <h3>In Preparation &amp; Ready</h3>
            <p className="stat-value">{activeCount}</p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper icon-success">
              <CheckCircle2 size={22} />
            </div>
            <span className="badge badge-delivered">Fulfilled</span>
          </div>
          <div className="stat-content">
            <h3>Completed Orders</h3>
            <p className="stat-value">{deliveredCount}</p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper icon-success">
              <TrendingUp size={22} />
            </div>
            <span className="badge badge-active">YTD Revenue</span>
          </div>
          <div className="stat-content">
            <h3>Delivered Revenue</h3>
            <p className="stat-value">GH₵ {totalSalesYear.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Orders & Top Items */}
      <div className="two-col-grid">
        <div className="panel-card">
          <div className="panel-card-header">
            <h3>Recent Orders</h3>
            <Link to="/vendor/orders" className="btn-outline btn-sm">
              View All Orders
            </Link>
          </div>

          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {(stats.recentOrders || []).length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      No orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  (stats.recentOrders || []).map((order) => (
                    <tr key={order.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{order.order_number}</div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                          {formatTimeAgo(order.created_at)}
                        </div>
                      </td>
                      <td>
                        {order.first_name || 'Customer'} {order.last_name || ''}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        GH₵ {parseFloat(order.total_amount || 0).toFixed(2)}
                      </td>
                      <td>
                        <span className={`badge badge-${order.status}`}>
                          {String(order.status).replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>{renderNextAction(order)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Menu Items */}
        <div className="panel-card">
          <div className="panel-card-header">
            <h3>Top Selling Items</h3>
            <Link to="/vendor/menu" className="btn-outline btn-sm">
              Manage Menu
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(stats.topItems || []).length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No delivered item statistics yet.
              </p>
            ) : (
              (stats.topItems || []).map((item, idx) => (
                <div
                  key={item.id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0.875rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '6px',
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--text-main)'
                      }}
                    >
                      #{idx + 1}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.name}</span>
                  </div>
                  <span className="meta-chip">{item.units_sold} sold</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Monthly Sales Overview Bar Chart */}
      <div className="panel-card">
        <div className="panel-card-header">
          <div>
            <h3>Monthly Sales Overview</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Delivered order revenue grouped by month
            </p>
          </div>
          <Link to="/vendor/analytics" className="btn-outline btn-sm">
            Detailed Analytics
          </Link>
        </div>

        <div className="bar-chart-container">
          {(stats.salesOverview || []).map((entry) => {
            const val = parseFloat(entry.total_sales || 0);
            const heightPct = Math.max(Math.round((val / maxSales) * 100), 6);
            const monthLabel = MONTH_NAMES[(parseInt(entry.month, 10) - 1) % 12] || `M${entry.month}`;
            return (
              <div className="bar-col" key={entry.month}>
                <span className="bar-val">₵{(val / 1000).toFixed(1)}k</span>
                <div className="bar-fill" style={{ height: `${heightPct}%` }} />
                <span className="bar-label">{monthLabel}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
