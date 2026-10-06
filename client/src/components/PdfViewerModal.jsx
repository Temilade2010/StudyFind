import React, { useState } from 'react';
import { 
  XIcon, 
  DownloadIcon, 
  FileTextIcon, 
  BookmarkIcon,
  ExternalLinkIcon
} from './Icons';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const PdfViewerModal = ({ resource, onClose, onOpenAiSummary }) => {
  const { isSaved, toggleSave, trackDownload } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  if (!resource) return null;

  const saved = isSaved(resource.id);

  const handleDownload = async () => {
    setIsDownloading(true);
    trackDownload(resource);

    try {
      const res = await api.recordDownload(resource.id, resource.file_url, resource);
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

  return (
    <div className="modal-overlay" onClick={onClose} style={{ padding: '16px' }}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()}
        style={{ 
          maxWidth: '960px', 
          height: '88vh', 
          display: 'flex', 
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden'
        }}
      >
        {/* Clean Header Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff',
          gap: '12px'
        }}>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ 
              fontSize: '16px', 
              fontWeight: 600,
              color: '#0f172a', 
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '560px'
            }}>
              {resource.title}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              <span>{resource.uploader_name || 'Academic Author'}</span>
              <span>•</span>
              <span>{resource.subject}</span>
              <span>•</span>
              <span>{resource.page_count || 32} pages</span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            
            {/* Save to Shelf */}
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => toggleSave(resource)}
              style={{
                color: saved ? '#b45309' : '#475569',
                borderColor: saved ? '#fde68a' : '#e2e8f0',
                background: saved ? '#fffbeb' : '#ffffff'
              }}
            >
              <BookmarkIcon size={13} fill={saved ? "#b45309" : "none"} />
              <span>{saved ? 'Saved' : 'Save'}</span>
            </button>

            {/* View Summary */}
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onOpenAiSummary(resource)}
            >
              <span>Summary</span>
            </button>

            {/* Direct Download Button */}
            <button 
              className="btn btn-primary btn-sm"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              <DownloadIcon size={13} />
              <span>{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
            </button>

            {/* Close */}
            <button 
              className="btn btn-icon btn-sm"
              onClick={onClose}
              title="Close viewer"
            >
              <XIcon size={16} />
            </button>
          </div>
        </div>

        {/* Viewer Sub-bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 18px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          fontSize: '12px',
          color: '#64748b'
        }}>
          <div>
            <span>Source: {resource.external_source_name || resource.source?.toUpperCase() || 'Library Repository'}</span>
          </div>

          <button
            onClick={() => window.open(resource.file_url, '_blank')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#2563eb',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <ExternalLinkIcon size={12} />
            <span>Open in new tab</span>
          </button>
        </div>

        {/* Document Content View */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#f1f5f9' }}>
          <iframe 
            src={resource.file_url}
            title={resource.title}
            onError={() => setIframeError(true)}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: '#ffffff'
            }}
          />

          {iframeError && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '30px',
              textAlign: 'center'
            }}>
              <FileTextIcon size={40} color="#64748b" style={{ marginBottom: '14px' }} />
              <h3 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '8px' }}>
                {resource.title}
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748b', maxWidth: '480px', marginBottom: '20px', lineHeight: 1.5 }}>
                This PDF cannot be directly embedded due to external domain restrictions. You can open it in a dedicated tab or download the file.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-primary" onClick={handleDownload}>
                  <DownloadIcon size={14} /> Download PDF
                </button>
                <button className="btn btn-secondary" onClick={() => window.open(resource.file_url, '_blank')}>
                  <ExternalLinkIcon size={14} /> Open in New Tab
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
