import React, { useState } from 'react';
import { XIcon, FileTextIcon } from './Icons';
import { api } from '../services/api';

export const AiChatModal = ({ resource, onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Ask questions about "${resource.title}". You can ask about key formulas, definitions, theorems, or exam problems.`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!resource) return null;

  const handleSend = async (textToSend) => {
    const q = textToSend || input;
    if (!q.trim() || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: q.trim() }]);
    setLoading(true);

    try {
      const res = await api.askDocumentQuestion(resource.id, q.trim());
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: res.answer, 
        pages: res.suggestedPages 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Could not retrieve an answer at this time. Please read or download the PDF directly.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '640px', height: '78vh', display: 'flex', flexDirection: 'column', padding: 0 }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff'
        }}>
          <div>
            <h2 style={{ fontSize: '15px', color: '#0f172a', margin: 0, fontWeight: 600 }}>
              Document Q&A
            </h2>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {resource.title}
            </span>
          </div>
          <button className="btn btn-icon btn-sm" onClick={onClose}>
            <XIcon size={16} />
          </button>
        </div>

        {/* Chat History */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', background: '#f8fafc' }}>
          {messages.map((m, idx) => (
            <div 
              key={idx}
              style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                background: m.role === 'user' ? '#0f172a' : '#ffffff',
                color: m.role === 'user' ? '#ffffff' : '#0f172a',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                lineHeight: 1.5,
                border: m.role === 'assistant' ? '1px solid #e2e8f0' : 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
              {m.pages && (
                <div style={{ marginTop: '6px', fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
                  Referenced pages: {m.pages.join(', ')}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{
              alignSelf: 'flex-start',
              padding: '8px 12px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '12.5px',
              color: '#64748b'
            }}>
              Finding relevant sections...
            </div>
          )}
        </div>

        {/* Suggested Prompts */}
        <div style={{
          padding: '8px 16px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          gap: '6px',
          background: '#ffffff'
        }}>
          <button 
            onClick={() => handleSend('What are the main topics covered in this document?')}
            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontSize: '11.5px', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer' }}
          >
            Main topics?
          </button>
          <button 
            onClick={() => handleSend('Summarize the most important formulas.')}
            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontSize: '11.5px', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer' }}
          >
            Key formulas?
          </button>
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }} 
          style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px', background: '#ffffff' }}
        >
          <input 
            type="text" 
            className="input-field" 
            placeholder="Ask a question about this material..."
            value={input}
            onChange={e => setInput(e.target.value)}
            style={{ fontSize: '13px', padding: '8px 12px' }}
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
