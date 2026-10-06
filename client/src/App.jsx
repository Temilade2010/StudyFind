import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ExplorePage } from './pages/ExplorePage';
import { LibraryPage } from './pages/LibraryPage';
import { StudyPacksSection } from './components/StudyPacksSection';

import { PdfViewerModal } from './components/PdfViewerModal';
import { AiSummaryModal } from './components/AiSummaryModal';
import { AiChatModal } from './components/AiChatModal';
import { UploadModal } from './components/UploadModal';

function MainApp() {
  const [currentTab, setCurrentTab] = useState('explore'); // 'explore' | 'packs' | 'library'
  
  // Modals state
  const [previewResource, setPreviewResource] = useState(null);
  const [summaryResource, setSummaryResource] = useState(null);
  const [chatResource, setChatResource] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '10px 18px',
          borderRadius: '6px',
          fontWeight: 500,
          fontSize: '13.5px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 100
        }}>
          {toastMessage}
        </div>
      )}

      {/* Top Navbar */}
      <Navbar 
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenUpload={() => setShowUploadModal(true)}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {currentTab === 'explore' && (
          <ExplorePage 
            onPreview={res => setPreviewResource(res)}
            onOpenAiSummary={res => setSummaryResource(res)}
            onOpenAiChat={res => setChatResource(res)}
            onOpenUpload={() => setShowUploadModal(true)}
          />
        )}

        {currentTab === 'packs' && (
          <div className="container" style={{ padding: '36px 20px 80px' }}>
            <h1 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '6px', fontWeight: 700 }}>
              Curated Course Study Packs
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '28px' }}>
              Academic packets grouping problem sets, lecture notes, and syllabus study guides.
            </p>
            <StudyPacksSection onSelectResource={res => setPreviewResource(res)} />
          </div>
        )}

        {currentTab === 'library' && (
          <LibraryPage 
            onPreview={res => setPreviewResource(res)}
            onOpenAiSummary={res => setSummaryResource(res)}
            onOpenAiChat={res => setChatResource(res)}
            onNavigateExplore={() => setCurrentTab('explore')}
          />
        )}
      </main>

      {/* Simple Clean Footer */}
      <footer style={{
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '24px 0',
        marginTop: 'auto'
      }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
              StudyFind
            </div>
            <p style={{ fontSize: '12px', color: '#64748b' }}>
              Open academic repository • Free reading materials & PDF downloads
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b' }}>
            <span>In-Browser PDF Reader</span>
            <span>•</span>
            <span>Direct Downloads</span>
            <span>•</span>
            <span>Zero Login Required</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      {previewResource && (
        <PdfViewerModal 
          resource={previewResource}
          onClose={() => setPreviewResource(null)}
          onOpenAiSummary={res => {
            setPreviewResource(null);
            setSummaryResource(res);
          }}
        />
      )}

      {summaryResource && (
        <AiSummaryModal 
          resource={summaryResource}
          onClose={() => setSummaryResource(null)}
          onLaunchChat={res => setChatResource(res)}
        />
      )}

      {chatResource && (
        <AiChatModal 
          resource={chatResource}
          onClose={() => setChatResource(null)}
        />
      )}

      {showUploadModal && (
        <UploadModal 
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={newRes => {
            showToast(`Document "${newRes.title}" published`);
            setCurrentTab('explore');
          }}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
