import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  FolderPlus,
  Utensils,
  X,
  Check
} from 'lucide-react';
import api from '../../services/api';
import './VendorPortal.css';

const FALLBACK_CATEGORIES = [
  { id: 1, name: 'Bucket & Share Meals', description: 'Family and group fried chicken buckets' },
  { id: 2, name: 'Streetwise Specials', description: 'Everyday value combos with rice or fries' },
  { id: 3, name: 'Burgers & Wraps', description: 'Crispy chicken burgers and toasted twisters' },
  { id: 4, name: 'Sides & Drinks', description: 'Fries, coleslaw, wings, and chilled beverages' }
];

const FALLBACK_ITEMS = [
  {
    id: 1,
    menu_category_id: 2,
    name: 'Streetwise Two with Spicy Wings',
    description: '2 pcs crispy chicken, seasoned rice or regular fries, and 2 spicy hot wings.',
    price: 55.0,
    size: 'Regular',
    sizes: [
      { size: 'Regular', price: 55.0 },
      { size: 'Large', price: 70.0 }
    ],
    extras: [{ name: 'Extra Cheese Slice', price: 8.0 }],
    quantity: 50,
    is_in_stock: true,
    image_url: ''
  },
  {
    id: 2,
    menu_category_id: 2,
    name: 'Jollof Rice & Grilled Quarter Chicken',
    description: 'Smoky Ghanaian jollof rice served with flame-grilled quarter chicken and shito.',
    price: 62.0,
    size: 'Standard',
    sizes: [],
    extras: [{ name: 'Fried Plantain (Kelewele)', price: 15.0 }],
    quantity: 35,
    is_in_stock: true,
    image_url: ''
  },
  {
    id: 3,
    menu_category_id: 3,
    name: 'Zinger Burger Deluxe Meal',
    description: 'Spicy crispy chicken fillet burger with lettuce, cheese, fries, and 330ml soda.',
    price: 76.0,
    size: 'Combo',
    sizes: [],
    extras: [],
    quantity: 28,
    is_in_stock: true,
    image_url: ''
  },
  {
    id: 4,
    menu_category_id: 1,
    name: '9-Piece Bucket Share Meal',
    description: '9 pieces of original or spicy chicken with 4 regular fries and 1.5L bottle drink.',
    price: 185.0,
    size: 'Family',
    sizes: [],
    extras: [],
    quantity: 15,
    is_in_stock: false,
    image_url: ''
  }
];

const EMPTY_ITEM_FORM = {
  id: null,
  menu_category_id: '',
  name: '',
  description: '',
  price: '',
  size: 'Regular',
  quantity: 25,
  image_url: '',
  is_in_stock: true,
  sizes: [],
  extras: []
};

const VendorMenu = () => {
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [items, setItems] = useState(FALLBACK_ITEMS);
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [search, setSearch] = useState('');

  // Category Modal State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ id: null, name: '', description: '' });

  // Item Modal State
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemForm, setItemForm] = useState(EMPTY_ITEM_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get('/api/vendors/me/menu-categories'),
      api.get('/api/vendors/me/menu-items')
    ])
      .then(([catRes, itemRes]) => {
        if (!active) return;
        if (catRes.data?.data) setCategories(catRes.data.data);
        if (itemRes.data?.data) setItems(itemRes.data.data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategoryId === 'all' ||
      String(item.menu_category_id) === String(selectedCategoryId);
    const matchesSearch =
      !search.trim() ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Category CRUD Handlers
  const openNewCategoryModal = () => {
    setCategoryForm({ id: null, name: '', description: '' });
    setCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat) => {
    setCategoryForm({ id: cat.id, name: cat.name, description: cat.description || '' });
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (categoryForm.id) {
        const res = await api.put(`/api/vendors/me/menu-categories/${categoryForm.id}`, {
          name: categoryForm.name,
          description: categoryForm.description
        });
        if (res.data?.data) {
          setCategories((prev) =>
            prev.map((c) => (c.id === categoryForm.id ? res.data.data : c))
          );
        }
      } else {
        const res = await api.post('/api/vendors/me/menu-categories', {
          name: categoryForm.name,
          description: categoryForm.description
        });
        if (res.data?.data) {
          setCategories((prev) => [...prev, res.data.data]);
        }
      }
    } catch {
      // Preview mode fallback
      if (categoryForm.id) {
        setCategories((prev) =>
          prev.map((c) => (c.id === categoryForm.id ? { ...c, ...categoryForm } : c))
        );
      } else {
        setCategories((prev) => [
          ...prev,
          { id: Date.now(), name: categoryForm.name, description: categoryForm.description }
        ]);
      }
    } finally {
      setSaving(false);
      setCategoryModalOpen(false);
    }
  };

  const handleDeleteCategory = async (catId) => {
    try {
      await api.delete(`/api/vendors/me/menu-categories/${catId}`);
    } catch {
      // Preview mode fallback
    }
    setCategories((prev) => prev.filter((c) => c.id !== catId));
    if (String(selectedCategoryId) === String(catId)) {
      setSelectedCategoryId('all');
    }
  };

  // Menu Item CRUD Handlers
  const openNewItemModal = () => {
    setItemForm({
      ...EMPTY_ITEM_FORM,
      menu_category_id:
        selectedCategoryId !== 'all' ? selectedCategoryId : categories[0]?.id || ''
    });
    setImageFile(null);
    setItemModalOpen(true);
  };

  const openEditItemModal = (item) => {
    setItemForm({
      id: item.id,
      menu_category_id: item.menu_category_id || '',
      name: item.name || '',
      description: item.description || '',
      price: item.price ?? '',
      size: item.size || 'Regular',
      quantity: item.quantity ?? 25,
      image_url: item.image_url || '',
      is_in_stock: item.is_in_stock !== false,
      sizes: Array.isArray(item.sizes) ? item.sizes : [],
      extras: Array.isArray(item.extras) ? item.extras : []
    });
    setImageFile(null);
    setItemModalOpen(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      if (itemForm.menu_category_id) formData.append('menu_category_id', itemForm.menu_category_id);
      formData.append('name', itemForm.name);
      formData.append('description', itemForm.description);
      formData.append('price', itemForm.price);
      formData.append('size', itemForm.size);
      formData.append('quantity', itemForm.quantity);
      formData.append('is_in_stock', String(itemForm.is_in_stock));
      if (itemForm.image_url) formData.append('image_url', itemForm.image_url);
      if (imageFile) formData.append('image', imageFile);
      formData.append('sizes', JSON.stringify(itemForm.sizes));
      formData.append('extras', JSON.stringify(itemForm.extras));

      if (itemForm.id) {
        const res = await api.put(`/api/vendors/me/menu-items/${itemForm.id}`, formData);
        if (res.data?.data) {
          setItems((prev) => prev.map((it) => (it.id === itemForm.id ? res.data.data : it)));
        }
      } else {
        const res = await api.post('/api/vendors/me/menu-items', formData);
        if (res.data?.data) {
          setItems((prev) => [res.data.data, ...prev]);
        }
      }
    } catch {
      const payload = {
        ...itemForm,
        id: itemForm.id || Date.now(),
        menu_category_id: Number(itemForm.menu_category_id) || null,
        price: parseFloat(itemForm.price || 0)
      };
      if (itemForm.id) {
        setItems((prev) => prev.map((it) => (it.id === itemForm.id ? payload : it)));
      } else {
        setItems((prev) => [payload, ...prev]);
      }
    } finally {
      setSaving(false);
      setItemModalOpen(false);
    }
  };

  const handleToggleStock = async (item) => {
    const nextStock = !item.is_in_stock;
    setItems((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, is_in_stock: nextStock } : it))
    );
    try {
      await api.put(`/api/vendors/me/menu-items/${item.id}`, {
        is_in_stock: nextStock
      });
    } catch {
      // Keep optimistic toggle in preview mode
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await api.delete(`/api/vendors/me/menu-items/${itemId}`);
    } catch {
      // Preview mode fallback
    }
    setItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  const addSizeRow = () => {
    setItemForm((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { size: '', price: '' }]
    }));
  };

  const addExtraRow = () => {
    setItemForm((prev) => ({
      ...prev,
      extras: [...prev.extras, { name: '', price: '' }]
    }));
  };

  return (
    <div className="vendor-page animate-fade-in">
      <div className="vendor-page-header">
        <div>
          <h1>Menu &amp; Catalog</h1>
          <p>Organize menu categories, manage item pricing, variations, add-ons, and stock status.</p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-outline" onClick={openNewCategoryModal}>
            <FolderPlus size={16} /> New Category
          </button>
          <button type="button" className="btn-vendor" onClick={openNewItemModal}>
            <Plus size={16} /> Add Menu Item
          </button>
        </div>
      </div>

      <div className="menu-layout">
        {/* Left Sidebar: Menu Categories */}
        <div className="panel-card">
          <div className="panel-card-header">
            <h3>Categories</h3>
            <span className="meta-chip">{categories.length}</span>
          </div>

          <div className="category-list">
            <div
              className={`category-item ${selectedCategoryId === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategoryId('all')}
            >
              <div>
                <div className="category-item-title">All Menu Items</div>
                <div className="category-item-sub">{items.length} total items</div>
              </div>
            </div>

            {categories.map((cat) => {
              const count = items.filter(
                (i) => String(i.menu_category_id) === String(cat.id)
              ).length;
              return (
                <div
                  key={cat.id}
                  className={`category-item ${
                    String(selectedCategoryId) === String(cat.id) ? 'active' : ''
                  }`}
                  onClick={() => setSelectedCategoryId(cat.id)}
                >
                  <div>
                    <div className="category-item-title">{cat.name}</div>
                    <div className="category-item-sub">{count} items</div>
                  </div>
                  <div
                    className="category-item-actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="icon-btn"
                      style={{ width: 28, height: 28 }}
                      onClick={() => openEditCategoryModal(cat)}
                      title="Edit Category"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      style={{ width: 28, height: 28, color: 'var(--color-danger)' }}
                      onClick={() => handleDeleteCategory(cat.id)}
                      title="Delete Category"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Area: Menu Items Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="filter-bar">
            <div className="search-box">
              <Search size={17} />
              <input
                type="text"
                placeholder="Search menu items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Showing {filteredItems.length} item{filteredItems.length === 1 ? '' : 's'}
            </span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="panel-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <Utensils size={32} color="var(--text-muted)" style={{ marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>No menu items found</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Add dishes, drinks, or combo meals to this category.
              </p>
              <button type="button" className="btn-vendor" onClick={openNewItemModal}>
                <Plus size={16} /> Add First Item
              </button>
            </div>
          ) : (
            <div className="menu-items-grid">
              {filteredItems.map((item) => {
                const catName =
                  categories.find((c) => String(c.id) === String(item.menu_category_id))?.name ||
                  'Uncategorized';
                return (
                  <div className="menu-item-card" key={item.id}>
                    <div className="menu-item-thumb">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} />
                      ) : (
                        <Utensils size={32} color="var(--text-muted)" />
                      )}
                      <div className="menu-item-stock-tag">
                        <span
                          className={`badge ${
                            item.is_in_stock ? 'badge-active' : 'badge-inactive'
                          }`}
                        >
                          {item.is_in_stock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>

                    <div className="menu-item-body">
                      <div className="menu-item-top">
                        <h4 className="menu-item-name">{item.name}</h4>
                        <span className="menu-item-price">
                          GH₵ {parseFloat(item.price || 0).toFixed(2)}
                        </span>
                      </div>

                      <p className="menu-item-desc">{item.description || 'No description'}</p>

                      <div className="menu-item-meta">
                        <span className="meta-chip">{catName}</span>
                        {item.size && <span className="meta-chip">Size: {item.size}</span>}
                        {Array.isArray(item.sizes) && item.sizes.length > 0 && (
                          <span className="meta-chip">{item.sizes.length} sizes</span>
                        )}
                        {Array.isArray(item.extras) && item.extras.length > 0 && (
                          <span className="meta-chip">{item.extras.length} extras</span>
                        )}
                      </div>

                      <div className="menu-item-footer">
                        <button
                          type="button"
                          className="btn-outline btn-sm"
                          onClick={() => handleToggleStock(item)}
                        >
                          <Check size={14} />
                          {item.is_in_stock ? 'Mark Sold Out' : 'Mark In Stock'}
                        </button>

                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          <button
                            type="button"
                            className="btn-outline btn-sm"
                            onClick={() => openEditItemModal(item)}
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn-danger-outline"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Category Modal */}
      {categoryModalOpen && (
        <div className="modal-backdrop" onClick={() => setCategoryModalOpen(false)}>
          <div
            className="modal-panel"
            style={{ maxWidth: 440 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>{categoryForm.id ? 'Edit Menu Category' : 'New Menu Category'}</h3>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setCategoryModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveCategory}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Category Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Grilled Specials"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description (optional)</label>
                  <textarea
                    placeholder="Short description shown on your store menu..."
                    value={categoryForm.description}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, description: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setCategoryModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-vendor" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Menu Item Modal */}
      {itemModalOpen && (
        <div className="modal-backdrop" onClick={() => setItemModalOpen(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{itemForm.id ? 'Edit Menu Item' : 'Add Menu Item'}</h3>
              <button type="button" className="icon-btn" onClick={() => setItemModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveItem}>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Item Name *</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Jollof & Spicy Chicken"
                      value={itemForm.name}
                      onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Menu Category</label>
                    <select
                      className="select-field"
                      value={itemForm.menu_category_id}
                      onChange={(e) =>
                        setItemForm({ ...itemForm, menu_category_id: e.target.value })
                      }
                    >
                      <option value="">Uncategorized</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Base Price (GH₵) *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input-field"
                      placeholder="0.00"
                      value={itemForm.price}
                      onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Default Size Label</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Regular, Large"
                      value={itemForm.size}
                      onChange={(e) => setItemForm({ ...itemForm, size: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    placeholder="Describe ingredients, portion size, and sides..."
                    value={itemForm.description}
                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Upload Product Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="input-field"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Or Image URL</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="https://..."
                      value={itemForm.image_url}
                      onChange={(e) => setItemForm({ ...itemForm, image_url: e.target.value })}
                    />
                  </div>
                </div>

                {/* Size Variations */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label>Size Variations (optional)</label>
                    <button type="button" className="btn-outline btn-sm" onClick={addSizeRow}>
                      <Plus size={13} /> Add Size
                    </button>
                  </div>
                  {itemForm.sizes.map((s, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.375rem' }}>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Size name (e.g. Large)"
                        value={s.size}
                        onChange={(e) => {
                          const updated = [...itemForm.sizes];
                          updated[idx] = { ...updated[idx], size: e.target.value };
                          setItemForm({ ...itemForm, sizes: updated });
                        }}
                      />
                      <input
                        type="number"
                        step="0.01"
                        className="input-field"
                        placeholder="Price (GH₵)"
                        value={s.price}
                        onChange={(e) => {
                          const updated = [...itemForm.sizes];
                          updated[idx] = { ...updated[idx], price: Number(e.target.value) };
                          setItemForm({ ...itemForm, sizes: updated });
                        }}
                      />
                      <button
                        type="button"
                        className="btn-danger-outline"
                        onClick={() =>
                          setItemForm({
                            ...itemForm,
                            sizes: itemForm.sizes.filter((_, i) => i !== idx)
                          })
                        }
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Extras / Add-ons */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label>Extras &amp; Add-ons (optional)</label>
                    <button type="button" className="btn-outline btn-sm" onClick={addExtraRow}>
                      <Plus size={13} /> Add Extra
                    </button>
                  </div>
                  {itemForm.extras.map((ex, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.375rem' }}>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Extra name (e.g. Extra Plantain)"
                        value={ex.name}
                        onChange={(e) => {
                          const updated = [...itemForm.extras];
                          updated[idx] = { ...updated[idx], name: e.target.value };
                          setItemForm({ ...itemForm, extras: updated });
                        }}
                      />
                      <input
                        type="number"
                        step="0.01"
                        className="input-field"
                        placeholder="Price (GH₵)"
                        value={ex.price}
                        onChange={(e) => {
                          const updated = [...itemForm.extras];
                          updated[idx] = { ...updated[idx], price: Number(e.target.value) };
                          setItemForm({ ...itemForm, extras: updated });
                        }}
                      />
                      <button
                        type="button"
                        className="btn-danger-outline"
                        onClick={() =>
                          setItemForm({
                            ...itemForm,
                            extras: itemForm.extras.filter((_, i) => i !== idx)
                          })
                        }
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="switch-row">
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Available in Stock</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Customers can immediately order this item when enabled
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`switch-btn ${itemForm.is_in_stock ? 'on' : ''}`}
                    onClick={() =>
                      setItemForm((prev) => ({ ...prev, is_in_stock: !prev.is_in_stock }))
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
                  onClick={() => setItemModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-vendor" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorMenu;
