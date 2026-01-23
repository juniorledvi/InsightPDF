import React, { useState, useCallback, useEffect } from 'react';
import { GripVertical } from 'lucide-react';

const MIN_SIDEBAR_WIDTH = 300;
const MAX_SIDEBAR_WIDTH = 800;

interface ResizableSidebarProps {
  children: React.ReactNode;
  isDesktop: boolean;
}

const ResizableSidebar: React.FC<ResizableSidebarProps> = ({ children, isDesktop }) => {
  const [sidebarWidth, setSidebarWidth] = useState(350);
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
    <>
      {/* Sidebar Wrapper */}
      <div 
        className="flex-shrink-0 w-full md:w-auto relative flex flex-col h-full border-b md:border-b-0 border-gray-200 dark:border-gray-800"
        style={{ width: isDesktop ? sidebarWidth : '100%' }}
      >
        {children}
      </div>

      {/* Resizer Handle (Desktop Only) */}
      <div
        className="hidden md:flex w-2 -ml-1 hover:w-3 z-50 cursor-col-resize items-center justify-center group hover:bg-indigo-500/10 transition-all select-none flex-shrink-0 relative"
        onMouseDown={startResizing}
      >
        <div className="w-[1px] h-full bg-gray-200 dark:bg-gray-800 group-hover:bg-indigo-500 transition-colors" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm p-0.5">
           <GripVertical className="w-3 h-3 text-gray-500" />
        </div>
      </div>

      {/* Overlay to catch mouse events over iframe/canvas during resizing */}
      {isResizing && (
        <div className="absolute inset-0 z-50 cursor-col-resize bg-transparent" />
      )}
    </>
  );
};

export default ResizableSidebar;