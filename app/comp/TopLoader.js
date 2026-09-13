"use client";
import React, { useEffect, useState, useTransition } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export const TopLoader = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  // Turn off loading bar when pathname or searchParams change
  useEffect(() => {
    setLoading(false);
  }, [pathname, searchParams]);

  // Intercept click on standard internal links to show top loading bar immediately
  useEffect(() => {
    const handleAnchorClick = (e) => {
      const target = e.target.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      // If internal link and not a hash or blank
      if (
        href &&
        href.startsWith('/') &&
        !href.startsWith('/#') &&
        !target.getAttribute('target') &&
        href !== pathname
      ) {
        setLoading(true);
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => {
      document.removeEventListener('click', handleAnchorClick);
    };
  }, [pathname]);

  if (!loading) return null;

  return (
    <div
      className="myntra-top-bar"
      role="progressbar"
      aria-label="Loading page"
    />
  );
};

export default TopLoader;
