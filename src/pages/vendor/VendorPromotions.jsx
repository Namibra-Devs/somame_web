import { useState, useEffect } from 'react';
import { Plus, Tag, Edit3, Trash2, X, Calendar, Percent } from 'lucide-react';
import api from '../../services/api';
import '../admin/AdminDashboard.css';
import './VendorPortal.css';

const FALLBACK_PROMOS = [
  {
    id: 1,
    code: 'WEEKEND20',
    discount_type: 'percentage',
    discount_value: '20',
    min_order_subtotal: '80.00',
    max_discount_limit: '30.00',
    applicable_to: { type: 'all', ids: [] },
    expires_at: '2026-12-31T23:59:00.000Z',
    is_active: true
  },
  {
    id: 2,
    code: 'SAVE15GHS',
    discount_type: 'fixed',
    discount_value: '15.00',
    min_order_subtotal: '100.00',
    max_discount_limit: null,
    applicable_to: { type: 'all', ids: [] },
    expires_at: '2026-11-30T23:59:00.000Z',
    is_active: true
  }
];

const EMPTY_PROMO = {
  id: null,
  code: '',
  discount_type: 'percentage',
  discount_value: '',
  min_order_subtotal: '0',
  max_discount_limit: '',
  applicable_type: 'all',
  expires_at: '2026-12-31',
  is_active: true
};

const VendorPromotions = () => {
  const [promotions, setPromotions] = useState(FALLBACK_PROMOS);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_PROMO);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const res = await api.get('/api/vendors/me/promotions');
        if (res.data?.data) {
          setPromotions(res.data.data);
        }
      } catch {
        // Keep fallback promotions in preview mode
      }
    };
    fetchPromotions();
  }, []);

  const openCreateModal = () => {
    setError('');
    setForm(EMPTY_PROMO);
    setModalOpen(true);
  };

  const openEditModal = (promo) => {
    setError('');
    const appTo =
      typeof promo.applicable_to === 'string'
        ? JSON.parse(promo.applicable_to)
        : promo.applicable_to || { type: 'all', ids: [] };

    setForm({
      id: promo.id,
      code: promo.code || '',
      discount_type: promo.discount_type || 'percentage',
      discount_value: promo.discount_value ?? '',
      min_order_subtotal: promo.min_order_subtotal ?? '0',
      max_discount_limit: promo.max_discount_limit ?? '',
      applicable_type: appTo.type || 'all',
      expires_at: promo.expires_at ? String(promo.expires_at).slice(0, 10) : '2026-12-31',
      is_active: promo.is_active !== false
    });
    setModalOpen(true);
  };

  const handleSavePromo = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_order_subtotal: Number(form.min_order_subtotal || 0),
      max_discount_limit: form.max_discount_limit ? Number(form.max_discount_limit) : null,
      applicable_to: { type: form.applicable_type, ids: [] },
      expires_at: new Date(form.expires_at).toISOString(),
      is_active: form.is_active
    };

    try {
      if (form.id) {
        const res = await api.put(`/api/vendors/me/promotions/${form.id}`, payload);
        if (res.data?.data) {
          setPromotions((prev) => prev.map((p) => (p.id === form.id ? res.data.data : p)));
        }
      } else {
        const res = await api.post('/api/vendors/me/promotions', payload);
        if (res.data?.data) {
          setPromotions((prev) => [res.data.data, ...prev]);
        }
      }
      setModalOpen(false);
    } catch {
      const localPromo = { ...payload, id: form.id || Date.now() };
      if (form.id) {
        setPromotions((prev) => prev.map((p) => (p.id === form.id ? localPromo : p)));
      } else {
        setPromotions((prev) => [localPromo, ...prev]);
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (promo) => {
    const nextState = !promo.is_active;
    setPromotions((prev) =>
      prev.map((p) => (p.id === promo.id ? { ...p, is_active: nextState } : p))
    );
    try {
      await api.put(`/api/vendors/me/promotions/${promo.id}`, {
        ...promo,
        is_active: nextState
      });
    } catch {
      // Keep optimistic toggle
    }
  };

  const handleDeletePromo = async (id) => {
    try {
      await api.delete(`/api/vendors/me/promotions/${id}`);
    } catch {
      // Preview mode fallback
    }
    setPromotions((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="vendor-page animate-fade-in">
      <div className="vendor-page-header">
        <div>
          <h1>Promotions &amp; Discount Codes</h1>
          <p>Create percentage or fixed-amount promo codes to boost repeat customer orders.</p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-vendor" onClick={openCreateModal}>
            <Plus size={16} /> Create Promo Code
          </button>
        </div>
      </div>

      <div className="panel-card">
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Promo Code</th>
                <th>Discount</th>
                <th>Min. Subtotal</th>
                <th>Max Cap</th>
                <th>Expires</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promotions.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No promotions created yet.
                  </td>
                </tr>
              ) : (
                promotions.map((promo) => (
                  <tr key={promo.id}>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          padding: '0.25rem 0.625rem',
                          backgroundColor: 'var(--bg-subtle)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)'
                        }}
                      >
                        <Tag size={13} />
                        {promo.code}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--color-vendor)' }}>
                      {promo.discount_type === 'percentage'
                        ? `${promo.discount_value}% OFF`
                        : `GH₵ ${parseFloat(promo.discount_value || 0).toFixed(2)} OFF`}
                    </td>
                    <td>GH₵ {parseFloat(promo.min_order_subtotal || 0).toFixed(2)}</td>
                    <td>
                      {promo.max_discount_limit
                        ? `GH₵ ${parseFloat(promo.max_discount_limit).toFixed(2)}`
                        : 'No cap'}
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                        <Calendar size={13} />
                        {promo.expires_at ? new Date(promo.expires_at).toLocaleDateString() : '—'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(promo)}
                        className={`badge ${promo.is_active ? 'badge-active' : 'badge-inactive'}`}
                        title="Click to toggle active status"
                      >
                        {promo.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn-outline btn-sm"
                          onClick={() => openEditModal(promo)}
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                        <button
                          type="button"
                          className="btn-danger-outline"
                          onClick={() => handleDeletePromo(promo.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Promo Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal-panel" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{form.id ? 'Edit Promotion' : 'Create Promotion'}</h3>
              <button type="button" className="icon-btn" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePromo}>
              <div className="modal-body">
                {error && <div className="auth-alert">{error}</div>}

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Promo Code *</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. LUNCH20"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Discount Type *</label>
                    <select
                      className="select-field"
                      value={form.discount_type}
                      onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (GH₵)</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>
                      Discount Value ({form.discount_type === 'percentage' ? '%' : 'GH₵'}) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="input-field"
                      placeholder="e.g. 15"
                      value={form.discount_value}
                      onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Minimum Order Subtotal (GH₵)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input-field"
                      placeholder="0.00"
                      value={form.min_order_subtotal}
                      onChange={(e) => setForm({ ...form, min_order_subtotal: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Max Discount Cap (GH₵, optional)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input-field"
                      placeholder="No limit"
                      value={form.max_discount_limit}
                      onChange={(e) => setForm({ ...form, max_discount_limit: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Expiry Date *</label>
                    <input
                      type="date"
                      className="input-field"
                      value={form.expires_at}
                      onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="switch-row">
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Promotion Active</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Allow customers to apply this code at checkout
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`switch-btn ${form.is_active ? 'on' : ''}`}
                    onClick={() => setForm((prev) => ({ ...prev, is_active: !prev.is_active }))}
                  >
                    <span className="switch-thumb" />
                  </button>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-vendor" disabled={saving}>
                  <Percent size={15} />
                  {saving ? 'Saving...' : 'Save Promotion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorPromotions;
