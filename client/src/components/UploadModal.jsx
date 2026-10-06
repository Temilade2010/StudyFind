import React, { useState } from 'react';
import { 
  XIcon, 
  UploadCloudIcon, 
  FileTextIcon
} from './Icons';
import { api } from '../services/api';

const SUBJECTS = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology & Medicine',
  'Economics & Finance',
  'Psychology'
];

export const UploadModal = ({ onClose, onUploadSuccess }) => {
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [academicLevel, setAcademicLevel] = useState('undergraduate');
  const [authorName, setAuthorName] = useState('');
  const [institution, setInstitution] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('Lecture Notes, Study Guide, PDF');
  const [file, setFile] = useState(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a title for the reading material.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('course_code', courseCode.trim() || 'General');
      formData.append('subject', subject);
      formData.append('academic_level', academicLevel);
      formData.append('author_name', authorName.trim() || 'Student Contributor');
      formData.append('institution', institution.trim() || 'Academic Scholar');
      formData.append('description', description.trim() || 'Academic study reading material.');
      formData.append('tags', tags);
      if (file) {
        formData.append('file', file);
      }

      const res = await api.uploadResource(formData);
      onUploadSuccess(res.resource);
      onClose();
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '580px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '17px', color: '#0f172a', margin: 0, fontWeight: 600 }}>
              Contribute Reading Material
            </h2>
            <span style={{ fontSize: '12.5px', color: '#64748b' }}>
              Add lecture notes, study packs, or syllabus materials for fellow students
            </span>
          </div>
          <button className="btn btn-icon btn-sm" onClick={onClose}>
            <XIcon size={16} />
          </button>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            padding: '8px 12px',
            color: '#b91c1c',
            fontSize: '13px',
            marginBottom: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* File Picker Zone */}
          <div style={{
            border: '1px dashed #cbd5e1',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center',
            background: '#f8fafc',
            cursor: 'pointer'
          }}>
            <input 
              type="file" 
              id="file-upload" 
              accept=".pdf,.docx,.pptx,.txt" 
              onChange={e => setFile(e.target.files[0])}
              style={{ display: 'none' }}
            />
            <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
              <FileTextIcon size={24} color="#64748b" style={{ margin: '0 auto 6px', display: 'block' }} />
              {file ? (
                <div>
                  <strong style={{ color: '#0f172a', display: 'block', fontSize: '13px' }}>{file.name}</strong>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              ) : (
                <div>
                  <span style={{ color: '#0f172a', fontWeight: 500, display: 'block', fontSize: '13px' }}>
                    Click to choose a PDF or document file
                  </span>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                    PDF, DOCX, or TXT (up to 50MB)
                  </span>
                </div>
              )}
            </label>
          </div>

          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Document Title *
            </label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. Multivariable Calculus Lecture Notes - Week 4"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Subject & Course Code */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Subject *
              </label>
              <select 
                className="input-field" 
                value={subject} 
                onChange={e => setSubject(e.target.value)}
              >
                {SUBJECTS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Course Code
              </label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. MATH 21A"
                value={courseCode}
                onChange={e => setCourseCode(e.target.value)}
              />
            </div>
          </div>

          {/* Author Name & Institution */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Author / Instructor
              </label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Prof. Davis"
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                University / Institution
              </label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Stanford University"
                value={institution}
                onChange={e => setInstitution(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Brief Description
            </label>
            <textarea 
              className="input-field" 
              rows={2}
              placeholder="Outline what formulas, topics, or chapters this material covers..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose} disabled={isUploading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={isUploading}>
              <UploadCloudIcon size={14} />
              <span>{isUploading ? 'Uploading...' : 'Publish Material'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
