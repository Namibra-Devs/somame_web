import { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  DollarSign,
  Calendar,
  Utensils,
  Star
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import '../admin/AdminDashboard.css';
import './VendorPortal.css';

const FALLBACK_ANALYTICS = {
  overview: {
    orders: 384,
    revenue: 46820.5,
    avg_order_value: '121.93',
    new_customers: 94
  },
  revenueOverTime: [
    { label: 'May', orders: 48, revenue: 5820 },
    { label: 'Jun', orders: 56, revenue: 6910 },
    { label: 'Jul', orders: 64, revenue: 7840 },
    { label: 'Aug', orders: 71, revenue: 8950 },
    { label: 'Sep', orders: 68, revenue: 8120 },
    { label: 'Oct', orders: 77, revenue: 9180.5 }
  ],
  topItems: [
    {
      rank: 1,
      item: 'Streetwise Two with Spicy Wings',
      image_url:
        'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=200&auto=format&fit=crop&q=80',
      units_sold: 142,
      revenue: 7810.0,
      avg_rating: '4.8'
    },
    {
      rank: 2,
      item: 'Jollof Rice & Grilled Quarter Chicken',
      image_url:
        'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=200&auto=format&fit=crop&q=80',
      units_sold: 118,
      revenue: 7316.0,
      avg_rating: '4.9'
    },
    {
      rank: 3,
      item: 'Zinger Burger Deluxe Meal',
      image_url:
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80',
      units_sold: 94,
      revenue: 7144.0,
      avg_rating: '4.7'
    },
    {
      rank: 4,
      item: '9-Piece Bucket Share Meal',
      image_url:
        'https://images.unsplash.com/photo-1562967914-608f82629710?w=200&auto=format&fit=crop&q=80',
      units_sold: 67,
      revenue: 12395.0,
      avg_rating: '4.9'
    },
    {
      rank: 5,
      item: 'Loaded Peri-Peri Fries',
      image_url:
        'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=200&auto=format&fit=crop&q=80',
      units_sold: 53,
      revenue: 1855.0,
      avg_rating: '4.6'
    }
  ]
};

const hydrateTopItemImages = async (analyticsPayload) => {
  const topList = analyticsPayload?.topItems || [];
  if (topList.length === 0 || topList.every((t) => Boolean(t.image_url))) {
    return analyticsPayload;
  }

  try {
    const menuRes = await api.get('/api/vendors/me/menu-items');
    const menuItems = menuRes.data?.data || [];
    if (menuItems.length === 0) return analyticsPayload;

    const enrichedTopItems = topList.map((top) => {
      if (top.image_url) return top;
      const match = menuItems.find(
        (m) =>
          (top.id && String(m.id) === String(top.id)) ||
          String(m.name || '').toLowerCase() === String(top.item || '').toLowerCase()
      );
      return match?.image_url ? { ...top, image_url: match.image_url } : top;
    });

    return {
      ...analyticsPayload,
      topItems: enrichedTopItems
    };
  } catch {
    return analyticsPayload;
  }
};

const formatDateInput = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getPresetDateRange = (presetKey) => {
  const now = new Date();
  const todayStr = formatDateInput(now);

  if (presetKey === 'today') {
    return { start: todayStr, end: todayStr };
  }
  if (presetKey === '7d') {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    return { start: formatDateInput(start), end: todayStr };
  }
  if (presetKey === '30d') {
    const start = new Date(now);
    start.setDate(now.getDate() - 29);
    return { start: formatDateInput(start), end: todayStr };
  }
  const year = now.getFullYear();
  return { start: `${year}-01-01`, end: `${year}-12-31` };
};

const DATE_PRESETS = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: 'Last 7 Days' },
  { key: '30d', label: 'Last 30 Days' },
  { key: 'year', label: 'This Year' }
];

const VendorAnalytics = () => {
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [activePreset, setActivePreset] = useState('year');
  const [analytics, setAnalytics] = useState(FALLBACK_ANALYTICS);
  const [loading, setLoading] = useState(false);

  const handleSelectPreset = (presetKey) => {
    const range = getPresetDateRange(presetKey);
    setActivePreset(presetKey);
    setStartDate(range.start);
    setEndDate(range.end);
    toast.success(`Showing analytics for ${DATE_PRESETS.find((p) => p.key === presetKey)?.label || presetKey}`);
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/vendors/me/analytics', {
        params: {
          start_date: startDate,
          end_date: endDate
        }
      });
      if (res.data?.data) {
        const hydrated = await hydrateTopItemImages(res.data.data);
        setAnalytics(hydrated);
      }
    } catch {
      // Keep fallback analytics when in preview mode
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    api
      .get('/api/vendors/me/analytics', {
        params: {
          start_date: startDate,
          end_date: endDate
        }
      })
      .then(async (res) => {
        if (!active || !res.data?.data) return;
        const hydrated = await hydrateTopItemImages(res.data.data);
        if (active) {
          setAnalytics(hydrated);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [startDate, endDate]);

  const maxRev = Math.max(
    ...(analytics.revenueOverTime || []).map((r) => parseFloat(r.revenue || 0)),
    1
  );

  return (
    <div className="vendor-page animate-fade-in">
      <div className="vendor-page-header">
        <div>
          <h1>Performance &amp; Analytics</h1>
          <p>Analyze delivered order revenue, average basket size, and best-selling menu items.</p>
        </div>

        <div className="header-actions" style={{ gap: '0.625rem' }}>
          <div className="tabs-strip" style={{ paddingBottom: 0 }}>
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.key}
                type="button"
                className={`tab-pill ${activePreset === preset.key ? 'active' : ''}`}
                onClick={() => handleSelectPreset(preset.key)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={16} color="var(--text-muted)" />
            <input
              type="date"
              className="select-field"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setActivePreset('custom');
              }}
            />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>to</span>
            <input
              type="date"
              className="select-field"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setActivePreset('custom');
              }}
            />
          </div>
          <button
            type="button"
            className="btn-vendor"
            onClick={() => {
              fetchAnalytics();
              toast.success('Analytics date range applied');
            }}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Apply Range'}
          </button>
        </div>
      </div>

      {/* Overview KPI Cards */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper icon-success">
              <TrendingUp size={22} />
            </div>
          </div>
          <div className="stat-content">
            <h3>Delivered Revenue</h3>
            <p className="stat-value">
              GH₵{' '}
              {parseFloat(analytics.overview?.revenue || 0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper icon-primary">
              <ShoppingBag size={22} />
            </div>
          </div>
          <div className="stat-content">
            <h3>Completed Orders</h3>
            <p className="stat-value">{analytics.overview?.orders || 0}</p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper icon-warning">
              <DollarSign size={22} />
            </div>
          </div>
          <div className="stat-content">
            <h3>Average Order Value</h3>
            <p className="stat-value">
              GH₵ {parseFloat(analytics.overview?.avg_order_value || 0).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper icon-secondary">
              <Users size={22} />
            </div>
          </div>
          <div className="stat-content">
            <h3>New Customers</h3>
            <p className="stat-value">{analytics.overview?.new_customers || 0}</p>
          </div>
        </div>
      </div>

      {/* Revenue Over Time Chart */}
      <div className="panel-card">
        <div className="panel-card-header">
          <div>
            <h3>Revenue Over Time</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Monthly breakdown of delivered order volume and gross sales
            </p>
          </div>
        </div>

        <div className="bar-chart-container">
          {(analytics.revenueOverTime || []).map((row) => {
            const val = parseFloat(row.revenue || 0);
            const heightPct = Math.max(Math.round((val / maxRev) * 100), 6);
            return (
              <div className="bar-col" key={row.label}>
                <span className="bar-val">₵{(val / 1000).toFixed(1)}k</span>
                <div className="bar-fill" style={{ height: `${heightPct}%` }} />
                <span className="bar-label">{row.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Selling Menu Items Table */}
      <div className="panel-card">
        <div className="panel-card-header">
          <h3>Top Performing Menu Items</h3>
        </div>

        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Menu Item</th>
                <th>Units Sold</th>
                <th>Avg. Rating</th>
                <th>Generated Revenue</th>
              </tr>
            </thead>
            <tbody>
              {(analytics.topItems || []).length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}
                  >
                    No top performing items recorded for the selected date range.
                  </td>
                </tr>
              ) : (
                (analytics.topItems || []).map((item) => (
                  <tr key={item.rank}>
                    <td>
                      <span className="meta-chip">#{item.rank}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                        <div
                          style={{
                            width: 46,
                            height: 46,
                            borderRadius: '12px',
                            backgroundColor: 'var(--bg-subtle)',
                            border: '1px solid var(--border-color)',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.item}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <Utensils size={18} color="var(--text-muted)" />
                          )}
                        </div>
                        <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                          {item.item}
                        </span>
                      </div>
                    </td>
                    <td>{item.units_sold} units</td>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontWeight: 500,
                          fontSize: '0.875rem',
                          padding: '0.25rem 0.625rem',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--bg-subtle)'
                        }}
                      >
                        <Star size={14} fill="#f59e0b" color="#f59e0b" />
                        {parseFloat(item.avg_rating ?? 0).toFixed(1)}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--color-vendor)' }}>
                      GH₵ {parseFloat(item.revenue || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorAnalytics;
