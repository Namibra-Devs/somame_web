import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Store, Smartphone, Lock, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import '../Auth.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const VendorLogin = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVendorLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login-with-password`, {
        phone_number: phone,
        password
      });

      const { user, token } = response.data.data;

      if (user.role !== 'vendor') {
        setError('This account is not registered as a Vendor partner.');
        setLoading(false);
        return;
      }

      localStorage.setItem('somame_token', token);
      localStorage.setItem('somame_user', JSON.stringify(user));
      navigate('/vendor/dashboard');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Unable to sign in. Please verify your credentials or ensure the API server is running.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewDashboard = () => {
    navigate('/vendor/dashboard');
  };

  return (
    <div className="auth-page">
      <header className="auth-topbar">
        <Link to="/" className="auth-back-link">
          <ArrowLeft size={16} />
          Back to Home
        </Link>
        <div className="auth-switch-link">
          System administrator?
          <Link to="/admin/login">Admin Login</Link>
        </div>
      </header>

      <main className="auth-main animate-fade-in">
        <div className="auth-card">
          <div className="auth-badge vendor">
            <Store size={14} />
            <span>Vendor Portal</span>
          </div>

          <div className="auth-header">
            <h1>Merchant Sign In</h1>
            <p>Access your store dashboard, live orders, and menu catalog.</p>
          </div>

          {error && <div className="auth-alert">{error}</div>}

          <form className="auth-form" onSubmit={handleVendorLogin}>
            <div className="auth-field">
              <label htmlFor="vendor-phone">Phone Number</label>
              <div className="auth-input-wrap">
                <Smartphone className="auth-input-icon" size={18} />
                <input
                  id="vendor-phone"
                  type="text"
                  className="auth-input"
                  placeholder="e.g. 0541234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="vendor-password">Password</label>
              <div className="auth-input-wrap">
                <Lock className="auth-input-icon" size={18} />
                <input
                  id="vendor-password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn vendor" disabled={loading}>
              <span>{loading ? 'Signing in...' : 'Sign In to Vendor Portal'}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="auth-divider">
            <button type="button" className="auth-demo-btn" onClick={handlePreviewDashboard}>
              Continue to Vendor Dashboard Preview &rarr;
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VendorLogin;
