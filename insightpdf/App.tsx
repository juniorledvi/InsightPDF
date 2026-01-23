import React, { useState } from 'react';
import PdfViewer from './components/PdfViewer';
import ControlPanel from './components/ControlPanel';
import DragDropOverlay from './components/DragDropOverlay';
import ResizableSidebar from './components/ResizableSidebar';
import { useMediaQuery } from './hooks/useMediaQuery';
import { useTheme } from './hooks/useTheme';
import { useChatController } from './hooks/useChatController';
import { useDragDrop } from './hooks/useDragDrop';
import { MessageSquare, FileText } from 'lucide-react';
import { LocatorResult } from './types';

const App: React.FC = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { theme, toggleTheme } = useTheme();
  
  // Mobile Tab State: 'chat' or 'pdf'
  const [mobileTab, setMobileTab] = useState<'chat' | 'pdf'>('chat');
  
  const {
    file,
    status,
    messages,
    activeResult,
    model,
    useFilesApi,
    setModel,
    handleFileUpload,
    handleClearChat,
    handleSearch,
    handleViewLocation,
    toggleFilesApi
  } = useChatController();

  const {
    isDragging,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop
  } = useDragDrop(handleFileUpload);

  // Wrapper to switch tab on mobile when viewing location
  const onMobileViewLocation = (result: LocatorResult) => {
    handleViewLocation(result);
    if (!isDesktop) {
      setMobileTab('pdf');
    }
  };

  return (
    <div 
      className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-gray-100 dark:bg-gray-950 relative transition-colors duration-300"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
    >
      <DragDropOverlay 
        isDragging={isDragging}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      />

      {/* Mobile Toggle Button (Floating Action Button) */}
      {!isDesktop && file && (
        <button
          onClick={() => setMobileTab(prev => prev === 'chat' ? 'pdf' : 'chat')}
          className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 active:scale-95 transition-transform"
        >
          {mobileTab === 'chat' ? (
            <FileText className="w-6 h-6" />
          ) : (
            <MessageSquare className="w-6 h-6" />
          )}
        </button>
      )}

      {/* Sidebar / Control Panel Area */}
      {/* On Mobile: Hidden if tab is 'pdf' */}
      <div className={`${isDesktop ? 'flex-shrink-0' : (mobileTab === 'chat' ? 'w-full h-full' : 'hidden')}`}>
        <ResizableSidebar isDesktop={isDesktop}>
          <ControlPanel 
            onFileUpload={handleFileUpload}
            onSearch={handleSearch}
            onViewLocation={onMobileViewLocation}
            onClearChat={handleClearChat}
            status={status}
            messages={messages}
            currentFile={file}
            selectedModel={model}
            onModelSelect={setModel}
            theme={theme}
            onToggleTheme={toggleTheme}
            useFilesApi={useFilesApi}
            onToggleFilesApi={toggleFilesApi}
          />
        </ResizableSidebar>
      </div>
      
      {/* Main / PDF Viewer Area */}
      {/* On Mobile: Hidden if tab is 'chat' */}
      <main className={`flex-1 h-full relative overflow-hidden ${!isDesktop && mobileTab === 'chat' ? 'hidden' : 'block'}`}>
        <PdfViewer 
          file={file} 
          result={activeResult} 
        />
      </main>
    </div>
  );
};

export default App;