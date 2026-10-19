import { ShoppingBag, TrendingUp, Clock, AlertCircle } from 'lucide-react';
// We can reuse the StatCard styling from AdminDashboard
import '../admin/AdminDashboard.css';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="card stat-card animate-fade-in">
    <div className="stat-header">
      <div className={`stat-icon-wrapper ${colorClass}`}>
        <Icon size={24} />
      </div>
    </div>
    <div className="stat-content mt-2">
      <h3>{title}</h3>
      <p className="stat-value">{value}</p>
    </div>
  </div>
);

const VendorDashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header mb-6">
        <h1>Store Dashboard</h1>
        <p className="text-muted">Manage your store's operations for today.</p>
      </div>

      <div className="stats-grid">
        <StatCard 
          title="New Orders" 
          value="12" 
          icon={AlertCircle} 
          colorClass="icon-warning" 
        />
        <StatCard 
          title="In Progress" 
          value="5" 
          icon={Clock} 
          colorClass="icon-primary" 
        />
        <StatCard 
          title="Completed Today" 
          value="34" 
          icon={ShoppingBag} 
          colorClass="icon-success" 
        />
        <StatCard 
          title="Today's Earnings" 
          value="₵ 1,250.00" 
          icon={TrendingUp} 
          colorClass="icon-secondary" 
        />
      </div>

      <div className="dashboard-content mt-6">
        <div className="card recent-activity animate-fade-in">
          <div className="flex justify-between items-center mb-4" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>Active Orders</h3>
            <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>View All</button>
          </div>
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Time</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>#ORD-7832</td>
                  <td>10:45 AM</td>
                  <td>2x Fried Rice, 1x Coke</td>
                  <td>₵ 120.00</td>
                  <td><span className="status-badge status-pending">New Order</span></td>
                  <td>
                    <button style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Accept</button>
                  </td>
                </tr>
                <tr>
                  <td>#ORD-7830</td>
                  <td>10:30 AM</td>
                  <td>1x Large Pizza</td>
                  <td>₵ 95.00</td>
                  <td><span className="status-badge status-delivery">Preparing</span></td>
                  <td>
                    <button style={{ color: 'var(--text-muted)' }}>Ready for Pickup</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
