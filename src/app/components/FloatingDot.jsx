"use client";

import React,{ useState, useEffect, useMemo } from 'react';

const Z_RANGE = 3000;

function _FloatingDot({ cx, cy, r, payload, fill, opacity, style, onMouseEnter, onMouseLeave }) {
    const [isHovered, setIsHovered] = useState(false);

    const zPosition = useMemo(() => {
      const seed = cx + cy; // Use position as seed
      return Math.abs(Math.sin(seed)) * Z_RANGE - Z_RANGE / 2;
    }, [cx, cy]);

    const duration = useMemo(() => {
      const seed = cx * cy;
      return 6 + Math.abs(Math.cos(seed)) * 4;
    }, [cx, cy]);

    const floatPattern = useMemo(() => {
      return Math.floor((cx + cy) % 3);
    }, [cx, cy]);

    const scale = (Z_RANGE + zPosition) / Z_RANGE;
    const baseSize = r * 1.5;
    const hitboxSize = baseSize * 3;
    // Use the passed-in opacity prop
    const blur = Math.max(0, (1 - scale) * 2);

    // Determine dot color based on size (all black)
    const dotFill = 'black';

    const groupStyle = {
      cursor: 'pointer',
      animation: isHovered ? 'none' : `none`,
      zIndex: 20,
    };

    // Debug: log size and fill for the first few dots
    useEffect(() => {
      if (cx < 10 && cy < 10) { // Only log a few times
        console.log('FloatingDot size:', r, 'fill:', dotFill);
      }
    }, [r, cx, cy, dotFill]);

    return (
      <g
        style={groupStyle}
        onMouseEnter={() => {
          setIsHovered(true);
          onMouseEnter();
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          onMouseLeave();
        }}>
        {/* Outline removed */}
        {/* Main dot */}
        <circle
          cx={cx}
          cy={cy}
          r={isHovered ? baseSize * 3 : baseSize}
          fill={fill}
          style={{
            opacity: isHovered ? Math.min(1, (opacity || 0.6) + 0.2) : (opacity || 0.6),
            transition: 'opacity 0.2s',
          }}
        />

        {/* Hitbox (invisible but handles hover) */}
        <circle
          cx={cx}
          cy={cy}
          r={hitboxSize}
          fill="transparent"
          style={{ pointerEvents: 'all' }}
        />
      </g>
    );
  }

export const FloatingDot = React.memo(
  _FloatingDot,
  (prevProps, nextProps) => {
    return (
      prevProps.cx === nextProps.cx &&
      prevProps.cy === nextProps.cy &&
      prevProps.r === nextProps.r &&
      prevProps.fill === nextProps.fill // Compare fill as well
    );
  }
);


