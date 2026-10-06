import React, { useState } from 'react';
import { BookmarkIcon, DownloadIcon, SearchIcon, TrashIcon } from '../components/Icons';
import { ResourceCard } from '../components/ResourceCard';
import { useAuth } from '../context/AuthContext';

export const LibraryPage = ({ onPreview, onOpenAiSummary, onOpenAiChat, onNavigateExplore }) => {
  const { savedShelf, clearShelf, recentlyDownloaded } = useAuth();
  const [activeTab, setActiveTab] = useState('saved'); // 'saved' | 'downloads'
  const [searchFilter, setSearchFilter] = useState('');

  const displayedList = activeTab === 'saved' ? savedShelf : recentlyDownloaded;

  const filteredList = displayedList.filter(item => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(term)) ||
      (item.subject && item.subject.toLowerCase().includes(term)) ||
      (item.uploader_name && item.uploader_name.toLowerCase().includes(term))
    );
  });

  return (
    <div className="container" style={{ padding: '36px 20px 80px' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <BookmarkIcon size={20} fill="#0f172a" color="#0f172a" />
            <h1 style={{ fontSize: '24px', color: '#0f172a', margin: 0, fontWeight: 700 }}>
              Saved Materials & Reading List
            </h1>
          </div>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Your personal reading list saved directly in your browser. No login needed.
          </p>
        </div>

        {/* Tab switcher: Saved Shelf vs Downloads */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button 
            className={`btn btn-sm ${activeTab === 'saved' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('saved')}
          >
            <BookmarkIcon size={13} />
            <span>Saved ({savedShelf.length})</span>
          </button>
          <button 
            className={`btn btn-sm ${activeTab === 'downloads' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('downloads')}
          >
            <DownloadIcon size={13} />
            <span>Downloads ({recentlyDownloaded.length})</span>
          </button>
        </div>
      </div>

      {/* Filter and Clear controls */}
      {displayedList.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '10px 14px',
          marginBottom: '24px'
        }}>
          {/* Quick Search inside shelf */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <SearchIcon size={14} color="#64748b" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              placeholder="Search within saved materials..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              style={{
                width: '100%',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '7px 10px 7px 30px',
                color: '#0f172a',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>

          {activeTab === 'saved' && (
            <button
              onClick={() => {
                if (window.confirm('Clear all saved materials from your shelf?')) {
                  clearShelf();
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#dc2626',
                cursor: 'pointer',
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <TrashIcon size={13} />
              <span>Clear Shelf</span>
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {displayedList.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '50px 20px',
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ fontSize: '16px', color: '#0f172a', marginBottom: '6px' }}>
            {activeTab === 'saved' ? 'Your saved shelf is empty' : 'No recent downloads yet'}
          </h3>
          <p style={{ fontSize: '13.5px', color: '#64748b', marginBottom: '16px' }}>
            {activeTab === 'saved' 
              ? 'Click "Save" on any textbook or lecture note to add it here.'
              : 'Materials you download will appear here for fast access.'}
          </p>
          <button 
            className="btn btn-primary btn-sm"
            onClick={onNavigateExplore}
          >
            Browse Reading Materials
          </button>
        </div>
      ) : filteredList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
          No saved materials match "{searchFilter}".
        </div>
      ) : (
        <div className="resources-grid">
          {filteredList.map(item => (
            <ResourceCard 
              key={item.id}
              resource={item}
              onPreview={onPreview}
              onOpenAiSummary={onOpenAiSummary}
              onOpenAiChat={onOpenAiChat}
            />
          ))}
        </div>
      )}

    </div>
  );
};
