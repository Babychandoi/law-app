// src/component/common/ScrollToTop.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' }); // smooth hoặc bỏ cũng được
  }, [pathname]);

  return null;
};

export default ScrollToTop;
