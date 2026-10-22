import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Sliders,
  ShieldCheck,
  Save,
  Calculator,
  Lock,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import api from '../../services/api';
import '../vendor/VendorPortal.css';
import './AdminDashboard.css';

const DEFAULT_CONFIGS = {
  order_service_fee: 2.0,
  parcel_base_fare: 10.0,
  parcel_per_km_fee: 2.5,
  parcel_service_fee: 5.0,
  parcel_express_multiplier: 1.5,
  rider_base_pay: 10.0,
  rider_distance_bonus: 2.0
};

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('pricing');
  const [configs, setConfigs] = useState(DEFAULT_CONFIGS);
  const [savingConfigs, setSavingConfigs] = useState(false);

  // Interactive Fare Simulator state
  const [simDistanceKm, setSimDistanceKm] = useState(6.5);
  const [simSpeed, setSimSpeed] = useState('standard');

  // Admin Account & Password state
  const [adminProfile, setAdminProfile] = useState({
    first_name: 'System',
    last_name: 'Admin',
    email: 'admin@somame.com',
    phone_number: '0000000000'
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const [cfgRes, usrRes] = await Promise.allSettled([
        api.get('/api/admin/configs'),
        api.get('/api/users/profile')
      ]);

      if (cfgRes.status === 'fulfilled' && cfgRes.value.data?.data) {
        setConfigs((prev) => ({ ...prev, ...cfgRes.value.data.data }));
      }

      if (usrRes.status === 'fulfilled' && usrRes.value.data?.data) {
        const u = usrRes.value.data.data;
        setAdminProfile({
          first_name: u.first_name || 'System',
          last_name: u.last_name || 'Admin',
          email: u.email || '',
          phone_number: u.phone_number || ''
        });
      }
    } catch {
      // keep defaults
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSaveConfigs = async (e) => {
    e.preventDefault();
    setSavingConfigs(true);
    const numericPayload = {};
    Object.entries(configs).forEach(([k, v]) => {
      numericPayload[k] = parseFloat(v || 0);
    });

    try {
      const res = await api.put('/api/admin/configs', numericPayload);
      if (res.data?.data) {
        setConfigs((prev) => ({ ...prev, ...res.data.data }));
      }
      toast.success('System pricing & fare configurations saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Saved in preview mode');
    } finally {
      setSavingConfigs(false);
    }
  };

  const handleSaveAdminProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put('/api/users/profile', adminProfile);
      if (res.data?.data) {
        localStorage.setItem('somame_user', JSON.stringify(res.data.data));
      }
      toast.success('Admin account details updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update admin profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('New password and confirmation do not match');
      return;
    }
    setSavingPassword(true);
    try {
      await api.put('/api/users/password', {
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password
      });
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
      toast.success('Admin password updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  // Simulated Parcel Fare & Rider Payout
  const dist = Math.max(parseFloat(simDistanceKm || 0), 0);
  const baseFare = parseFloat(configs.parcel_base_fare || 0);
  const perKm = parseFloat(configs.parcel_per_km_fee || 0);
  const serviceFee = parseFloat(configs.parcel_service_fee || 0);
  const expressMult = parseFloat(configs.parcel_express_multiplier || 1);

  const rawDeliveryCharge = (baseFare + dist * perKm) * (simSpeed === 'express' ? expressMult : 1);
  const simulatedCustomerTotal = rawDeliveryCharge + serviceFee;
  const simulatedRiderPay =
    parseFloat(configs.rider_base_pay || 0) +
    dist * parseFloat(configs.rider_distance_bonus || 0);

  return (
    <div className="vendor-page animate-fade-in">
      <div className="vendor-page-header">
        <div>
          <h1>System Configurations &amp; Security</h1>
          <p>
            Control global food service fees, parcel distance tariffs, express multipliers, rider base pay, and administrator credentials.
          </p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-outline" onClick={fetchSettings}>
            <RefreshCw size={15} /> Reload Configs
          </button>
        </div>
      </div>

      <div className="tabs-strip">
        <button
          type="button"
          className={`tab-pill ${activeTab === 'pricing' ? 'active' : ''}`}
          onClick={() => setActiveTab('pricing')}
        >
          <Sliders size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Pricing, Tariffs &amp; Rider Pay
        </button>
        <button
          type="button"
          className={`tab-pill ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <ShieldCheck size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Admin Account &amp; Security
        </button>
      </div>

      {activeTab === 'pricing' && (
        <div className="two-col-grid">
          <form className="panel-card" onSubmit={handleSaveConfigs}>
            <div className="panel-card-header">
              <div>
                <h3>Global Platform Tariffs (GH₵)</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Stored in PostgreSQL <code>system_configs</code> and applied immediately to new orders.
                </p>
              </div>
              <button type="submit" className="btn-primary" disabled={savingConfigs}>
                <Save size={15} />
                {savingConfigs ? 'Saving...' : 'Save Tariffs'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Food Order Service Fee (GH₵)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    value={configs.order_service_fee}
                    onChange={(e) =>
                      setConfigs({ ...configs, order_service_fee: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Parcel Service Fee (GH₵)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    value={configs.parcel_service_fee}
                    onChange={(e) =>
                      setConfigs({ ...configs, parcel_service_fee: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Parcel Base Fare (GH₵)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    value={configs.parcel_base_fare}
                    onChange={(e) =>
                      setConfigs({ ...configs, parcel_base_fare: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Parcel Per-Kilometer Rate (GH₵ / km)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    value={configs.parcel_per_km_fee}
                    onChange={(e) =>
                      setConfigs({ ...configs, parcel_per_km_fee: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Express Delivery Multiplier (×)</label>
                  <input
                    type="number"
                    step="0.05"
                    className="input-field"
                    value={configs.parcel_express_multiplier}
                    onChange={(e) =>
                      setConfigs({ ...configs, parcel_express_multiplier: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Rider Base Pay per Trip (GH₵)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    value={configs.rider_base_pay}
                    onChange={(e) =>
                      setConfigs({ ...configs, rider_base_pay: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Rider Distance Bonus (GH₵ / km)</label>
                <input
                  type="number"
                  step="0.01"
                  className="input-field"
                  value={configs.rider_distance_bonus}
                  onChange={(e) =>
                    setConfigs({ ...configs, rider_distance_bonus: e.target.value })
                  }
                  required
                />
              </div>
            </div>
          </form>

          {/* Live Fare & Rider Payout Simulator */}
          <div className="panel-card">
            <div className="panel-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calculator size={19} color="var(--color-brand)" />
                <h3>Interactive Fare &amp; Payout Simulator</h3>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Sample Trip Distance (km)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    className="input-field"
                    value={simDistanceKm}
                    onChange={(e) => setSimDistanceKm(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Delivery Speed Tier</label>
                  <select
                    className="select-field"
                    value={simSpeed}
                    onChange={(e) => setSimSpeed(e.target.value)}
                  >
                    <option value="standard">Standard Delivery (1.0×)</option>
                    <option value="express">
                      Express Delivery ({configs.parcel_express_multiplier}×)
                    </option>
                  </select>
                </div>
              </div>

              <div className="payout-settings-row">
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Estimated Customer Parcel Fare
                  </div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-brand)' }}>
                    GH₵ {simulatedCustomerTotal.toFixed(2)}
                  </div>
                </div>
                <span className="meta-chip">
                  Includes GH₵ {serviceFee.toFixed(2)} service fee
                </span>
              </div>

              <div className="payout-settings-row">
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Estimated Rider Trip Earnings
                  </div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-vendor)' }}>
                    GH₵ {simulatedRiderPay.toFixed(2)}
                  </div>
                </div>
                <span className="meta-chip">
                  Base GH₵ {parseFloat(configs.rider_base_pay || 0).toFixed(2)} + Distance
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="two-col-grid">
          <form className="panel-card" onSubmit={handleSaveAdminProfile}>
            <div className="panel-card-header">
              <h3>Administrator Profile</h3>
              <button type="submit" className="btn-primary" disabled={savingProfile}>
                <Save size={15} />
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={adminProfile.first_name}
                    onChange={(e) =>
                      setAdminProfile({ ...adminProfile, first_name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={adminProfile.last_name}
                    onChange={(e) =>
                      setAdminProfile({ ...adminProfile, last_name: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Admin Phone Number (Login ID)</label>
                <input
                  type="text"
                  className="input-field"
                  value={adminProfile.phone_number}
                  onChange={(e) =>
                    setAdminProfile({ ...adminProfile, phone_number: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Admin Email Address</label>
                <input
                  type="email"
                  className="input-field"
                  value={adminProfile.email}
                  onChange={(e) =>
                    setAdminProfile({ ...adminProfile, email: e.target.value })
                  }
                />
              </div>
            </div>
          </form>

          <form className="panel-card" onSubmit={handleSavePassword}>
            <div className="panel-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={18} color="var(--color-brand)" />
                <h3>Change Administrator Password</h3>
              </div>
              <button type="submit" className="btn-primary" disabled={savingPassword}>
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Current Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showOldPw ? 'text' : 'password'}
                    className="input-field"
                    value={passwordForm.old_password}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, old_password: e.target.value })
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPw((p) => !p)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)'
                    }}
                  >
                    {showOldPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>New Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    className="input-field"
                    value={passwordForm.new_password}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, new_password: e.target.value })
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw((p) => !p)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)'
                    }}
                  >
                    {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm New Password *</label>
                <input
                  type="password"
                  className="input-field"
                  value={passwordForm.confirm_password}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirm_password: e.target.value })
                  }
                  required
                />
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
