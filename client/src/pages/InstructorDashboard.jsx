import React, { useState, useEffect } from 'react';
import { 
  GraduationCapIcon, 
  UploadCloudIcon, 
  DownloadIcon, 
  EyeIcon, 
  StarIcon, 
  CheckCircleIcon,
  XIcon
} from '../components/Icons';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const InstructorDashboard = ({ onOpenUpload, onPreview }) => {
  const { user } = useAuth();
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUploads = async () => {
    try {
      const res = await api.search({ source: 'internal', limit: 50 });
      // Filter to current instructor's uploads or all internal if demo
      const myItems = (res.results || []).filter(r => r.uploader_id === user?.id || user?.role === 'admin');
      setUploads(myItems);
    } catch (err) {
      console.error('Failed to load instructor uploads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await api.deleteResource(id);
      setUploads(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert('Could not delete resource: ' + err.message);
    }
  };

  const totalDownloads = uploads.reduce((acc, curr) => acc + (curr.download_count || 0), 0);
  const totalViews = uploads.reduce((acc, curr) => acc + (curr.view_count || 0), 0);

  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      
      {/* Instructor Profile Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '32px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img 
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'} 
            alt={user?.full_name}
            style={{ width: '70px', height: '70px', borderRadius: '50%', border: '3px solid #6366f1' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '24px', color: '#fff', margin: 0 }}>
                {user?.full_name || 'Dr. Evelyn Reed'}
              </h1>
              <span className="badge badge-verified">
                <CheckCircleIcon size={12} color="#10b981" /> Verified Instructor
              </span>
            </div>
            <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '4px' }}>
              {user?.academic_title || 'Associate Professor of Computer Science'} • {user?.institution || 'MIT'}
            </div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              {user?.bio || 'Democratizing verified academic study resources and algorithms cheatsheets.'}
            </div>
          </div>
        </div>

        <button className="btn btn-primary" onClick={onOpenUpload}>
          <UploadCloudIcon size={16} /> Upload New Material
        </button>
      </div>

      {/* Metrics Shelf */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '36px'
      }}>
        <div style={{ background: '#0f172a', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '20px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Total Materials Uploaded</span>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', marginTop: '6px' }}>{uploads.length}</div>
        </div>
        <div style={{ background: '#0f172a', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '20px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Total Student Downloads</span>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#38bdf8', marginTop: '6px' }}>{totalDownloads.toLocaleString()}</div>
        </div>
        <div style={{ background: '#0f172a', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '20px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Total In-Browser Views</span>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#818cf8', marginTop: '6px' }}>{totalViews.toLocaleString()}</div>
        </div>
        <div style={{ background: '#0f172a', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '20px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Student Satisfaction</span>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b', marginTop: '6px' }}>4.9 ★</div>
        </div>
      </div>

      {/* Uploads Table / Shelf */}
      <div style={{ background: '#0f172a', border: '1px solid var(--border-subtle)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '18px', color: '#fff', margin: 0 }}>
            Published Educational Resources ({uploads.length})
          </h2>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            Live across platform search
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading materials...</div>
        ) : uploads.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            You haven't uploaded any study materials yet. Click "Upload New Material" above to begin.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {uploads.map(item => (
              <div 
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 24px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  gap: '16px'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                      {item.course_code || item.subject}
                    </span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{item.academic_level}</span>
                  </div>
                  <h3 style={{ fontSize: '15px', color: '#f8fafc', marginBottom: '4px' }}>
                    {item.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: '#64748b' }}>
                    <span>⬇️ {item.download_count?.toLocaleString()} downloads</span>
                    <span>👁️ {item.view_count?.toLocaleString()} views</span>
                    <span>⭐ {item.rating_avg} rating</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => onPreview(item)}
                  >
                    <EyeIcon size={14} /> Preview
                  </button>
                  <button 
                    className="btn btn-icon btn-sm"
                    onClick={() => handleDelete(item.id)}
                    title="Delete Upload"
                    style={{ color: '#f87171' }}
                  >
                    <XIcon size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
