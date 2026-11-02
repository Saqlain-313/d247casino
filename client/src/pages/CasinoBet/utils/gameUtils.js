
import { TWO_PLAYER_GAMES } from '../constants';

/**
 * Check if game should show only two players
 */
export const shouldShowOnlyTwoPlayers = (gameId) => {
  return TWO_PLAYER_GAMES.includes(gameId);
};

/**
 * Get chart data for baccarat statistics
 */
export const getBaccaratChartData = (resultData) => {
  const g = resultData?.g;

  return [
    {
      name: 'player',
      y: Number.parseFloat(g?.p) || 0,
      color: '#428bca',
    },
    {
      name: 'banker',
      y: Number.parseFloat(g?.b) || 0,
      color: '#d9534f',
    },
    {
      name: 'Tie',
      y: Number.parseFloat(g?.t) || 0,
      color: '#5cb85c',
    },
  ];
};

/**
 * Get Highcharts configuration for baccarat pie chart
 */
export const getBaccaratChartOptions = (chartData) => ({
  chart: {
    type: 'pie',
    options3d: {
      enabled: true,
      alpha: 35,
      depth: 50,
    },
    backgroundColor: 'transparent',
    animation: false,
    height: 300,
  },

  title: {
    text: null,
  },

  credits: {
    enabled: false,
  },

  plotOptions: {
    pie: {
      depth: 45,
      startAngle: -85,
      endAngle: 450,
      center: ['50%', '50%'],

      dataLabels: {
        enabled: true,
        distance: -40,

        formatter: function () {
          return this.y > 0 ? this.y : null;
        },

        style: {
          color: '#fff',
          fontWeight: 'bold',
          textOutline: 'none',
          fontSize: '14px',
        },
      },
    },
  },

  tooltip: {
    enabled: true,
  },

  series: [
    {
      type: 'pie',
      animation: false,
      data: chartData,
    },
  ],
});

/**
 * Casino TV Configuration
 */
const CASINO_TV_BASE_URL = (
  import.meta.env.VITE_CASINO_TV_BASE_URL ||
  'https://scoreapi.nautical7.com'
).replace(/\/+$/, '');

const CASINO_TV_KEY =
  import.meta.env.VITE_CASINO_TV_KEY || '';

/**
 * Get video stream URL for a game
 */
export const getVideoStreamUrl = (eventName) => {
  if (!eventName) return '';

  const safeEventName = String(eventName).trim();

  if (!/^[a-zA-Z0-9_-]+$/.test(safeEventName)) {
    console.error('Invalid casino event name:', safeEventName);
    return '';
  }

  if (!CASINO_TV_KEY) {
    console.error('Casino TV API key is missing');
    return '';
  }

  const params = new URLSearchParams({
    key: CASINO_TV_KEY,
  });

  return `${CASINO_TV_BASE_URL}/diamond/casino/${encodeURIComponent(
    safeEventName
  )}?${params.toString()}`;
};
