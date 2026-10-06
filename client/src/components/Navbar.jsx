import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCapIcon, 
  SearchIcon, 
  BookmarkIcon, 
  LayersIcon,
  UploadCloudIcon
} from './Icons';

export const Navbar = ({ 
  currentTab, 
  setCurrentTab, 
  onOpenUpload 
}) => {
  const { shelfCount } = useAuth();

  return (
    <nav className="site-nav">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setCurrentTab('explore')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '6px',
            background: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <GraduationCapIcon size={19} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
                StudyFind
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#64748b',
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                padding: '1px 6px',
                borderRadius: '4px'
              }}>
                Open Library
              </span>
            </div>
          </div>
        </div>

        {/* Center Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button 
            className={`btn btn-sm ${currentTab === 'explore' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setCurrentTab('explore')}
          >
            <SearchIcon size={14} />
            <span>Search & Library</span>
          </button>

          <button 
            className={`btn btn-sm ${currentTab === 'packs' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setCurrentTab('packs')}
          >
            <LayersIcon size={14} />
            <span>Study Packs</span>
          </button>

          <button 
            className={`btn btn-sm ${currentTab === 'library' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setCurrentTab('library')}
            style={{ position: 'relative' }}
          >
            <BookmarkIcon size={14} />
            <span>Saved Shelf</span>
            {shelfCount > 0 && (
              <span style={{
                background: currentTab === 'library' ? '#ffffff' : '#0f172a',
                color: currentTab === 'library' ? '#0f172a' : '#ffffff',
                fontSize: '11px',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '9999px',
                marginLeft: '4px'
              }}>
                {shelfCount}
              </span>
            )}
          </button>
        </div>

        {/* Right Action: Upload */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onOpenUpload}
            style={{ fontWeight: 500 }}
          >
            <UploadCloudIcon size={14} />
            <span>Upload PDF</span>
          </button>
        </div>

      </div>
    </nav>
  );
};
