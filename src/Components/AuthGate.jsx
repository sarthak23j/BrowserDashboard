import React, { useState, useEffect } from 'react';
import '../Styles/AuthGate.css';

const AuthGate = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem('creds_auth') === 'true') {
      setAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(false);

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        sessionStorage.setItem('creds_auth', 'true');
        setAuthenticated(true);
      } else {
        setError(true);
        setPassword('');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(true);
    }
  };

  if (loading) return null;
  if (authenticated) return children;

  return (
    <div className="auth-gate">
      <form className={`auth-box ${error ? 'shake' : ''}`} onSubmit={handleSubmit} onAnimationEnd={() => setError(false)}>
        <div className="auth-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <input
          type="password"
          className="auth-input"
          placeholder="enter password..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          autoComplete="off"
        />
        {error && <div className="auth-error">wrong password</div>}
        <button type="submit" className="auth-btn">unlock</button>
      </form>
    </div>
  );
};

export default AuthGate;
