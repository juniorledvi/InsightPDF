import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LocatorResult } from '../types';
import PdfToolbar from './PdfToolbar';
import PdfDocumentList from './PdfDocumentList';
import { usePdfNavigation } from '../hooks/usePdfNavigation';

interface PdfViewerProps {
  file: File | null;
  result: LocatorResult | null;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ file, result }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState<number>(1.0);
  const [showOverlay, setShowOverlay] = useState<boolean>(true);
  const [containerWidth, setContainerWidth] = useState<number>(600);
  const [pdfPageSize, setPdfPageSize] = useState<{width: number, height: number} | null>(null);

  // Custom hook handles scrolling, page tracking, and refs
  const {
    pageNumber,
    containerRef,
    scrollToPage,
    registerPageRef,
    setPageNumber
  } = usePdfNavigation(numPages);

  // Reset state when file changes
  useEffect(() => {
    setPdfPageSize(null);
    setScale(1.0);
  }, [file]);

  // Auto-jump to page when result changes
  useEffect(() => {
    if (result && result.pageNumber) {
      scrollToPage(result.pageNumber);
      setShowOverlay(true); 
    }
  }, [result, scrollToPage]);

  // Responsive container width
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth - 64); // minus padding (p-8 = 32px * 2)
      }
    };
    
    const resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => resizeObserver.disconnect();
  }, [containerRef]);

  const calculateFitScale = useCallback((pageWidth: number, pageHeight: number) => {
    if (!containerRef.current) return 1.0;

    const { clientWidth, clientHeight } = containerRef.current;
    // Account for padding (p-8 = 32px * 2 = 64px)
    const contentWidth = clientWidth - 64; 
    const contentHeight = clientHeight - 64;

    // Scale 1.0 represents "Fit Width" in our logic (width = containerWidth * 1.0)
    const widthScale = 1.0;

    // Calculate scale needed to fit height
    // displayedWidth = containerWidth * scale
    // displayedHeight = displayedWidth / aspect
    // We want displayedHeight <= contentHeight
    // (containerWidth * scale) / (pageWidth/pageHeight) <= contentHeight
    // scale <= (contentHeight / containerWidth) * (pageWidth/pageHeight)
    
    const aspect = pageWidth / pageHeight;
    const heightScale = (contentHeight / contentWidth) * aspect;

    // Choose the smaller scale to ensure it fits completely (Fit Window)
    return Math.min(widthScale, heightScale);
  }, []);

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

  const handleFitToWindow = () => {
    if (pdfPageSize) {
      const bestScale = calculateFitScale(pdfPageSize.width, pdfPageSize.height);
      setScale(bestScale);
    } else {
      setScale(1.0);
    }
  };

  const handleFitToWidth = () => {
    setScale(1.0);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const changePage = (offset: number) => {
    const newPage = Math.max(1, Math.min(pageNumber + offset, numPages || 1));
    scrollToPage(newPage);
  };

  const handleZoom = (delta: number) => {
    setScale(s => {
      const newScale = Math.round((s + delta) * 10) / 10;
      return Math.min(2.5, Math.max(0.1, newScale));
    });
  };

  if (!file) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg m-4 transition-colors">
        <p className="text-lg font-medium">No PDF loaded</p>
        <p className="text-sm">Upload a document to get started</p>
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