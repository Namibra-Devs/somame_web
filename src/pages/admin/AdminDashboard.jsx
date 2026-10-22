import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Users,
  Store,
  Bike,
  TrendingUp,
  ShoppingBag,
  Package,
  ShieldAlert,
  Headphones,
  RefreshCw,
  ArrowRight,
  Clock
} from 'lucide-react';
import api from '../../services/api';
import '../vendor/VendorPortal.css';
import './AdminDashboard.css';

const FALLBACK_DASHBOARD = {
  kpis: {
    total_users: 1245,
    total_customers: 1180,
    active_users: 1210,
    total_vendors: 42,
    open_vendors: 36,
    total_riders: 68,
    online_riders: 29,
    pending_kyc: 4,
    approved_riders: 61,
    total_orders: 3840,
    delivered_orders: 3690,
    active_orders: 14,
    total_parcels: 920,
    delivered_parcels: 885,
    active_parcels: 6,
    total_gmv: '184520.00',
    today_revenue: '4820.50',
    food_service_fees: '9420.00',
    open_support_cases: 3
  },
  revenue_chart: [
    { label: 'Mon', food_revenue: 3200, order_count: 54 },
    { label: 'Tue', food_revenue: 3850, order_count: 62 },
    { label: 'Wed', food_revenue: 4120, order_count: 71 },
    { label: 'Thu', food_revenue: 3690, order_count: 59 },
    { label: 'Fri', food_revenue: 5480, order_count: 89 },
    { label: 'Sat', food_revenue: 6120, order_count: 98 },
    { label: 'Sun', food_revenue: 4820.5, order_count: 77 }
  ],
  recent_orders: [
    {
      id: 101,
      order_number: 'ORD-89412',
      customer_name: 'Kwame Mensah',
      customer_phone: '0244112233',
      vendor_name: 'KFC East Legon',
      status: 'out_for_delivery',
      total_amount: '135.00',
      payment_method: 'momo',
      created_at: new Date().toISOString()
    },
    {
      id: 102,
      order_number: 'ORD-89411',
      customer_name: 'Ama Osei',
      customer_phone: '0559887766',
      vendor_name: 'Papaye Osu',
      status: 'preparing',
      total_amount: '92.50',
      payment_method: 'card',
      created_at: new Date(Date.now() - 15 * 60000).toISOString()
    },
    {
      id: 103,
      order_number: 'ORD-89410',
      customer_name: 'Yaw Boateng',
      customer_phone: '0201239876',
      vendor_name: 'Pizza Hut Cantonments',
      status: 'delivered',
      total_amount: '210.00',
      payment_method: 'momo',
      created_at: new Date(Date.now() - 42 * 60000).toISOString()
    }
  ],
  recent_parcels: [
    {
      id: 201,
      order_number: 'PRC-54109',
      customer_name: 'Efua Dapaah',
      recipient_name: 'Kofi Asante',
      item_description: 'Laptop & Official Documents',
      delivery_speed: 'express',
      distance_km: '7.4',
      status: 'in_transit',
      total_amount: '48.00',
      created_at: new Date().toISOString()
    },
    {
      id: 202,
      order_number: 'PRC-54108',
      customer_name: 'Nana Yaw',
      recipient_name: 'Abena Serwaa',
      item_description: 'Boutique Fashion Package',
      delivery_speed: 'standard',
      distance_km: '4.2',
      status: 'delivered',
      total_amount: '26.50',
      created_at: new Date(Date.now() - 55 * 60000).toISOString()
    }
  ]
};

const AdminDashboard = () => {
  const [data, setData] = useState(FALLBACK_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await api.get('/api/admin/dashboard');
      if (res.data?.data) {
        setData(res.data.data);
        setUsingFallback(false);
      }
    } catch {
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const kpis = data.kpis || FALLBACK_DASHBOARD.kpis;
  const chart = data.revenue_chart || [];
  const maxChartRev = Math.max(...chart.map((c) => parseFloat(c.food_revenue || 0)), 1);

  return (
    <div className="vendor-page animate-fade-in">
      <div className="vendor-page-header">
        <div>
          <h1>Platform Overview</h1>
          <p>
            Real-time telemetry across customers, partner merchants, dispatch riders, food orders, and parcel deliveries.
          </p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn-outline"
            onClick={() => {
              fetchDashboard();
              toast.success('Dashboard metrics refreshed');
            }}
            disabled={loading}
          >
            <RefreshCw size={15} />
            {loading ? 'Refreshing...' : 'Refresh Telemetry'}
          </button>
          <Link to="/admin/orders" className="btn-primary">
            <ShoppingBag size={15} /> Live Dispatch Board
          </Link>
        </div>
      </div>

      {usingFallback && (
        <div className="preview-banner">
          <div className="preview-banner-left">
            <Clock size={16} color="var(--color-brand)" />
            <span>
              Viewing live preview metrics. Sign in with an Admin account to stream direct database telemetry.
            </span>
          </div>
          <Link to="/admin/login" style={{ color: 'var(--color-brand)', fontWeight: 600 }}>
            Admin Sign In &rarr;
          </Link>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper icon-success">
              <TrendingUp size={22} />
            </div>
            <span className="stat-trend positive">
              Today: GH₵ {parseFloat(kpis.today_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="stat-content">
            <h3>Gross Platform Volume (GMV)</h3>
            <p className="stat-value">
              GH₵{' '}
              {parseFloat(kpis.total_gmv || 0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper icon-primary">
              <Store size={22} />
            </div>
            <span className="stat-trend positive">{kpis.open_vendors} Open Now</span>
          </div>
          <div className="stat-content">
            <h3>Partner Vendors</h3>
            <p className="stat-value">{kpis.total_vendors}</p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper icon-warning">
              <Bike size={22} />
            </div>
            <span className="stat-trend positive">{kpis.online_riders} Online</span>
          </div>
          <div className="stat-content">
            <h3>Registered Riders</h3>
            <p className="stat-value">{kpis.total_riders}</p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper icon-secondary">
              <Users size={22} />
            </div>
            <span className="stat-trend positive">{kpis.active_users} Active</span>
          </div>
          <div className="stat-content">
            <h3>Total Platform Users</h3>
            <p className="stat-value">{Number(kpis.total_users || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Actionable Operational Alerts Strip */}
      <div className="stats-grid">
        <Link to="/admin/riders" className="panel-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div className="stat-icon-wrapper icon-warning" style={{ flexShrink: 0 }}>
              <ShieldAlert size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                {kpis.pending_kyc} Pending Rider KYC
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Review Ghana Card, license &amp; vehicle docs
              </div>
            </div>
          </div>
          <ArrowRight size={18} color="var(--text-muted)" />
        </Link>

        <Link to="/admin/orders" className="panel-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div className="stat-icon-wrapper icon-primary" style={{ flexShrink: 0 }}>
              <Package size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                {Number(kpis.active_orders || 0) + Number(kpis.active_parcels || 0)} Active Dispatches
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                {kpis.active_orders} food orders • {kpis.active_parcels} parcel jobs
              </div>
            </div>
          </div>
          <ArrowRight size={18} color="var(--text-muted)" />
        </Link>

        <Link to="/admin/support" className="panel-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div className="stat-icon-wrapper icon-success" style={{ flexShrink: 0 }}>
              <Headphones size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                {kpis.open_support_cases} Open Support Tickets
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Customer &amp; rider helpdesk queue
              </div>
            </div>
          </div>
          <ArrowRight size={18} color="var(--text-muted)" />
        </Link>
      </div>

      {/* 7-Day Revenue & Order Volume Chart */}
      <div className="panel-card">
        <div className="panel-card-header">
          <div>
            <h3>7-Day Delivered Food Revenue</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Platform Service Fees Collected: <strong>GH₵ {parseFloat(kpis.food_service_fees || 0).toFixed(2)}</strong> • Total Delivered Food Orders: <strong>{kpis.delivered_orders}</strong>
            </p>
          </div>
          <Link to="/admin/payouts" className="btn-outline btn-sm">
            View Payouts &amp; Finance
          </Link>
        </div>

        <div className="bar-chart-container">
          {chart.map((point, idx) => {
            const val = parseFloat(point.food_revenue || 0);
            const heightPct = Math.max(Math.round((val / maxChartRev) * 100), 6);
            return (
              <div key={point.date || idx} className="bar-col">
                <span className="bar-val">GH₵ {val.toFixed(0)}</span>
                <div
                  className="bar-fill"
                  style={{
                    height: `${heightPct}%`,
                    backgroundColor: 'var(--color-brand)'
                  }}
                  title={`${point.label}: GH₵ ${val.toFixed(2)} (${point.order_count || 0} orders)`}
                />
                <span className="bar-label">{point.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Food Orders & Recent Parcel Deliveries */}
      <div className="two-col-grid">
        <div className="panel-card">
          <div className="panel-card-header">
            <h3>Recent Food Orders</h3>
            <Link to="/admin/orders" className="btn-text-pill btn-sm">
              All Orders &rarr;
            </Link>
          </div>

          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Vendor</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {(data.recent_orders || []).length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      No food orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  (data.recent_orders || []).map((ord) => (
                    <tr key={ord.id}>
                      <td style={{ fontWeight: 600 }}>{ord.order_number}</td>
                      <td>
                        <div>{ord.customer_name || 'Customer'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {ord.customer_phone}
                        </div>
                      </td>
                      <td>{ord.vendor_name || 'Vendor'}</td>
                      <td>
                        <span className={`badge badge-${ord.status}`}>
                          {String(ord.status || 'pending').replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        GH₵ {parseFloat(ord.total_amount || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel-card">
          <div className="panel-card-header">
            <h3>Recent Parcel Dispatches</h3>
            <Link to="/admin/orders" className="btn-text-pill btn-sm">
              All Parcels &rarr;
            </Link>
          </div>

          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Parcel #</th>
                  <th>Item &amp; Recipient</th>
                  <th>Speed</th>
                  <th>Status</th>
                  <th>Fare</th>
                </tr>
              </thead>
              <tbody>
                {(data.recent_parcels || []).length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      No parcel dispatches recorded yet.
                    </td>
                  </tr>
                ) : (
                  (data.recent_parcels || []).map((prc) => (
                    <tr key={prc.id}>
                      <td style={{ fontWeight: 600 }}>{prc.order_number}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{prc.item_description}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          To: {prc.recipient_name} ({prc.distance_km} km)
                        </div>
                      </td>
                      <td>
                        <span className="meta-chip" style={{ textTransform: 'capitalize' }}>
                          {prc.delivery_speed}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            prc.status === 'delivered'
                              ? 'badge-delivered'
                              : prc.status === 'cancelled'
                                ? 'badge-cancelled'
                                : 'badge-preparing'
                          }`}
                        >
                          {String(prc.status || 'pending').replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        GH₵ {parseFloat(prc.total_amount || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
