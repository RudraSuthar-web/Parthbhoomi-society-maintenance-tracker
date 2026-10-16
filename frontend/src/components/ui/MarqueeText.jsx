import React, { useRef, useState, useEffect } from 'react';

/**
 * MarqueeText: Infinite scrolling text animation (like bus destination displays)
 * Automatically activates only when text overflows its container.
 */
export default function MarqueeText({
  text,
  className = '',
  pauseOnHover = true,
  speedMultiplier = 0.35, // seconds per character
  minDuration = 7,
}) {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        // Measure whether the full text width exceeds the available container width
        const isOverflow = textRef.current.scrollWidth > containerRef.current.clientWidth + 2;
        setIsOverflowing(isOverflow);
      }
    };

    // Initial check
    checkOverflow();

    // Check after fonts load or layout stabilizes
    const timeout = setTimeout(checkOverflow, 100);

    // Check on window resize
    window.addEventListener('resize', checkOverflow);

    // ResizeObserver for container size changes
    let observer;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      observer = new ResizeObserver(checkOverflow);
      observer.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', checkOverflow);
      if (observer) observer.disconnect();
    };
  }, [text]);

  const duration = Math.max(minDuration, Math.round((text?.length || 10) * speedMultiplier));

  return (
    <div
      ref={containerRef}
      className="w-full min-w-0 overflow-hidden relative select-none"
      style={
        isOverflowing
          ? {
              maskImage:
                'linear-gradient(to right, transparent 0%, black 6px, black calc(100% - 6px), transparent 100%)',
              WebkitMaskImage:
                'linear-gradient(to right, transparent 0%, black 6px, black calc(100% - 6px), transparent 100%)',
            }
          : undefined
      }
    >
      {isOverflowing ? (
        <div
          className={`animate-marquee-infinite ${className}`}
          style={{
            '--marquee-duration': `${duration}s`,
            animationPlayState: undefined,
          }}
        >
          <span className="inline-block pr-8">{text}</span>
          <span className="inline-block pr-8" aria-hidden="true">
            {text}
          </span>
        </div>
      ) : (
        <p ref={textRef} className={`truncate ${className}`}>
          {text}
        </p>
      )}

      {/* Hidden measurer to continuously track natural text width */}
      {isOverflowing && (
        <span
          ref={textRef}
          className={`absolute opacity-0 pointer-events-none whitespace-nowrap -z-10 ${className}`}
          aria-hidden="true"
        >
          {text}
        </span>
      )}
    </div>
  );
}
