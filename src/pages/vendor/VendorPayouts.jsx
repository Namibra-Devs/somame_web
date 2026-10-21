import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import {
  Wallet,
  Eye,
  EyeOff,
  Smartphone,
  Landmark,
  Plus,
  Trash2,
  Edit3,
  X,
  Calendar,
  Download,
  ArrowUpRight,
  CheckCircle2
} from 'lucide-react';
import api from '../../services/api';
import ConfirmModal from '../../components/ConfirmModal';
import { formatTimeAgo } from '../../utils/timeAgo';
import '../admin/AdminDashboard.css';
import './VendorPortal.css';

const maskAccountDisplay = (method) => {
  if (!method) return '****';
  const raw = String(method.account_number || '').replace(/\s+/g, '');
  if (raw.length <= 3) return raw;
  const last3 = raw.slice(-3);
  return method.provider === 'bank' ? `*******${last3}` : `****${last3}`;
};

const formatShortSetupSummary = (method) => {
  if (!method) return 'No payout account configured yet';
  return `${method.network_or_bank} (${maskAccountDisplay(method)})`;
};

const EMPTY_BREAKDOWN = {
  order_count: 0,
  gross_revenue: 0,
  commission_rate: 15,
  commission_amount: 0,
  commission_pct: 0,
  delivery_fees: 0,
  delivery_fees_pct: 0,
  net_payout: 0,
  net_payout_pct: 0
};

const EMPTY_METHOD_FORM = {
  id: null,
  provider: 'momo',
  network_or_bank: 'MTN Mobile Money',
  account_name: '',
  account_number: '',
  branch: '',
  is_default: false
};

const PERIOD_TABS = [
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
  { key: 'custom', label: 'Custom Range' }
];

const VendorPayouts = () => {
  const [showBalance, setShowBalance] = useState(true);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);

  const [period, setPeriod] = useState('monthly');
  const [customStart, setCustomStart] = useState('2026-01-01');
  const [customEnd, setCustomEnd] = useState('2026-12-31');
  const [breakdown, setBreakdown] = useState(EMPTY_BREAKDOWN);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // 2-Step Request Payout Modal State
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestStep, setRequestStep] = useState(1);
  const [selectedMethodId, setSelectedMethodId] = useState(null);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [submittingPayout, setSubmittingPayout] = useState(false);

  // Payout Settings Modal State
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [methodForm, setMethodForm] = useState(EMPTY_METHOD_FORM);
  const [savingMethod, setSavingMethod] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState(null);

  const defaultMethod =
    paymentMethods.find((m) => m.is_default) || paymentMethods[0] || null;

  const refreshEarningsData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/vendors/me/earnings', {
        params: {
          period,
          start_date: period === 'custom' ? customStart : undefined,
          end_date: period === 'custom' ? customEnd : undefined
        }
      });
      const d = res.data?.data;
      if (d) {
        setAvailableBalance(parseFloat(d.available_balance || 0));
        setTotalEarned(parseFloat(d.total_earned || 0));
        setTotalWithdrawn(parseFloat(d.total_withdrawn || 0));
        setBreakdown(d.breakdown || EMPTY_BREAKDOWN);
        setPaymentMethods(Array.isArray(d.payment_methods) ? d.payment_methods : []);
        setPayoutHistory(Array.isArray(d.payout_history) ? d.payout_history : []);
      }
    } catch {
      // Keep current state if request fails
    } finally {
      setLoading(false);
    }
  }, [period, customStart, customEnd]);

  useEffect(() => {
    let active = true;
    api
      .get('/api/vendors/me/earnings', {
        params: {
          period,
          start_date: period === 'custom' ? customStart : undefined,
          end_date: period === 'custom' ? customEnd : undefined
        }
      })
      .then((res) => {
        if (!active || !res.data?.data) return;
        const d = res.data.data;
        setAvailableBalance(parseFloat(d.available_balance || 0));
        setTotalEarned(parseFloat(d.total_earned || 0));
        setTotalWithdrawn(parseFloat(d.total_withdrawn || 0));
        setBreakdown(d.breakdown || EMPTY_BREAKDOWN);
        setPaymentMethods(Array.isArray(d.payment_methods) ? d.payment_methods : []);
        setPayoutHistory(Array.isArray(d.payout_history) ? d.payout_history : []);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [period, customStart, customEnd]);

  // Open 2-Step Request Payout Modal
  const openRequestPayoutModal = () => {
    if (paymentMethods.length === 0) {
      toast.error('Please add a payout account in Payout Settings first');
      openAddMethodForm();
      setSettingsModalOpen(true);
      return;
    }
    const initialId = defaultMethod ? defaultMethod.id : paymentMethods[0].id;
    setSelectedMethodId(initialId);
    setPayoutAmount('');
    setRequestStep(1);
    setRequestModalOpen(true);
  };

  const handleProceedToAmount = () => {
    if (!selectedMethodId) {
      toast.error('Please select a payout account to continue');
      return;
    }
    setRequestStep(2);
  };

  const handleConfirmPayout = async (e) => {
    e.preventDefault();
    const numericAmount = parseFloat(payoutAmount);

    if (!numericAmount || numericAmount <= 0) {
      toast.error('Please enter a valid payout amount');
      return;
    }

    if (numericAmount > availableBalance) {
      toast.error('Entered amount exceeds your available balance');
      return;
    }

    setSubmittingPayout(true);
    try {
      const res = await api.post('/api/vendors/me/payouts', {
        amount: numericAmount,
        payment_method_id: selectedMethodId
      });

      const createdPayout = res.data?.data?.payout;
      const remaining = res.data?.data?.remaining_balance;

      if (createdPayout) {
        setPayoutHistory((prev) => [createdPayout, ...prev]);
      }
      if (typeof remaining === 'number') {
        setAvailableBalance(remaining);
      } else {
        setAvailableBalance((prev) => Math.max(0, +(prev - numericAmount).toFixed(2)));
      }
      setTotalWithdrawn((prev) => +(prev + numericAmount).toFixed(2));
      setRequestModalOpen(false);
      toast.success(`Payout of GH₵ ${numericAmount.toFixed(2)} processed successfully`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process payout request');
    } finally {
      setSubmittingPayout(false);
    }
  };

  // Payout Settings Handlers
  const openAddMethodForm = () => {
    setMethodForm({
      ...EMPTY_METHOD_FORM,
      is_default: paymentMethods.length === 0
    });
    setEditingMethod('new');
  };

  const openEditMethodForm = (m) => {
    setMethodForm({
      id: m.id,
      provider: m.provider || 'momo',
      network_or_bank:
        m.network_or_bank || (m.provider === 'bank' ? 'GCB Bank' : 'MTN Mobile Money'),
      account_name: m.account_name || '',
      account_number: m.account_number || '',
      branch: m.branch || '',
      is_default: Boolean(m.is_default)
    });
    setEditingMethod('edit');
  };

  const handleSavePaymentMethod = async (e) => {
    e.preventDefault();
    setSavingMethod(true);
    try {
      const res = await api.post('/api/vendors/me/payment-methods', methodForm);
      if (res.data?.data) {
        await refreshEarningsData();
      }
      setEditingMethod(null);
      toast.success(
        methodForm.id ? 'Payout account updated' : 'New payout account saved'
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save payout account');
    } finally {
      setSavingMethod(false);
    }
  };

  const handleSetDefaultMethod = async (methodId) => {
    try {
      await api.put(`/api/vendors/me/payment-methods/${methodId}`, {
        is_default: true
      });
      setPaymentMethods((prev) =>
        prev.map((m) => ({
          ...m,
          is_default: m.id === methodId
        }))
      );
      toast.success('Default payout account updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update default account');
    }
  };

  const handleDeleteMethod = async (methodId) => {
    try {
      await api.delete(`/api/vendors/me/payment-methods/${methodId}`);
      await fetchEarningsData();
      toast.success('Payout account deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete payout account');
    }
  };

  const handleExportCSV = () => {
    if (payoutHistory.length === 0) {
      toast.error('No payout history available to export');
      return;
    }
    const headers = ['Date', 'Reference', 'Method', 'Account', 'Amount (GHS)', 'Status'];
    const rows = payoutHistory.map((p) => [
      p.created_at ? new Date(p.created_at).toISOString().slice(0, 10) : '',
      p.reference_id || `PAY-${p.id}`,
      `"${p.method_label || ''}"`,
      `"${p.account_masked || ''}"`,
      parseFloat(p.amount || 0).toFixed(2),
      p.status || 'Paid'
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'somame_vendor_payouts.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Payout history exported to CSV');
  };

  const chosenMethodForRequest =
    paymentMethods.find((m) => String(m.id) === String(selectedMethodId)) ||
    defaultMethod;

  return (
    <div className="vendor-page animate-fade-in">
      {/* Page Header */}
      <div className="vendor-page-header">
        <div>
          <h1>Earnings &amp; Payouts</h1>
          <p>
            Monitor your available balance, review period commission breakdowns, and withdraw funds to your configured accounts.
          </p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn-vendor"
            onClick={openRequestPayoutModal}
          >
            <ArrowUpRight size={16} /> Request Payout
          </button>
        </div>
      </div>

      {/* Top Row: Available Balance Card & Payout Settings Card */}
      <div className="payout-top-grid">
        {/* Available Balance Card */}
        <div className="balance-hero-card">
          <div className="balance-hero-top">
            <span className="balance-hero-label">
              <Wallet size={17} /> Available Balance
            </span>
            <button
              type="button"
              className="balance-eye-btn"
              onClick={() => setShowBalance((prev) => !prev)}
              title={showBalance ? 'Hide balance' : 'Show balance'}
            >
              {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>

          <div className="balance-hero-amount">
            {showBalance
              ? `GH₵ ${availableBalance.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}`
              : 'GH₵ •••••••'}
          </div>

          <div className="balance-hero-meta">
            <span>
              Total Earned:{' '}
              <strong>
                {showBalance ? `GH₵ ${totalEarned.toFixed(2)}` : 'GH₵ ••••'}
              </strong>
            </span>
            <span>
              Withdrawn:{' '}
              <strong>
                {showBalance ? `GH₵ ${totalWithdrawn.toFixed(2)}` : 'GH₵ ••••'}
              </strong>
            </span>
          </div>
        </div>

        {/* Payout Settings Card */}
        <div
          className="panel-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div className="panel-card-header" style={{ marginBottom: '0.75rem' }}>
            <div>
              <h3>Payout Settings</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Default receiving account for your store withdrawals
              </p>
            </div>
            <span className="badge badge-active">
              {paymentMethods.length} {paymentMethods.length === 1 ? 'Account' : 'Accounts'}
            </span>
          </div>

          <div className="payout-settings-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="payout-method-icon">
                {defaultMethod?.provider === 'bank' ? (
                  <Landmark size={18} />
                ) : (
                  <Smartphone size={18} />
                )}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  {formatShortSetupSummary(defaultMethod)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                  {defaultMethod
                    ? `${defaultMethod.account_name}${defaultMethod.branch ? ` • ${defaultMethod.branch}` : ''}`
                    : 'Add Mobile Money or Bank account to enable payouts'}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn-outline btn-sm"
              onClick={() => {
                setEditingMethod(null);
                setSettingsModalOpen(true);
              }}
            >
              {paymentMethods.length === 0 ? (
                <>
                  <Plus size={14} /> Add Account
                </>
              ) : (
                <>
                  <Edit3 size={14} /> Change Account
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Period Filter Strip (Matches VendorAnalytics & VendorOrders) */}
      <div className="filter-bar">
        <div className="tabs-strip" style={{ paddingBottom: 0 }}>
          {PERIOD_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`tab-pill ${period === tab.key ? 'active' : ''}`}
              onClick={() => setPeriod(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {period === 'custom' ? (
          <div className="filter-controls">
            <Calendar size={16} color="var(--text-muted)" />
            <input
              type="date"
              className="select-field"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
            />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>to</span>
            <input
              type="date"
              className="select-field"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
            />
          </div>
        ) : (
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            {loading
              ? 'Refreshing breakdown...'
              : `${breakdown.order_count || 0} delivered ${
                  breakdown.order_count === 1 ? 'order' : 'orders'
                } in selected period`}
          </span>
        )}
      </div>

      {/* Period Breakdown Card */}
      <div className="panel-card">
        <div className="panel-card-header">
          <h3>Period Breakdown</h3>
          <span className="badge badge-preparing">
            {PERIOD_TABS.find((t) => t.key === period)?.label || 'Selected Period'}
          </span>
        </div>

        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount (GH₵)</th>
                <th>% of Gross</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    Gross Revenue
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Total delivered order value before deductions
                  </div>
                </td>
                <td style={{ fontWeight: 600 }}>
                  GH₵ {parseFloat(breakdown.gross_revenue || 0).toFixed(2)}
                </td>
                <td style={{ fontWeight: 600 }}>
                  {parseFloat(breakdown.gross_revenue || 0) > 0 ? '100%' : '0%'}
                </td>
              </tr>

              <tr>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    Somame Commission ({breakdown.commission_rate || 15}%)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Platform service commission
                  </div>
                </td>
                <td style={{ fontWeight: 600, color: 'var(--color-danger)' }}>
                  -GH₵ {parseFloat(breakdown.commission_amount || 0).toFixed(2)}
                </td>
                <td style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>
                  {breakdown.commission_pct || 0}%
                </td>
              </tr>

              <tr>
                <td style={{ borderBottom: 'none' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    Delivery &amp; Service Fees Collected
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Order service fees collected from customers
                  </div>
                </td>
                <td style={{ fontWeight: 600, color: 'var(--color-danger)', borderBottom: 'none' }}>
                  -GH₵ {parseFloat(breakdown.delivery_fees || 0).toFixed(2)}
                </td>
                <td style={{ fontWeight: 500, color: 'var(--text-secondary)', borderBottom: 'none' }}>
                  {breakdown.delivery_fees_pct || 0}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Highlighted Net Payout Row */}
        <div className="net-payout-summary-bar">
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0d652d' }}>
              Net Payout
            </div>
            <div style={{ fontSize: '0.78rem', color: '#0d652d', opacity: 0.85 }}>
              Net earnings credited to your store balance for this period
            </div>
          </div>
          <div style={{ fontWeight: 700, fontSize: '1.0625rem', color: '#0d652d' }}>
            GH₵ {parseFloat(breakdown.net_payout || 0).toFixed(2)}
          </div>
          <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0d652d' }}>
            {breakdown.net_payout_pct || 0}%
          </div>
        </div>
      </div>

      {/* Payout History Card */}
      <div className="panel-card">
        <div className="panel-card-header">
          <div>
            <h3>Payout History</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              All completed and pending withdrawals from your store wallet
            </p>
          </div>
          {payoutHistory.length > 0 && (
            <button
              type="button"
              className="btn-outline btn-sm"
              onClick={handleExportCSV}
            >
              <Download size={14} /> Export CSV
            </button>
          )}
        </div>

        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Reference</th>
                <th>Amount (GH₵)</th>
                <th>Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payoutHistory.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}
                  >
                    No payouts requested yet. Click &ldquo;Request Payout&rdquo; when you have available balance to withdraw.
                  </td>
                </tr>
              ) : (
                payoutHistory.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : '—'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {formatTimeAgo(item.created_at)}
                      </div>
                    </td>
                    <td style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>
                      {item.reference_id || `PAY-${item.id}`}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      GH₵ {parseFloat(item.amount || 0).toFixed(2)}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                        {item.method_label || 'Mobile Money'}
                      </div>
                      {item.account_masked && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {item.account_masked}
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          String(item.status || 'Paid').toLowerCase() === 'paid'
                            ? 'badge-delivered'
                            : String(item.status || '').toLowerCase() === 'failed'
                              ? 'badge-cancelled'
                              : 'badge-pending'
                        }`}
                      >
                        {item.status || 'Paid'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================================
          2-Step Request Payout Modal (Uses our standard Material 3 Modal UI)
         ===================================================================== */}
      {requestModalOpen &&
        createPortal(
          <div className="modal-backdrop" onClick={() => setRequestModalOpen(false)}>
            <div
              className="modal-panel modal-panel-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>{requestStep === 1 ? 'Request Payout' : 'Enter Payout Amount'}</h3>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setRequestModalOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              {requestStep === 1 ? (
                <>
                  <div className="modal-body">
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      Select the payout account where you would like to receive your funds:
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {paymentMethods.map((m) => {
                        const isSelected = String(selectedMethodId) === String(m.id);
                        return (
                          <button
                            key={m.id}
                            type="button"
                            className={`method-option-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => setSelectedMethodId(m.id)}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div className="payout-method-icon">
                                {m.provider === 'bank' ? (
                                  <Landmark size={18} />
                                ) : (
                                  <Smartphone size={18} />
                                )}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '0.925rem', color: 'var(--text-main)' }}>
                                  {m.network_or_bank} ({maskAccountDisplay(m)})
                                </div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                  {m.account_name}
                                  {m.branch ? ` • ${m.branch}` : ''}
                                </div>
                              </div>
                            </div>

                            <span className="method-radio-dot">
                              {isSelected && <span className="method-radio-dot-inner" />}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      className="btn-text-pill"
                      onClick={() => {
                        setRequestModalOpen(false);
                        openAddMethodForm();
                        setSettingsModalOpen(true);
                      }}
                      style={{ alignSelf: 'flex-start', paddingLeft: 0 }}
                    >
                      <Plus size={15} /> Add another payout account
                    </button>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => setRequestModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn-vendor"
                      onClick={handleProceedToAmount}
                    >
                      Next
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleConfirmPayout}>
                  <div className="modal-body">
                    {/* Selected Account Summary */}
                    <div className="payout-settings-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="payout-method-icon">
                          {chosenMethodForRequest?.provider === 'bank' ? (
                            <Landmark size={18} />
                          ) : (
                            <Smartphone size={18} />
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Receiving Account
                          </div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                            {formatShortSetupSummary(chosenMethodForRequest)}
                          </div>
                        </div>
                      </div>
                      <CheckCircle2 size={18} color="var(--color-vendor)" />
                    </div>

                    <div className="form-group">
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <label>Enter Amount (GH₵)</label>
                        <button
                          type="button"
                          onClick={() => setPayoutAmount(String(availableBalance.toFixed(2)))}
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            color: 'var(--color-vendor)'
                          }}
                        >
                          Available: GH₵ {availableBalance.toFixed(2)} (Use Max)
                        </button>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="1"
                        max={availableBalance > 0 ? availableBalance : undefined}
                        className="input-field"
                        placeholder="0.00"
                        value={payoutAmount}
                        onChange={(e) => setPayoutAmount(e.target.value)}
                        autoFocus
                        required
                      />
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => setRequestStep(1)}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="btn-vendor"
                      disabled={submittingPayout}
                    >
                      {submittingPayout ? 'Processing...' : 'Confirm Payout'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>,
          document.body
        )}

      {/* =====================================================================
          Payout Settings / Manage Accounts Modal
         ===================================================================== */}
      {settingsModalOpen &&
        createPortal(
          <div className="modal-backdrop" onClick={() => setSettingsModalOpen(false)}>
            <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  {editingMethod === 'new'
                    ? 'Add Payout Account'
                    : editingMethod === 'edit'
                      ? 'Edit Payout Account'
                      : 'Payout Settings'}
                </h3>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => {
                    setEditingMethod(null);
                    setSettingsModalOpen(false);
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {!editingMethod ? (
                <>
                  <div className="modal-body">
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      Configure your Mobile Money wallets and Bank accounts for receiving store payouts.
                    </p>

                    {paymentMethods.length === 0 ? (
                      <div
                        style={{
                          padding: '2rem',
                          textAlign: 'center',
                          backgroundColor: 'var(--bg-subtle)',
                          borderRadius: '16px',
                          color: 'var(--text-muted)'
                        }}
                      >
                        No payout accounts saved yet. Click &ldquo;Add New Account&rdquo; below to add your Mobile Money or Bank account.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {paymentMethods.map((m) => (
                          <div
                            key={m.id}
                            className="payout-settings-row"
                            style={{
                              borderColor: m.is_default
                                ? 'var(--color-vendor)'
                                : 'var(--border-color)',
                              backgroundColor: m.is_default
                                ? 'var(--color-vendor-subtle)'
                                : 'var(--bg-subtle)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div className="payout-method-icon">
                                {m.provider === 'bank' ? (
                                  <Landmark size={18} />
                                ) : (
                                  <Smartphone size={18} />
                                )}
                              </div>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <strong style={{ fontSize: '0.925rem', color: 'var(--text-main)' }}>
                                    {m.network_or_bank} ({maskAccountDisplay(m)})
                                  </strong>
                                  {m.is_default && (
                                    <span className="badge badge-delivered">Default</span>
                                  )}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                                  {m.account_name}
                                  {m.branch ? ` • ${m.branch}` : ''}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              {!m.is_default && (
                                <button
                                  type="button"
                                  className="btn-outline btn-sm"
                                  onClick={() => handleSetDefaultMethod(m.id)}
                                >
                                  Set Default
                                </button>
                              )}
                              <button
                                type="button"
                                className="icon-btn"
                                onClick={() => openEditMethodForm(m)}
                                title="Edit account"
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                type="button"
                                className="icon-btn"
                                onClick={() => setMethodToDelete(m)}
                                title="Delete account"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => setSettingsModalOpen(false)}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="btn-vendor"
                      onClick={openAddMethodForm}
                    >
                      <Plus size={16} /> Add New Account
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleSavePaymentMethod}>
                  <div className="modal-body">
                    <div className="form-grid-2">
                      <div className="form-group">
                        <label>Account Type</label>
                        <select
                          className="select-field"
                          value={methodForm.provider}
                          onChange={(e) => {
                            const nextProvider = e.target.value;
                            setMethodForm((prev) => ({
                              ...prev,
                              provider: nextProvider,
                              network_or_bank:
                                nextProvider === 'bank' ? 'GCB Bank' : 'MTN Mobile Money'
                            }));
                          }}
                        >
                          <option value="momo">Mobile Money</option>
                          <option value="bank">Bank Account</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>
                          {methodForm.provider === 'bank' ? 'Bank Name' : 'Mobile Network'}
                        </label>
                        {methodForm.provider === 'momo' ? (
                          <select
                            className="select-field"
                            value={methodForm.network_or_bank}
                            onChange={(e) =>
                              setMethodForm((prev) => ({
                                ...prev,
                                network_or_bank: e.target.value
                              }))
                            }
                          >
                            <option value="MTN Mobile Money">MTN Mobile Money</option>
                            <option value="Telecel Cash">Telecel Cash</option>
                            <option value="AT Money">AT Money</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. ABSA, GCB Bank, Ecobank"
                            value={methodForm.network_or_bank}
                            onChange={(e) =>
                              setMethodForm((prev) => ({
                                ...prev,
                                network_or_bank: e.target.value
                              }))
                            }
                            required
                          />
                        )}
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div className="form-group">
                        <label>Account Holder Name</label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="Registered name on account"
                          value={methodForm.account_name}
                          onChange={(e) =>
                            setMethodForm((prev) => ({
                              ...prev,
                              account_name: e.target.value
                            }))
                          }
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          {methodForm.provider === 'bank'
                            ? 'Account Number'
                            : 'Mobile Money Number'}
                        </label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder={
                            methodForm.provider === 'bank' ? '0123456098' : '0541234890'
                          }
                          value={methodForm.account_number}
                          onChange={(e) =>
                            setMethodForm((prev) => ({
                              ...prev,
                              account_number: e.target.value
                            }))
                          }
                          required
                        />
                      </div>
                    </div>

                    {methodForm.provider === 'bank' && (
                      <div className="form-group">
                        <label>Bank Branch</label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="e.g. East Legon Branch"
                          value={methodForm.branch}
                          onChange={(e) =>
                            setMethodForm((prev) => ({ ...prev, branch: e.target.value }))
                          }
                        />
                      </div>
                    )}

                    <div className="switch-row">
                      <div>
                        <strong style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>
                          Set as Default Payout Account
                        </strong>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Pre-select this account when requesting payouts
                        </p>
                      </div>
                      <button
                        type="button"
                        className={`switch-btn ${methodForm.is_default ? 'on' : ''}`}
                        onClick={() =>
                          setMethodForm((prev) => ({
                            ...prev,
                            is_default: !prev.is_default
                          }))
                        }
                      >
                        <span className="switch-thumb" />
                      </button>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => setEditingMethod(null)}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="btn-vendor"
                      disabled={savingMethod}
                    >
                      {savingMethod ? 'Saving...' : 'Save Account'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>,
          document.body
        )}

      {/* Confirm Delete Payment Method Modal */}
      <ConfirmModal
        open={Boolean(methodToDelete)}
        title="Remove payout account?"
        message={
          methodToDelete
            ? `Are you sure you want to remove "${methodToDelete.network_or_bank} (${maskAccountDisplay(
                methodToDelete
              )})" from your payout settings?`
            : ''
        }
        confirmLabel="Remove account"
        onCancel={() => setMethodToDelete(null)}
        onConfirm={() => {
          if (methodToDelete) {
            handleDeleteMethod(methodToDelete.id);
          }
          setMethodToDelete(null);
        }}
      />
    </div>
  );
};

export default VendorPayouts;
