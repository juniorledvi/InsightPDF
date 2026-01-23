import React, { useState, useEffect } from 'react';
import { LocatorResult } from '../types';
import PdfToolbar from './PdfToolbar';
import PdfDocumentList from './PdfDocumentList';
import { usePdfNavigation } from '../hooks/usePdfNavigation';
import { usePdfContainer } from '../hooks/usePdfContainer';
import { usePdfZoom } from '../hooks/usePdfZoom';

interface PdfViewerProps {
  file: File | null;
  result: LocatorResult | null;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ file, result }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [showOverlay, setShowOverlay] = useState<boolean>(true);

  // Use navigation hook which owns the scroll container ref
  const {
    pageNumber,
    containerRef,
    scrollToPage,
    registerPageRef,
    setPageNumber
  } = usePdfNavigation(numPages);

  // Use modular hooks for container sizing and zooming
  const { containerWidth } = usePdfContainer(containerRef);
  const { 
    scale, 
    setScale, 
    pdfPageSize, 
    setPdfPageSize, 
    handleZoom, 
    handleFitToWindow, 
    handleFitToWidth, 
    calculateFitScale 
  } = usePdfZoom(containerRef);

  // Reset state when file changes
  useEffect(() => {
    setPdfPageSize(null);
    setScale(1.0);
  }, [file, setPdfPageSize, setScale]);

  // Auto-jump to page when result changes
  useEffect(() => {
    if (result && result.pageNumber) {
      scrollToPage(result.pageNumber);
      setShowOverlay(true); 
    }
  }, [result, scrollToPage]);

  // Handle initial page load to determine auto-fit behavior
  const handlePageLoad = (page: { originalWidth: number; originalHeight: number }) => {
    // Only auto-fit on initial load of the file
    if (!pdfPageSize) {
      setPdfPageSize({ width: page.originalWidth, height: page.originalHeight });
      
      // Smart default: 
      // If landscape (like slides), fit to window so you see the whole slide.
      // If portrait (like docs), fit to width so text is readable.
      const isLandscape = page.originalWidth > page.originalHeight;
      
      if (isLandscape) {
         const bestScale = calculateFitScale(page.originalWidth, page.originalHeight);
         setScale(bestScale);
      } else {
         setScale(1.0); // Fit Width
      }
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const changePage = (offset: number) => {
    const newPage = Math.max(1, Math.min(pageNumber + offset, numPages || 1));
    scrollToPage(newPage);
  };

  if (!file) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg m-4 transition-colors">
        <p className="text-lg font-medium">未加载 PDF</p>
        <p className="text-sm">上传文档以开始</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-200 dark:bg-gray-900 transition-colors duration-300">
      <PdfToolbar 
        pageNumber={pageNumber}
        numPages={numPages}
        scale={scale}
        showOverlay={showOverlay}
        onPageChange={changePage}
        onToggleOverlay={() => setShowOverlay(!showOverlay)}
        onZoom={handleZoom}
        onFitToWindow={handleFitToWindow}
        onFitToWidth={handleFitToWidth}
      />

      {/* PDF Canvas - Continuous Scroll */}
      <div 
        className="flex-1 overflow-auto p-8 relative scroll-smooth" 
        ref={containerRef}
      >
        <PdfDocumentList
          file={file}
          numPages={numPages}
          containerWidth={containerWidth}
          scale={scale}
          showOverlay={showOverlay}
          activeResult={result}
          currentPage={pageNumber}
          onLoadSuccess={onDocumentLoadSuccess}
          onRegisterPageRef={registerPageRef}
          onPageLoad={handlePageLoad}
        />
      </div>
    </div>
  );
};

export default PdfViewer;
