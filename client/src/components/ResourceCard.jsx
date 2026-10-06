import React, { useState } from 'react';
import { 
  FileTextIcon, 
  DownloadIcon, 
  EyeIcon, 
  BookmarkIcon, 
  FileTextIcon as SummaryIcon
} from './Icons';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ResourceCard = ({
  resource,
  onPreview,
  onOpenAiSummary,
  onOpenAiChat
}) => {
  const { isSaved, toggleSave, trackDownload } = useAuth();
  const [downloads, setDownloads] = useState(resource.download_count || 120);
  const [isDownloading, setIsDownloading] = useState(false);
  const saved = isSaved(resource.id);

  // Simple clean badge label
  const getDocumentTypeBadge = () => {
    const t = resource.document_type || '';
    const title = (resource.title || '').toLowerCase();
    if (t === 'textbook' || title.includes('textbook') || title.includes('handbook')) {
      return { label: 'Textbook', bg: '#eff6ff', color: '#1d4ed8', border: '#dbeafe' };
    }
    if (t === 'exam_packet' || title.includes('exam') || title.includes('midterm') || title.includes('final')) {
      return { label: 'Exam Pack', bg: '#fffbeb', color: '#b45309', border: '#fde68a' };
    }
    if (t === 'cheatsheet' || title.includes('cheatsheet') || title.includes('formula')) {
      return { label: 'Cheatsheet', bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' };
    }
    if (resource.source === 'arxiv' || t === 'paper' || title.includes('paper')) {
      return { label: 'Research Paper', bg: '#f1f5f9', color: '#334155', border: '#e2e8f0' };
    }
    return { label: 'Lecture Notes', bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
  };

  const badge = getDocumentTypeBadge();

  const handleBookmark = (e) => {
    e.stopPropagation();
    toggleSave(resource);
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    setIsDownloading(true);
    trackDownload(resource);

    try {
      const res = await api.recordDownload(resource.id, resource.file_url, resource);
      setDownloads(res.downloadCount || downloads + 1);
      
      const downloadTarget = res.downloadUrl || resource.file_url;
      
      if (downloadTarget.startsWith('http')) {
        window.open(downloadTarget, '_blank');
      } else {
        const link = document.createElement('a');
        link.href = downloadTarget;
        link.download = `${(resource.title || 'document').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      window.open(resource.file_url, '_blank');
    } finally {
      setTimeout(() => setIsDownloading(false), 1000);
    }
  };

  const formattedSize = resource.file_size_bytes 
    ? `${(resource.file_size_bytes / (1024 * 1024)).toFixed(1)} MB`
    : '2.4 MB';

  return (
    <div className="academic-card">
      
      {/* Top Header: Badge & Bookmark */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ 
            fontSize: '11px', 
            fontWeight: 600, 
            padding: '2px 8px', 
            borderRadius: '4px',
            background: badge.bg, 
            color: badge.color, 
            border: `1px solid ${badge.border}` 
          }}>
            {badge.label}
          </span>
          <span style={{ 
            fontSize: '11px', 
            color: '#64748b', 
            background: '#f8fafc', 
            border: '1px solid #e2e8f0', 
            padding: '2px 6px', 
            borderRadius: '4px',
            textTransform: 'capitalize' 
          }}>
            {resource.subject || 'General'}
          </span>
        </div>

        {/* Bookmark Button */}
        <button 
          onClick={handleBookmark}
          title={saved ? "Saved in reading shelf" : "Save to reading shelf"}
          style={{
            background: saved ? '#fffbeb' : '#ffffff',
            border: '1px solid',
            borderColor: saved ? '#fde68a' : '#e2e8f0',
            borderRadius: '4px',
            padding: '4px 7px',
            color: saved ? '#b45309' : '#64748b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            fontWeight: 500
          }}
        >
          <BookmarkIcon size={12} fill={saved ? "#b45309" : "none"} />
          <span>{saved ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      {/* Title */}
      <h3 
        onClick={() => onPreview(resource)}
        style={{ 
          fontSize: '15.5px', 
          fontWeight: 600,
          lineHeight: 1.35, 
          color: '#0f172a', 
          marginBottom: '6px',
          cursor: 'pointer',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#2563eb'}
        onMouseLeave={e => e.currentTarget.style.color = '#0f172a'}
      >
        {resource.title}
      </h3>

      {/* Author / Source */}
      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {resource.uploader_name || 'Academic Scholar'} {resource.published_year ? `(${resource.published_year})` : ''}
      </div>

      {/* Description */}
      <p style={{ 
        fontSize: '12.5px', 
        color: '#475569', 
        lineHeight: 1.45, 
        marginBottom: '14px',
        flexGrow: 1,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {resource.description}
      </p>

      {/* Document Metadata Details */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingTop: '8px', 
        borderTop: '1px solid #f1f5f9',
        fontSize: '11.5px',
        color: '#64748b',
        marginBottom: '12px'
      }}>
        <div>
          <span>{resource.page_count || 32} pages</span>
          <span style={{ margin: '0 5px' }}>•</span>
          <span>{formattedSize}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#475569' }}>
          <DownloadIcon size={11} color="#64748b" />
          <span>{downloads.toLocaleString()}</span>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        
        {/* Read Online */}
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => onPreview(resource)}
          style={{ flex: 1, justifyContent: 'center', fontSize: '12px' }}
        >
          <EyeIcon size={13} />
          <span>Read PDF</span>
        </button>

        {/* Direct Download */}
        <button 
          className="btn btn-primary btn-sm"
          onClick={handleDownload}
          disabled={isDownloading}
          style={{ flex: 1, justifyContent: 'center', fontSize: '12px' }}
        >
          <DownloadIcon size={13} />
          <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
        </button>

        {/* Quick Summary Button */}
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => onOpenAiSummary(resource)}
          title="View document summary"
          style={{ padding: '6px 9px', fontSize: '11.5px', color: '#475569' }}
        >
          Summary
        </button>

      </div>

    </div>
  );
};
