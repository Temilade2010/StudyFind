import React, { useState, useEffect } from 'react';
import { LayersIcon, BookOpenIcon, CheckCircleIcon } from './Icons';
import { api } from '../services/api';

export const StudyPacksSection = ({ onSelectResource }) => {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCollections()
      .then(res => setPacks(res.collections || []))
      .catch(err => console.error('Failed to load study packs:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || packs.length === 0) return null;

  return (
    <div style={{ marginBottom: '36px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <LayersIcon size={18} color="#0f172a" />
          <h2 style={{ fontSize: '18px', color: '#0f172a', fontWeight: 600 }}>
            Curated Course Study Packs
          </h2>
        </div>
        <span style={{ fontSize: '12.5px', color: '#64748b' }}>
          Syllabus-aligned bundles
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {packs.map(pack => (
          <div 
            key={pack.id}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#2563eb',
                background: '#eff6ff',
                border: '1px solid #dbeafe',
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                {pack.subject}
              </span>
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                by {pack.creator_name}
              </span>
            </div>

            <h3 style={{ fontSize: '16px', color: '#0f172a', fontWeight: 600, marginBottom: '6px', lineHeight: 1.3 }}>
              {pack.title}
            </h3>

            <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.45, marginBottom: '14px' }}>
              {pack.description}
            </p>

            {/* Included materials list */}
            <div style={{ marginTop: 'auto' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
                Included Materials ({pack.resourcesCount || pack.resources?.length || 0})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {(pack.resources || []).slice(0, 3).map(r => (
                  <div 
                    key={r.id}
                    onClick={() => onSelectResource(r)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 8px',
                      background: '#f8fafc',
                      borderRadius: '4px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                      color: '#334155',
                      cursor: 'pointer',
                      transition: 'all 0.1s'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#0f172a';
                      e.currentTarget.style.color = '#0f172a';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.color = '#334155';
                    }}
                  >
                    <BookOpenIcon size={13} color="#64748b" style={{ flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};
