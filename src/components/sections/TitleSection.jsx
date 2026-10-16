'use client';

import { useEffect } from 'react';

/**
 * Title section: the project name, the introduction, and the Spilhaus ocean
 * map with the flood dots over the Pacific.
 *
 * Layout: two columns on a wide screen, stacked on a narrow one. All type is
 * fluid and the decorative annotation lines are hidden where there is no room
 * for them, so nothing lands on top of anything else at other zoom levels.
 */

// Positions are in percent of the map artwork, so the dots stay over the
// Pacific whatever the window size is.
const DOTS = [
  { size: 5.49, top: '40%', left: '58.5%', delay: '0s' },
  { size: 2.06, top: '45%', left: '61.4%', delay: '0.3s' },
  { size: 2.40, top: '45%', left: '64.2%', delay: '0.6s' },
  { size: 1.92, top: '38%', left: '60.2%', delay: '0.9s' },
  { size: 2.19, top: '45%', left: '56.8%', delay: '1.2s' },
  { size: 1.71, top: '42%', left: '62.5%', delay: '1.5s' },
  { size: 2.61, top: '43%', left: '54.6%', delay: '1.8s' },
  { size: 1.99, top: '38%', left: '57.4%', delay: '2.1s' },
  { size: 2.13, top: '38%', left: '59.7%', delay: '2.4s' },
  { size: 2.40, top: '42%', left: '52.8%', delay: '2.7s' },
  { size: 3.29, top: '52%', left: '55.7%', delay: '3s' },
  { size: 1.30, top: '47%', left: '61.4%', delay: '3.3s' },
];

const TitleSection = ({
  title = 'Chauka',
  subtitle = 'This is a global warning.',
  content = "On Manus Island, the Chauka bird once warned villagers when something was wrong. Its call meant: stop and pay attention.<br/><br/>Now, the ocean is calling.<br/><br/>It sends signals through rising tides, salt in gardens, and floods that reach farther each year. Pacific Island nations are the first to feel this. They didn't cause the crisis, but they are living with its consequences.<br/><br/>Elsewhere, people may not notice yet. But the warning is already here.",
}) => {
  // Keyframes for the pulsing flood dots.
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes smallPulse {
        0%   { transform: scale(1);   opacity: 0.4; }
        50%  { transform: scale(1.3); opacity: 0.7; }
        100% { transform: scale(1);   opacity: 0.4; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <section className="title-section">
      <div className="title-text">
        <h1 className="title-main">{title}</h1>
        <p className="title-sub">{subtitle}</p>
        <div className="title-body" dangerouslySetInnerHTML={{ __html: content }} />
      </div>

      <div className="title-map">
        <div className="title-map-stage">
          <div className="title-map-box">
            <img src="/spilhaus_black.png" alt="The world's ocean shown as one connected body (Spilhaus projection)" />

            {DOTS.map((dot, i) => (
              <span
                key={i}
                className="flood-dot"
                style={{
                  width: `${dot.size}%`,
                  top: dot.top,
                  left: dot.left,
                  animationDelay: dot.delay,
                }}
              />
            ))}

          </div>
        </div>

        {/* Legend under the map, no panel behind it. */}
        <div className="flood-legend-row">
          <span className="flood-legend flood-legend--large">
            <span className="flood-legend-dot" />
            large flood
          </span>
          <span className="flood-legend flood-legend--small">
            <span className="flood-legend-dot" />
            small flood
          </span>
        </div>
      </div>
    </section>
  );
};

export default TitleSection;
