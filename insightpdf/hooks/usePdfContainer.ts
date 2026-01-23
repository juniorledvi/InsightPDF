import { useState, useEffect, RefObject } from 'react';

export const usePdfContainer = (containerRef: RefObject<HTMLDivElement | null>) => {
  const [containerWidth, setContainerWidth] = useState<number>(600);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        // Account for padding (p-8 = 32px * 2 = 64px)
        setContainerWidth(containerRef.current.clientWidth - 64);
      }
    };
    
    const resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
      updateWidth();
    }
    
    return () => resizeObserver.disconnect();
  }, [containerRef]);

  return { containerWidth };
};
