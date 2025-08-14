"use client";

import React, { useEffect, useRef, useState, type CSSProperties } from "react";

const variantClasses = {
  red: {
    bg: "bg-[#dc3131]",                 // soft red background
    border: "border border-red-200", // subtle red border
    text: "text-white",              // black text for readability
  },
};

type MarqueeStyle = CSSProperties & { ["--marquee-distance"]?: string };

interface NoticeMarqueeProps {
  message: string;
  speedPxPerSec?: number;
}

const NoticeMarquee: React.FC<NoticeMarqueeProps> = ({
  message,
  speedPxPerSec = 40, // slow pace for professional feel
}) => {
  const v = variantClasses.red;
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null); // measure the icon+text group
  const [distance, setDistance] = useState(0); // px to scroll (width of one copy)
  const [duration, setDuration] = useState(0); // seconds

  useEffect(() => {
    const measure = () => {
      if (!containerRef.current || !contentRef.current) return;
      const contentWidth = contentRef.current.offsetWidth;

      const scrollDistance = contentWidth; // scroll exactly one copy width
      const dur = Math.max(1, Math.round((scrollDistance / speedPxPerSec) * 100) / 100);

      setDistance(scrollDistance);
      setDuration(dur);
    };

    measure();

    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [message, speedPxPerSec]);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const animatedStyle: MarqueeStyle | undefined =
    prefersReduced || distance === 0
      ? undefined
      : {
          animation: `marquee-slide ${duration}s linear infinite`,
          ["--marquee-distance"]: `${distance}px`,
        };

  return (
    <div
      className={`relative overflow-hidden ${v.bg} ${v.border} rounded-md shadow-sm w-[98%] m-auto mt-[12px]`}
    >
      <div className="flex items-center px-4 py-2 text-sm">
        {/* Marquee container */}
        <div ref={containerRef} className="relative overflow-hidden h-6 flex-1">
          <div
            className={`${v.text} inline-flex whitespace-nowrap will-change-transform font-semibold`}
            style={animatedStyle}
          >
            {/* COPY 1 (measured) */}
            <div ref={contentRef} className="mx-6 inline-flex items-center gap-2">
              {/* Moving Alert Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-red-600 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.366-.756 1.42-.756 1.786 0l6.518 13.47A1 1 0 0115.686 18H4.314a1 1 0 01-.875-1.431l6.518-13.47zM11 14a1 1 0 10-2 0 1 1 0 002 0zm-1-7a.75.75 0 00-.75.75v3.5a.75.75 0 001.5 0v-3.5A.75.75 0 0010 7z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{message}</span>
            </div>

            {/* COPY 2 (for seamless loop) */}
            <div className="mx-6 inline-flex items-center gap-2" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-red-600 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.366-.756 1.42-.756 1.786 0l6.518 13.47A1 1 0 0115.686 18H4.314a1 1 0 01-.875-1.431l6.518-13.47zM11 14a1 1 0 10-2 0 1 1 0 002 0zm-1-7a.75.75 0 00-.75.75v3.5a.75.75 0 001.5 0v-3.5A.75.75 0 0010 7z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{message}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style jsx global>{`
        @keyframes marquee-slide {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-1 * var(--marquee-distance, 0px)));
          }
        }
      `}</style>
    </div>
  );
};

export default NoticeMarquee;
