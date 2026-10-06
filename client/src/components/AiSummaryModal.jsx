import React, { useState, useEffect } from 'react';
import { XIcon, FileTextIcon, CheckCircleIcon } from './Icons';
import { api } from '../services/api';

export const AiSummaryModal = ({ resource, onClose, onLaunchChat }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    summary: resource.ai_summary || '',
    keyTakeaways: resource.key_takeaways || [],
    difficulty: resource.academic_level === 'postgraduate' ? 'Advanced' : 'Undergraduate',
    estimatedReadTime: `${Math.round((resource.page_count || 24) * 1.5)} mins`
  });

  useEffect(() => {
    if (!resource.ai_summary) {
      setLoading(true);
      api.getAiSummary(resource.id)
        .then(res => setData(res))
        .catch(err => console.error('Summary error:', err))
        .finally(() => setLoading(false));
    }
  }, [resource]);

  if (!resource) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '600px', padding: '24px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileTextIcon size={20} color="#0f172a" />
            <h2 style={{ fontSize: '17px', color: '#0f172a', margin: 0, fontWeight: 600 }}>
              Document Overview & Key Points
            </h2>
          </div>
          <button className="btn btn-icon btn-sm" onClick={onClose}>
            <XIcon size={16} />
          </button>
        </div>

        {/* Target Resource Banner */}
        <div style={{ 
          background: '#f8fafc', 
          border: '1px solid #e2e8f0', 
          borderRadius: '6px', 
          padding: '12px 14px', 
          marginBottom: '18px' 
        }}>
          <div style={{ fontSize: '11.5px', color: '#64748b', marginBottom: '2px' }}>
            {resource.subject} • {resource.uploader_name}
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
            {resource.title}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '36px 0', color: '#64748b' }}>
            <p style={{ fontSize: '13.5px' }}>Generating document summary...</p>
          </div>
        ) : (
          <div>
            {/* Meta details */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <div style={{ 
                background: '#f8fafc', 
                border: '1px solid #e2e8f0', 
                padding: '6px 10px', 
                borderRadius: '6px', 
                fontSize: '12px' 
              }}>
                <span style={{ color: '#64748b' }}>Level: </span>
                <strong style={{ color: '#0f172a' }}>{data.difficulty || 'Undergraduate'}</strong>
              </div>
              <div style={{ 
                background: '#f8fafc', 
                border: '1px solid #e2e8f0', 
                padding: '6px 10px', 
                borderRadius: '6px', 
                fontSize: '12px' 
              }}>
                <span style={{ color: '#64748b' }}>Est. Reading Time: </span>
                <strong style={{ color: '#0f172a' }}>{data.estimatedReadTime || '25 mins'}</strong>
              </div>
            </div>

            {/* Summary */}
            <div style={{ marginBottom: '18px' }}>
              <h4 style={{ fontSize: '13px', color: '#0f172a', marginBottom: '6px', fontWeight: 600 }}>
                Summary
              </h4>
              <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.55 }}>
                {data.summary}
              </p>
            </div>

            {/* Key Takeaways */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '13px', color: '#0f172a', marginBottom: '10px', fontWeight: 600 }}>
                Key Highlights
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(data.keyTakeaways || []).map((t, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '8px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    color: '#334155'
                  }}>
                    <CheckCircleIcon size={14} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
              <button className="btn btn-secondary btn-sm" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
