import { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  X,
  Clock,
  MapPin,
  Phone,
  KeyRound,
  Bike
} from 'lucide-react';
import api from '../../services/api';
import '../admin/AdminDashboard.css';
import './VendorPortal.css';

const STATUS_TABS = [
  { key: 'all', label: 'All Orders' },
  { key: 'pending', label: 'New / Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready for Pickup' },
  { key: 'out_for_delivery', label: 'On Delivery' },
  { key: 'delivered', label: 'Delivered' }
];

const FALLBACK_ORDERS = [
  {
    id: 101,
    order_number: 'ORD-7832',
    first_name: 'Kwame',
    last_name: 'Mensah',
    customer_phone: '0541234567',
    status: 'pending',
    total_amount: '120.00',
    discount_amount: '0.00',
    service_fee: '2.00',
    payment_method: 'momo',
    delivery_address: 'Osu Oxford Street, Near Danquah Circle',
    customer_note: 'Please include extra chilli sauce and tissues.',
    merchant_otp: '4829',
    created_at: '2026-10-19T19:45:00.000Z',
    items: [
      { id: 1, item_name: 'Streetwise Two with Spicy Wings', quantity: 2, price: '49.00' },
      { id: 2, item_name: 'Large Coleslaw Tub', quantity: 1, price: '20.00' }
    ]
  },
  {
    id: 102,
    order_number: 'ORD-7830',
    first_name: 'Ama',
    last_name: 'Osei',
    customer_phone: '0249876543',
    status: 'accepted',
    total_amount: '95.00',
    discount_amount: '10.00',
    service_fee: '2.00',
    payment_method: 'card',
    delivery_address: 'East Legon, Boundary Road Apt 4B',
    customer_note: '',
    merchant_otp: '9104',
    created_at: '2026-10-19T19:20:00.000Z',
    items: [
      { id: 3, item_name: 'Jollof Rice & Grilled Quarter Chicken', quantity: 2, price: '51.50' }
    ]
  },
  {
    id: 103,
    order_number: 'ORD-7827',
    first_name: 'Kojo',
    last_name: 'Antwi',
    customer_phone: '0503344556',
    status: 'preparing',
    total_amount: '164.50',
    discount_amount: '0.00',
    service_fee: '2.00',
    payment_method: 'cod',
    delivery_address: 'Airport Residential Area, Patrice Lumumba Rd',
    customer_note: 'Call when rider leaves the restaurant.',
    merchant_otp: '6371',
    rider_first_name: 'Yaw',
    rider_last_name: 'Boateng',
    rider_phone: '0558899001',
    created_at: '2026-10-19T18:55:00.000Z',
    items: [
      { id: 4, item_name: '9-Piece Bucket Share Meal', quantity: 1, price: '142.50' },
      { id: 5, item_name: 'Loaded Peri-Peri Fries', quantity: 1, price: '20.00' }
    ]
  },
  {
    id: 104,
    order_number: 'ORD-7821',
    first_name: 'Efua',
    last_name: 'Boadu',
    customer_phone: '0201122334',
    status: 'ready',
    total_amount: '78.00',
    discount_amount: '0.00',
    service_fee: '2.00',
    payment_method: 'momo',
    delivery_address: 'Cantonments, 4th Circular Road',
    customer_note: '',
    merchant_otp: '3052',
    rider_first_name: 'Ibrahim',
    rider_last_name: 'Sulemana',
    rider_phone: '0244556677',
    created_at: '2026-10-19T18:10:00.000Z',
    items: [
      { id: 6, item_name: 'Zinger Burger Deluxe Meal', quantity: 1, price: '76.00' }
    ]
  }
];

const VendorOrders = () => {
  const [orders, setOrders] = useState(FALLBACK_ORDERS);
  const [totalCount, setTotalCount] = useState(FALLBACK_ORDERS.length);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    let active = true;
    api
      .get('/api/vendors/me/orders', {
        params: {
          status: statusFilter,
          dateFilter: dateFilter || undefined,
          search: search || undefined,
          page,
          limit: 10
        }
      })
      .then((res) => {
        if (active && res.data?.data) {
          setOrders(res.data.data);
          setTotalCount(res.data.totalCount ?? res.data.data.length);
        }
      })
      .catch(() => {
        if (!active) return;
        let filtered = [...FALLBACK_ORDERS];
        if (statusFilter !== 'all') {
          filtered = filtered.filter((o) => o.status === statusFilter);
        }
        if (search.trim()) {
          const q = search.toLowerCase();
          filtered = filtered.filter(
            (o) =>
              o.order_number.toLowerCase().includes(q) ||
              `${o.first_name} ${o.last_name}`.toLowerCase().includes(q)
          );
        }
        setOrders(filtered);
        setTotalCount(filtered.length);
      });
    return () => {
      active = false;
    };
  }, [statusFilter, dateFilter, search, page]);

  const handleOpenOrderDetails = async (order) => {
    setSelectedOrder(order);
    try {
      const res = await api.get(`/api/vendors/me/orders/${order.id}`);
      if (res.data?.data) {
        setSelectedOrder(res.data.data);
      }
    } catch {
      // Keep local order object if offline
    }
  };

  const handleUpdateStatus = async (orderId, nextStatus) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/api/orders/${orderId}/status`, { status: nextStatus });
    } catch {
      // Optimistically update in preview mode
    } finally {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: nextStatus }));
      }
      setUpdatingId(null);
    }
  };

  const renderStatusButton = (order) => {
    if (order.status === 'pending') {
      return (
        <button
          type="button"
          className="btn-vendor btn-sm"
          disabled={updatingId === order.id}
          onClick={() => handleUpdateStatus(order.id, 'accepted')}
        >
          Accept Order
        </button>
      );
    }
    if (order.status === 'accepted') {
      return (
        <button
          type="button"
          className="btn-outline btn-sm"
          disabled={updatingId === order.id}
          onClick={() => handleUpdateStatus(order.id, 'preparing')}
        >
          Start Preparing
        </button>
      );
    }
    if (order.status === 'preparing') {
      return (
        <button
          type="button"
          className="btn-vendor btn-sm"
          disabled={updatingId === order.id}
          onClick={() => handleUpdateStatus(order.id, 'ready')}
        >
          Mark Ready for Rider
        </button>
      );
    }
    return null;
  };

  return (
    <div className="vendor-page animate-fade-in">
      <div className="vendor-page-header">
        <div>
          <h1>Order Management</h1>
          <p>Accept new orders, update kitchen preparation status, and coordinate rider handoffs.</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="tabs-strip">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`tab-pill ${statusFilter === tab.key ? 'active' : ''}`}
            onClick={() => {
              setStatusFilter(tab.key);
              setPage(1);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Date Filter */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={17} />
          <input
            type="text"
            placeholder="Search by Order # or customer name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="filter-controls">
          <select
            className="select-field"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Dates</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="panel-card">
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Placed At</th>
                <th>Payment</th>
                <th>Amount</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No orders match the current filters.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 700 }}>{order.order_number}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {order.first_name || order.customer_first_name || 'Customer'}{' '}
                        {order.last_name || order.customer_last_name || ''}
                      </div>
                      {order.delivery_address && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {order.delivery_address}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {order.created_at
                        ? new Date(order.created_at).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : '—'}
                    </td>
                    <td>
                      <span className="meta-chip" style={{ textTransform: 'uppercase' }}>
                        {order.payment_method || 'MOMO'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      GH₵ {parseFloat(order.total_amount || 0).toFixed(2)}
                    </td>
                    <td>
                      <span className={`badge badge-${order.status}`}>
                        {String(order.status).replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        {renderStatusButton(order)}
                        <button
                          type="button"
                          className="btn-outline btn-sm"
                          onClick={() => handleOpenOrderDetails(order)}
                        >
                          <Eye size={15} /> View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-bar">
          <span>
            Showing {orders.length} of {totalCount} orders
          </span>
          <div className="pagination-btns">
            <button
              type="button"
              className="btn-outline btn-sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn-outline btn-sm"
              disabled={orders.length < 10}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Order {selectedOrder.order_number}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Placed {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString() : ''}
                </span>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Status & Handoff PIN */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.875rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Current Status
                  </div>
                  <span className={`badge badge-${selectedOrder.status}`}>
                    {String(selectedOrder.status).replace(/_/g, ' ')}
                  </span>
                </div>

                {selectedOrder.merchant_otp && (
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '0.25rem'
                      }}
                    >
                      <KeyRound size={13} /> Rider Pickup OTP
                    </div>
                    <strong style={{ fontSize: '1.125rem', letterSpacing: '0.1em' }}>
                      {selectedOrder.merchant_otp}
                    </strong>
                  </div>
                )}
              </div>

              {/* Customer & Rider Info */}
              <div className="form-grid-2">
                <div
                  style={{
                    padding: '0.875rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                    CUSTOMER
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>
                    {selectedOrder.customer_first_name || selectedOrder.first_name || 'Customer'}{' '}
                    {selectedOrder.customer_last_name || selectedOrder.last_name || ''}
                  </div>
                  {selectedOrder.customer_phone && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Phone size={13} /> {selectedOrder.customer_phone}
                    </div>
                  )}
                  {selectedOrder.delivery_address && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <MapPin size={13} /> {selectedOrder.delivery_address}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    padding: '0.875rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                    ASSIGNED RIDER
                  </div>
                  {selectedOrder.rider_first_name ? (
                    <>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <Bike size={15} /> {selectedOrder.rider_first_name} {selectedOrder.rider_last_name}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <Phone size={13} /> {selectedOrder.rider_phone}
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Clock size={14} /> Rider broadcasts when order is marked Ready
                    </div>
                  )}
                </div>
              </div>

              {selectedOrder.customer_note && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    fontSize: '0.8125rem',
                    color: '#92400e'
                  }}
                >
                  <strong>Customer Note:</strong> {selectedOrder.customer_note}
                </div>
              )}

              {/* Order Line Items */}
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.625rem' }}>
                  Order Items
                </h4>
                <div
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden'
                  }}
                >
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div
                      key={item.id || idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        borderBottom:
                          idx < (selectedOrder.items || []).length - 1
                            ? '1px solid var(--border-color)'
                            : 'none'
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 700, marginRight: '0.5rem' }}>{item.quantity}x</span>
                        <span style={{ fontWeight: 500 }}>{item.item_name}</span>
                      </div>
                      <span style={{ fontWeight: 600 }}>
                        GH₵ {(parseFloat(item.price || 0) * parseInt(item.quantity || 1, 10)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-color)',
                  fontSize: '1rem',
                  fontWeight: 800
                }}
              >
                <span>Order Total ({String(selectedOrder.payment_method || 'momo').toUpperCase()})</span>
                <span>GH₵ {parseFloat(selectedOrder.total_amount || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="modal-footer">
              {renderStatusButton(selectedOrder)}
              <button type="button" className="btn-outline" onClick={() => setSelectedOrder(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorOrders;
