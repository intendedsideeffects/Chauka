'use client';

/**
 * One story section: header, text, chart, caption.
 *
 * Sizing rules that keep it readable at any zoom level or screen size:
 * - the section grows with its content (min-height) instead of clipping it,
 * - every font size and gap is fluid (clamp), so 125% browser zoom or a
 *   phone screen shifts the whole block down in proportion,
 * - the chart is never wider than the column it sits in.
 */

const SegmentTemplate = ({
  header = '',
  headerSecondLine = '',
  text = '',
  chartComponent = null,
  caption = '',
  styles = {},
}) => {
  const defaultStyles = {
    container: {
      width: '100%',
      minHeight: '100vh',
      background: 'transparent',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      scrollSnapAlign: 'start',
      borderBottom: '3px solid #9ca3af',
      pointerEvents: 'auto',
      padding: 'clamp(2.5rem, 8vh, 6rem) clamp(1rem, 4vw, 4rem) clamp(1.5rem, 5vh, 3.5rem)',
      overflowX: 'clip',
    },
    header: {
      fontSize: 'clamp(1.5rem, 3.4vw, 2.5rem)',
      fontWeight: 'normal',
      color: '#000',
      margin: 0,
      textAlign: 'left',
      fontFamily: 'Helvetica World, Arial, sans-serif',
      lineHeight: 1.1,
    },
    headerSecondLine: {
      fontSize: 'clamp(1.7rem, 4vw, 3rem)',
      fontWeight: 'bold',
      color: '#000',
      margin: 0,
      textAlign: 'left',
      fontFamily: 'Times New Roman, serif',
      fontStyle: 'italic',
      lineHeight: 1.1,
    },
    text: {
      fontSize: 'clamp(0.95rem, 1.35vw, 1.1rem)',
      color: '#000',
      margin: 0,
      lineHeight: 1.55,
      fontFamily: 'Helvetica World, Arial, sans-serif',
    },
    caption: {
      fontSize: 'clamp(0.75rem, 1.05vw, 0.9rem)',
      color: '#9ca3af',
      fontStyle: 'italic',
      lineHeight: 1.4,
      margin: 0,
    },
  };

  const merged = {
    container: { ...defaultStyles.container, ...styles.container },
    header: { ...defaultStyles.header, ...styles.header },
    headerSecondLine: { ...defaultStyles.headerSecondLine, ...styles.headerSecondLine },
    text: { ...defaultStyles.text, ...styles.text },
    caption: { ...defaultStyles.caption, ...styles.caption },
  };

  const column = {
    width: '100%',
    maxWidth: 'min(1050px, 100%)',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(1rem, 2.5vh, 2rem)',
    zIndex: 1000,
    position: 'relative',
  };

  // No panel behind the words: the dots are meant to drift over the text, and
  // a white ground behind it both hid them and clipped the type.
  const textColumn = {
    width: '100%',
    maxWidth: '800px',
    textAlign: 'left',
    margin: '0 auto',
  };

  return (
    <section style={merged.container}>
      <div style={column}>
        <div style={textColumn}>
          <h2 style={merged.header}>{header}</h2>
          {headerSecondLine && <h3 style={merged.headerSecondLine}>{headerSecondLine}</h3>}
        </div>

        <div style={textColumn}>
          <p style={merged.text} dangerouslySetInnerHTML={{ __html: text }} />
        </div>

        {chartComponent && (
          <div
            style={{
              width: '100%',
              maxWidth: '1050px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div className="chart-scaler">{chartComponent}</div>
          </div>
        )}

        {caption && (
          <div style={textColumn}>
            <p style={merged.caption} dangerouslySetInnerHTML={{ __html: caption }} />
          </div>
        )}
      </div>
    </section>
  );
};

export default SegmentTemplate;
