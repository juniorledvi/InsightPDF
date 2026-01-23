import { useState, useCallback, RefObject } from 'react';

export const usePdfZoom = (containerRef: RefObject<HTMLDivElement | null>) => {
  const [scale, setScale] = useState<number>(1.0);
  const [pdfPageSize, setPdfPageSize] = useState<{width: number, height: number} | null>(null);

  const calculateFitScale = useCallback((pageWidth: number, pageHeight: number) => {
    if (!containerRef.current) return 1.0;

    const { clientWidth, clientHeight } = containerRef.current;
    // Account for padding (p-8 = 32px * 2 = 64px)
    const contentWidth = clientWidth - 64; 
    const contentHeight = clientHeight - 64;

    const aspect = pageWidth / pageHeight;
    // Scale needed to fit height within the container
    const heightScale = (contentHeight / contentWidth) * aspect;
    const widthScale = 1.0;

    // Choose the smaller scale to ensure it fits completely
    return Math.min(widthScale, heightScale);
  }, [containerRef]);

  const handleZoom = useCallback((delta: number) => {
    setScale(s => {
      const newScale = Math.round((s + delta) * 10) / 10;
      return Math.min(2.5, Math.max(0.1, newScale));
    });
  }, []);

  const handleFitToWindow = useCallback(() => {
    if (pdfPageSize) {
      const bestScale = calculateFitScale(pdfPageSize.width, pdfPageSize.height);
      setScale(bestScale);
    } else {
      setScale(1.0);
    }
  }, [pdfPageSize, calculateFitScale]);

  const handleFitToWidth = useCallback(() => {
    setScale(1.0);
  }, []);

  return {
    scale,
    setScale,
    pdfPageSize,
    setPdfPageSize,
    handleZoom,
    handleFitToWindow,
    handleFitToWidth,
    calculateFitScale
  };
};
