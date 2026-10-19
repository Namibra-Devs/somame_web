import { Users, Store, Bike, TrendingUp } from 'lucide-react';
import './AdminDashboard.css';

const StatCard = ({ title, value, icon: Icon, trend, colorClass }) => (
  <div className="card stat-card animate-fade-in">
    <div className="stat-header">
      <div className={`stat-icon-wrapper ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div className={`stat-trend ${trend > 0 ? 'positive' : 'negative'}`}>
        <TrendingUp size={16} /> {Math.abs(trend)}%
      </div>
    </div>
    <div className="stat-content">
      <h3>{title}</h3>
      <p className="stat-value">{value}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header mb-6">
        <h1>Dashboard Overview</h1>
        <p className="text-muted">Welcome back, here's what's happening today.</p>
      </div>

      <div className="stats-grid">
        <StatCard 
          title="Total Users" 
          value="12,450" 
          icon={Users} 
          trend={12.5} 
          colorClass="icon-primary" 
        />
        <StatCard 
          title="Active Vendors" 
          value="142" 
          icon={Store} 
          trend={5.2} 
          colorClass="icon-secondary" 
        />
        <StatCard 
          title="Active Riders" 
          value="85" 
          icon={Bike} 
          trend={-2.4} 
          colorClass="icon-warning" 
        />
        <StatCard 
          title="Today's Revenue" 
          value="₵ 4,250" 
          icon={TrendingUp} 
          trend={18.1} 
          colorClass="icon-success" 
        />
      </div>

      <div className="dashboard-content">
        <div className="card recent-activity animate-fade-in">
          <h3>Recent Orders</h3>
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Vendor</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>#ORD-7829</td>
                  <td>Kwame Mensah</td>
                  <td>KFC Madina</td>
                  <td><span className="status-badge status-pending">Pending</span></td>
                  <td>₵ 120.00</td>
                </tr>
                <tr>
                  <td>#ORD-7828</td>
                  <td>Akosua Osei</td>
                  <td>Pizza Hut</td>
                  <td><span className="status-badge status-completed">Completed</span></td>
                  <td>₵ 85.50</td>
                </tr>
                <tr>
                  <td>#ORD-7827</td>
                  <td>Yaw Boakye</td>
                  <td>Papaye</td>
                  <td><span className="status-badge status-delivery">On Delivery</span></td>
                  <td>₵ 240.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
