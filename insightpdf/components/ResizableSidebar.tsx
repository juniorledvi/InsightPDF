import React, { useState, useCallback, useEffect } from 'react';
import { GripVertical } from 'lucide-react';

const MIN_SIDEBAR_WIDTH = 300;
const MAX_SIDEBAR_WIDTH = 800;

interface ResizableSidebarProps {
  children: React.ReactNode;
  isDesktop: boolean;
}

const ResizableSidebar: React.FC<ResizableSidebarProps> = ({ children, isDesktop }) => {
  // Increased default width by 10% (350 * 1.1 = 385)
  const [sidebarWidth, setSidebarWidth] = useState(385);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback(() => setIsResizing(true), []);
  const stopResizing = useCallback(() => setIsResizing(false), []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing) {
        const newWidth = Math.max(
          MIN_SIDEBAR_WIDTH,
          Math.min(mouseMoveEvent.clientX, MAX_SIDEBAR_WIDTH)
        );
        setSidebarWidth(newWidth);
      }
    },
    [isResizing]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
      // Prevent text selection while resizing
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, resize, stopResizing]);

  return (
    <div className="flex h-full relative">
      {/* Sidebar Wrapper */}
      <div 
        className="flex-shrink-0 w-full md:w-auto relative flex flex-col h-full border-b md:border-b-0 border-gray-200 dark:border-gray-800"
        style={{ width: isDesktop ? sidebarWidth : '100%' }}
      >
        {children}
      </div>

      {/* Resizer Handle (Desktop Only) */}
      <div
        className="hidden md:flex w-4 -ml-2 z-50 cursor-col-resize items-center justify-center group hover:bg-transparent transition-all select-none flex-shrink-0 relative h-full"
        onMouseDown={startResizing}
      >
        {/* Visual Line area */}
        <div className="w-1 h-full flex justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/10 transition-colors">
            <div className="w-[1px] h-full bg-gray-200 dark:bg-gray-800 group-hover:bg-indigo-400 transition-colors" />
        </div>
        
        {/* Grip Icon */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm p-0.5 pointer-events-none">
           <GripVertical className="w-3 h-3 text-gray-500" />
        </div>
      </div>

      {/* Overlay to catch mouse events over iframe/canvas during resizing */}
      {isResizing && (
        <div className="fixed inset-0 z-[100] cursor-col-resize bg-transparent" />
      )}
    </div>
  );
};

export default ResizableSidebar;