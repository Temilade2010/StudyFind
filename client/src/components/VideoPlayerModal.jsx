import React, { useState } from 'react';
import { 
  XIcon, 
  BotIcon, 
  SparklesIcon, 
  ExternalLinkIcon,
  BookmarkIcon,
  VideoIcon
} from './Icons';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const VideoPlayerModal = ({ resource, onClose, onOpenAiSummary }) => {
  const { user, refreshLibraryCount } = useAuth();
  const [showAiSplit, setShowAiSplit] = useState(false);
  const [isSaved, setIsSaved] = useState(resource.isBookmarked || false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I'm your StudyFind AI tutor for **"${resource.title}"**. Ask me anything about this lecture's concepts, formulas, or key takeaways!`
    }
  ]);
  const [loadingAnswer, setLoadingAnswer] = useState(false);

  if (!resource) return null;

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim() || loadingAnswer) return;

    const userQ = question.trim();
    setQuestion('');
    setMessages(prev => [...prev, { role: 'user', content: userQ }]);
    setLoadingAnswer(true);

    try {
      const res = await api.askDocumentQuestion(resource.id, userQ, resource);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: res.answer
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Apologies, could not process that question right now. Please try again.' 
      }]);
    } finally {
      setLoadingAnswer(false);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      alert('Please log in to save videos to your personal library.');
      return;
    }
    try {
      const res = await api.toggleBookmark(resource.id, resource);
      setIsSaved(res.bookmarked);
      refreshLibraryCount();
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ padding: '16px' }}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()}
        style={{ 
          maxWidth: showAiSplit ? '1280px' : '980px', 
          height: '90vh', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'max-width 0.3s ease'
        }}
      >
        {/* Header Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 22px',
          borderBottom: '1px solid var(--border-subtle)',
          background: '#090d16'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <VideoIcon size={20} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ 
                fontSize: '16px', 
                color: '#fff', 
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '520px'
              }}>
                {resource.title}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94a3b8' }}>
                <span style={{ color: '#38bdf8', fontWeight: 600 }}>{resource.channel_name || 'Academic Educator'}</span>
                <span>•</span>
                <span>{resource.subject}</span>
                <span>•</span>
                <span>{resource.duration || 'Lecture'}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Toggle Split AI Tutor */}
            <button 
              className={`btn btn-sm ${showAiSplit ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setShowAiSplit(!showAiSplit)}
              style={{ gap: '6px' }}
            >
              <BotIcon size={15} />
              {showAiSplit ? 'Hide AI Tutor' : 'Ask Lecture (AI)'}
            </button>

            {/* AI Summary CTA */}
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onOpenAiSummary(resource)}
            >
              <SparklesIcon size={15} /> Key Points
            </button>

            {/* Bookmark button */}
            <button 
              className="btn btn-secondary btn-sm"
              onClick={handleBookmark}
              style={{ color: isSaved ? '#f59e0b' : '#cbd5e1' }}
            >
              <BookmarkIcon size={15} fill={isSaved ? '#f59e0b' : 'none'} />
              {isSaved ? 'Saved' : 'Save'}
            </button>

            {/* Direct Watch on YouTube */}
            <a 
              href={resource.video_url || resource.file_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ textDecoration: 'none' }}
            >
              <ExternalLinkIcon size={14} /> Open Source
            </a>

            <button 
              className="btn btn-icon btn-sm"
              onClick={onClose}
            >
              <XIcon size={18} />
            </button>
          </div>
        </div>

        {/* Video Player & Split Panel */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          {/* Main Video & Details Panel */}
          <div style={{ 
            flex: 1, 
            background: '#070b14', 
            height: '100%', 
            overflowY: 'auto',
            borderRight: showAiSplit ? '1px solid var(--border-subtle)' : 'none'
          }}>
            {/* 16:9 Video Container */}
            <div style={{
              position: 'relative',
              width: '100%',
              paddingBottom: '56.25%', // 16:9 Aspect Ratio
              background: '#000'
            }}>
              <iframe 
                src={resource.embed_url || `https://www.youtube.com/embed/${resource.video_id}?autoplay=1&rel=0`}
                title={resource.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
              />
            </div>

            {/* Video Metadata & Takeaways */}
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-level" style={{ textTransform: 'capitalize' }}>
                    {resource.academic_level ? resource.academic_level.replace('_', ' ') : 'All Levels'}
                  </span>
                  <span className="badge badge-external">
                    {resource.channel_name}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                  {resource.views}
                </div>
              </div>

              <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#f8fafc', marginBottom: '12px', lineHeight: 1.3 }}>
                {resource.title}
              </h1>

              <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '20px' }}>
                {resource.description}
              </p>

              {/* Key Takeaways Box */}
              {resource.key_takeaways && resource.key_takeaways.length > 0 && (
                <div style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#818cf8', marginBottom: '10px' }}>
                    <SparklesIcon size={15} />
                    <span>AI-Extracted Core Educational Takeaways</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', color: '#cbd5e1', fontSize: '13.5px', lineHeight: 1.6 }}>
                    {resource.key_takeaways.map((point, idx) => (
                      <li key={idx} style={{ marginBottom: '6px' }}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags */}
              {resource.tags && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {resource.tags.map((tag, idx) => (
                    <span key={idx} style={{
                      fontSize: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#94a3b8',
                      padding: '3px 9px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Collapsible Split AI Tutor Panel */}
          {showAiSplit && (
            <div style={{ 
              width: '420px', 
              background: '#0f172a', 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%' 
            }}>
              <div style={{ 
                padding: '14px 18px', 
                borderBottom: '1px solid var(--border-subtle)', 
                background: 'rgba(15, 23, 42, 0.8)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <BotIcon size={16} color="#38bdf8" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                  StudyFind Lecture Copilot
                </span>
                <span className="badge badge-internal" style={{ marginLeft: 'auto', fontSize: '10px' }}>
                  Active Context
                </span>
              </div>

              {/* Chat Messages */}
              <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {messages.map((m, idx) => (
                  <div 
                    key={idx} 
                    style={{
                      alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      background: m.role === 'user' ? '#6366f1' : 'rgba(30, 41, 59, 0.8)',
                      color: '#f8fafc',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      lineHeight: 1.5,
                      border: m.role === 'user' ? 'none' : '1px solid var(--border-subtle)'
                    }}
                  >
                    {m.content}
                  </div>
                ))}
                {loadingAnswer && (
                  <div style={{ alignSelf: 'flex-start', color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>
                    StudyFind AI is synthesizing explanation...
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleAskQuestion} style={{ padding: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '8px' }}>
                <input 
                  type="text"
                  placeholder="Ask a question about this lecture..."
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  style={{
                    flex: 1,
                    background: '#090d16',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
                <button type="submit" className="btn btn-primary btn-sm" disabled={loadingAnswer || !question.trim()}>
                  Ask
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
