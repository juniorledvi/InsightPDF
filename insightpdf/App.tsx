import React from 'react';
import PdfViewer from './components/PdfViewer';
import ControlPanel from './components/ControlPanel';
import DragDropOverlay from './components/DragDropOverlay';
import ResizableSidebar from './components/ResizableSidebar';
import { useMediaQuery } from './hooks/useMediaQuery';
import { useTheme } from './hooks/useTheme';
import { useChatController } from './hooks/useChatController';
import { useDragDrop } from './hooks/useDragDrop';

const App: React.FC = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { theme, toggleTheme } = useTheme();
  
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

      <ResizableSidebar isDesktop={isDesktop}>
        <ControlPanel 
          onFileUpload={handleFileUpload}
          onSearch={handleSearch}
          onViewLocation={handleViewLocation}
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
      
      <main className="flex-1 h-full relative overflow-hidden">
        <PdfViewer 
          file={file} 
          result={activeResult} 
        />
      </main>
    </div>
  );
};

export default App;