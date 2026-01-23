import { useState, useRef, useEffect, useCallback } from 'react';

export const usePdfNavigation = (numPages: number | null) => {
  const [pageNumber, setPageNumber] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const isAutoScrolling = useRef(false);

  const scrollToPage = useCallback((targetPage: number) => {
    const pageEl = pageRefs.current.get(targetPage);
    if (pageEl) {
      isAutoScrolling.current = true;
      setPageNumber(targetPage);
      
      pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Release the lock after animation roughly completes
      setTimeout(() => {
        isAutoScrolling.current = false;
      }, 800);
    }
  }, []);

  const registerPageRef = useCallback((pageIndex: number, el: HTMLDivElement | null) => {
    if (el) {
      pageRefs.current.set(pageIndex, el);
    } else {
      pageRefs.current.delete(pageIndex);
    }
  }, []);

  // Intersection Observer to update page number on scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !numPages) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isAutoScrolling.current) return;

        // Find the page with the highest intersection ratio (most visible)
        const visibleEntry = entries.reduce((prev, current) => 
          (prev.intersectionRatio > current.intersectionRatio) ? prev : current
        );

        if (visibleEntry.isIntersecting && visibleEntry.intersectionRatio > 0) {
          const pageNum = Number(visibleEntry.target.getAttribute('data-page-number'));
          if (!isNaN(pageNum) && pageNum !== pageNumber) {
            setPageNumber(pageNum);
          }
        }
      },
      {
        root: container,
        threshold: [0.1, 0.5, 0.8], // Check multiple points to capture partially visible pages
        rootMargin: "-10% 0px -50% 0px" // Bias towards the top half of the viewport
      }
    );

    pageRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [numPages, pageNumber]); // Re-run when pages change

  return {
    pageNumber,
    setPageNumber,
    containerRef,
    scrollToPage,
    registerPageRef
  };
};