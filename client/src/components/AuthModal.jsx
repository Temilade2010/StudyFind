import React, { useState } from 'react';
import { XIcon, GraduationCapIcon, UserCheckIcon } from './Icons';
import { useAuth } from '../context/AuthContext';

export const AuthModal = ({ onClose }) => {
  const { login, signup, switchPersona } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institution, setInstitution] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        await signup({
          email,
          password,
          full_name: fullName,
          role,
          institution
        });
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '480px', padding: '28px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <GraduationCapIcon size={18} />
            </div>
            <h2 style={{ fontSize: '18px', color: '#fff', margin: 0 }}>
              {isSignup ? 'Create StudyFind Account' : 'Sign In to StudyFind'}
            </h2>
          </div>
          <button className="btn btn-icon btn-sm" onClick={onClose}>
            <XIcon size={18} />
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '10px 14px',
            color: '#fca5a5',
            fontSize: '13px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {/* Demo Fast Login Pills */}
        <div style={{ 
          background: 'rgba(255,255,255,0.02)', 
          border: '1px solid var(--border-subtle)', 
          borderRadius: '10px', 
          padding: '12px', 
          marginBottom: '18px' 
        }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
            Instant Demo Logins (One-Click)
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => { switchPersona('student'); onClose(); }}
              style={{ fontSize: '12px', padding: '4px 8px' }}
            >
              🎓 Student Demo
            </button>
            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => { switchPersona('instructor'); onClose(); }}
              style={{ fontSize: '12px', padding: '4px 8px' }}
            >
              👨‍🏫 Instructor Demo
            </button>
            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => { switchPersona('admin'); onClose(); }}
              style={{ fontSize: '12px', padding: '4px 8px' }}
            >
              🛡️ Admin Demo
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isSignup && (
            <>
              {/* Role selection */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                  I am a:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${role === 'student' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setRole('student')}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${role === 'instructor' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setRole('instructor')}
                  >
                    Instructor / Professor
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
                  Full Name
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Jordan Smith"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
                  University / College / School
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Stanford University"
                  value={institution}
                  onChange={e => setInstitution(e.target.value)}
                />
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
              Email Address
            </label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="name@university.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
              Password
            </label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }} disabled={loading}>
            {loading ? 'Authenticating...' : (isSignup ? 'Complete Registration' : 'Sign In')}
          </button>

          <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '13px', color: '#94a3b8' }}>
            {isSignup ? (
              <span>
                Already have an account?{' '}
                <strong 
                  onClick={() => setIsSignup(false)} 
                  style={{ color: '#818cf8', cursor: 'pointer' }}
                >
                  Sign in
                </strong>
              </span>
            ) : (
              <span>
                Don't have an account?{' '}
                <strong 
                  onClick={() => setIsSignup(true)} 
                  style={{ color: '#818cf8', cursor: 'pointer' }}
                >
                  Create one now
                </strong>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
