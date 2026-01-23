import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

interface DragDropOverlayProps {
  isDragging: boolean;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

const DragDropOverlay: React.FC<DragDropOverlayProps> = ({ isDragging, onDragLeave, onDragOver, onDrop }) => {
  if (!isDragging) return null;

  return (
    <div 
      className="absolute inset-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-8 border-indigo-500/30 border-dashed m-4 rounded-3xl flex items-center justify-center transition-all"
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="flex flex-col items-center p-12 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl animate-bounce">
        <Upload className="w-24 h-24 text-indigo-600 mb-6" strokeWidth={1.5} />
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">拖放 PDF 以上传</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">释放以开始分析</p>
      </div>
    </div>
  );
};

export default DragDropOverlay;