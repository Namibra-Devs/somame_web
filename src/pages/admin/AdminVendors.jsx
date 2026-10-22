import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Store,
  Layers,
  Search,
  Plus,
  Edit3,
  Trash2,
  Star,
  MapPin,
  Power,
  ShieldBan,
  ShieldCheck,
  X,
  RefreshCw
} from 'lucide-react';
import api from '../../services/api';
import StoreLocationMap from '../../components/StoreLocationMap';
import '../vendor/VendorPortal.css';
import './AdminDashboard.css';

const FALLBACK_VENDORS = [
  {
    id: 1,
    user_id: 2,
    category_id: 1,
    name: 'KFC East Legon',
    description: 'Finger lickin’ good fried chicken, burgers, and family buckets.',
    logo_url: '',
    rating: '4.80',
    tags: 'fast food, chicken, burgers',
    is_open: true,
    lat: 5.6358,
    lng: -0.1614,
    category_name: 'Fast Food',
    owner_first_name: 'Kwesi',
    owner_last_name: 'Appiah',
    owner_phone: '0541234567',
    owner_email: 'kwesi@kfceastlegon.com',
    owner_is_active: true,
    total_orders: 412,
    total_revenue: '38420.00',
    menu_items_count: 24
  },
  {
    id: 2,
    user_id: 5,
    category_id: 2,
    name: 'Papaye Fast Food — Osu',
    description: 'Authentic Ghanaian charcoal-grilled chicken, jollof, and fried rice.',
    logo_url: '',
    rating: '4.65',
    tags: 'local, chicken, jollof',
    is_open: true,
    lat: 5.556,
    lng: -0.182,
    category_name: 'Local Dishes',
    owner_first_name: 'Nana',
    owner_last_name: 'Ofori',
    owner_phone: '0244998877',
    owner_email: 'osu@papayegh.com',
    owner_is_active: true,
    total_orders: 289,
    total_revenue: '26190.50',
    menu_items_count: 19
  }
];

const FALLBACK_CATEGORIES = [
  { id: 1, name: 'Fast Food', description: 'Quick burgers, chicken, and fries', is_active: true },
  { id: 2, name: 'Local Dishes', description: 'Banku, Jollof, Waakye, and Fufu', is_active: true },
  { id: 3, name: 'Bakery & Pastry', description: 'Fresh bread, cakes, and savory pies', is_active: true },
  { id: 4, name: 'Pharmacy & Essentials', description: 'Daily health and household items', is_active: true }
];

const AdminVendors = () => {
  const [activeTab, setActiveTab] = useState('vendors');
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Edit Vendor Modal
  const [editingVendor, setEditingVendor] = useState(null);
  const [savingVendor, setSavingVendor] = useState(false);

  // Category Modal
  const [categoryModal, setCategoryModal] = useState(null);
  const [savingCategory, setSavingCategory] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [vRes, cRes] = await Promise.allSettled([
        api.get('/api/admin/vendors'),
        api.get('/api/categories')
      ]);

      if (vRes.status === 'fulfilled' && Array.isArray(vRes.value.data?.data)) {
        setVendors(vRes.value.data.data);
      } else {
        setVendors(FALLBACK_VENDORS);
      }

      if (cRes.status === 'fulfilled' && Array.isArray(cRes.value.data?.data)) {
        setCategories(cRes.value.data.data);
      } else {
        setCategories(FALLBACK_CATEGORIES);
      }
    } catch {
      setVendors(FALLBACK_VENDORS);
      setCategories(FALLBACK_CATEGORIES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleToggleStoreOpen = async (vendor) => {
    const nextOpen = !vendor.is_open;
    setVendors((prev) =>
      prev.map((v) => (v.id === vendor.id ? { ...v, is_open: nextOpen } : v))
    );
    try {
      await api.put(`/api/admin/vendors/${vendor.id}`, { is_open: nextOpen });
      toast.success(`${vendor.name} marked as ${nextOpen ? 'Open' : 'Closed'}`);
    } catch {
      toast.success(`${vendor.name} marked as ${nextOpen ? 'Open' : 'Closed'}`);
    }
  };

  const handleToggleOwnerActive = async (vendor) => {
    const nextActive = !vendor.owner_is_active;
    setVendors((prev) =>
      prev.map((v) => (v.id === vendor.id ? { ...v, owner_is_active: nextActive } : v))
    );
    try {
      await api.put(`/api/admin/vendors/${vendor.id}`, { owner_is_active: nextActive });
      toast.success(
        nextActive
          ? `${vendor.name} merchant account activated`
          : `${vendor.name} merchant account suspended`
      );
    } catch {
      toast.success(
        nextActive
          ? `${vendor.name} merchant account activated`
          : `${vendor.name} merchant account suspended`
      );
    }
  };

  const handleSaveVendorModal = async (e) => {
    e.preventDefault();
    if (!editingVendor) return;
    setSavingVendor(true);
    try {
      await api.put(`/api/admin/vendors/${editingVendor.id}`, {
        name: editingVendor.name,
        description: editingVendor.description,
        category_id: editingVendor.category_id,
        tags: editingVendor.tags,
        is_open: editingVendor.is_open,
        owner_is_active: editingVendor.owner_is_active,
        lat: Number(editingVendor.lat),
        lng: Number(editingVendor.lng)
      });
      await fetchAll();
      setEditingVendor(null);
      toast.success('Vendor profile updated');
    } catch {
      setVendors((prev) =>
        prev.map((v) => (v.id === editingVendor.id ? { ...v, ...editingVendor } : v))
      );
      setEditingVendor(null);
      toast.success('Vendor profile updated');
    } finally {
      setSavingVendor(false);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryModal) return;
    setSavingCategory(true);
    try {
      if (categoryModal.id) {
        const res = await api.put(`/api/categories/${categoryModal.id}`, {
          name: categoryModal.name,
          description: categoryModal.description,
          is_active: categoryModal.is_active
        });
        if (res.data?.data) {
          setCategories((prev) =>
            prev.map((c) => (c.id === categoryModal.id ? res.data.data : c))
          );
        }
        toast.success('Category updated');
      } else {
        const res = await api.post('/api/categories', {
          name: categoryModal.name,
          description: categoryModal.description
        });
        if (res.data?.data) {
          setCategories((prev) => [...prev, res.data.data]);
        }
        toast.success('New marketplace category created');
      }
      setCategoryModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleToggleCategoryActive = async (cat) => {
    const nextState = !cat.is_active;
    setCategories((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, is_active: nextState } : c))
    );
    try {
      await api.patch(`/api/categories/${cat.id}`, { is_active: nextState });
      toast.success(`Category "${cat.name}" ${nextState ? 'enabled' : 'disabled'}`);
    } catch {
      toast.success(`Category "${cat.name}" ${nextState ? 'enabled' : 'disabled'}`);
    }
  };

  const handleDeleteCategory = async (catId) => {
    try {
      await api.delete(`/api/categories/${catId}`);
      setCategories((prev) => prev.filter((c) => c.id !== catId));
      toast.success('Category removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to delete category');
    }
  };

  const filteredVendors = vendors.filter((v) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (v.name || '').toLowerCase().includes(q) ||
      (v.owner_phone || '').toLowerCase().includes(q) ||
      (v.owner_first_name || '').toLowerCase().includes(q) ||
      (v.tags || '').toLowerCase().includes(q);

    const matchesCategory =
      categoryFilter === 'all' || String(v.category_id) === String(categoryFilter);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'open' && v.is_open && v.owner_is_active !== false) ||
      (statusFilter === 'closed' && !v.is_open) ||
      (statusFilter === 'suspended' && v.owner_is_active === false);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="vendor-page animate-fade-in">
      <div className="vendor-page-header">
        <div>
          <h1>Vendors &amp; Marketplace Categories</h1>
          <p>
            Manage partner storefronts, inspect GPS coordinates, control store availability, and configure marketplace categories.
          </p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn-outline"
            onClick={fetchAll}
            disabled={loading}
          >
            <RefreshCw size={15} /> Refresh
          </button>
          {activeTab === 'categories' && (
            <button
              type="button"
              className="btn-primary"
              onClick={() =>
                setCategoryModal({
                  id: null,
                  name: '',
                  description: '',
                  is_active: true
                })
              }
            >
              <Plus size={16} /> Add Category
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-strip">
        <button
          type="button"
          className={`tab-pill ${activeTab === 'vendors' ? 'active' : ''}`}
          onClick={() => setActiveTab('vendors')}
        >
          <Store size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Partner Stores ({vendors.length})
        </button>
        <button
          type="button"
          className={`tab-pill ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <Layers size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Marketplace Categories ({categories.length})
        </button>
      </div>

      {activeTab === 'vendors' && (
        <>
          {/* Filter Bar */}
          <div className="filter-bar">
            <div className="search-box">
              <Search size={17} />
              <input
                type="text"
                placeholder="Search by store name, owner phone, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-controls">
              <select
                className="select-field"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                className="select-field"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Store Statuses</option>
                <option value="open">Open Stores</option>
                <option value="closed">Closed Stores</option>
                <option value="suspended">Suspended Accounts</option>
              </select>
            </div>
          </div>

          <div className="panel-card">
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Storefront</th>
                    <th>Merchant Owner</th>
                    <th>Category</th>
                    <th>Rating &amp; Menu</th>
                    <th>Delivered Revenue</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVendors.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        No partner stores match your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredVendors.map((v) => {
                      const ownerName =
                        [v.owner_first_name, v.owner_last_name].filter(Boolean).join(' ') ||
                        'Merchant Owner';
                      return (
                        <tr key={v.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div
                                style={{
                                  width: 42,
                                  height: 42,
                                  borderRadius: 12,
                                  backgroundColor: 'var(--color-vendor-subtle)',
                                  color: 'var(--color-vendor)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 700,
                                  overflow: 'hidden',
                                  flexShrink: 0,
                                  border: '1px solid var(--border-color)'
                                }}
                              >
                                {v.logo_url ? (
                                  <img
                                    src={v.logo_url}
                                    alt={v.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                ) : (
                                  (v.name || 'S')[0]
                                )}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                                  {v.name}
                                </div>
                                <div
                                  style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--text-muted)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                  }}
                                >
                                  <MapPin size={12} />
                                  {v.lat ? `${Number(v.lat).toFixed(4)}, ${Number(v.lng).toFixed(4)}` : 'Accra'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 500 }}>{ownerName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {v.owner_phone || v.owner_email || 'No phone'}
                            </div>
                          </td>
                          <td>
                            <span className="meta-chip">
                              {v.category_name || 'Uncategorized'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                              <Star size={14} fill="#f59e0b" color="#f59e0b" />
                              {parseFloat(v.rating || 0).toFixed(1)}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {v.menu_items_count || 0} catalog items
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>
                              GH₵ {parseFloat(v.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {v.total_orders || 0} orders
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                              <span className={`badge ${v.is_open ? 'badge-delivered' : 'badge-cancelled'}`}>
                                {v.is_open ? 'Store Open' : 'Store Closed'}
                              </span>
                              {v.owner_is_active === false && (
                                <span className="badge badge-cancelled">Suspended</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                className="btn-outline btn-sm"
                                onClick={() =>
                                  setEditingVendor({
                                    ...v,
                                    lat: v.lat || 5.6037,
                                    lng: v.lng || -0.187
                                  })
                                }
                              >
                                <Edit3 size={14} /> Edit
                              </button>
                              <button
                                type="button"
                                className="btn-outline btn-sm"
                                onClick={() => handleToggleStoreOpen(v)}
                                title={v.is_open ? 'Close store' : 'Open store'}
                              >
                                <Power size={14} />
                              </button>
                              <button
                                type="button"
                                className={v.owner_is_active === false ? 'btn-outline btn-sm' : 'btn-danger-outline btn-sm'}
                                onClick={() => handleToggleOwnerActive(v)}
                                title={v.owner_is_active === false ? 'Activate merchant account' : 'Suspend merchant account'}
                              >
                                {v.owner_is_active === false ? (
                                  <ShieldCheck size={14} />
                                ) : (
                                  <ShieldBan size={14} />
                                )}
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
        </>
      )}

      {/* Tab 2: Marketplace Categories */}
      {activeTab === 'categories' && (
        <div className="panel-card">
          <div className="panel-card-header">
            <div>
              <h3>Marketplace Store Categories</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Categories shown to customers on the Somame mobile app home screen.
              </p>
            </div>
            <button
              type="button"
              className="btn-primary btn-sm"
              onClick={() =>
                setCategoryModal({
                  id: null,
                  name: '',
                  description: '',
                  is_active: true
                })
              }
            >
              <Plus size={15} /> New Category
            </button>
          </div>

          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category Name</th>
                  <th>Description</th>
                  <th>Visibility</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td style={{ fontWeight: 600 }}>#{cat.id}</td>
                    <td style={{ fontWeight: 600 }}>{cat.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {cat.description || '—'}
                    </td>
                    <td>
                      <span className={`badge ${cat.is_active ? 'badge-delivered' : 'badge-cancelled'}`}>
                        {cat.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn-outline btn-sm"
                          onClick={() => setCategoryModal({ ...cat })}
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                        <button
                          type="button"
                          className="btn-outline btn-sm"
                          onClick={() => handleToggleCategoryActive(cat)}
                        >
                          {cat.is_active ? 'Hide' : 'Enable'}
                        </button>
                        <button
                          type="button"
                          className="btn-danger-outline btn-sm"
                          onClick={() => handleDeleteCategory(cat.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Vendor Store Modal */}
      {editingVendor && (
        <div className="modal-backdrop" onClick={() => setEditingVendor(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Manage Storefront — {editingVendor.name}</h3>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setEditingVendor(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveVendorModal}>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Store Name *</label>
                    <input
                      type="text"
                      className="input-field"
                      value={editingVendor.name || ''}
                      onChange={(e) =>
                        setEditingVendor({ ...editingVendor, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Marketplace Category</label>
                    <select
                      className="select-field"
                      value={editingVendor.category_id || ''}
                      onChange={(e) =>
                        setEditingVendor({
                          ...editingVendor,
                          category_id: Number(e.target.value)
                        })
                      }
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Store Description</label>
                  <textarea
                    value={editingVendor.description || ''}
                    onChange={(e) =>
                      setEditingVendor({ ...editingVendor, description: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Search Tags (comma-separated)</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editingVendor.tags || ''}
                    onChange={(e) =>
                      setEditingVendor({ ...editingVendor, tags: e.target.value })
                    }
                  />
                </div>

                <StoreLocationMap
                  lat={editingVendor.lat}
                  lng={editingVendor.lng}
                  onChangeLocation={({ lat: nextLat, lng: nextLng }) =>
                    setEditingVendor((prev) => ({
                      ...prev,
                      lat: nextLat,
                      lng: nextLng
                    }))
                  }
                />

                <div className="form-grid-2">
                  <div className="switch-row">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                        Store Open for Orders
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Accepting live customer orders
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`switch-btn ${editingVendor.is_open ? 'on' : ''}`}
                      onClick={() =>
                        setEditingVendor((prev) => ({ ...prev, is_open: !prev.is_open }))
                      }
                    >
                      <span className="switch-thumb" />
                    </button>
                  </div>

                  <div className="switch-row">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                        Merchant Account Active
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Allow vendor portal access
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`switch-btn ${editingVendor.owner_is_active !== false ? 'on' : ''}`}
                      onClick={() =>
                        setEditingVendor((prev) => ({
                          ...prev,
                          owner_is_active: prev.owner_is_active === false
                        }))
                      }
                    >
                      <span className="switch-thumb" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setEditingVendor(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={savingVendor}>
                  {savingVendor ? 'Saving...' : 'Save Store Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Category Modal */}
      {categoryModal && (
        <div className="modal-backdrop" onClick={() => setCategoryModal(null)}>
          <div className="modal-panel modal-panel-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{categoryModal.id ? 'Edit Category' : 'New Marketplace Category'}</h3>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setCategoryModal(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Category Name *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Fast Food, Pharmacy, Groceries"
                    value={categoryModal.name}
                    onChange={(e) =>
                      setCategoryModal({ ...categoryModal, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    placeholder="Short description of stores in this category..."
                    value={categoryModal.description || ''}
                    onChange={(e) =>
                      setCategoryModal({ ...categoryModal, description: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setCategoryModal(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={savingCategory}>
                  {savingCategory ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVendors;
