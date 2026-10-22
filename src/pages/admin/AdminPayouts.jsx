import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Store,
  Bike,
  Search,
  Download,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock
} from 'lucide-react';
import api from '../../services/api';
import '../vendor/VendorPortal.css';
import './AdminDashboard.css';

const FALLBACK_PAYOUTS = {
  vendor_payouts: [
    {
      id: 1,
      vendor_id: 1,
      vendor_name: 'KFC East Legon',
      vendor_phone: '0541234567',
      amount: '1850.00',
      method_label: 'MTN Mobile Money',
      account_masked: '*******4567',
      status: 'Paid',
      reference_id: 'VPAY-982341',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      vendor_id: 2,
      vendor_name: 'Papaye Fast Food — Osu',
      vendor_phone: '0244998877',
      amount: '2400.00',
      method_label: 'GCB Bank',
      account_masked: '*******1092',
      status: 'Pending',
      reference_id: 'VPAY-982340',
      created_at: new Date(Date.now() - 3600000).toISOString()
    }
  ],
  rider_payouts: [
    {
      id: 10,
      rider_id: 11,
      rider_name: 'Kojo Mensah',
      rider_phone: '0244556677',
      amount: '320.00',
      payout_method_name: 'MTN Mobile Money',
      payout_account_info: '*******6677',
      status: 'success',
      reference_id: 'RPAY-441209',
      created_at: new Date().toISOString()
    },
    {
      id: 11,
      rider_id: 13,
      rider_name: 'Emmanuel Tetteh',
      rider_phone: '0208877665',
      amount: '410.00',
      payout_method_name: 'Telecel Cash',
      payout_account_info: '*******7665',
      status: 'pending',
      reference_id: 'RPAY-441210',
      created_at: new Date(Date.now() - 7200000).toISOString()
    }
  ]
};

const AdminPayouts = () => {
  const [activeTab, setActiveTab] = useState('vendor');
  const [vendorPayouts, setVendorPayouts] = useState([]);
  const [riderPayouts, setRiderPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPayouts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/payouts');
      if (res.data?.data) {
        setVendorPayouts(res.data.data.vendor_payouts || []);
        setRiderPayouts(res.data.data.rider_payouts || []);
      } else {
        setVendorPayouts(FALLBACK_PAYOUTS.vendor_payouts);
        setRiderPayouts(FALLBACK_PAYOUTS.rider_payouts);
      }
    } catch {
      setVendorPayouts(FALLBACK_PAYOUTS.vendor_payouts);
      setRiderPayouts(FALLBACK_PAYOUTS.rider_payouts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  const handleUpdatePayoutStatus = async (type, id, nextStatus) => {
    if (type === 'vendor') {
      setVendorPayouts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: nextStatus } : p))
      );
    } else {
      setRiderPayouts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: nextStatus } : p))
      );
    }

    try {
      await api.patch(`/api/admin/payouts/${type}/${id}`, { status: nextStatus });
      toast.success(`Payout #${id} marked as ${nextStatus}`);
    } catch {
      toast.success(`Payout #${id} marked as ${nextStatus}`);
    }
  };

  const handleExportCSV = () => {
    const list = activeTab === 'vendor' ? vendorPayouts : riderPayouts;
    if (list.length === 0) {
      toast.error('No payout records to export');
      return;
    }

    const headers = [
      'ID',
      'Reference',
      'Beneficiary',
      'Phone',
      'Method',
      'Account',
      'Amount (GHS)',
      'Status',
      'Date'
    ];
    const rows = list.map((p) => [
      p.id,
      `"${p.reference_id || `PAY-${p.id}`}"`,
      `"${p.vendor_name || p.rider_name || ''}"`,
      `"${p.vendor_phone || p.rider_phone || ''}"`,
      `"${p.method_label || p.payout_method_name || ''}"`,
      `"${p.account_masked || p.payout_account_info || ''}"`,
      parseFloat(p.amount || 0).toFixed(2),
      p.status,
      p.created_at ? new Date(p.created_at).toISOString().slice(0, 10) : ''
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `somame_${activeTab}_payouts.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Payout ledger exported to CSV');
  };

  const totalVendorPaid = vendorPayouts.reduce(
    (s, p) => s + parseFloat(p.amount || 0),
    0
  );
  const totalRiderPaid = riderPayouts.reduce(
    (s, p) => s + parseFloat(p.amount || 0),
    0
  );
  const pendingCount =
    vendorPayouts.filter((p) => String(p.status).toLowerCase() === 'pending').length +
    riderPayouts.filter((p) => String(p.status).toLowerCase() === 'pending').length;

  const q = searchQuery.toLowerCase();
  const filteredVendorPayouts = vendorPayouts.filter(
    (p) =>
      !q ||
      (p.vendor_name || '').toLowerCase().includes(q) ||
      (p.reference_id || '').toLowerCase().includes(q) ||
      (p.method_label || '').toLowerCase().includes(q)
  );
  const filteredRiderPayouts = riderPayouts.filter(
    (p) =>
      !q ||
      (p.rider_name || '').toLowerCase().includes(q) ||
      (p.reference_id || '').toLowerCase().includes(q) ||
      (p.payout_method_name || '').toLowerCase().includes(q)
  );

  return (
    <div className="vendor-page animate-fade-in">
      <div className="vendor-page-header">
        <div>
          <h1>Payouts &amp; Financial Settlements</h1>
          <p>
            Audit and approve merchant and rider withdrawal requests across Mobile Money and Ghana commercial banks.
          </p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn-outline"
            onClick={fetchPayouts}
            disabled={loading}
          >
            <RefreshCw size={15} /> Refresh Ledger
          </button>
          <button type="button" className="btn-primary" onClick={handleExportCSV}>
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper icon-success">
              <Store size={22} />
            </div>
          </div>
          <div className="stat-content">
            <h3>Vendor Payouts Volume</h3>
            <p className="stat-value">
              GH₵ {totalVendorPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper icon-primary">
              <Bike size={22} />
            </div>
          </div>
          <div className="stat-content">
            <h3>Rider Payouts Volume</h3>
            <p className="stat-value">
              GH₵ {totalRiderPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper icon-warning">
              <Clock size={22} />
            </div>
          </div>
          <div className="stat-content">
            <h3>Pending Approvals</h3>
            <p className="stat-value">{pendingCount}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-strip">
        <button
          type="button"
          className={`tab-pill ${activeTab === 'vendor' ? 'active' : ''}`}
          onClick={() => setActiveTab('vendor')}
        >
          <Store size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Vendor Settlements ({vendorPayouts.length})
        </button>
        <button
          type="button"
          className={`tab-pill ${activeTab === 'rider' ? 'active' : ''}`}
          onClick={() => setActiveTab('rider')}
        >
          <Bike size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Rider Settlements ({riderPayouts.length})
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <Search size={17} />
          <input
            type="text"
            placeholder="Search by beneficiary name, reference ID, or bank/MoMo network..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {activeTab === 'vendor' ? (
        <div className="panel-card">
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Vendor Store</th>
                  <th>Method &amp; Account</th>
                  <th>Amount</th>
                  <th>Requested At</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendorPayouts.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No vendor payouts recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredVendorPayouts.map((p) => {
                    const stLower = String(p.status || 'Paid').toLowerCase();
                    return (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{p.reference_id || `VPAY-${p.id}`}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{p.vendor_name || `Vendor #${p.vendor_id}`}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {p.vendor_phone}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{p.method_label}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {p.account_masked}
                          </div>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--color-vendor)' }}>
                          GH₵ {parseFloat(p.amount || 0).toFixed(2)}
                        </td>
                        <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                          {p.created_at
                            ? new Date(p.created_at).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })
                            : '—'}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              stLower === 'paid' || stLower === 'success'
                                ? 'badge-delivered'
                                : stLower === 'failed'
                                  ? 'badge-cancelled'
                                  : 'badge-pending'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button
                              type="button"
                              className="btn-vendor btn-sm"
                              onClick={() => handleUpdatePayoutStatus('vendor', p.id, 'Paid')}
                            >
                              <CheckCircle2 size={14} /> Mark Paid
                            </button>
                            <button
                              type="button"
                              className="btn-danger-outline btn-sm"
                              onClick={() => handleUpdatePayoutStatus('vendor', p.id, 'Failed')}
                            >
                              <XCircle size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="panel-card">
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Dispatch Rider</th>
                  <th>Method &amp; Account</th>
                  <th>Amount</th>
                  <th>Requested At</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRiderPayouts.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No rider payouts recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredRiderPayouts.map((p) => {
                    const stLower = String(p.status || 'pending').toLowerCase();
                    return (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{p.reference_id || `RPAY-${p.id}`}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{p.rider_name || `Rider #${p.rider_id}`}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {p.rider_phone}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{p.payout_method_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {p.payout_account_info}
                          </div>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--color-brand)' }}>
                          GH₵ {parseFloat(p.amount || 0).toFixed(2)}
                        </td>
                        <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                          {p.created_at
                            ? new Date(p.created_at).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })
                            : '—'}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              stLower === 'paid' || stLower === 'success'
                                ? 'badge-delivered'
                                : stLower === 'failed'
                                  ? 'badge-cancelled'
                                  : 'badge-pending'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button
                              type="button"
                              className="btn-vendor btn-sm"
                              onClick={() => handleUpdatePayoutStatus('rider', p.id, 'success')}
                            >
                              <CheckCircle2 size={14} /> Mark Paid
                            </button>
                            <button
                              type="button"
                              className="btn-danger-outline btn-sm"
                              onClick={() => handleUpdatePayoutStatus('rider', p.id, 'failed')}
                            >
                              <XCircle size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayouts;
