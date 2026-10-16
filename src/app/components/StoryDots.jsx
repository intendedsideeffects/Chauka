'use client';

import { useEffect, useState } from 'react';
import {
  loadFloodDots,
  loadResistanceDots,
  YEAR_MAX,
  yearToPercent,
  FLOOD_COLOR,
  RESISTANCE_COLOR,
} from './storyDotsData';

/**
 * The dot layer over story sections 1-7.
 *
 * It is rendered as an absolutely positioned child of the wrapper around
 * those sections, so it always covers exactly that stretch of the page and
 * ends with the night sky of section 7 - at any window size.
 *
 * Every dot is placed in percent, so zooming or resizing moves the dots with
 * the sections instead of drifting away from them. The dots sit ON TOP of the
 * text and the charts on purpose: the floods interrupting the reading is part
 * of the piece.
 *
 * Hovering a dot blows it up and draws a thin cross across the page, the way
 * the original did.
 */

const TICK_YEARS = [1900, 1925, 1950, 1975, 2000, YEAR_MAX];

export default function StoryDots() {
  const [floods, setFloods] = useState([]);
  const [resistance, setResistance] = useState([]);
  const [active, setActive] = useState(null); // { dot, x, y }

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadFloodDots(), loadResistanceDots()])
      .then(([f, r]) => {
        if (cancelled) return;
        setFloods(f);
        setResistance(r);
      })
      .catch((err) => console.error('Could not load story dots:', err));
    return () => {
      cancelled = true;
    };
  }, []);

  // Close the tooltip when the reader scrolls on.
  useEffect(() => {
    if (!active) return undefined;
    const close = () => setActive(null);
    window.addEventListener('scroll', close, { passive: true, capture: true });
    return () => window.removeEventListener('scroll', close, { capture: true });
  }, [active]);

  const open = (dot, event) => {
    const point = event.touches?.[0] ?? event;
    setActive({ dot, x: point.clientX, y: point.clientY });
  };

  const tooltipPosition = (width) => {
    if (!active) return {};
    const maxHeight = Math.min(320, window.innerHeight - 32);
    let left = active.x + 20;
    let top = active.y - 100;
    if (left + width > window.innerWidth - 16) left = Math.max(16, active.x - width - 20);
    if (top + maxHeight > window.innerHeight - 16) top = window.innerHeight - maxHeight - 16;
    if (top < 16) top = 16;
    return { left, top, maxHeight };
  };

  const renderDot = (dot) => {
    const isFlood = dot.kind === 'flood';
    const color = isFlood ? FLOOD_COLOR : RESISTANCE_COLOR;
    const isActive = active?.dot.id === dot.id;
    // The button reaches further than the circle it paints, so small dots are
    // still easy to hit - with a mouse and with a thumb.
    const hit = Math.max(dot.radius * 3, 34);

    return (
      <button
        key={dot.id}
        type="button"
        className="story-dot"
        data-active={isActive ? 'true' : 'false'}
        onMouseEnter={(e) => open(dot, e)}
        onMouseLeave={() => setActive(null)}
        onClick={(e) => {
          e.stopPropagation();
          open(dot, e);
        }}
        aria-label={
          isFlood
            ? `${dot.type} in ${dot.country}, ${dot.year}`
            : `Act of climate resistance, ${dot.year}`
        }
        style={{
          left: `${dot.xPercent}%`,
          top: `${dot.yPercent}%`,
          width: `${hit}px`,
          height: `${hit}px`,
          '--dot-color': color,
          '--dot-size': `${dot.radius * 2}px`,
          '--dot-grow': isFlood ? 3.4 : 2.8,
        }}
      >
        <span className="story-dot-glow" />
        <span className="story-dot-core" />
      </button>
    );
  };

  return (
    <>
      <div className="story-dots-layer">
        {/* Minimal timeline: a hairline with a few years, so the dots read as
            a time axis instead of decoration. No toggle button, no panel. */}
        <div className="story-timeline">
          {TICK_YEARS.map((year) => (
            <span key={year} style={{ top: `${yearToPercent(year)}%` }}>
              {year === YEAR_MAX ? 'now' : year}
            </span>
          ))}
        </div>

        {floods.map(renderDot)}
        {resistance.map(renderDot)}

        {/* The cross through the hovered dot, as in the original. */}
        {active && (
          <svg className="story-dot-cross" aria-hidden="true">
            <line
              x1="0"
              y1={`${active.dot.yPercent}%`}
              x2="100%"
              y2={`${active.dot.yPercent}%`}
              stroke="#000000"
              strokeWidth="0.5"
              opacity="0.6"
            />
            <line
              x1={`${active.dot.xPercent}%`}
              y1="0"
              x2={`${active.dot.xPercent}%`}
              y2="100%"
              stroke="#000000"
              strokeWidth="0.5"
              opacity="0.6"
            />
          </svg>
        )}
      </div>

      {active && (
        <div
          role="tooltip"
          className="story-tooltip"
          onClick={() => setActive(null)}
          style={{
            width: active.dot.kind === 'flood' ? 'min(384px, calc(100vw - 32px))' : 'min(400px, calc(100vw - 32px))',
            ...tooltipPosition(active.dot.kind === 'flood' ? 384 : 400),
          }}
        >
          {active.dot.kind === 'flood' ? (
            <>
              <p className="story-tooltip-title">
                {active.dot.type} in {active.dot.country}
              </p>
              <p className="story-tooltip-sub">Start year: {active.dot.year}</p>
              {active.dot.summary && <p className="story-tooltip-body">{active.dot.summary}</p>}
            </>
          ) : (
            <>
              <p className="story-tooltip-title">Resistance</p>
              <p className="story-tooltip-sub">{active.dot.year}</p>
              <p className="story-tooltip-body">{active.dot.text}</p>
            </>
          )}
        </div>
      )}
    </>
  );
}
