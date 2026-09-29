'use client';

import { useEffect, useMemo, useState } from 'react';
import { loadHazardDots, loadResistanceDots, YEAR_MAX, yearToPercent } from './storyDotsData';

/**
 * Where a dot may sit horizontally.
 *
 * The story text is a centred column, so the dots are pushed into the margins
 * either side of it. On a narrow screen the text takes the full width and
 * there is no margin left; the dots then drift across it, but they are
 * painted UNDER the text, which stays fully legible.
 */
function marginBands(viewportWidth) {
  // The content column (text and charts) is at most 1050px wide and centred.
  // Dots keep clear of it, so the text stays readable and the charts stay
  // clickable - and so do the dots themselves.
  const columnWidth = Math.min(1050, viewportWidth - 32);
  const halfPct = (columnWidth / 2 / viewportWidth) * 100;
  const edge = Math.max(0, 50 - halfPct - 1); // width of one margin, in %
  return { edge, hasRoom: edge > 5 };
}

/**
 * The dot layer over story sections 1-6.
 *
 * It is rendered as an absolutely positioned child of the wrapper around
 * those sections, so it always covers exactly that stretch of the page and
 * stops where section 7 (the star sky) begins - at any window size.
 *
 * Every dot is placed in percent, so zooming or resizing moves the dots with
 * the sections instead of drifting away from them.
 */

const TICK_YEARS = [1900, 1925, 1950, 1975, 2000, YEAR_MAX];

function formatAffected(n) {
  if (!n) return null;
  return n.toLocaleString('en-US');
}

export default function StoryDots() {
  const [hazards, setHazards] = useState([]);
  const [resistance, setResistance] = useState([]);
  const [active, setActive] = useState(null); // {dot, x, y}
  const [narrow, setNarrow] = useState(false);
  const [bands, setBands] = useState({ edge: 20, hasRoom: true });

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadHazardDots(), loadResistanceDots()])
      .then(([h, r]) => {
        if (cancelled) return;
        setHazards(h);
        setResistance(r);
      })
      .catch((err) => console.error('Could not load story dots:', err));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const check = () => {
      setNarrow(window.innerWidth < 900);
      setBands(marginBands(window.innerWidth));
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close the tooltip when the reader scrolls on.
  useEffect(() => {
    if (!active) return undefined;
    const close = () => setActive(null);
    window.addEventListener('scroll', close, { passive: true, capture: true });
    return () => window.removeEventListener('scroll', close, { capture: true });
  }, [active]);

  // On a phone the full set is unreadable noise, so show a thinned-out
  // selection: every hazard from the last 40 years, a third of the older ones.
  const visibleHazards = useMemo(() => {
    if (!narrow) return hazards;
    return hazards.filter((d, i) => d.year >= 1985 || i % 3 === 0);
  }, [hazards, narrow]);

  const openTooltip = (dot, event) => {
    const { clientX, clientY } = event.touches?.[0] ?? event;
    setActive({ dot, x: clientX, y: clientY });
  };

  const tooltipStyle = () => {
    if (!active) return {};
    const width = Math.min(360, window.innerWidth - 32);
    // the tooltip scrolls rather than growing, so one height covers every
    // summary length
    const maxHeight = Math.min(300, window.innerHeight - 32);
    let left = active.x + 16;
    let top = active.y - 40;
    if (left + width > window.innerWidth - 16) left = Math.max(16, active.x - width - 16);
    if (top + maxHeight > window.innerHeight - 16) top = window.innerHeight - maxHeight - 16;
    if (top < 16) top = 16;
    return { left, top, width, maxHeight, overflowY: 'auto' };
  };

  // Put the dot in one of the two margins. Where there is no margin, spread
  // the dots over the full width instead of stacking them all on one line.
  const dotX = (dot) => {
    const { edge, hasRoom } = bands;
    if (!hasRoom || dot.drift) return 2 + dot.offset * 96;
    return dot.side === 'left' ? 1 + dot.offset * (edge - 1) : 100 - edge + dot.offset * (edge - 1);
  };

  const renderDot = (dot) => {
    const isHazard = dot.kind === 'hazard';
    const base = isHazard ? (narrow ? 7 : 9) : narrow ? 13 : 17;
    const size = base * dot.scale;
    // on a phone a 14px dot is impossible to hit, so the button reaches
    // further than the circle it paints
    const reach = narrow ? Math.max(size * 2, 30) : size * 2;
    const isActive = active?.dot.id === dot.id;

    return (
      <button
        key={dot.id}
        type="button"
        onMouseEnter={(e) => !narrow && openTooltip(dot, e)}
        onMouseLeave={() => !narrow && setActive(null)}
        onClick={(e) => {
          e.stopPropagation();
          openTooltip(dot, e);
        }}
        aria-label={
          isHazard
            ? `${dot.type} in ${dot.country}, ${dot.year}`
            : `Act of climate resistance, ${dot.year}`
        }
        style={{
          position: 'absolute',
          left: `${dotX(dot)}%`,
          top: `${dot.yPercent}%`,
          width: `${reach}px`,
          height: `${reach}px`,
          marginLeft: `${-reach / 2}px`,
          marginTop: `${-reach / 2}px`,
          backgroundSize: `${size * 2}px ${size * 2}px`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          padding: 0,
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          pointerEvents: 'auto',
          background: isHazard
            ? `radial-gradient(circle, ${dot.color} 0%, ${dot.color}99 58%, transparent 72%)`
            : `radial-gradient(circle, #edf551 0%, #edf55199 55%, transparent 72%)`,
          opacity: isActive ? 1 : dot.drift ? 0.4 : 0.85,
          transform: isActive ? 'scale(1.35)' : 'scale(1)',
          transition: 'transform 0.25s ease, background 0.25s ease',
          WebkitTapHighlightColor: 'transparent',
        }}
      />
    );
  };

  return (
    <>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        // Under the story text (its column is z-index 1000) so the text stays
        // crisp; the text blocks let clicks through, so the dots underneath
        // are still reachable. The tooltip is rendered separately, on top.
        zIndex: 999,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Minimal timeline: a hairline with a few years, so the dots read as
          a time axis instead of decoration. No toggle button, no panel. */}
      <div
        style={{
          position: 'absolute',
          // inset so the 1900 and "now" labels are not cut in half by the
          // overlay's overflow
          top: '10px',
          bottom: '10px',
          right: 'clamp(6px, 1.5vw, 22px)',
          width: '1px',
          background: 'linear-gradient(to bottom, rgba(14,34,79,0) 0%, rgba(14,34,79,0.18) 8%, rgba(14,34,79,0.18) 92%, rgba(14,34,79,0) 100%)',
        }}
      >
        {TICK_YEARS.map((year) => (
          <span
            key={year}
            style={{
              position: 'absolute',
              top: `${yearToPercent(year)}%`,
              right: '8px',
              transform: 'translateY(-50%)',
              fontSize: 'clamp(8px, 0.85vw, 11px)',
              letterSpacing: '0.06em',
              color: 'rgba(14,34,79,0.35)',
              fontFamily: 'Helvetica World, Arial, sans-serif',
              whiteSpace: 'nowrap',
            }}
          >
            {year === YEAR_MAX ? 'now' : year}
          </span>
        ))}
      </div>

      {visibleHazards.map(renderDot)}
      {resistance.map(renderDot)}

    </div>

    {active && (
        <div
          role="tooltip"
          onClick={() => setActive(null)}
          style={{
            position: 'fixed',
            ...tooltipStyle(),
            background: 'rgba(255,255,255,0.97)',
            color: '#0e224f',
            padding: '14px 16px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            boxShadow: '0 10px 20px -6px rgba(0,0,0,0.25)',
            fontFamily: 'Helvetica World, Arial, sans-serif',
            fontSize: 'clamp(12px, 1.1vw, 15px)',
            lineHeight: 1.5,
            zIndex: 10001,
            pointerEvents: 'auto',
          }}
        >
          {active.dot.kind === 'hazard' ? (
            <>
              <strong style={{ display: 'block', marginBottom: '4px' }}>
                {active.dot.type} in {active.dot.country}, {active.dot.year}
              </strong>
              {active.dot.summary && <span>{active.dot.summary}</span>}
              {formatAffected(active.dot.affected) && (
                <span style={{ display: 'block', marginTop: '6px', color: '#5b6478' }}>
                  People affected: {formatAffected(active.dot.affected)}
                </span>
              )}
            </>
          ) : (
            <>
              <strong style={{ display: 'block', marginBottom: '4px' }}>
                Resistance, {active.dot.year}
              </strong>
              <span>{active.dot.text}</span>
            </>
          )}
        </div>
      )}
    </>
  );
}
