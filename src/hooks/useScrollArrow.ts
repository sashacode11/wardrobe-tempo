// 📁 hooks/useScrollArrow.ts
import { useState, useEffect, RefObject } from 'react';

export const useScrollArrow = (ref: RefObject<HTMLElement>) => {
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = ref.current!;
      const isAtStart = scrollLeft <= 5;
      const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 5;

      setShowLeftArrow(!isAtStart);
      setShowRightArrow(!isAtEnd);
    };

    const checkOverflow = () => {
      const { scrollWidth, clientWidth } = ref.current!;
      const isOverflowing = scrollWidth > clientWidth;
      if (!isOverflowing) {
        setShowLeftArrow(false);
        setShowRightArrow(false);
        return;
      }
      handleScroll(); // Re-check position
    };

    const currentRef = ref.current;
    currentRef.addEventListener('scroll', handleScroll);
    checkOverflow();
    window.addEventListener('resize', checkOverflow);

    return () => {
      currentRef.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [ref]);

  const scrollLeft = () => {
    if (ref.current) {
      ref.current.scrollBy({ left: -100, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (ref.current) {
      ref.current.scrollBy({ left: 100, behavior: 'smooth' });
    }
  };

  return {
    showLeftArrow,
    showRightArrow,
    scrollLeft,
    scrollRight,
  };
};
