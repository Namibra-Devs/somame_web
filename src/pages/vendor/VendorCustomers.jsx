import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  Phone,
  Calendar,
  Eye,
  X,
  ShoppingBag,
  KeyRound,
  MapPin,
  Bike,
  Clock,
  Utensils,
  ArrowLeft
} from 'lucide-react';
import api from '../../services/api';
import { formatTimeAgo } from '../../utils/timeAgo';
import '../admin/AdminDashboard.css';
import './VendorPortal.css';

const FALLBACK_CUSTOMERS = [
  {
    id: 11,
    first_name: 'Kwame',
    last_name: 'Mensah',
    phone_number: '0541234567',
    date_joined: '2026-03-10T09:00:00.000Z',
    last_order_date: '2026-10-21T15:35:00.000Z'
  },
  {
    id: 12,
    first_name: 'Ama',
    last_name: 'Osei',
    phone_number: '0249876543',
    date_joined: '2026-05-14T11:30:00.000Z',
    last_order_date: '2026-10-20T18:20:00.000Z'
  },
  {
    id: 13,
    first_name: 'Kojo',
    last_name: 'Antwi',
    phone_number: '0503344556',
    date_joined: '2026-07-02T16:15:00.000Z',
    last_order_date: '2026-10-18T20:10:00.000Z'
  },
  {
    id: 14,
    first_name: 'Efua',
    last_name: 'Boadu',
    phone_number: '0201122334',
    date_joined: '2026-08-22T10:05:00.000Z',
    last_order_date: '2026-10-15T12:30:00.000Z'
  }
];

const VendorCustomers = () => {
  const [customers, setCustomers] = useState(FALLBACK_CUSTOMERS);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(FALLBACK_CUSTOMERS.length);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    let active = true;
    api
      .get('/api/vendors/me/customers', {
        params: {
          search: search || undefined,
          date_filter: dateFilter || undefined,
          page,
          limit: 10
        }
      })
      .then(async (res) => {
        if (!active || !res.data?.data) return;
        const list = res.data.data;
        setCustomers(list);
        setTotal(res.data.pagination?.total ?? list.length);

        // If the running API server hasn't been restarted yet and omits date_joined on list,
        // hydrate date_joined from the existing customer details endpoint (/customers/:id)
        const needsHydration = list.some((c) => !c.date_joined && !c.created_at);
        if (needsHydration) {
          const hydrated = await Promise.all(
            list.map(async (c) => {
              if (c.date_joined || c.created_at) return c;
              try {
                const detailRes = await api.get(`/api/vendors/me/customers/${c.id}`);
                const dateJoined = detailRes.data?.data?.stats?.date_joined;
                return dateJoined ? { ...c, date_joined: dateJoined } : c;
              } catch {
                return c;
              }
            })
          );
          if (active) {
            setCustomers(hydrated);
          }
        }
      })
      .catch(() => {
        if (!active) return;
        const q = search.toLowerCase();
        const filtered = FALLBACK_CUSTOMERS.filter(
          (c) =>
            !q ||
            `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
            (c.phone_number || '').includes(q)
        );
        setCustomers(filtered);
        setTotal(filtered.length);
      });
    return () => {
      active = false;
    };
  }, [search, dateFilter, page]);

  const handleOpenCustomer = async (cust) => {
    setSelectedOrder(null);
    const fallbackDetails = {
      stats: {
        id: cust.id,
        first_name: cust.first_name,
        last_name: cust.last_name,
        phone_number: cust.phone_number,
        date_joined: '2026-03-10T09:00:00.000Z',
        total_orders: 8,
        total_spent: '940.00',
        average_order: '117.50',
        last_order: cust.last_order_date
      },
      recentOrders: [
        {
          id: 101,
          order_number: 'ORD-7832',
          status: 'delivered',
          total_amount: '120.00',
          payment_method: 'momo',
          delivery_address: 'Osu Oxford Street, Near Danquah Circle',
          customer_note: 'Please include extra chilli sauce and tissues.',
          merchant_otp: '4829',
          created_at: cust.last_order_date,
          items: [
            {
              id: 1,
              item_name: 'Streetwise Two with Spicy Wings',
              quantity: 2,
              price: '49.00',
              image_url:
                'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=200&auto=format&fit=crop&q=80'
            },
            {
              id: 2,
              item_name: 'Large Coleslaw Tub',
              quantity: 1,
              price: '20.00',
              image_url:
                'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&auto=format&fit=crop&q=80'
            }
          ]
        },
        {
          id: 95,
          order_number: 'ORD-7610',
          status: 'delivered',
          total_amount: '145.00',
          payment_method: 'card',
          delivery_address: 'East Legon, Boundary Road Apt 4B',
          merchant_otp: '7319',
          created_at: '2026-10-08T18:20:00.000Z',
          items: [
            {
              id: 3,
              item_name: 'Jollof Rice & Grilled Quarter Chicken',
              quantity: 2,
              price: '62.00',
              image_url:
                'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=200&auto=format&fit=crop&q=80'
            }
          ]
        }
      ]
    };

    setSelectedCustomer(fallbackDetails);
    try {
      const res = await api.get(`/api/vendors/me/customers/${cust.id}`);
      if (res.data?.data) {
        setSelectedCustomer(res.data.data);
      }
    } catch {
      // Keep fallback details when in preview mode
    }
  };

  const handleOpenOrderDetails = async (ord) => {
    const fallbackOrder = {
      ...ord,
      customer_first_name: selectedCustomer?.stats?.first_name || 'Customer',
      customer_last_name: selectedCustomer?.stats?.last_name || '',
      customer_phone: selectedCustomer?.stats?.phone_number || '',
      payment_method: ord.payment_method || 'momo',
      delivery_address: ord.delivery_address || 'Accra, Ghana',
      items: ord.items || [
        {
          id: 1,
          item_name: 'Streetwise Two with Spicy Wings',
          quantity: 2,
          price: '49.00',
          image_url:
            'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=200&auto=format&fit=crop&q=80'
        }
      ]
    };

    setSelectedOrder(fallbackOrder);
    try {
      const res = await api.get(`/api/vendors/me/orders/${ord.id}`);
      if (res.data?.data) {
        setSelectedOrder(res.data.data);
      }
    } catch {
      // Keep fallback order details when in preview mode
    }
  };

  return (
    <div className="vendor-page animate-fade-in">
      <div className="vendor-page-header">
        <div>
          <h1>Store Customers</h1>
          <p>View customers who have ordered from your store and inspect their order history.</p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <Search size={17} />
          <input
            type="text"
            placeholder="Search by customer name or phone number..."
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
            <option value="">All Time</option>
            <option value="today">Ordered Today</option>
            <option value="this_week">Ordered This Week</option>
            <option value="this_month">Ordered This Month</option>
          </select>
        </div>
      </div>

      <div className="panel-card">
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Phone Number</th>
                <th>Date Joined</th>
                <th>Last Order Date</th>
                <th style={{ textAlign: 'right' }}>Profile</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((cust) => {
                  const joinedAt = cust.date_joined || cust.created_at;
                  return (
                  <tr key={cust.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            backgroundColor: 'var(--bg-subtle)',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 600,
                            fontSize: '0.8125rem'
                          }}
                        >
                          {(cust.first_name || 'C')[0]}
                          {(cust.last_name || '')[0]}
                        </div>
                        <span style={{ fontWeight: 500 }}>
                          {cust.first_name || 'Customer'} {cust.last_name || ''}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
                        <Phone size={14} color="var(--text-muted)" />
                        {cust.phone_number}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: '0.84375rem', color: 'var(--text-main)' }}>
                        {joinedAt
                          ? new Date(joinedAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : '—'}
                      </div>
                      {joinedAt && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {formatTimeAgo(joinedAt)}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: '0.84375rem', color: 'var(--text-main)' }}>
                        {formatTimeAgo(cust.last_order_date)}
                      </div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <Calendar size={12} color="var(--text-muted)" />
                        {cust.last_order_date
                          ? new Date(cust.last_order_date).toLocaleDateString()
                          : '—'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn-outline btn-sm"
                        onClick={() => handleOpenCustomer(cust)}
                      >
                        <Eye size={14} /> View History
                      </button>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-bar">
          <span>
            Showing {customers.length} of {total} customers
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
              disabled={customers.length < 10}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer &&
        !selectedOrder &&
        createPortal(
          <div className="modal-backdrop" onClick={() => setSelectedCustomer(null)}>
            <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h3>
                    {selectedCustomer.stats?.first_name} {selectedCustomer.stats?.last_name}
                  </h3>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {selectedCustomer.stats?.phone_number}
                  </span>
                </div>
                <button type="button" className="icon-btn" onClick={() => setSelectedCustomer(null)}>
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  <div
                    style={{
                      padding: '0.9375rem',
                      borderRadius: '16px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-subtle)'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Orders</div>
                    <strong style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                      {selectedCustomer.stats?.total_orders || 0}
                    </strong>
                  </div>
                  <div
                    style={{
                      padding: '0.9375rem',
                      borderRadius: '16px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-subtle)'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Spent</div>
                    <strong style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--color-vendor)' }}>
                      GH₵ {parseFloat(selectedCustomer.stats?.total_spent || 0).toFixed(2)}
                    </strong>
                  </div>
                  <div
                    style={{
                      padding: '0.9375rem',
                      borderRadius: '16px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-subtle)'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg. Order</div>
                    <strong style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                      GH₵ {parseFloat(selectedCustomer.stats?.average_order || 0).toFixed(2)}
                    </strong>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <ShoppingBag size={15} /> Recent Orders with Your Store
                  </h4>
                  <div
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: '16px',
                      overflow: 'hidden'
                    }}
                  >
                    {(selectedCustomer.recentOrders || []).map((ord, idx) => (
                      <div
                        key={ord.id || idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.8125rem 1rem',
                          borderBottom:
                            idx < (selectedCustomer.recentOrders || []).length - 1
                              ? '1px solid var(--border-color)'
                              : 'none'
                        }}
                      >
                        <div>
                          <button
                            type="button"
                            onClick={() => handleOpenOrderDetails(ord)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.375rem',
                              fontWeight: 600,
                              fontSize: '0.875rem',
                              color: 'var(--color-brand)',
                              padding: '0.15rem 0',
                              textDecoration: 'underline',
                              textUnderlineOffset: '3px'
                            }}
                            title="Click to view full order details"
                          >
                            {ord.order_number}
                          </button>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {formatTimeAgo(ord.created_at)}
                            {ord.created_at
                              ? ` • ${new Date(ord.created_at).toLocaleDateString()}`
                              : ''}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span className={`badge badge-${ord.status}`}>
                            {String(ord.status || '').replace(/_/g, ' ')}
                          </span>
                          <strong style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                            GH₵ {parseFloat(ord.total_amount || 0).toFixed(2)}
                          </strong>
                          <button
                            type="button"
                            className="btn-outline btn-sm"
                            onClick={() => handleOpenOrderDetails(ord)}
                          >
                            <Eye size={13} /> Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setSelectedCustomer(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Full Order Details Modal when clicking a customer's recent order ID */}
      {selectedOrder &&
        createPortal(
          <div className="modal-backdrop" onClick={() => setSelectedOrder(null)}>
            <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h3>Order {selectedOrder.order_number}</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Placed {formatTimeAgo(selectedOrder.created_at)}
                    {selectedOrder.created_at
                      ? ` • ${new Date(selectedOrder.created_at).toLocaleString()}`
                      : ''}
                  </span>
                </div>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setSelectedOrder(null)}
                  aria-label="Close order details"
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
                    borderRadius: '16px',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        marginBottom: '0.25rem'
                      }}
                    >
                      Current Status
                    </div>
                    <span className={`badge badge-${selectedOrder.status}`}>
                      {String(selectedOrder.status || '').replace(/_/g, ' ')}
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
                      padding: '0.875rem 1rem',
                      borderRadius: '16px',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        marginBottom: '0.375rem'
                      }}
                    >
                      CUSTOMER
                    </div>
                    <div style={{ fontWeight: 500, fontSize: '0.9375rem' }}>
                      {selectedOrder.customer_first_name ||
                        selectedCustomer?.stats?.first_name ||
                        'Customer'}{' '}
                      {selectedOrder.customer_last_name ||
                        selectedCustomer?.stats?.last_name ||
                        ''}
                    </div>
                    {(selectedOrder.customer_phone || selectedCustomer?.stats?.phone_number) && (
                      <div
                        style={{
                          fontSize: '0.8125rem',
                          color: 'var(--text-secondary)',
                          marginTop: '0.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem'
                        }}
                      >
                        <Phone size={13} />{' '}
                        {selectedOrder.customer_phone || selectedCustomer?.stats?.phone_number}
                      </div>
                    )}
                    {selectedOrder.delivery_address && (
                      <div
                        style={{
                          fontSize: '0.8125rem',
                          color: 'var(--text-muted)',
                          marginTop: '0.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem'
                        }}
                      >
                        <MapPin size={13} /> {selectedOrder.delivery_address}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      padding: '0.875rem 1rem',
                      borderRadius: '16px',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        marginBottom: '0.375rem'
                      }}
                    >
                      ASSIGNED RIDER
                    </div>
                    {selectedOrder.rider_first_name ? (
                      <>
                        <div
                          style={{
                            fontWeight: 500,
                            fontSize: '0.9375rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem'
                          }}
                        >
                          <Bike size={15} /> {selectedOrder.rider_first_name}{' '}
                          {selectedOrder.rider_last_name}
                        </div>
                        <div
                          style={{
                            fontSize: '0.8125rem',
                            color: 'var(--text-secondary)',
                            marginTop: '0.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem'
                          }}
                        >
                          <Phone size={13} /> {selectedOrder.rider_phone}
                        </div>
                      </>
                    ) : (
                      <div
                        style={{
                          fontSize: '0.8125rem',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem'
                        }}
                      >
                        <Clock size={14} /> No rider assigned
                      </div>
                    )}
                  </div>
                </div>

                {selectedOrder.customer_note && (
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '14px',
                      backgroundColor: '#fef7e0',
                      fontSize: '0.8125rem',
                      color: '#b06000'
                    }}
                  >
                    <strong>Customer Note:</strong> {selectedOrder.customer_note}
                  </div>
                )}

                {/* Order Line Items with Item Images */}
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.625rem' }}>
                    Order Items
                  </h4>
                  <div
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    {(selectedOrder.items || []).map((item, idx) => (
                      <div
                        key={item.id || idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.875rem',
                          padding: '0.75rem 1rem',
                          borderBottom:
                            idx < (selectedOrder.items || []).length - 1
                              ? '1px solid var(--border-color)'
                              : 'none'
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.875rem',
                            minWidth: 0
                          }}
                        >
                          <div
                            style={{
                              width: 48,
                              height: 48,
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
                                alt={item.item_name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <Utensils size={18} color="var(--text-muted)" />
                            )}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: 500,
                                color: 'var(--text-main)',
                                fontSize: '0.9375rem'
                              }}
                            >
                              {item.item_name}
                            </div>
                            <div
                              style={{
                                fontSize: '0.78rem',
                                color: 'var(--text-muted)',
                                marginTop: '0.125rem'
                              }}
                            >
                              Qty: <strong>{item.quantity}</strong> &times; GH₵{' '}
                              {parseFloat(item.price || 0).toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <span
                          style={{
                            fontWeight: 600,
                            color: 'var(--text-main)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          GH₵{' '}
                          {(
                            parseFloat(item.price || 0) * parseInt(item.quantity || 1, 10)
                          ).toFixed(2)}
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
                    fontWeight: 600
                  }}
                >
                  <span>
                    Order Total ({String(selectedOrder.payment_method || 'momo').toUpperCase()})
                  </span>
                  <span>GH₵ {parseFloat(selectedOrder.total_amount || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setSelectedOrder(null)}
                >
                  <ArrowLeft size={15} /> Back to Customer
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setSelectedOrder(null);
                    setSelectedCustomer(null);
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default VendorCustomers;
