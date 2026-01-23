import React from 'react';
import { ArrowDown } from 'lucide-react';
import { LocatorResult } from '../types';

interface PdfOverlayProps {
  result: LocatorResult | null;
  pageNumber: number;
  showOverlay: boolean;
}

const PdfOverlay: React.FC<PdfOverlayProps> = ({ result, pageNumber, showOverlay }) => {
  if (!result || !result.box2d || result.pageNumber !== pageNumber || !showOverlay) return null;

  const [ymin, xmin, ymax, xmax] = result.box2d;

  // Convert 0-1000 scale to percentages
  const top = ymin / 10;
  const left = xmin / 10;
  const height = (ymax - ymin) / 10;
  const width = (xmax - xmin) / 10;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Bounding Box Highlight */}
      <div 
        className="absolute border-2 border-red-500 bg-red-500/10 transition-all duration-500"
        style={{
          top: `${top}%`,
          left: `${left}%`,
          width: `${width}%`,
          height: `${height}%`,
        }}
      />
      
      {/* Arrow and Label */}
      <div 
        className="absolute flex flex-col items-center animate-bounce"
        style={{
          top: `${top}%`, // Position at the top of the box
          left: `${left + width / 2}%`, // Center horizontally
          transform: 'translate(-50%, -100%) translateY(-10px)' // Shift up
        }}
      >
        <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded mb-1 shadow-md whitespace-nowrap">
          位于此处
        </div>
        <ArrowDown className="w-8 h-8 text-red-600 drop-shadow-md" strokeWidth={3} />
      </div>
    </div>
  );
};

export default PdfOverlay;