// Constants for the sea level rise chart in story section 2.

// Chart dimensions
export const CHART_DIMENSIONS = {
  container: {
    width: '100%',
    // auto: the box follows its content (controls + plot + labels) instead of
    // clipping it into the caption below
    height: 'auto'
  },
  chartArea: {
    height: '350px'
  }
};

// Global sea level rise predictions
export const GLOBAL_SEA_LEVEL_RISE = {
  '2050': {
    '2': 0.22,
    '4': 0.22
  },
  '2100': {
    '2': 0.47,
    '4': 0.63
  }
}; 