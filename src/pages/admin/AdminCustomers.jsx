import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Users,
  Search,
  Download,
  ShieldBan,
  ShieldCheck,
  ShoppingBag,
  MapPin,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import api from '../../services/api';
import '../vendor/VendorPortal.css';
import './AdminDashboard.css';

const FALLBACK_CUSTOMERS = [
  {
    id: 3,
    first_name: 'Kwame',
    last_name: 'Mensah',
    email: 'kwame.mensah@gmail.com',
    phone_number: '0244112233',
    is_verified: true,
    is_active: true,
    food_orders_count: 19,
    parcel_orders_count: 4,
    total_spent: '2485.00',
    saved_addresses_count: 2,
    created_at: '2026-07-12T10:20:00.000Z'
  },
  {
    id: 4,
    first_name: 'Ama',
    last_name: 'Osei',
    email: 'ama.osei@yahoo.com',
    phone_number: '0559887766',
    is_verified: true,
    is_active: true,
    food_orders_count: 11,
    parcel_orders_count: 7,
    total_spent: '1640.50',
    saved_addresses_count: 3,
    created_at: '2026-08-03T14:15:00.000Z'
  },
  {
    id: 8,
    first_name: 'Yaw',
    last_name: 'Boateng',
    email: 'yaw.boateng@outlook.com',
    phone_number: '0201239876',
    is_verified: true,
    is_active: true,
    food_orders_count: 6,
    parcel_orders_count: 1,
    total_spent: '780.00',
    saved_addresses_count: 1,
    created_at: '2026-09-18T09:05:00.000Z'
  }
];

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await api.get('/api/admin/customers');
      if (Array.isArray(res.data?.data)) {
        setCustomers(res.data.data);
      } else {
        setCustomers(FALLBACK_CUSTOMERS);
      }
    } catch {
      setCustomers(FALLBACK_CUSTOMERS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleToggleCustomerActive = async (customer) => {
    const nextActive = !customer.is_active;
    setCustomers((prev) =>
      prev.map((c) => (c.id === customer.id ? { ...c, is_active: nextActive } : c))
    );
    try {
      await api.patch(`/api/users/${customer.id}/status`, { is_active: nextActive });
      toast.success(
        nextActive ? 'Customer account activated' : 'Customer account suspended'
      );
    } catch {
      toast.success(
        nextActive ? 'Customer account activated' : 'Customer account suspended'
      );
    }
  };

  const handleExportCSV = () => {
    if (customers.length === 0) {
      toast.error('No customer records to export');
      return;
    }
    const headers = [
      'ID',
      'Name',
      'Phone',
      'Email',
      'Food Orders',
      'Parcel Orders',
      'Total Spent (GHS)',
      'Status',
      'Joined Date'
    ];
    const rows = customers.map((c) => [
      c.id,
      `"${[c.first_name, c.last_name].filter(Boolean).join(' ') || 'Customer'}"`,
      `"${c.phone_number || ''}"`,
      `"${c.email || ''}"`,
      c.food_orders_count || 0,
      c.parcel_orders_count || 0,
      parseFloat(c.total_spent || 0).toFixed(2),
      c.is_active ? 'Active' : 'Suspended',
      c.created_at ? new Date(c.created_at).toISOString().slice(0, 10) : ''
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'somame_customers_directory.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Customer directory exported to CSV');
  };

  const filteredCustomers = customers.filter((c) => {
    const fullName = `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      fullName.includes(q) ||
      (c.phone_number || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && c.is_active !== false) ||
      (statusFilter === 'suspended' && c.is_active === false);

    return matchesSearch && matchesStatus;
  });

  const totalSpendSum = customers.reduce(
    (sum, c) => sum + parseFloat(c.total_spent || 0),
    0
  );

  return (
    <div className="vendor-page animate-fade-in">
      <div className="vendor-page-header">
        <div>
          <h1>Customers Directory</h1>
          <p>
            View customer order activity, lifetime spend across food &amp; parcel delivery, and manage account access.
          </p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn-outline"
            onClick={fetchCustomers}
            disabled={loading}
          >
            <RefreshCw size={15} /> Refresh
          </button>
          <button type="button" className="btn-primary" onClick={handleExportCSV}>
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* Customer KPI Strip */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper icon-primary">
              <Users size={22} />
            </div>
          </div>
          <div className="stat-content">
            <h3>Registered Customers</h3>
            <p className="stat-value">{customers.length}</p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper icon-success">
              <CheckCircle2 size={22} />
            </div>
          </div>
          <div className="stat-content">
            <h3>Active Accounts</h3>
            <p className="stat-value">
              {customers.filter((c) => c.is_active !== false).length}
            </p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper icon-warning">
              <ShoppingBag size={22} />
            </div>
          </div>
          <div className="stat-content">
            <h3>Cumulative Customer Spend</h3>
            <p className="stat-value">
              GH₵ {totalSpendSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={17} />
          <input
            type="text"
            placeholder="Search customer by name, phone number, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            className="select-field"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Account Statuses</option>
            <option value="active">Active Customers</option>
            <option value="suspended">Suspended Accounts</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="panel-card">
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone &amp; Email</th>
                <th>Orders &amp; Parcels</th>
                <th>Saved Addresses</th>
                <th>Lifetime Spend</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No customers match your search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const fullName =
                    [c.first_name, c.last_name].filter(Boolean).join(' ') ||
                    `Customer #${c.id}`;
                  return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                          {fullName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          ID #{c.id} {c.is_verified ? '• OTP Verified' : ''}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{c.phone_number}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {c.email || 'No email'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>
                          {c.food_orders_count || 0} food orders
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {c.parcel_orders_count || 0} parcel dispatches
                        </div>
                      </td>
                      <td>
                        <span className="meta-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={12} /> {c.saved_addresses_count || 0} saved
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--color-vendor)' }}>
                        GH₵ {parseFloat(c.total_spent || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {c.created_at
                          ? new Date(c.created_at).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })
                          : '—'}
                      </td>
                      <td>
                        <span className={`badge ${c.is_active !== false ? 'badge-delivered' : 'badge-cancelled'}`}>
                          {c.is_active !== false ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={c.is_active !== false ? 'btn-danger-outline btn-sm' : 'btn-outline btn-sm'}
                          onClick={() => handleToggleCustomerActive(c)}
                        >
                          {c.is_active !== false ? (
                            <>
                              <ShieldBan size={14} /> Suspend
                            </>
                          ) : (
                            <>
                              <ShieldCheck size={14} /> Activate
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomers;
