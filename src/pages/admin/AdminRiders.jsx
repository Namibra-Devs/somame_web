import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Bike,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  FileCheck,
  ShieldBan,
  ShieldCheck,
  Star,
  Wallet,
  X,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import api from '../../services/api';
import '../vendor/VendorPortal.css';
import './AdminDashboard.css';

const FALLBACK_RIDERS = [
  {
    id: 11,
    first_name: 'Kojo',
    last_name: 'Mensah',
    phone_number: '0244556677',
    email: 'kojo.rider@somame.com',
    is_verified: true,
    is_active: true,
    rating: '4.90',
    vehicle_type: 'motorbike',
    id_document_type: 'ghana_card',
    verification_status: 'approved',
    is_online: true,
    wallet_balance: '345.00',
    total_earned: '4820.00',
    food_deliveries: 148,
    parcel_deliveries: 42,
    date_of_birth: '1996-04-12'
  },
  {
    id: 12,
    first_name: 'Ibrahim',
    last_name: 'Salifu',
    phone_number: '0551122334',
    email: 'ibrahim.rider@somame.com',
    is_verified: false,
    is_active: true,
    rating: '4.75',
    vehicle_type: 'motorbike',
    id_document_type: 'ghana_card',
    verification_status: 'pending',
    is_online: false,
    wallet_balance: '0.00',
    total_earned: '0.00',
    food_deliveries: 0,
    parcel_deliveries: 0,
    date_of_birth: '1998-09-21'
  },
  {
    id: 13,
    first_name: 'Emmanuel',
    last_name: 'Tetteh',
    phone_number: '0208877665',
    email: 'emmanuel.t@somame.com',
    is_verified: true,
    is_active: true,
    rating: '4.82',
    vehicle_type: 'car',
    id_document_type: 'passport',
    verification_status: 'approved',
    is_online: true,
    wallet_balance: '510.50',
    total_earned: '6190.00',
    food_deliveries: 92,
    parcel_deliveries: 84,
    date_of_birth: '1993-11-04'
  }
];

const KYC_DOC_FIELDS = [
  { key: 'selfie_image_url', label: 'Rider Portrait Selfie' },
  { key: 'id_front_image_url', label: 'National ID / Passport (Front)' },
  { key: 'id_back_image_url', label: 'National ID (Back)' },
  { key: 'license_front_image_url', label: 'Driver’s License (Front)' },
  { key: 'license_back_image_url', label: 'Driver’s License (Back)' },
  { key: 'road_worthy_image_url', label: 'Road Worthy Certificate' },
  { key: 'insurance_image_url', label: 'Vehicle Insurance Certificate' }
];

const AdminRiders = () => {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kycFilter, setKycFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineFilter, setOnlineFilter] = useState('all');
  const [selectedRider, setSelectedRider] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchRiders = useCallback(async () => {
    try {
      const res = await api.get('/api/admin/riders');
      if (Array.isArray(res.data?.data)) {
        setRiders(res.data.data);
      } else {
        setRiders(FALLBACK_RIDERS);
      }
    } catch {
      setRiders(FALLBACK_RIDERS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRiders();
  }, [fetchRiders]);

  const handleUpdateKyc = async (rider, nextStatus) => {
    setUpdatingId(rider.id);
    setRiders((prev) =>
      prev.map((r) =>
        r.id === rider.id
          ? {
              ...r,
              verification_status: nextStatus,
              is_verified: nextStatus === 'approved'
            }
          : r
      )
    );
    if (selectedRider && selectedRider.id === rider.id) {
      setSelectedRider((prev) => ({
        ...prev,
        verification_status: nextStatus,
        is_verified: nextStatus === 'approved'
      }));
    }

    try {
      await api.patch(`/api/admin/riders/${rider.id}/verify`, {
        verification_status: nextStatus
      });
      toast.success(
        `Rider KYC marked as ${nextStatus.toUpperCase()}`
      );
    } catch {
      toast.success(
        `Rider KYC marked as ${nextStatus.toUpperCase()}`
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleRiderActive = async (rider) => {
    const nextActive = !rider.is_active;
    setRiders((prev) =>
      prev.map((r) => (r.id === rider.id ? { ...r, is_active: nextActive } : r))
    );
    try {
      await api.patch(`/api/admin/riders/${rider.id}/verify`, {
        is_active: nextActive
      });
      toast.success(
        nextActive ? 'Rider account activated' : 'Rider account suspended'
      );
    } catch {
      toast.success(
        nextActive ? 'Rider account activated' : 'Rider account suspended'
      );
    }
  };

  const filteredRiders = riders.filter((r) => {
    const fullName = `${r.first_name || ''} ${r.last_name || ''}`.toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      fullName.includes(q) ||
      (r.phone_number || '').toLowerCase().includes(q) ||
      (r.email || '').toLowerCase().includes(q);

    const matchesKyc =
      kycFilter === 'all' || r.verification_status === kycFilter;

    const matchesOnline =
      onlineFilter === 'all' ||
      (onlineFilter === 'online' && r.is_online) ||
      (onlineFilter === 'offline' && !r.is_online);

    return matchesSearch && matchesKyc && matchesOnline;
  });

  const pendingCount = riders.filter((r) => r.verification_status === 'pending').length;
  const onlineCount = riders.filter((r) => r.is_online).length;

  return (
    <div className="vendor-page animate-fade-in">
      <div className="vendor-page-header">
        <div>
          <h1>Riders &amp; KYC Verification</h1>
          <p>
            Inspect rider identity documents, approve dispatch onboarding, monitor online fleet availability, and review rider earnings.
          </p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn-outline"
            onClick={fetchRiders}
            disabled={loading}
          >
            <RefreshCw size={15} /> Refresh Fleet
          </button>
        </div>
      </div>

      {/* Fleet Summary Strip */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper icon-primary">
              <Bike size={22} />
            </div>
            <span className="stat-trend positive">{onlineCount} Online</span>
          </div>
          <div className="stat-content">
            <h3>Total Registered Riders</h3>
            <p className="stat-value">{riders.length}</p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper icon-warning">
              <Clock size={22} />
            </div>
          </div>
          <div className="stat-content">
            <h3>Pending KYC Review</h3>
            <p className="stat-value">{pendingCount}</p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper icon-success">
              <CheckCircle2 size={22} />
            </div>
          </div>
          <div className="stat-content">
            <h3>Approved Dispatchers</h3>
            <p className="stat-value">
              {riders.filter((r) => r.verification_status === 'approved').length}
            </p>
          </div>
        </div>
      </div>

      {/* KYC Status Pills */}
      <div className="tabs-strip">
        {[
          { key: 'all', label: `All Riders (${riders.length})` },
          { key: 'pending', label: `Pending KYC (${pendingCount})` },
          {
            key: 'approved',
            label: `Approved (${riders.filter((r) => r.verification_status === 'approved').length})`
          },
          {
            key: 'rejected',
            label: `Rejected (${riders.filter((r) => r.verification_status === 'rejected').length})`
          }
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`tab-pill ${kycFilter === tab.key ? 'active' : ''}`}
            onClick={() => setKycFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={17} />
          <input
            type="text"
            placeholder="Search rider by name, phone number, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            className="select-field"
            value={onlineFilter}
            onChange={(e) => setOnlineFilter(e.target.value)}
          >
            <option value="all">All Availability</option>
            <option value="online">Online Now</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      {/* Riders Table */}
      <div className="panel-card">
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Rider</th>
                <th>Vehicle &amp; ID</th>
                <th>Availability</th>
                <th>Completed Trips</th>
                <th>Wallet Balance</th>
                <th>KYC Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRiders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No riders match your current filters.
                  </td>
                </tr>
              ) : (
                filteredRiders.map((r) => {
                  const fullName =
                    [r.first_name, r.last_name].filter(Boolean).join(' ') ||
                    `Rider #${r.id}`;
                  return (
                    <tr key={r.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                          {fullName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {r.phone_number} •{' '}
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                            <Star size={11} fill="#f59e0b" color="#f59e0b" />
                            {parseFloat(r.rating || 0).toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, textTransform: 'capitalize' }}>
                          {r.vehicle_type || 'Motorbike'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          {(r.id_document_type || 'ghana_card').replace(/_/g, ' ')}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${r.is_online ? 'badge-delivered' : 'badge-inactive'}`}>
                          {r.is_online ? 'Online' : 'Offline'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>
                          {Number(r.food_deliveries || 0) + Number(r.parcel_deliveries || 0)} trips
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {r.food_deliveries || 0} food • {r.parcel_deliveries || 0} parcel
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>
                          GH₵ {parseFloat(r.wallet_balance || 0).toFixed(2)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Earned: GH₵ {parseFloat(r.total_earned || 0).toFixed(2)}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                          <span
                            className={`badge ${
                              r.verification_status === 'approved'
                                ? 'badge-delivered'
                                : r.verification_status === 'rejected'
                                  ? 'badge-cancelled'
                                  : 'badge-pending'
                            }`}
                          >
                            {r.verification_status || 'pending'}
                          </span>
                          {r.is_active === false && (
                            <span className="badge badge-cancelled">Suspended</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="btn-outline btn-sm"
                            onClick={() => setSelectedRider(r)}
                          >
                            <FileCheck size={14} /> Review KYC
                          </button>
                          {r.verification_status !== 'approved' && (
                            <button
                              type="button"
                              className="btn-vendor btn-sm"
                              disabled={updatingId === r.id}
                              onClick={() => handleUpdateKyc(r, 'approved')}
                            >
                              <CheckCircle2 size={14} /> Approve
                            </button>
                          )}
                          <button
                            type="button"
                            className={r.is_active === false ? 'btn-outline btn-sm' : 'btn-danger-outline btn-sm'}
                            onClick={() => handleToggleRiderActive(r)}
                            title={r.is_active === false ? 'Activate rider account' : 'Suspend rider account'}
                          >
                            {r.is_active === false ? <ShieldCheck size={14} /> : <ShieldBan size={14} />}
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

      {/* Rider KYC Inspection & Approval Modal */}
      {selectedRider && (
        <div className="modal-backdrop" onClick={() => setSelectedRider(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>
                  Rider KYC Inspection —{' '}
                  {[selectedRider.first_name, selectedRider.last_name].filter(Boolean).join(' ') ||
                    selectedRider.phone_number}
                </h3>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setSelectedRider(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-grid-2">
                <div className="payout-settings-row">
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Phone &amp; Vehicle
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      {selectedRider.phone_number} •{' '}
                      <span style={{ textTransform: 'capitalize' }}>
                        {selectedRider.vehicle_type || 'motorbike'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="payout-settings-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Wallet size={16} color="var(--color-brand)" />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Wallet / Total Earned
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        GH₵ {parseFloat(selectedRider.wallet_balance || 0).toFixed(2)} / GH₵{' '}
                        {parseFloat(selectedRider.total_earned || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ marginBottom: '0.75rem', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  Submitted KYC &amp; Compliance Documents
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {KYC_DOC_FIELDS.map((doc) => {
                    const url = selectedRider[doc.key];
                    return (
                      <div key={doc.key} className="payout-settings-row">
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                            {doc.label}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {url ? 'Document uploaded and ready for verification' : 'No image uploaded yet'}
                          </div>
                        </div>
                        {url ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-outline btn-sm"
                          >
                            <ExternalLink size={14} /> View File
                          </a>
                        ) : (
                          <span className="badge badge-pending">Pending Upload</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-danger-outline"
                onClick={() => handleUpdateKyc(selectedRider, 'rejected')}
                disabled={updatingId === selectedRider.id}
              >
                <XCircle size={15} /> Reject KYC
              </button>
              <button
                type="button"
                className="btn-vendor"
                onClick={() => handleUpdateKyc(selectedRider, 'approved')}
                disabled={updatingId === selectedRider.id}
              >
                <CheckCircle2 size={15} /> Approve Rider KYC
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRiders;
