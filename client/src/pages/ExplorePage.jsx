import React, { useState, useEffect } from 'react';
import { 
  SearchIcon, 
  BookOpenIcon, 
  FileTextIcon
} from '../components/Icons';
import { ResourceCard } from '../components/ResourceCard';
import { StudyPacksSection } from '../components/StudyPacksSection';
import { api } from '../services/api';

const SUBJECT_LIST = [
  'All Subjects',
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology & Medicine',
  'Economics & Finance',
  'Psychology'
];

const MATERIAL_TYPES = [
  { id: 'all', label: 'All Materials' },
  { id: 'textbook', label: 'Textbooks' },
  { id: 'notes', label: 'Lecture Notes' },
  { id: 'exam', label: 'Exam Packs' },
  { id: 'cheatsheet', label: 'Cheatsheets' },
  { id: 'paper', label: 'Research Papers' }
];

const SUGGESTED_SEARCHES = [
  'Calculus',
  'Data Structures',
  'Organic Chemistry',
  'Linear Algebra',
  'Macroeconomics',
  'Quantum Mechanics'
];

export const ExplorePage = ({ 
  onPreview, 
  onOpenAiSummary, 
  onOpenAiChat, 
  onOpenUpload 
}) => {
  const [query, setQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedSort, setSelectedSort] = useState('relevance');

  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const executeSearch = async () => {
    setLoading(true);
    try {
      const subjectParam = selectedSubject === 'All Subjects' ? '' : selectedSubject;
      const res = await api.search({
        q: query,
        subject: subjectParam,
        type: selectedType,
        level: selectedLevel === 'all' ? '' : selectedLevel,
        sort: selectedSort,
        limit: 24
      });

      setResults(res.results || []);
      setTotalCount(res.total || 0);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      executeSearch();
    }, 250);
    return () => clearTimeout(timer);
  }, [query, selectedSubject, selectedType, selectedLevel, selectedSort]);

  return (
    <div className="container" style={{ padding: '36px 20px 80px' }}>
      
      {/* Clean Hero Search Header */}
      <section style={{ 
        textAlign: 'center', 
        maxWidth: '740px',
        margin: '0 auto 36px'
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
          Find reading materials & textbooks
        </h1>
        <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.5, marginBottom: '24px' }}>
          Search through university lecture notes, open textbooks, and past exam packs. Read online or download free PDFs directly with no account needed.
        </p>

        {/* Clean Search Input */}
        <div style={{
          position: 'relative',
          maxWidth: '640px',
          margin: '0 auto'
        }}>
          <div style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#64748b',
            pointerEvents: 'none'
          }}>
            <SearchIcon size={18} />
          </div>

          <input 
            type="text" 
            placeholder="Search by topic, course title, author (e.g. Calculus, CS 106B)..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '13px 44px 13px 44px',
              fontSize: '15px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              color: '#0f172a',
              outline: 'none',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              transition: 'border-color 0.15s'
            }}
            onFocus={e => e.currentTarget.style.borderColor = '#0f172a'}
            onBlur={e => e.currentTarget.style.borderColor = '#cbd5e1'}
          />

          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#f1f5f9',
                border: 'none',
                color: '#64748b',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                cursor: 'pointer',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Suggested Searches */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '6px', 
          marginTop: '14px' 
        }}>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Suggestions:</span>
          {SUGGESTED_SEARCHES.map(topic => (
            <button
              key={topic}
              onClick={() => setQuery(topic)}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: '12px',
                color: '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#0f172a';
                e.currentTarget.style.color = '#0f172a';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.color = '#475569';
              }}
            >
              {topic}
            </button>
          ))}
        </div>
      </section>

      {/* Filter Toolbar */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '14px 16px',
        marginBottom: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
      }}>
        {/* Material Type Segmented Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {MATERIAL_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              style={{
                background: selectedType === type.id ? '#0f172a' : '#f8fafc',
                color: selectedType === type.id ? '#ffffff' : '#475569',
                border: '1px solid',
                borderColor: selectedType === type.id ? '#0f172a' : '#e2e8f0',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.1s'
              }}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Subject Pills and Dropdown Filters */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          gap: '12px',
          paddingTop: '10px',
          borderTop: '1px solid #f1f5f9'
        }}>
          {/* Subject Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {SUBJECT_LIST.map(sub => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                style={{
                  background: selectedSubject === sub ? '#2563eb' : '#ffffff',
                  color: selectedSubject === sub ? '#ffffff' : '#475569',
                  border: '1px solid',
                  borderColor: selectedSubject === sub ? '#2563eb' : '#e2e8f0',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.1s'
                }}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Level and Sort Selects */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <select
              value={selectedLevel}
              onChange={e => setSelectedLevel(e.target.value)}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#334155',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '12.5px',
                outline: 'none'
              }}
            >
              <option value="all">All Academic Levels</option>
              <option value="undergraduate">Undergraduate</option>
              <option value="postgraduate">Postgraduate</option>
              <option value="high_school">High School</option>
            </select>

            <select
              value={selectedSort}
              onChange={e => setSelectedSort(e.target.value)}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#334155',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '12.5px',
                outline: 'none'
              }}
            >
              <option value="relevance">Most Relevant</option>
              <option value="downloads">Most Downloaded</option>
              <option value="newest">Recently Added</option>
            </select>
          </div>
        </div>
      </div>

      {/* Curated Study Packs Section */}
      <StudyPacksSection onSelectResource={onPreview} />

      {/* Results Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '16px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BookOpenIcon size={18} color="#0f172a" />
          <h2 style={{ fontSize: '18px', color: '#0f172a', fontWeight: 600 }}>
            {query ? `Results for "${query}"` : 'Available Reading Materials'}
          </h2>
        </div>

        <span style={{ fontSize: '13px', color: '#64748b' }}>
          {totalCount} {totalCount === 1 ? 'item' : 'items'} available
        </span>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <p style={{ fontSize: '14px' }}>Loading reading materials...</p>
        </div>
      ) : results.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '48px 20px', 
          background: '#ffffff', 
          borderRadius: '8px', 
          border: '1px solid #e2e8f0' 
        }}>
          <p style={{ fontSize: '15px', color: '#334155', marginBottom: '6px', fontWeight: 500 }}>
            No materials found matching your search.
          </p>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Try a different search term or reset filters.
          </span>
        </div>
      ) : (
        <div className="resources-grid">
          {results.map(resource => (
            <ResourceCard 
              key={resource.id}
              resource={resource}
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
