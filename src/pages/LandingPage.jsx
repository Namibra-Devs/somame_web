import { Link } from 'react-router-dom';
import {
  Store,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Bike,
  Utensils,
  PackageCheck,
  BarChart3,
  Clock,
  HeadphonesIcon,
  MapPin
} from 'lucide-react';
import './LandingPage.css';

const CURRENT_YEAR = new Date().getFullYear();

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Top Navigation */}
      <header className="landing-nav">
        <div className="landing-container landing-nav-inner">
          <Link to="/" className="brand-mark">
            <span className="brand-box">S</span>
            <span>Somame</span>
          </Link>

          <nav className="landing-nav-links">
            <a href="#portals">Web Portals</a>
            <a href="#capabilities">Capabilities</a>
          </nav>

          <div className="landing-nav-actions">
            <Link to="/admin/login" className="btn-admin-nav">
              <ShieldCheck size={16} />
              Admin Login
            </Link>
            <Link to="/vendor/login" className="btn-vendor-nav">
              <Store size={16} />
              Vendor Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-container hero-grid animate-fade-in">
          <div>
            <div className="hero-badge">
              <span className="status-dot" />
              <span>Somame Commerce &amp; Logistics Platform</span>
            </div>

            <h1 className="hero-title">
              Unified food delivery, parcel dispatch, and store operations.
            </h1>

            <p className="hero-subtitle">
              Manage restaurant menus, process live customer orders, coordinate delivery riders, and oversee city-wide operations from a clean, reliable web workspace.
            </p>

            <div className="hero-actions">
              <Link to="/vendor/login" className="btn-hero-vendor">
                <Store size={18} />
                Access Vendor Portal
                <ArrowRight size={18} />
              </Link>
              <Link to="/admin/login" className="btn-hero-admin">
                <ShieldCheck size={18} />
                Admin Console
              </Link>
            </div>

            <div className="hero-metrics">
              <div className="metric-item">
                <strong>Real-Time</strong>
                <span>Socket.io Order &amp; Rider Sync</span>
              </div>
              <div className="metric-item">
                <strong>PostGIS</strong>
                <span>Spatial Vendor &amp; Fare Routing</span>
              </div>
              <div className="metric-item">
                <strong>Multi-Role</strong>
                <span>Dedicated Merchant &amp; Admin Portals</span>
              </div>
            </div>
          </div>

          {/* Flat Architectural Operations Preview */}
          <div className="hero-preview-card">
            <div className="preview-header">
              <div className="preview-header-title">
                <Clock size={16} />
                <span>Live Operations Feed</span>
              </div>
              <span className="preview-tag">System Online</span>
            </div>

            <div className="preview-panel-block">
              <div className="preview-block-top">
                <span className="preview-order-id">ORDER #ORD-7832</span>
                <span className="preview-badge-blue">Preparing</span>
              </div>
              <div className="preview-order-title">KFC East Legon &rarr; Osu Oxford St.</div>
              <div className="preview-order-meta">
                <span>2x Streetwise Two, 1x Coleslaw</span>
                <strong>GH₵ 120.00</strong>
              </div>
            </div>

            <div className="preview-panel-block">
              <div className="preview-block-top">
                <span className="preview-order-id">PARCEL #PRC-4019</span>
                <span className="preview-badge-blue">Rider Assigned</span>
              </div>
              <div className="preview-order-title">Airport Residential &rarr; Cantonments</div>
              <div className="preview-order-meta">
                <span>Express Document Dispatch (4.2 km)</span>
                <strong>GH₵ 35.00</strong>
              </div>
            </div>

            <div className="preview-kpi-row">
              <div className="preview-kpi-box">
                <div className="preview-kpi-label">Store Settlement</div>
                <div className="preview-kpi-val">GH₵ 14,820</div>
                <div className="preview-kpi-sub">Instant MoMo &amp; Card</div>
              </div>
              <div className="preview-kpi-box">
                <div className="preview-kpi-label">Avg. Dispatch</div>
                <div className="preview-kpi-val">24 mins</div>
                <div className="preview-kpi-sub">Live GPS Tracked</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dedicated Web Portals Section */}
      <section id="portals" className="landing-section landing-section-subtle">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-eyebrow">Role-Based Access</span>
            <h2 className="section-title">Choose your workspace</h2>
            <p className="section-description">
              Vendor partners and system administrators have separate, dedicated authentication routes and tailored dashboards.
            </p>
          </div>

          <div className="portals-grid">
            {/* Vendor Portal Card */}
            <div className="portal-card">
              <div className="portal-card-top">
                <div className="portal-icon-box portal-icon-vendor">
                  <Store size={24} />
                </div>
                <span className="portal-route-pill">/vendor/login</span>
                <h3>Vendor &amp; Merchant Portal</h3>
                <p>
                  Built for restaurants, grocery stores, and retail merchants on Somame to manage daily kitchen and storefront operations.
                </p>
                <ul className="portal-checklist">
                  <li>
                    <CheckCircle2 size={16} color="var(--color-vendor)" />
                    Accept, prepare, and hand off live customer orders
                  </li>
                  <li>
                    <CheckCircle2 size={16} color="var(--color-vendor)" />
                    Manage menu categories, items, pricing, and photos
                  </li>
                  <li>
                    <CheckCircle2 size={16} color="var(--color-vendor)" />
                    Configure operating hours, holidays, and store promotions
                  </li>
                  <li>
                    <CheckCircle2 size={16} color="var(--color-vendor)" />
                    Track revenue analytics and repeat customer insights
                  </li>
                </ul>
              </div>

              <Link to="/vendor/login" className="portal-card-link vendor">
                <span>Sign in to Vendor Portal</span>
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Admin Portal Card */}
            <div className="portal-card">
              <div className="portal-card-top">
                <div className="portal-icon-box portal-icon-admin">
                  <ShieldCheck size={24} />
                </div>
                <span className="portal-route-pill">/admin/login</span>
                <h3>System Administration Console</h3>
                <p>
                  Built for Somame operations teams to configure platform parameters, oversee partners, and resolve support tickets.
                </p>
                <ul className="portal-checklist">
                  <li>
                    <CheckCircle2 size={16} color="var(--color-brand)" />
                    Manage global marketplace categories and visibility
                  </li>
                  <li>
                    <CheckCircle2 size={16} color="var(--color-brand)" />
                    Configure delivery base fares, per-km rates, and commissions
                  </li>
                  <li>
                    <CheckCircle2 size={16} color="var(--color-brand)" />
                    Monitor vendors, riders, customer accounts, and payouts
                  </li>
                  <li>
                    <CheckCircle2 size={16} color="var(--color-brand)" />
                    Respond to real-time customer support cases and chats
                  </li>
                </ul>
              </div>

              <Link to="/admin/login" className="portal-card-link admin">
                <span>Sign in to Admin Console</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="capabilities" className="landing-section">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-eyebrow">Platform Architecture</span>
            <h2 className="section-title">Everything powered by Somame API</h2>
            <p className="section-description">
              Connected directly to your PostgreSQL, PostGIS, MinIO object storage, and Socket.io backend services.
            </p>
          </div>

          <div className="capabilities-grid">
            <div className="capability-card">
              <div className="capability-icon">
                <Utensils size={20} />
              </div>
              <h4>Menu &amp; Catalog Engine</h4>
              <p>
                Organize store menus into custom categories, upload high-resolution product images, and toggle availability in one click.
              </p>
            </div>

            <div className="capability-card">
              <div className="capability-icon">
                <Bike size={20} />
              </div>
              <h4>Real-Time Dispatch</h4>
              <p>
                Instant order status transitions from placement to rider pickup and doorstep confirmation over authenticated WebSockets.
              </p>
            </div>

            <div className="capability-card">
              <div className="capability-icon">
                <PackageCheck size={20} />
              </div>
              <h4>Parcel Logistics</h4>
              <p>
                Automated distance-based parcel fare calculation, pickup/dropoff verification, and live rider trajectory tracking.
              </p>
            </div>

            <div className="capability-card">
              <div className="capability-icon">
                <BarChart3 size={20} />
              </div>
              <h4>Store Analytics &amp; CRM</h4>
              <p>
                Monitor daily sales volume, top-performing menu items, customer order histories, and active promotional campaigns.
              </p>
            </div>

            <div className="capability-card">
              <div className="capability-icon">
                <MapPin size={20} />
              </div>
              <h4>Spatial Discovery</h4>
              <p>
                PostGIS-backed proximity search connects customers with nearby open vendors and dispatches the closest available riders.
              </p>
            </div>

            <div className="capability-card">
              <div className="capability-icon">
                <HeadphonesIcon size={20} />
              </div>
              <h4>Integrated Support Desk</h4>
              <p>
                Order-linked support cases, help center articles, and real-time messaging between customers and support agents.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container footer-inner">
          <div className="brand-mark">
            <span className="brand-box">S</span>
            <span>Somame</span>
          </div>

          <div className="footer-links">
            <Link to="/vendor/login">Vendor Login</Link>
            <Link to="/admin/login">Admin Login</Link>
          </div>

          <div className="footer-copy">
            &copy; {CURRENT_YEAR} Somame Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
