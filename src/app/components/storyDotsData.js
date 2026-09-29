/**
 * Data loading + layout for the story dots.
 *
 * Two kinds of dots are laid over the story sections:
 *   blue  - climate hazards recorded in the Pacific (the danger)
 *   yellow - acts of climate resistance (the answer)
 *
 * Both are read from CSV files in /public. There is no database: an earlier
 * version fetched the blue dots from a Supabase table that no longer exists,
 * which is why they had disappeared from the site.
 *
 * Layout rules
 * ------------
 * A dot's vertical position is its year on a shared 1900 -> PRESENT scale,
 * expressed as a PERCENTAGE of the overlay. The overlay is stretched over
 * story sections 1-6 by the layout, so the dots keep their position at any
 * window size, zoom level or phone screen. Older events sit at the top,
 * recent ones at the bottom, which is why the hazards thin out at the start
 * of the story and pile up towards the end.
 *
 * Horizontal placement is deterministic (seeded by the row), never
 * Math.random(), so dots do not jump around on re-render or resize.
 */

export const YEAR_MIN = 1900;
export const YEAR_MAX = 2025;

/**
 * Every hazard type in the dataset gets its own shade of blue, so the field of
 * dots reads as one family while a reader can still tell a flood from a
 * drought. Water-driven hazards are the deepest blues, the rest step lighter.
 */
export const HAZARD_COLORS = {
  flood: '#0b3f8f',
  'mass movement (wet)': '#14539e',
  storm: '#1b6fc4',
  'mass movement (dry)': '#3f7fb8',
  drought: '#4f93d1',
  wildfire: '#6aa6dd',
  earthquake: '#20496e',
  'volcanic activity': '#2f5f86',
  epidemic: '#7fb2e0',
};

const DEFAULT_HAZARD_COLOR = '#4f93d1';

export function hazardColor(type) {
  return HAZARD_COLORS[(type || '').toLowerCase()] || DEFAULT_HAZARD_COLOR;
}

/** Deterministic 0..1 pseudo random number from an integer seed. */
function seeded(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Year -> vertical position in percent of the overlay (0 = top = 1900). */
export function yearToPercent(year) {
  const clamped = Math.min(Math.max(year, YEAR_MIN), YEAR_MAX);
  return ((clamped - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * 100;
}

/** Keep a jittered dot inside the overlay, so none is clipped in half at the
 *  bottom edge where section 7 starts. */
function withinOverlay(percent) {
  return Math.min(Math.max(percent, 0.6), 99.4);
}

/**
 * The year an event happened.
 *
 * Nine rows have no start_year and no end_year, among them Cyclone Harold and
 * the 2024 landslide in Papua New Guinea. Their EM-DAT id starts with the
 * year ("2020-0132-SLB"), so nothing has to be dropped.
 */
function eventYear(row) {
  const direct = parseInt(row.start_year, 10);
  if (!Number.isNaN(direct)) return direct;
  const fromEnd = parseInt(row.end_year, 10);
  if (!Number.isNaN(fromEnd)) return fromEnd;
  const fromId = parseInt(String(row.id || '').slice(0, 4), 10);
  return Number.isNaN(fromId) ? null : fromId;
}

/** Split a CSV line, honouring "quoted, fields". */
function splitCsvLine(line, delimiter) {
  const out = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const c = line[i];
    if (c === '"') {
      if (quoted && line[i + 1] === '"') {
        field += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (c === delimiter && !quoted) {
      out.push(field);
      field = '';
    } else {
      field += c;
    }
  }
  out.push(field);
  return out;
}

function parseCsv(text, delimiter) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const header = splitCsvLine(lines[0], delimiter).map((h) => h.trim().replace(/^﻿/, ''));
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line, delimiter);
    const row = {};
    header.forEach((key, i) => {
      row[key] = (cells[i] ?? '').trim();
    });
    return row;
  });
}

/**
 * Hazard dots (blue).
 *
 * Size grows with how many people an event affected AND with how late in the
 * story it sits, so the danger visibly builds up towards the last section.
 */
export async function loadHazardDots() {
  const res = await fetch('/Disaster_Dataset_with_Summaries_fixed.csv');
  const rows = parseCsv(await res.text(), ';');

  // Every recorded hazard, not only the climate-driven ones: the colour says
  // which kind it was.
  const hazards = rows
    .map((r) => ({ ...r, year: eventYear(r) }))
    .filter((r) => r.disaster_type && r.year >= YEAR_MIN && r.year <= YEAR_MAX);

  const affected = hazards
    .map((r) => Number(r.total_affected) || 0)
    .filter((v) => v > 0)
    .sort((a, b) => a - b);
  // 90th percentile instead of the maximum: one huge outlier would otherwise
  // squash every other dot to the minimum size.
  const cap = affected.length ? affected[Math.floor(affected.length * 0.9)] : 1;

  return hazards.map((r, i) => {
    const year = r.year;
    const progress = (year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN); // 0 = 1900, 1 = now
    const severity = Math.min((Number(r.total_affected) || 0) / cap, 1);

    // 0.45 -> 1.0 with time, times 1 -> 1.6 with severity.
    const scale = (0.45 + 0.55 * progress) * (1 + 0.6 * severity);

    const rnd = seeded(i + 1);
    const rnd2 = seeded(i + 91);

    return {
      id: `hazard-${i}`,
      kind: 'hazard',
      year,
      // side: which margin this dot prefers; the exact x is worked out at
      // render time from how much room the text column leaves
      side: rnd < 0.5 ? 'left' : 'right',
      offset: rnd2,
      // a minority drift across the middle of the page for the disruption the
      // piece is after; they sit under the text and are decorative only
      drift: seeded(i + 613) < 0.18,
      yPercent: withinOverlay(yearToPercent(year) + (rnd2 - 0.5) * 1.2),
      scale,
      color: hazardColor(r.disaster_type),
      country: r.country,
      type: r.disaster_type,
      summary: r.summary,
      affected: Number(r.total_affected) || 0,
    };
  });
}

/** Resistance dots (yellow). */
export async function loadResistanceDots() {
  const res = await fetch('/Climate_Resistance_Tooltips.csv');
  const rows = parseCsv(await res.text(), ',');

  return rows
    .map((r, i) => {
      const year = parseInt(r.Year, 10);
      if (Number.isNaN(year)) return null;
      const rnd = seeded(i + 17);
      const rnd2 = seeded(i + 53);
      return {
        id: `resistance-${i}`,
        kind: 'resistance',
        year,
        side: rnd < 0.5 ? 'left' : 'right',
        offset: rnd2,
        drift: false,
        yPercent: withinOverlay(yearToPercent(year) + (rnd2 - 0.5) * 1.5),
        scale: 1,
        text: r['Tooltip Text'],
      };
    })
    .filter(Boolean);
}
