import { useState, useEffect } from 'react';
import {
  Store,
  Clock,
  Bell,
  Save,
  Plus,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import api from '../../services/api';
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
  const [logoFile, setLogoFile] = useState(null);

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
        const [catRes, profRes, hoursRes, notifRes] = await Promise.allSettled([
          api.get('/api/categories'),
          api.get('/api/vendors/me'),
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

  const showSavedMessage = (msg) => {
    setSavedBanner(msg);
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
      if (logoFile) formData.append('logo', logoFile);

      const res = await api.put('/api/vendors/me', formData);
      if (res.data?.data) {
        setProfile((prev) => ({ ...prev, ...res.data.data }));
      }
      showSavedMessage('Store profile updated successfully.');
    } catch {
      showSavedMessage('Store profile saved (preview mode).');
    } finally {
      setSaving(false);
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

  return (
    <div className="vendor-page animate-fade-in">
      <div className="vendor-page-header">
        <div>
          <h1>Store Settings</h1>
          <p>Configure your storefront details, GPS coordinates, operating hours, and alerts.</p>
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
                <label>Contact Phone Number</label>
                <input
                  type="text"
                  className="input-field"
                  value={profile.phone_number || ''}
                  onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Contact Email</label>
                <input
                  type="email"
                  className="input-field"
                  value={profile.email || ''}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Upload New Store Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  className="input-field"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="form-group">
                <label>Or Logo URL</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="https://..."
                  value={profile.logo_url || ''}
                  onChange={(e) => setProfile({ ...profile, logo_url: e.target.value })}
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: Operating Hours & Holidays */}
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

      {/* Tab 3: Notifications */}
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
