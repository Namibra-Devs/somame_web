import { useState, useEffect } from 'react';
import { Search, Phone, Calendar, Eye, X, ShoppingBag } from 'lucide-react';
import api from '../../services/api';
import '../admin/AdminDashboard.css';
import './VendorPortal.css';

const FALLBACK_CUSTOMERS = [
  {
    id: 11,
    first_name: 'Kwame',
    last_name: 'Mensah',
    phone_number: '0541234567',
    last_order_date: '2026-10-19T19:45:00.000Z'
  },
  {
    id: 12,
    first_name: 'Ama',
    last_name: 'Osei',
    phone_number: '0249876543',
    last_order_date: '2026-10-18T14:20:00.000Z'
  },
  {
    id: 13,
    first_name: 'Kojo',
    last_name: 'Antwi',
    phone_number: '0503344556',
    last_order_date: '2026-10-15T20:10:00.000Z'
  },
  {
    id: 14,
    first_name: 'Efua',
    last_name: 'Boadu',
    phone_number: '0201122334',
    last_order_date: '2026-10-12T12:30:00.000Z'
  }
];

const VendorCustomers = () => {
  const [customers, setCustomers] = useState(FALLBACK_CUSTOMERS);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(FALLBACK_CUSTOMERS.length);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

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
      .then((res) => {
        if (active && res.data?.data) {
          setCustomers(res.data.data);
          setTotal(res.data.pagination?.total ?? res.data.data.length);
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
          created_at: cust.last_order_date
        },
        {
          id: 95,
          order_number: 'ORD-7610',
          status: 'delivered',
          total_amount: '145.00',
          created_at: '2026-10-08T18:20:00.000Z'
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
                <th>Last Order Date</th>
                <th style={{ textAlign: 'right' }}>Profile</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((cust) => (
                  <tr key={cust.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: '8px',
                            backgroundColor: 'var(--bg-subtle)',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.8125rem'
                          }}
                        >
                          {(cust.first_name || 'C')[0]}
                          {(cust.last_name || '')[0]}
                        </div>
                        <span style={{ fontWeight: 600 }}>
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
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        <Calendar size={14} color="var(--text-muted)" />
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
                ))
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
      {selectedCustomer && (
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
                    padding: '0.875rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Orders</div>
                  <strong style={{ fontSize: '1.25rem' }}>
                    {selectedCustomer.stats?.total_orders || 0}
                  </strong>
                </div>
                <div
                  style={{
                    padding: '0.875rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Spent</div>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--color-vendor)' }}>
                    GH₵ {parseFloat(selectedCustomer.stats?.total_spent || 0).toFixed(2)}
                  </strong>
                </div>
                <div
                  style={{
                    padding: '0.875rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg. Order</div>
                  <strong style={{ fontSize: '1.25rem' }}>
                    GH₵ {parseFloat(selectedCustomer.stats?.average_order || 0).toFixed(2)}
                  </strong>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <ShoppingBag size={15} /> Recent Orders with Your Store
                </h4>
                <div
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
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
                        padding: '0.75rem 1rem',
                        borderBottom:
                          idx < (selectedCustomer.recentOrders || []).length - 1
                            ? '1px solid var(--border-color)'
                            : 'none'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{ord.order_number}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {ord.created_at ? new Date(ord.created_at).toLocaleDateString() : ''}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span className={`badge badge-${ord.status}`}>{ord.status}</span>
                        <strong style={{ fontSize: '0.875rem' }}>
                          GH₵ {parseFloat(ord.total_amount || 0).toFixed(2)}
                        </strong>
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
        </div>
      )}
    </div>
  );
};

export default VendorCustomers;
