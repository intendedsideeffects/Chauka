/**
 * Data loading + layout for the story dots.
 *
 * Two kinds of dots are laid over the story sections:
 *   blue   - floods recorded in the Pacific (the danger)
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
 * story sections 1-7 by the layout, so the dots keep their position at any
 * window size, zoom level or phone screen. Older events sit at the top,
 * recent ones at the bottom, which is why the floods thin out at the start of
 * the story and pile up towards the end, in the night sky of section 7.
 *
 * Horizontally the dots spread across the full width, over the text and over
 * the charts. That overlap is the point of the piece: the floods interrupt
 * the reading.
 *
 * Placement is deterministic (seeded by the row), never Math.random(), so
 * dots do not jump around on re-render or resize.
 */

export const YEAR_MIN = 1900;
export const YEAR_MAX = 2025;

export const FLOOD_COLOR = '#0066cc';
export const RESISTANCE_COLOR = '#edf551';

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

/** Keep a jittered dot inside the overlay, so none is clipped in half. */
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
 * Flood dots (blue).
 *
 * The radius follows how many people the flood affected, on the same 6-30px
 * range the piece used originally, and grows a little towards the end of the
 * story so the danger builds up as the reader scrolls.
 */
export async function loadFloodDots() {
  const res = await fetch('/Disaster_Dataset_with_Summaries_fixed.csv');
  const rows = parseCsv(await res.text(), ';');

  const floods = rows
    .map((r) => ({ ...r, year: eventYear(r) }))
    .filter(
      (r) =>
        (r.disaster_type || '').toLowerCase().includes('flood') &&
        r.year >= YEAR_MIN &&
        r.year <= YEAR_MAX
    );

  const affected = floods
    .map((r) => Number(r.total_affected) || 0)
    .filter((v) => v > 0)
    .sort((a, b) => a - b);
  // 90th percentile rather than the maximum: a single outlier would squash
  // every other dot down to the minimum size.
  const cap = affected.length ? affected[Math.floor(affected.length * 0.9)] : 1;

  return floods.map((r, i) => {
    const { year } = r;
    const progress = (year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN);
    const severity = Math.min((Number(r.total_affected) || 0) / cap, 1);
    const radius = (6 + severity * 24) * (0.72 + 0.28 * progress);

    const rnd = seeded(i + 1);
    const rnd2 = seeded(i + 91);

    return {
      id: `flood-${i}`,
      kind: 'flood',
      year,
      xPercent: 3 + rnd * 94,
      yPercent: withinOverlay(yearToPercent(year) + (rnd2 - 0.5) * 1.2),
      radius,
      country: r.country,
      type: r.disaster_type,
      summary: r.summary,
      affected: Number(r.total_affected) || 0,
    };
  });
}

/** Resistance dots (yellow). One fixed size, as in the original. */
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
        xPercent: 4 + rnd * 92,
        yPercent: withinOverlay(yearToPercent(year) + (rnd2 - 0.5) * 1.5),
        radius: 15,
        text: r['Tooltip Text'],
      };
    })
    .filter(Boolean);
}
