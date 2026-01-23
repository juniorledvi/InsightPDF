import React from 'react';
import { ChevronRight, ChevronLeft, ZoomIn, ZoomOut, Eye, EyeOff, Expand } from 'lucide-react';

interface PdfToolbarProps {
  pageNumber: number;
  numPages: number | null;
  scale: number;
  showOverlay: boolean;
  onPageChange: (offset: number) => void;
  onToggleOverlay: () => void;
  onZoom: (delta: number) => void;
  onFitToWindow?: () => void;
}

const PdfToolbar: React.FC<PdfToolbarProps> = ({
  pageNumber,
  numPages,
  scale,
  showOverlay,
  onPageChange,
  onToggleOverlay,
  onZoom,
  onFitToWindow
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 flex items-center justify-between shadow-sm z-20 transition-colors">
      <div className="flex items-center space-x-4">
        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button 
            onClick={() => onPageChange(-1)} 
            disabled={pageNumber <= 1}
            className="p-1 hover:bg-white dark:hover:bg-gray-600 dark:text-gray-200 rounded-md disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="px-3 text-sm font-medium text-gray-600 dark:text-gray-200">
            {pageNumber} / {numPages || '--'}
          </span>
          <button 
            onClick={() => onPageChange(1)} 
            disabled={numPages ? pageNumber >= numPages : true}
            className="p-1 hover:bg-white dark:hover:bg-gray-600 dark:text-gray-200 rounded-md disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button 
          onClick={onToggleOverlay}
          className={`p-2 rounded-full transition-colors ${showOverlay ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'}`}
          title={showOverlay ? "Hide Location" : "Show Location"}
        >
          {showOverlay ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
        </button>
        
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

        {onFitToWindow && (
          <button
            onClick={onFitToWindow}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400"
            title="Fit to Window"
          >
            <Expand className="w-5 h-5" />
          </button>
        )}

        <button 
          onClick={() => onZoom(-0.1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <span className="text-sm w-12 text-center text-gray-600 dark:text-gray-400">
          {Math.round(scale * 100)}%
        </span>
        <button 
          onClick={() => onZoom(0.1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PdfToolbar;