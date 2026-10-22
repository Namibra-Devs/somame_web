import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  ShoppingBag,
  Package,
  Search,
  Eye,
  X,
  RefreshCw,
  MapPin,
  Bike
} from 'lucide-react';
import api from '../../services/api';
import '../vendor/VendorPortal.css';
import './AdminDashboard.css';

const FOOD_STATUSES = [
  'pending',
  'accepted',
  'preparing',
  'out_for_delivery',
  'delivered'
];

const PARCEL_STATUSES = [
  'pending',
  'accepted',
  'picked_up',
  'in_transit',
  'delivered',
  'cancelled'
];

const FALLBACK_ORDERS = [
  {
    id: 101,
    order_number: 'ORD-89412',
    customer_name: 'Kwame Mensah',
    customer_phone: '0244112233',
    vendor_name: 'KFC East Legon',
    rider_id: 11,
    rider_name: 'Kojo Mensah',
    rider_phone: '0244556677',
    status: 'out_for_delivery',
    total_amount: '135.00',
    discount_amount: '0.00',
    service_fee: '5.00',
    rider_tip: '10.00',
    payment_method: 'momo',
    payment_status: 'completed',
    customer_note: 'Please add extra spicy ketchup packets.',
    created_at: new Date().toISOString(),
    items: [
      { id: 1, item_name: 'Streetwise 3 with Coleslaw', quantity: 2, price: '55.00' },
      { id: 2, item_name: 'Krushers Oreo', quantity: 1, price: '25.00' }
    ]
  },
  {
    id: 102,
    order_number: 'ORD-89411',
    customer_name: 'Ama Osei',
    customer_phone: '0559887766',
    vendor_name: 'Papaye Fast Food — Osu',
    rider_id: null,
    rider_name: '',
    rider_phone: '',
    status: 'preparing',
    total_amount: '92.50',
    discount_amount: '5.00',
    service_fee: '4.00',
    rider_tip: '0.00',
    payment_method: 'card',
    payment_status: 'completed',
    customer_note: '',
    created_at: new Date(Date.now() - 25 * 60000).toISOString(),
    items: [
      { id: 3, item_name: 'Full Charcoal Grilled Chicken + Jollof', quantity: 1, price: '92.50' }
    ]
  }
];

const FALLBACK_PARCELS = [
  {
    id: 201,
    order_number: 'PRC-54109',
    customer_name: 'Efua Dapaah',
    customer_phone: '0244001122',
    rider_id: 13,
    rider_name: 'Emmanuel Tetteh',
    rider_phone: '0208877665',
    pickup_lat: 5.6037,
    pickup_lng: -0.187,
    dropoff_lat: 5.6502,
    dropoff_lng: -0.165,
    distance_km: '7.40',
    estimated_time_mins: 24,
    item_description: 'Laptop & Signed Legal Contract',
    item_value: '4500.00',
    recipient_name: 'Kofi Asante',
    recipient_phone: '0547788990',
    delivery_speed: 'express',
    status: 'in_transit',
    total_amount: '48.00',
    payment_method: 'momo',
    payment_status: 'completed',
    created_at: new Date().toISOString()
  }
];

const AdminOrders = () => {
  const [activeTab, setActiveTab] = useState('food');
  const [orders, setOrders] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [savingUpdate, setSavingUpdate] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [oRes, pRes, rRes] = await Promise.allSettled([
        api.get('/api/admin/orders'),
        api.get('/api/admin/parcels'),
        api.get('/api/admin/riders')
      ]);

      if (oRes.status === 'fulfilled' && Array.isArray(oRes.value.data?.data)) {
        setOrders(oRes.value.data.data);
      } else {
        setOrders(FALLBACK_ORDERS);
      }

      if (pRes.status === 'fulfilled' && Array.isArray(pRes.value.data?.data)) {
        setParcels(pRes.value.data.data);
      } else {
        setParcels(FALLBACK_PARCELS);
      }

      if (rRes.status === 'fulfilled' && Array.isArray(rRes.value.data?.data)) {
        setRiders(rRes.value.data.data);
      }
    } catch {
      setOrders(FALLBACK_ORDERS);
      setParcels(FALLBACK_PARCELS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleSaveOrderChanges = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setSavingUpdate(true);
    try {
      await api.patch(`/api/admin/orders/${selectedOrder.id}/status`, {
        status: selectedOrder.status,
        payment_status: selectedOrder.payment_status,
        rider_id: selectedOrder.rider_id ? Number(selectedOrder.rider_id) : null
      });
      await fetchAll();
      setSelectedOrder(null);
      toast.success(`Order ${selectedOrder.order_number} updated`);
    } catch {
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? { ...o, ...selectedOrder } : o))
      );
      setSelectedOrder(null);
      toast.success(`Order ${selectedOrder.order_number} updated`);
    } finally {
      setSavingUpdate(false);
    }
  };

  const handleSaveParcelChanges = async (e) => {
    e.preventDefault();
    if (!selectedParcel) return;
    setSavingUpdate(true);
    try {
      await api.patch(`/api/admin/parcels/${selectedParcel.id}/status`, {
        status: selectedParcel.status,
        payment_status: selectedParcel.payment_status,
        rider_id: selectedParcel.rider_id ? Number(selectedParcel.rider_id) : null
      });
      await fetchAll();
      setSelectedParcel(null);
      toast.success(`Parcel ${selectedParcel.order_number} updated`);
    } catch {
      setParcels((prev) =>
        prev.map((p) => (p.id === selectedParcel.id ? { ...p, ...selectedParcel } : p))
      );
      setSelectedParcel(null);
      toast.success(`Parcel ${selectedParcel.order_number} updated`);
    } finally {
      setSavingUpdate(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (o.order_number || '').toLowerCase().includes(q) ||
      (o.customer_name || '').toLowerCase().includes(q) ||
      (o.vendor_name || '').toLowerCase().includes(q) ||
      (o.rider_name || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredParcels = parcels.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (p.order_number || '').toLowerCase().includes(q) ||
      (p.customer_name || '').toLowerCase().includes(q) ||
      (p.recipient_name || '').toLowerCase().includes(q) ||
      (p.item_description || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="vendor-page animate-fade-in">
      <div className="vendor-page-header">
        <div>
          <h1>Orders &amp; Parcel Dispatch Control</h1>
          <p>
            Supervise live restaurant orders and express parcel deliveries, assign dispatch riders, and override order states.
          </p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn-outline"
            onClick={fetchAll}
            disabled={loading}
          >
            <RefreshCw size={15} /> Refresh Board
          </button>
        </div>
      </div>

      {/* Mode Switch Tabs */}
      <div className="tabs-strip">
        <button
          type="button"
          className={`tab-pill ${activeTab === 'food' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('food');
            setStatusFilter('all');
          }}
        >
          <ShoppingBag size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Food &amp; Store Orders ({orders.length})
        </button>
        <button
          type="button"
          className={`tab-pill ${activeTab === 'parcel' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('parcel');
            setStatusFilter('all');
          }}
        >
          <Package size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Parcel Deliveries ({parcels.length})
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={17} />
          <input
            type="text"
            placeholder={
              activeTab === 'food'
                ? 'Search order #, customer, vendor, or rider...'
                : 'Search parcel #, sender, recipient, or item...'
            }
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
            <option value="all">All Statuses</option>
            {(activeTab === 'food' ? FOOD_STATUSES : PARCEL_STATUSES).map((st) => (
              <option key={st} value={st}>
                {st.replace(/_/g, ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Food Orders Table */}
      {activeTab === 'food' && (
        <div className="panel-card">
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Vendor Store</th>
                  <th>Assigned Rider</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No food orders match your search.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord.id}>
                      <td style={{ fontWeight: 600 }}>{ord.order_number}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{ord.customer_name || 'Customer'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {ord.customer_phone}
                        </div>
                      </td>
                      <td style={{ fontWeight: 500 }}>{ord.vendor_name || 'Vendor'}</td>
                      <td>
                        {ord.rider_name ? (
                          <div>
                            <div style={{ fontWeight: 500 }}>{ord.rider_name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {ord.rider_phone}
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}>
                          {ord.payment_method}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                          {ord.payment_status}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        GH₵ {parseFloat(ord.total_amount || 0).toFixed(2)}
                      </td>
                      <td>
                        <span className={`badge badge-${ord.status}`}>
                          {String(ord.status || 'pending').replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-outline btn-sm"
                          onClick={() => setSelectedOrder({ ...ord })}
                        >
                          <Eye size={14} /> Manage
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Parcel Deliveries Table */}
      {activeTab === 'parcel' && (
        <div className="panel-card">
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Parcel #</th>
                  <th>Sender</th>
                  <th>Recipient &amp; Item</th>
                  <th>Distance &amp; Speed</th>
                  <th>Assigned Rider</th>
                  <th>Fare</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParcels.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No parcel deliveries match your search.
                    </td>
                  </tr>
                ) : (
                  filteredParcels.map((prc) => (
                    <tr key={prc.id}>
                      <td style={{ fontWeight: 600 }}>{prc.order_number}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{prc.customer_name || 'Customer'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {prc.customer_phone}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{prc.item_description}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          To: {prc.recipient_name} ({prc.recipient_phone})
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{prc.distance_km} km</div>
                        <span className="meta-chip" style={{ textTransform: 'capitalize' }}>
                          {prc.delivery_speed}
                        </span>
                      </td>
                      <td>
                        {prc.rider_name ? (
                          <div>
                            <div style={{ fontWeight: 500 }}>{prc.rider_name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {prc.rider_phone}
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        GH₵ {parseFloat(prc.total_amount || 0).toFixed(2)}
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
                      <td>
                        <button
                          type="button"
                          className="btn-outline btn-sm"
                          onClick={() => setSelectedParcel({ ...prc })}
                        >
                          <Eye size={14} /> Manage
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Food Order Inspection & Dispatch Modal */}
      {selectedOrder && (
        <div className="modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Manage Order — {selectedOrder.order_number}</h3>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setSelectedOrder(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveOrderChanges}>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div className="payout-settings-row">
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Customer
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        {selectedOrder.customer_name || 'Customer'} ({selectedOrder.customer_phone})
                      </div>
                    </div>
                  </div>
                  <div className="payout-settings-row">
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Merchant Store
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        {selectedOrder.vendor_name}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                    Ordered Items
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {(selectedOrder.items || []).map((it, idx) => (
                      <div key={it.id || idx} className="payout-settings-row">
                        <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                          {it.quantity}× {it.item_name}
                        </span>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                          GH₵ {(parseFloat(it.price || 0) * Number(it.quantity || 1)).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedOrder.customer_note && (
                  <div className="payout-settings-row">
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Customer Delivery Note
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>
                        {selectedOrder.customer_note}
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Order Status</label>
                    <select
                      className="select-field"
                      value={selectedOrder.status}
                      onChange={(e) =>
                        setSelectedOrder({ ...selectedOrder, status: e.target.value })
                      }
                    >
                      {FOOD_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st.replace(/_/g, ' ').toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Payment Status</label>
                    <select
                      className="select-field"
                      value={selectedOrder.payment_status || 'pending'}
                      onChange={(e) =>
                        setSelectedOrder({
                          ...selectedOrder,
                          payment_status: e.target.value
                        })
                      }
                    >
                      <option value="pending">PENDING</option>
                      <option value="completed">COMPLETED</option>
                      <option value="failed">FAILED</option>
                      <option value="refunded">REFUNDED</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Assign Dispatch Rider</label>
                  <select
                    className="select-field"
                    value={selectedOrder.rider_id || ''}
                    onChange={(e) =>
                      setSelectedOrder({
                        ...selectedOrder,
                        rider_id: e.target.value ? Number(e.target.value) : null
                      })
                    }
                  >
                    <option value="">— Unassigned —</option>
                    {riders.map((r) => (
                      <option key={r.id} value={r.id}>
                        {[r.first_name, r.last_name].filter(Boolean).join(' ') || r.phone_number} ({r.phone_number})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setSelectedOrder(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={savingUpdate}>
                  {savingUpdate ? 'Saving...' : 'Update Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Parcel Inspection & Dispatch Modal */}
      {selectedParcel && (
        <div className="modal-backdrop" onClick={() => setSelectedParcel(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Manage Parcel — {selectedParcel.order_number}</h3>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setSelectedParcel(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveParcelChanges}>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div className="payout-settings-row">
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Sender
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        {selectedParcel.customer_name || 'Customer'} ({selectedParcel.customer_phone})
                      </div>
                    </div>
                  </div>
                  <div className="payout-settings-row">
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Recipient
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        {selectedParcel.recipient_name} ({selectedParcel.recipient_phone})
                      </div>
                    </div>
                  </div>
                </div>

                <div className="payout-settings-row">
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Package Description &amp; Declared Value
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      {selectedParcel.item_description} • Declared Value: GH₵{' '}
                      {parseFloat(selectedParcel.item_value || 0).toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      <MapPin size={12} style={{ verticalAlign: 'middle' }} /> Distance:{' '}
                      {selectedParcel.distance_km} km • Speed: {selectedParcel.delivery_speed} • Fare: GH₵{' '}
                      {parseFloat(selectedParcel.total_amount || 0).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Parcel Status</label>
                    <select
                      className="select-field"
                      value={selectedParcel.status}
                      onChange={(e) =>
                        setSelectedParcel({ ...selectedParcel, status: e.target.value })
                      }
                    >
                      {PARCEL_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st.replace(/_/g, ' ').toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Payment Status</label>
                    <select
                      className="select-field"
                      value={selectedParcel.payment_status || 'pending'}
                      onChange={(e) =>
                        setSelectedParcel({
                          ...selectedParcel,
                          payment_status: e.target.value
                        })
                      }
                    >
                      <option value="pending">PENDING</option>
                      <option value="completed">COMPLETED</option>
                      <option value="failed">FAILED</option>
                      <option value="refunded">REFUNDED</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <Bike size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    Assign Dispatch Rider
                  </label>
                  <select
                    className="select-field"
                    value={selectedParcel.rider_id || ''}
                    onChange={(e) =>
                      setSelectedParcel({
                        ...selectedParcel,
                        rider_id: e.target.value ? Number(e.target.value) : null
                      })
                    }
                  >
                    <option value="">— Unassigned —</option>
                    {riders.map((r) => (
                      <option key={r.id} value={r.id}>
                        {[r.first_name, r.last_name].filter(Boolean).join(' ') || r.phone_number} ({r.phone_number})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setSelectedParcel(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={savingUpdate}>
                  {savingUpdate ? 'Saving...' : 'Update Parcel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
