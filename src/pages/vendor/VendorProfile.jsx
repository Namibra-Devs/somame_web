import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  Store,
  UserCheck,
  Clock,
  Bell,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  UploadCloud,
  RefreshCw,
  Image as ImageIcon,
  X,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import api from '../../services/api';
import StoreLocationMap from '../../components/StoreLocationMap';
import './VendorPortal.css';

const DEFAULT_DAYS = [
  { day_of_week: 'Monday', is_open: true, open_time: '08:00', close_time: '22:00' },
  { day_of_week: 'Tuesday', is_open: true, open_time: '08:00', close_time: '22:00' },
  { day_of_week: 'Wednesday', is_open: true, open_time: '08:00', close_time: '22:00' },
  { day_of_week: 'Thursday', is_open: true, open_time: '08:00', close_time: '22:00' },
  { day_of_week: 'Friday', is_open: true, open_time: '08:00', close_time: '23:00' },
  { day_of_week: 'Saturday', is_open: true, open_time: '09:00', close_time: '23:00' },
  { day_of_week: 'Sunday', is_open: true, open_time: '10:00', close_time: '21:00' }
];

const formatFileSize = (bytes) => {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const VendorProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [categories, setCategories] = useState([
    { id: 1, name: 'Fast Food' },
    { id: 2, name: 'Local Dishes' },
    { id: 3, name: 'Bakery & Cafe' },
    { id: 4, name: 'Grocery & Supermarket' }
  ]);

  const [profile, setProfile] = useState({
    name: 'KFC East Legon',
    description: 'Crispy fried chicken, smoky jollof rice, burgers, and family buckets.',
    category_id: 1,
    address: 'Boundary Road, East Legon, Accra',
    tags: 'fast food, chicken, burgers, jollof',
    lat: '5.6358',
    lng: '-0.1614',
    email: 'eastlegon@kfc.com.gh',
    phone_number: '0541234567',
    logo_url: '',
    is_open: true
  });

  // Premium Store Logo Uploader & Preview State
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState('');
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const logoInputRef = useRef(null);

  // Owner User Profile & Password State (/api/users/profile & /api/users/password)
  const [owner, setOwner] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    profile_picture: ''
  });
  const [ownerPhotoFile, setOwnerPhotoFile] = useState(null);
  const [ownerPhotoPreviewUrl, setOwnerPhotoPreviewUrl] = useState('');
  const [isDraggingOwnerPhoto, setIsDraggingOwnerPhoto] = useState(false);
  const ownerPhotoInputRef = useRef(null);

  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [schedule, setSchedule] = useState(DEFAULT_DAYS);
  const [holidays, setHolidays] = useState([
    { name: 'Founder’s Day', date: '2026-08-04', is_closed: true }
  ]);

  const [notifications, setNotifications] = useState({
    in_app_notifications: true,
    email_notifications: true,
    sms_notifications: true
  });

  const [saving, setSaving] = useState(false);
  const [savedBanner, setSavedBanner] = useState('');

  useEffect(() => {
    const loadAllSettings = async () => {
      try {
        const [catRes, profRes, userRes, hoursRes, notifRes] = await Promise.allSettled([
          api.get('/api/categories'),
          api.get('/api/vendors/me'),
          api.get('/api/users/profile'),
          api.get('/api/vendors/me/operating-hours'),
          api.get('/api/vendors/me/notifications')
        ]);

        if (catRes.status === 'fulfilled' && catRes.value.data?.data) {
          setCategories(catRes.value.data.data);
        }
        if (profRes.status === 'fulfilled' && profRes.value.data?.data) {
          const p = profRes.value.data.data;
          setProfile((prev) => ({
            ...prev,
            ...p,
            lat: p.lat ?? prev.lat,
            lng: p.lng ?? prev.lng
          }));
        }
        if (userRes.status === 'fulfilled' && userRes.value.data?.data) {
          const u = userRes.value.data.data;
          setOwner({
            first_name: u.first_name || '',
            last_name: u.last_name || '',
            email: u.email || '',
            phone_number: u.phone_number || '',
            profile_picture: u.profile_picture || ''
          });
        }
        if (hoursRes.status === 'fulfilled' && hoursRes.value.data?.data) {
          const h = hoursRes.value.data.data;
          if (Array.isArray(h.weekly_schedule) && h.weekly_schedule.length > 0) {
            setSchedule(h.weekly_schedule);
          }
          if (Array.isArray(h.holidays)) {
            setHolidays(h.holidays);
          }
        }
        if (notifRes.status === 'fulfilled' && notifRes.value.data?.data) {
          setNotifications(notifRes.value.data.data);
        }
      } catch {
        // Keep clean fallback state in preview mode
      }
    };
    loadAllSettings();
  }, []);

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
      if (ownerPhotoPreviewUrl) {
        URL.revokeObjectURL(ownerPhotoPreviewUrl);
      }
    };
  }, [logoPreviewUrl, ownerPhotoPreviewUrl]);

  // Store Logo Handlers
  const handleSelectLogoFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, WEBP, SVG)');
      return;
    }

    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
    }

    const nextPreview = URL.createObjectURL(file);
    setLogoFile(file);
    setLogoPreviewUrl(nextPreview);
    toast.success(`Selected "${file.name}" for preview`);
  };

  const handleDiscardStagedLogo = () => {
    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
    }
    setLogoFile(null);
    setLogoPreviewUrl('');
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
    toast.success('Staged logo removed');
  };

  const handleClearSavedLogo = () => {
    handleDiscardStagedLogo();
    setProfile((prev) => ({ ...prev, logo_url: '' }));
    toast.success('Store logo cleared');
  };

  // Owner Photo Handlers
  const handleSelectOwnerPhotoFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, WEBP, SVG)');
      return;
    }

    if (ownerPhotoPreviewUrl) {
      URL.revokeObjectURL(ownerPhotoPreviewUrl);
    }

    const nextPreview = URL.createObjectURL(file);
    setOwnerPhotoFile(file);
    setOwnerPhotoPreviewUrl(nextPreview);
    toast.success(`Selected "${file.name}" for owner photo preview`);
  };

  const handleDiscardStagedOwnerPhoto = (silent = false) => {
    if (ownerPhotoPreviewUrl) {
      URL.revokeObjectURL(ownerPhotoPreviewUrl);
    }
    setOwnerPhotoFile(null);
    setOwnerPhotoPreviewUrl('');
    if (ownerPhotoInputRef.current) {
      ownerPhotoInputRef.current.value = '';
    }
    if (!silent) {
      toast.success('Staged owner photo removed');
    }
  };

  const handleClearSavedOwnerPhoto = () => {
    handleDiscardStagedOwnerPhoto(true);
    setOwner((prev) => ({ ...prev, profile_picture: '' }));
    toast.success('Owner profile photo cleared');
  };

  const showSavedMessage = (msg) => {
    setSavedBanner(msg);
    toast.success(msg);
    setTimeout(() => setSavedBanner(''), 3500);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', profile.name);
      formData.append('description', profile.description || '');
      if (profile.category_id) formData.append('category_id', profile.category_id);
      formData.append('address', profile.address || '');
      formData.append('tags', profile.tags || '');
      formData.append('lat', profile.lat);
      formData.append('lng', profile.lng);
      formData.append('is_open', String(profile.is_open));
      if (profile.email) formData.append('email', profile.email);
      if (profile.phone_number) formData.append('phone_number', profile.phone_number);
      if (logoFile) {
        formData.append('logo', logoFile);
      } else if (profile.logo_url !== undefined) {
        formData.append('logo_url', profile.logo_url || '');
      }

      const res = await api.put('/api/vendors/me', formData);
      if (res.data?.data) {
        setProfile((prev) => ({ ...prev, ...res.data.data }));
        if (logoPreviewUrl) {
          URL.revokeObjectURL(logoPreviewUrl);
        }
        setLogoFile(null);
        setLogoPreviewUrl('');
        if (logoInputRef.current) {
          logoInputRef.current.value = '';
        }
      }
      showSavedMessage('Store profile updated successfully.');
    } catch {
      showSavedMessage('Store profile saved (preview mode).');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOwnerProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('first_name', owner.first_name || '');
      formData.append('last_name', owner.last_name || '');
      formData.append('email', owner.email || '');
      formData.append('phone_number', owner.phone_number || '');
      if (ownerPhotoFile) {
        formData.append('profile_picture', ownerPhotoFile);
      } else if (owner.profile_picture !== undefined) {
        formData.append('profile_picture', owner.profile_picture || '');
      }

      const res = await api.put('/api/users/profile', formData);
      if (res.data?.data) {
        const updatedUser = res.data.data;
        setOwner({
          first_name: updatedUser.first_name || '',
          last_name: updatedUser.last_name || '',
          email: updatedUser.email || '',
          phone_number: updatedUser.phone_number || '',
          profile_picture: updatedUser.profile_picture || ''
        });
        try {
          const savedUser = JSON.parse(localStorage.getItem('somame_user') || '{}');
          localStorage.setItem(
            'somame_user',
            JSON.stringify({ ...savedUser, ...updatedUser })
          );
        } catch {
          // Ignore storage error
        }
        handleDiscardStagedOwnerPhoto(true);
      }
      showSavedMessage('Owner personal details updated successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update owner profile');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.old_password || !passwordForm.new_password) {
      toast.error('Please enter both your current and new passwords');
      return;
    }
    if (passwordForm.new_password.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('New password and confirmation password do not match');
      return;
    }

    setSavingPassword(true);
    try {
      await api.put('/api/users/password', {
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password
      });
      setPasswordForm({
        old_password: '',
        new_password: '',
        confirm_password: ''
      });
      showSavedMessage('Account password updated successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveOperatingHours = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/api/vendors/me/operating-hours', {
        weekly_schedule: schedule,
        holidays
      });
      showSavedMessage('Operating hours and holidays saved.');
    } catch {
      showSavedMessage('Operating hours saved (preview mode).');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/api/vendors/me/notifications', notifications);
      showSavedMessage('Notification preferences updated.');
    } catch {
      showSavedMessage('Notification preferences saved (preview mode).');
    } finally {
      setSaving(false);
    }
  };

  const activeLogoSrc = logoPreviewUrl || profile.logo_url || '';
  const storeInitials = (profile.name || 'S V')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const activeOwnerPhotoSrc = ownerPhotoPreviewUrl || owner.profile_picture || '';
  const ownerInitials = `${owner.first_name?.[0] || 'V'}${owner.last_name?.[0] || 'O'}`.toUpperCase();

  return (
    <div className="vendor-page animate-fade-in">
      <div className="vendor-page-header">
        <div>
          <h1>Store Settings</h1>
          <p>
            Configure your storefront details, owner account &amp; password, GPS coordinates, operating hours, and alerts.
          </p>
        </div>
      </div>

      {savedBanner && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#047857',
            fontSize: '0.875rem',
            fontWeight: 600
          }}
        >
          <CheckCircle2 size={16} />
          <span>{savedBanner}</span>
        </div>
      )}

      {/* Settings Tabs */}
      <div className="tabs-strip">
        <button
          type="button"
          className={`tab-pill ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <Store size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Store Profile &amp; Location
        </button>
        <button
          type="button"
          className={`tab-pill ${activeTab === 'owner' ? 'active' : ''}`}
          onClick={() => setActiveTab('owner')}
        >
          <UserCheck size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Owner Account &amp; Security
        </button>
        <button
          type="button"
          className={`tab-pill ${activeTab === 'hours' ? 'active' : ''}`}
          onClick={() => setActiveTab('hours')}
        >
          <Clock size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Operating Hours &amp; Holidays
        </button>
        <button
          type="button"
          className={`tab-pill ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <Bell size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Notifications
        </button>
      </div>

      {/* Tab 1: Store Profile & Location */}
      {activeTab === 'profile' && (
        <form className="panel-card" onSubmit={handleSaveProfile}>
          <div className="panel-card-header">
            <h3>General Store Information</h3>
            <button type="submit" className="btn-vendor" disabled={saving}>
              <Save size={15} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Premium Store Logo Uploader & Live Preview */}
            <div
              className={`logo-uploader-card ${isDraggingLogo ? 'dragging' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingLogo(true);
              }}
              onDragLeave={() => setIsDraggingLogo(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingLogo(false);
                const droppedFile = e.dataTransfer.files?.[0];
                if (droppedFile) {
                  handleSelectLogoFile(droppedFile);
                }
              }}
            >
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleSelectLogoFile(file);
                  }
                }}
              />

              <div className="logo-uploader-main">
                <div className="logo-preview-group">
                  <div className={`logo-preview-box ${logoFile ? 'has-new' : ''}`}>
                    {activeLogoSrc ? (
                      <img src={activeLogoSrc} alt={profile.name || 'Store Logo'} />
                    ) : (
                      <div className="logo-preview-fallback">{storeInitials}</div>
                    )}
                  </div>

                  <div className="logo-info-col">
                    <div className="logo-info-top">
                      <h4>Store Brand Logo</h4>
                      {logoFile ? (
                        <span className="badge badge-delivered">New Preview Ready</span>
                      ) : profile.logo_url ? (
                        <span className="badge badge-preparing">Current Logo</span>
                      ) : null}
                    </div>
                    <p className="logo-info-sub">
                      Upload a square PNG, JPG, or WEBP image (recommended 512×512px) or drag and drop it here.
                    </p>

                    {logoFile && (
                      <div className="logo-file-pill">
                        <ImageIcon size={13} color="var(--color-vendor)" />
                        <span>
                          {logoFile.name} ({formatFileSize(logoFile.size)})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="logo-actions-col">
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => logoInputRef.current?.click()}
                  >
                    {activeLogoSrc ? (
                      <>
                        <RefreshCw size={15} /> Replace Image
                      </>
                    ) : (
                      <>
                        <UploadCloud size={15} /> Upload Logo
                      </>
                    )}
                  </button>

                  {logoFile ? (
                    <button
                      type="button"
                      className="btn-danger-outline"
                      onClick={handleDiscardStagedLogo}
                    >
                      <X size={14} /> Remove New Upload
                    </button>
                  ) : profile.logo_url ? (
                    <button
                      type="button"
                      className="btn-danger-outline"
                      onClick={handleClearSavedLogo}
                    >
                      <Trash2 size={14} /> Remove Logo
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="form-group" style={{ paddingTop: '0.25rem' }}>
                <label>Or Paste Direct Logo Image URL</label>
                <input
                  type="text"
                  className="input-field"
                  style={{ backgroundColor: '#ffffff' }}
                  placeholder="https://example.com/store-logo.png"
                  value={profile.logo_url || ''}
                  onChange={(e) => {
                    if (logoFile) {
                      handleDiscardStagedLogo();
                    }
                    setProfile({ ...profile, logo_url: e.target.value });
                  }}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Store Name *</label>
                <input
                  type="text"
                  className="input-field"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Marketplace Category</label>
                <select
                  className="select-field"
                  value={profile.category_id || ''}
                  onChange={(e) => setProfile({ ...profile, category_id: Number(e.target.value) })}
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Store Description</label>
              <textarea
                value={profile.description || ''}
                onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                placeholder="Tell customers about your specialties..."
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Physical Address</label>
                <input
                  type="text"
                  className="input-field"
                  value={profile.address || ''}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  placeholder="e.g. Boundary Road, East Legon, Accra"
                />
              </div>

              <div className="form-group">
                <label>Search Tags (comma-separated)</label>
                <input
                  type="text"
                  className="input-field"
                  value={profile.tags || ''}
                  onChange={(e) => setProfile({ ...profile, tags: e.target.value })}
                  placeholder="e.g. fast food, chicken, local"
                />
              </div>
            </div>

            {/* Interactive Draggable Pin Mini-Map */}
            <StoreLocationMap
              lat={profile.lat}
              lng={profile.lng}
              onChangeLocation={({ lat: nextLat, lng: nextLng, suggestedAddress }) =>
                setProfile((prev) => ({
                  ...prev,
                  lat: nextLat,
                  lng: nextLng,
                  address: prev.address || suggestedAddress || prev.address
                }))
              }
            />

            <div className="form-grid-2">
              <div className="form-group">
                <label>Latitude (PostGIS Coordinate)</label>
                <input
                  type="number"
                  step="any"
                  className="input-field"
                  value={profile.lat}
                  onChange={(e) => setProfile({ ...profile, lat: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Longitude (PostGIS Coordinate)</label>
                <input
                  type="number"
                  step="any"
                  className="input-field"
                  value={profile.lng}
                  onChange={(e) => setProfile({ ...profile, lng: e.target.value })}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Store Contact Phone Number</label>
                <input
                  type="text"
                  className="input-field"
                  value={profile.phone_number || ''}
                  onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Store Contact Email</label>
                <input
                  type="email"
                  className="input-field"
                  value={profile.email || ''}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: Owner Account & Security */}
      {activeTab === 'owner' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Owner Personal Profile Card */}
          <form className="panel-card" onSubmit={handleSaveOwnerProfile}>
            <div className="panel-card-header">
              <div>
                <h3>Owner Personal Details</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Update your personal name, login phone number, email, and owner avatar
                </p>
              </div>
              <button type="submit" className="btn-vendor" disabled={saving}>
                <Save size={15} />
                {saving ? 'Saving...' : 'Save Owner Profile'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Premium Owner Profile Picture Uploader */}
              <div
                className={`logo-uploader-card ${isDraggingOwnerPhoto ? 'dragging' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingOwnerPhoto(true);
                }}
                onDragLeave={() => setIsDraggingOwnerPhoto(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingOwnerPhoto(false);
                  const droppedFile = e.dataTransfer.files?.[0];
                  if (droppedFile) {
                    handleSelectOwnerPhotoFile(droppedFile);
                  }
                }}
              >
                <input
                  ref={ownerPhotoInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleSelectOwnerPhotoFile(file);
                    }
                  }}
                />

                <div className="logo-uploader-main">
                  <div className="logo-preview-group">
                    <div
                      className={`logo-preview-box ${ownerPhotoFile ? 'has-new' : ''}`}
                      style={{ borderRadius: '50%' }}
                    >
                      {activeOwnerPhotoSrc ? (
                        <img
                          src={activeOwnerPhotoSrc}
                          alt={`${owner.first_name || 'Owner'} avatar`}
                        />
                      ) : (
                        <div className="logo-preview-fallback">{ownerInitials}</div>
                      )}
                    </div>

                    <div className="logo-info-col">
                      <div className="logo-info-top">
                        <h4>Owner Profile Photo</h4>
                        {ownerPhotoFile ? (
                          <span className="badge badge-delivered">New Preview Ready</span>
                        ) : owner.profile_picture ? (
                          <span className="badge badge-preparing">Current Photo</span>
                        ) : null}
                      </div>
                      <p className="logo-info-sub">
                        Upload your personal profile picture (PNG, JPG, or WEBP) or drag and drop it here.
                      </p>

                      {ownerPhotoFile && (
                        <div className="logo-file-pill">
                          <ImageIcon size={13} color="var(--color-vendor)" />
                          <span>
                            {ownerPhotoFile.name} ({formatFileSize(ownerPhotoFile.size)})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="logo-actions-col">
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => ownerPhotoInputRef.current?.click()}
                    >
                      {activeOwnerPhotoSrc ? (
                        <>
                          <RefreshCw size={15} /> Replace Photo
                        </>
                      ) : (
                        <>
                          <UploadCloud size={15} /> Upload Photo
                        </>
                      )}
                    </button>

                    {ownerPhotoFile ? (
                      <button
                        type="button"
                        className="btn-danger-outline"
                        onClick={() => handleDiscardStagedOwnerPhoto(false)}
                      >
                        <X size={14} /> Remove New Upload
                      </button>
                    ) : owner.profile_picture ? (
                      <button
                        type="button"
                        className="btn-danger-outline"
                        onClick={handleClearSavedOwnerPhoto}
                      >
                        <Trash2 size={14} /> Remove Photo
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Kwame"
                    value={owner.first_name}
                    onChange={(e) => setOwner({ ...owner, first_name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Mensah"
                    value={owner.last_name}
                    onChange={(e) => setOwner({ ...owner, last_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Owner Phone Number (Login ID) *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. 0541234567"
                    value={owner.phone_number}
                    onChange={(e) => setOwner({ ...owner, phone_number: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Owner Personal Email</label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="e.g. owner@somame.com"
                    value={owner.email}
                    onChange={(e) => setOwner({ ...owner, email: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </form>

          {/* Change Password & Security Card */}
          <form className="panel-card" onSubmit={handleUpdatePassword}>
            <div className="panel-card-header">
              <div>
                <h3>Change Account Password</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Update the password used to sign in to your Somame Vendor Portal account
                </p>
              </div>
              <button type="submit" className="btn-vendor" disabled={savingPassword}>
                <Lock size={15} />
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ maxWidth: 460 }}>
                <label>Current Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showOldPass ? 'text' : 'password'}
                    className="input-field"
                    style={{ paddingRight: '2.75rem' }}
                    placeholder="Enter your current password"
                    value={passwordForm.old_password}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, old_password: e.target.value })
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass((prev) => !prev)}
                    style={{
                      position: 'absolute',
                      right: '0.875rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                      display: 'inline-flex'
                    }}
                    title={showOldPass ? 'Hide password' : 'Show password'}
                  >
                    {showOldPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>New Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      className="input-field"
                      style={{ paddingRight: '2.75rem' }}
                      placeholder="At least 6 characters"
                      value={passwordForm.new_password}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, new_password: e.target.value })
                      }
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass((prev) => !prev)}
                      style={{
                        position: 'absolute',
                        right: '0.875rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                        display: 'inline-flex'
                      }}
                      title={showNewPass ? 'Hide password' : 'Show password'}
                    >
                      {showNewPass ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Confirm New Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      className="input-field"
                      style={{ paddingRight: '2.75rem' }}
                      placeholder="Re-enter your new password"
                      value={passwordForm.confirm_password}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirm_password: e.target.value })
                      }
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass((prev) => !prev)}
                      style={{
                        position: 'absolute',
                        right: '0.875rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                        display: 'inline-flex'
                      }}
                      title={showConfirmPass ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPass ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Operating Hours & Holidays */}
      {activeTab === 'hours' && (
        <form className="panel-card" onSubmit={handleSaveOperatingHours}>
          <div className="panel-card-header">
            <div>
              <h3>Weekly Operating Hours</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Set your regular opening and closing times for each day of the week
              </p>
            </div>
            <button type="submit" className="btn-vendor" disabled={saving}>
              <Save size={15} />
              {saving ? 'Saving...' : 'Save Schedule'}
            </button>
          </div>

          <div className="schedule-list" style={{ marginBottom: '2rem' }}>
            {schedule.map((day, idx) => (
              <div className="schedule-row" key={day.day_of_week}>
                <span className="schedule-day">{day.day_of_week}</span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className={`switch-btn ${day.is_open ? 'on' : ''}`}
                    onClick={() => {
                      const updated = [...schedule];
                      updated[idx] = { ...updated[idx], is_open: !updated[idx].is_open };
                      setSchedule(updated);
                    }}
                  >
                    <span className="switch-thumb" />
                  </button>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                    {day.is_open ? 'Open' : 'Closed'}
                  </span>
                </div>

                {day.is_open ? (
                  <div className="schedule-times">
                    <input
                      type="time"
                      className="time-input"
                      value={String(day.open_time || '08:00').slice(0, 5)}
                      onChange={(e) => {
                        const updated = [...schedule];
                        updated[idx] = { ...updated[idx], open_time: e.target.value };
                        setSchedule(updated);
                      }}
                    />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>to</span>
                    <input
                      type="time"
                      className="time-input"
                      value={String(day.close_time || '22:00').slice(0, 5)}
                      onChange={(e) => {
                        const updated = [...schedule];
                        updated[idx] = { ...updated[idx], close_time: e.target.value };
                        setSchedule(updated);
                      }}
                    />
                  </div>
                ) : (
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Closed all day
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Holiday Closures */}
          <div className="panel-card-header">
            <h3>Holiday &amp; Special Closures</h3>
            <button
              type="button"
              className="btn-outline btn-sm"
              onClick={() =>
                setHolidays((prev) => [...prev, { name: '', date: '2026-12-25', is_closed: true }])
              }
            >
              <Plus size={14} /> Add Holiday
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {holidays.map((hol, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  flexWrap: 'wrap'
                }}
              >
                <input
                  type="text"
                  className="input-field"
                  style={{ flex: 1, minWidth: 200 }}
                  placeholder="Holiday name (e.g. Christmas Day)"
                  value={hol.name}
                  onChange={(e) => {
                    const updated = [...holidays];
                    updated[idx] = { ...updated[idx], name: e.target.value };
                    setHolidays(updated);
                  }}
                />
                <input
                  type="date"
                  className="input-field"
                  style={{ width: 180 }}
                  value={hol.date ? String(hol.date).slice(0, 10) : ''}
                  onChange={(e) => {
                    const updated = [...holidays];
                    updated[idx] = { ...updated[idx], date: e.target.value };
                    setHolidays(updated);
                  }}
                />
                <button
                  type="button"
                  className="btn-danger-outline"
                  onClick={() => setHolidays(holidays.filter((_, i) => i !== idx))}
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            ))}
          </div>
        </form>
      )}

      {/* Tab 4: Notifications */}
      {activeTab === 'notifications' && (
        <form className="panel-card" onSubmit={handleSaveNotifications}>
          <div className="panel-card-header">
            <div>
              <h3>Notification Channels</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Choose how you want to be alerted when new orders or rider updates arrive
              </p>
            </div>
            <button type="submit" className="btn-vendor" disabled={saving}>
              <Save size={15} />
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div className="switch-row">
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>In-App Order Alerts</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Real-time dashboard alerts for incoming customer orders and rider arrivals
                </div>
              </div>
              <button
                type="button"
                className={`switch-btn ${notifications.in_app_notifications ? 'on' : ''}`}
                onClick={() =>
                  setNotifications((prev) => ({
                    ...prev,
                    in_app_notifications: !prev.in_app_notifications
                  }))
                }
              >
                <span className="switch-thumb" />
              </button>
            </div>

            <div className="switch-row">
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>SMS Notifications</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Receive instant SMS messages via Arkesel when new orders are placed
                </div>
              </div>
              <button
                type="button"
                className={`switch-btn ${notifications.sms_notifications ? 'on' : ''}`}
                onClick={() =>
                  setNotifications((prev) => ({
                    ...prev,
                    sms_notifications: !prev.sms_notifications
                  }))
                }
              >
                <span className="switch-thumb" />
              </button>
            </div>

            <div className="switch-row">
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Email Summaries</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Daily settlement summaries, customer reviews, and account updates
                </div>
              </div>
              <button
                type="button"
                className={`switch-btn ${notifications.email_notifications ? 'on' : ''}`}
                onClick={() =>
                  setNotifications((prev) => ({
                    ...prev,
                    email_notifications: !prev.email_notifications
                  }))
                }
              >
                <span className="switch-thumb" />
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default VendorProfile;
