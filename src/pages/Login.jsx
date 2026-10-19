import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Store, ArrowRight, Smartphone, Lock } from 'lucide-react';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('admin');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate login for now
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/vendor');
    }
  };

  return (
    <div className="login-wrapper animate-fade-in">
      <div className="login-container glass-effect">
        <div className="login-header">
          <div className="logo-icon">
            <span className="logo-text">S</span>
          </div>
          <h1>Welcome to Somame</h1>
          <p>Login to access your dashboard</p>
        </div>

        <div className="role-selector">
          <button 
            className={`role-btn ${role === 'admin' ? 'active' : ''}`}
            onClick={() => setRole('admin')}
          >
            <ShieldAlert size={20} /> Admin
          </button>
          <button 
            className={`role-btn ${role === 'vendor' ? 'active' : ''}`}
            onClick={() => setRole('vendor')}
          >
            <Store size={20} /> Vendor
          </button>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label>Phone Number</label>
            <div className="input-wrapper">
              <Smartphone className="input-icon" size={20} />
              <input 
                type="text" 
                className="input-field with-icon" 
                placeholder="e.g. 0541234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input 
                type="password" 
                className="input-field with-icon" 
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary login-submit">
            Sign In <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
