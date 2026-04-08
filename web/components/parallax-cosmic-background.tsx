"use client";

import React, { useEffect, useState, useMemo } from 'react';

interface CosmicParallaxBgProps {
  loop?: boolean;
  className?: string;
}

const generateStarBoxShadow = (count: number): string => {
  const shadows = [];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 2000);
    const y = Math.floor(Math.random() * 2000);
    shadows.push(`${x}px ${y}px #FFF`);
  }
  return shadows.join(', ');
};

const CosmicParallaxBg: React.FC<CosmicParallaxBgProps> = ({
  loop = true,
  className = '',
}) => {
  const [mounted, setMounted] = useState(false);
  const iterationCount = loop ? 'infinite' : '1';

  // useMemo relies on random, but since we only render after mount, 
  // the server vs client mismatch doesn't matter (server renders nothing)
  const smallStars = useMemo(() => generateStarBoxShadow(700), []);
  const mediumStars = useMemo(() => generateStarBoxShadow(200), []);
  const bigStars = useMemo(() => generateStarBoxShadow(100), []);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes animStar {
        from { transform: translateY(0px); }
        to { transform: translateY(-2000px); }
      }
    `;
    document.head.appendChild(style);
    
    // Using requestAnimationFrame to avoid "cascading renders" lint error
    // while still ensuring we only render stars on the client to avoid hydration mismatch.
    const frameId = requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => {
      document.head.removeChild(style);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className={className} style={{
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      background: 'radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%)',
      overflow: 'hidden',
    }}>
      {mounted && (
        <>
          <div style={{
            width: '1px', height: '1px', background: 'transparent',
            boxShadow: smallStars,
            animation: `animStar 50s linear ${iterationCount}`,
          }} />
          <div style={{
            width: '2px', height: '2px', background: 'transparent',
            boxShadow: mediumStars,
            animation: `animStar 100s linear ${iterationCount}`,
          }} />
          <div style={{
            width: '3px', height: '3px', background: 'transparent',
            boxShadow: bigStars,
            animation: `animStar 150s linear ${iterationCount}`,
          }} />
        </>
      )}

      {/* Horizon */}
      <div style={{
        position: 'absolute', bottom: 0, left: '-25%', width: '150%', height: '15px',
        borderRadius: '100%/100%', background: '#fff',
        boxShadow: '0 0 40px 2px #fff, 0 0 60px 10px rgba(59,130,246,0.5), 0 0 160px 60px rgba(59,130,246,0.2)',
        zIndex: 3,
      }}>
        <div style={{
          position: 'absolute', top: '-200px', left: '25%', width: '50%', height: '200px',
          background: 'radial-gradient(ellipse at bottom, rgba(59,130,246,0.15) 0%, transparent 70%)',
        }} />
      </div>

      {/* Earth */}
      <div style={{
        position: 'absolute', bottom: '-300px', left: '-10%', width: '120%', height: '300px',
        background: '#0c0c14', zIndex: 2,
      }} />

    </div>
  );
};

export { CosmicParallaxBg };