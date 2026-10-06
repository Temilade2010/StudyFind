import React, { useState, useEffect } from 'react';
import { 
  ShieldCheckIcon, 
  UserCheckIcon, 
  AlertTriangleIcon, 
  CheckCircleIcon, 
  XIcon, 
  TrendingUpIcon 
} from '../components/Icons';
import { api } from '../services/api';

export const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('verifications'); // 'verifications' | 'reports' | 'analytics'
  const [pendingInstructors, setPendingInstructors] = useState([]);
  const [reports, setReports] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [instRes, repRes, analRes] = await Promise.all([
        api.getPendingInstructors().catch(() => ({ pending: [] })),
        api.getAdminReports().catch(() => ({ reports: [] })),
        api.getAdminAnalytics().catch(() => null)
      ]);
      setPendingInstructors(instRes.pending || []);
      setReports(repRes.reports || []);
      setAnalytics(analRes);
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerify = async (id, status) => {
    try {
      await api.verifyInstructor(id, status);
      setPendingInstructors(prev => prev.filter(u => u.id !== id));
      alert(`Instructor ${status === 'verified' ? 'Approved & Badged' : 'Rejected'}.`);
    } catch (err) {
      alert('Action failed: ' + err.message);
    }
  };

  const handleResolveReport = async (id, action) => {
    try {
      await api.resolveAdminReport(id, action);
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: action === 'take_down' ? 'resolved' : 'dismissed' } : r));
      alert(`Report marked as ${action === 'take_down' ? 'Quarantined / Taken Down' : 'Dismissed'}.`);
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f87171'
          }}>
            <ShieldCheckIcon size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '26px', color: '#fff', margin: 0 }}>
              Platform Academic Moderation & Control
            </h1>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>
              Instructor credential reviews, DMCA copyright triage, and platform metrics
            </span>
          </div>
        </div>

        {/* Admin Navigation Pills */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`btn btn-sm ${activeTab === 'verifications' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('verifications')}
          >
            <UserCheckIcon size={14} /> Pending Instructors ({pendingInstructors.length})
          </button>
          <button 
            className={`btn btn-sm ${activeTab === 'reports' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('reports')}
          >
            <AlertTriangleIcon size={14} /> Reports & Flags ({reports.filter(r => r.status === 'pending').length})
          </button>
          <button 
            className={`btn btn-sm ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('analytics')}
          >
            <TrendingUpIcon size={14} /> Global Analytics
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>Loading admin dashboard...</div>
      ) : activeTab === 'verifications' ? (
        /* Tab 1: Instructor Verifications */
        <div style={{ background: '#0f172a', border: '1px solid var(--border-subtle)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
            <h2 style={{ fontSize: '18px', color: '#fff', margin: 0 }}>
              Instructor Credential Verification Queue ({pendingInstructors.length})
            </h2>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>
              Ensure instructors have verified academic affiliations before enabling mass uploads
            </span>
          </div>

          {pendingInstructors.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              No pending instructor verification requests at this time.
            </div>
          ) : (
            <div>
              {pendingInstructors.map(inst => (
                <div 
                  key={inst.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px 24px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    gap: '20px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <img 
                      src={inst.avatar_url} 
                      alt={inst.full_name} 
                      style={{ width: '48px', height: '48px', borderRadius: '50%' }}
                    />
                    <div>
                      <h3 style={{ fontSize: '16px', color: '#f8fafc', marginBottom: '2px' }}>
                        {inst.full_name}
                      </h3>
                      <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                        <strong>{inst.institution}</strong> • {inst.email}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                        Bio: {inst.bio || 'Applicant provided credentials for department verification.'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleVerify(inst.id, 'verified')}
                    >
                      <CheckCircleIcon size={14} /> Approve & Verify
                    </button>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleVerify(inst.id, 'rejected')}
                      style={{ color: '#f87171' }}
                    >
                      <XIcon size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'reports' ? (
        /* Tab 2: Moderation Reports */
        <div style={{ background: '#0f172a', border: '1px solid var(--border-subtle)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
            <h2 style={{ fontSize: '18px', color: '#fff', margin: 0 }}>
              Flagged Content & Takedown Reports
            </h2>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>
              Protect intellectual property and address student reports of inappropriate or erroneous materials
            </span>
          </div>

          {reports.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              No active content reports or copyright flags.
            </div>
          ) : (
            <div>
              {reports.map(rep => (
                <div 
                  key={rep.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px 24px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    gap: '20px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5' }}>
                        {rep.reason}
                      </span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        Status: <strong style={{ textTransform: 'capitalize' }}>{rep.status}</strong>
                      </span>
                    </div>
                    <h3 style={{ fontSize: '15px', color: '#f8fafc', marginBottom: '2px' }}>
                      Target Resource: {rep.resourceTitle}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                      Reporter note: "{rep.details || 'Flagged for moderation check'}"
                    </p>
                  </div>

                  {rep.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleResolveReport(rep.id, 'dismiss')}
                      >
                        Dismiss
                      </button>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleResolveReport(rep.id, 'take_down')}
                        style={{ background: '#dc2626' }}
                      >
                        Quarantine & Takedown
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Tab 3: System Analytics */
        analytics && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
              <div style={{ background: '#0f172a', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '20px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Total Registered Users</span>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>{analytics.metrics.totalUsers}</div>
              </div>
              <div style={{ background: '#0f172a', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '20px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Verified Instructors</span>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>{analytics.metrics.instructorCount}</div>
              </div>
              <div style={{ background: '#0f172a', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '20px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Internal Documents</span>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#6366f1', marginTop: '4px' }}>{analytics.metrics.totalResources}</div>
              </div>
              <div style={{ background: '#0f172a', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '20px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Global Document Downloads</span>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>{analytics.metrics.totalDownloads.toLocaleString()}</div>
              </div>
            </div>

            <div style={{ background: '#0f172a', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '16px' }}>
                Subject Distribution & Student Demand
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                {Object.entries(analytics.subjectBreakdown || {}).map(([subject, count]) => (
                  <div key={subject} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#cbd5e1', fontWeight: 600 }}>{subject}</span>
                    <span className="badge badge-internal">{count} materials</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )}

    </div>
  );
};
