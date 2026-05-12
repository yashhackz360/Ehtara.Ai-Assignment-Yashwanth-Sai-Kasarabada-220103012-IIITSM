import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPage.css';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { login, signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
        toast.success('Welcome back!');
      } else {
        await signup(form.name, form.email, form.password);
        toast.success('Account created successfully.');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="auth-page">
      {/* Ambient Orbs */}
      <div className="auth-orbs">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>

      {/* Two-column layout */}
      <div className="auth-columns">

        {/* ── Left: Attribution Card ── */}
        <div className="auth-info-card">
          <div className="auth-info-logo">
            <span className="auth-info-appname">TaskFlow</span>
          </div>

          <p className="auth-info-tagline">
            Your team's command center — manage projects, assign tasks, and crush deadlines together.
          </p>

          <div className="auth-info-divider" />

          <div className="auth-info-attribution">
            <div className="auth-info-dev-row">
              <span className="auth-info-label">DEVELOPED BY</span>
              <span className="auth-info-dev-name">Yashwanth Sai Kasarabada</span>
            </div>
            <div className="auth-info-meta-row">
              <span className="auth-info-roll-badge">Roll No: 220103012</span>
            </div>
            <p className="auth-info-institute">
              Indian Institute of Information Technology<br />
              Senapati, Manipur
            </p>
            <div className="auth-info-assignment">
              <span className="auth-info-assign-label">Hiring Assignment</span>
              <span className="auth-info-assign-title">Team Task Manager</span>
              <span className="auth-info-assign-company">ethara.ai &nbsp;·&nbsp; AI Full Stack Developer Role</span>
            </div>
          </div>

          <div className="auth-info-features">
            {['Role-based access control', 'Kanban board view', 'Team collaboration', 'Real-time task tracking'].map(f => (
              <div key={f} className="auth-info-feature">
                <span className="auth-info-check">✓</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Auth Card ── */}
        <div className="auth-card">
          {/* Welcome Header */}
          <div className="auth-brand" style={{ marginBottom: '24px' }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '24px', fontWeight: 800, color: 'var(--stitch-on-surface)', marginBottom: '4px' }}>
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="auth-tagline" style={{ marginTop: 0, textAlign: 'left' }}>
              {isLogin ? 'Please enter your details to sign in.' : 'Please enter your details to sign up.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Name (signup only) */}
            {!isLogin && (
              <div className="auth-field animate-fade-in">
                <label className="auth-label" htmlFor="auth-name">Full Name</label>
                <div className="auth-input-wrap">
                  <span className="material-symbols-outlined auth-field-icon">person</span>
                  <input
                    id="auth-name"
                    className="auth-input"
                    type="text"
                    name="name"
                    placeholder="Yashwanth Sai"
                    value={form.name}
                    onChange={handleChange}
                    required={!isLogin}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-email">Email Address</label>
              <div className="auth-input-wrap">
                <span className="material-symbols-outlined auth-field-icon">mail</span>
                <input
                  id="auth-email"
                  className="auth-input"
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <div className="auth-label-row">
                <label className="auth-label" htmlFor="auth-password">Password</label>
                {isLogin && <span className="auth-forgot">Forgot?</span>}
              </div>
              <div className="auth-input-wrap">
                <span className="material-symbols-outlined auth-field-icon">lock</span>
                <input
                  id="auth-password"
                  className="auth-input"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* Primary CTA */}
            <button
              id="auth-submit"
              type="submit"
              className="auth-btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span className="auth-spinner" />
              ) : (
                <>
                  {isLogin ? 'Continue' : 'Create Account'}
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    arrow_forward
                  </span>
                </>
              )}
            </button>

          </form>

          {/* Footer toggle */}
          <div className="auth-footer">
            <p className="auth-switch-text">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                id="auth-toggle"
                type="button"
                className="auth-switch-btn"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setForm({ name: '', email: '', password: '' });
                }}
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
        {/* ── End Auth Card ── */}

      </div>
    </div>
  );
}

export default AuthPage;
