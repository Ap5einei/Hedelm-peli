import { useEffect, useState } from "react";

interface WinLineOverlayProps {
  lineNumber: number;
  isActive: boolean;
}

export const WinLineOverlay = ({ lineNumber, isActive }: WinLineOverlayProps) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (isActive) {
      setShouldAnimate(true);
    } else {
      setShouldAnimate(false);
    }
  }, [isActive]);

  if (!isActive) return null;

  // Define line paths based on line number
  const getLinePath = () => {
    const cellHeight = 33.33; // percentage
    const yOffset = 16.66; // percentage to center in cell
    
    switch (lineNumber) {
      case 1: // Middle horizontal
        return `M 0 ${50}% L 100% ${50}%`;
      case 2: // Top horizontal
        return `M 0 ${yOffset}% L 100% ${yOffset}%`;
      case 3: // Bottom horizontal
        return `M 0 ${100 - yOffset}% L 100% ${100 - yOffset}%`;
      case 4: // V shape (top-middle-bottom-middle-top)
        return `M 0 ${yOffset}% L 25% ${50}% L 50% ${100 - yOffset}% L 75% ${50}% L 100% ${yOffset}%`;
      case 5: // ^ shape (bottom-middle-top-middle-bottom)
        return `M 0 ${100 - yOffset}% L 25% ${50}% L 50% ${yOffset}% L 75% ${50}% L 100% ${100 - yOffset}%`;
      default:
        return '';
    }
  };

  // Define colors for different lines
  const getLineColor = () => {
    const colors = [
      'rgba(251, 191, 36, 0.8)', // yellow/gold - line 1
      'rgba(139, 92, 246, 0.8)', // purple - line 2
      'rgba(34, 211, 238, 0.8)', // cyan - line 3
      'rgba(239, 68, 68, 0.8)', // red - line 4
      'rgba(34, 197, 94, 0.8)', // green - line 5
    ];
    return colors[lineNumber - 1] || colors[0];
  };

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <filter id={`glow-${lineNumber}`}>
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d={getLinePath()}
        stroke={getLineColor()}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#glow-${lineNumber})`}
        className={shouldAnimate ? 'animate-pulse' : ''}
        style={{
          strokeDasharray: shouldAnimate ? '1000' : 'none',
          strokeDashoffset: shouldAnimate ? '1000' : '0',
          animation: shouldAnimate ? `draw 1s ease-out forwards, pulse 1.5s ease-in-out infinite` : 'none',
        }}
      />
      <style>
        {`
          @keyframes draw {
            to {
              stroke-dashoffset: 0;
            }
          }
        `}
      </style>
    </svg>
  );
};
