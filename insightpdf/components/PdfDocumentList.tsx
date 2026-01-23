import React, { useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { LocatorResult } from '../types';
import PdfOverlay from './PdfOverlay';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfDocumentListProps {
  file: File;
  numPages: number | null;
  containerWidth: number;
  scale: number;
  showOverlay: boolean;
  activeResult: LocatorResult | null;
  currentPage: number;
  onLoadSuccess: (data: { numPages: number }) => void;
  onRegisterPageRef: (pageIndex: number, el: HTMLDivElement | null) => void;
  onPageLoad?: (page: { originalWidth: number; originalHeight: number }) => void;
}

const PdfDocumentList: React.FC<PdfDocumentListProps> = ({
  file,
  numPages,
  containerWidth,
  scale,
  showOverlay,
  activeResult,
  currentPage,
  onLoadSuccess,
  onRegisterPageRef,
  onPageLoad
}) => {
  // Define how many pages to keep rendered around the current page
  const WINDOW_SIZE = 2;

  return (
    <div className="flex flex-col gap-6 pb-20">
      <Document
        file={file}
        onLoadSuccess={onLoadSuccess}
        className="flex flex-col gap-6"
        loading={
          <div className="flex items-center justify-center h-96 w-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        }
      >
        {numPages && Array.from(new Array(numPages), (_, index) => {
          const pageIndex = index + 1;
          const scaledWidth = containerWidth * scale;
          
          // Optimization: Only render pages close to the current viewport
          // This dramatically improves performance during zoom by not re-rendering the whole PDF
          const shouldRender = Math.abs(pageIndex - currentPage) <= WINDOW_SIZE;

          return (
            <div
              key={pageIndex}
              data-page-number={pageIndex}
              ref={(el) => onRegisterPageRef(pageIndex, el)}
              className="relative shadow-lg transition-all duration-200 ease-in-out bg-white mx-auto"
              style={{ 
                width: scaledWidth,
                minHeight: scaledWidth * 1.294 // Approximate A4 aspect ratio to maintain scroll height
              }} 
            >
              {shouldRender ? (
                <>
                  <Page 
                    key={`${pageIndex}-${scale}`} // Force re-render when scale changes (only for visible pages)
                    pageNumber={pageIndex} 
                    width={scaledWidth} 
                    className="bg-white"
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    onLoadSuccess={(page) => {
                      // Report dimensions of the first page to parent for auto-fit logic
                      if (pageIndex === 1 && onPageLoad) {
                        onPageLoad({ 
                          originalWidth: page.originalWidth, 
                          originalHeight: page.originalHeight 
                        });
                      }
                    }}
                    loading={
                      <div 
                        className="bg-white animate-pulse flex items-center justify-center text-gray-400 text-sm"
                        style={{ width: scaledWidth, height: scaledWidth * 1.294 }}
                      >
                        正在加载第 {pageIndex} 页...
                      </div>
                    }
                  />
                  <PdfOverlay 
                    result={activeResult} 
                    pageNumber={pageIndex} 
                    showOverlay={showOverlay} 
                  />
                </>
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center text-gray-300 text-sm bg-white"
                  style={{ height: scaledWidth * 1.294 }}
                >
                  <span className="sr-only">第 {pageIndex} 页</span>
                </div>
              )}
            </div>
          );
        })}
      </Document>
    </div>
  );
};

export default PdfDocumentList;