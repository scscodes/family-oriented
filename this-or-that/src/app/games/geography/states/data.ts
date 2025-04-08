/**
 * Data for US states display
 * Uses Natural Earth Data GeoJSON for accurate state outlines
 */
interface State {
  name: string;
  code: string;
  geoUrl: string;
  center: [number, number];
  zoom: number;
}

export const states: State[] = [
  { name: 'Alabama', code: 'AL', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-86.8, 32.8], zoom: 5 },
  { name: 'Alaska', code: 'AK', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-152.5, 64.2], zoom: 3 },
  { name: 'Arizona', code: 'AZ', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-111.6, 34.2], zoom: 5 },
  { name: 'Arkansas', code: 'AR', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-92.4, 34.7], zoom: 5 },
  { name: 'California', code: 'CA', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-119.4, 36.8], zoom: 5 },
  { name: 'Colorado', code: 'CO', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-105.5, 39.0], zoom: 5 },
  { name: 'Connecticut', code: 'CT', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-72.7, 41.6], zoom: 6 },
  { name: 'Delaware', code: 'DE', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-75.5, 39.0], zoom: 6 },
  { name: 'Florida', code: 'FL', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-81.6, 27.8], zoom: 5 },
  { name: 'Georgia', code: 'GA', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-83.4, 32.6], zoom: 5 },
  { name: 'Hawaii', code: 'HI', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-155.5, 19.9], zoom: 5 },
  { name: 'Idaho', code: 'ID', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-114.5, 44.4], zoom: 5 },
  { name: 'Illinois', code: 'IL', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-89.0, 40.0], zoom: 5 },
  { name: 'Indiana', code: 'IN', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-86.1, 40.2], zoom: 5 },
  { name: 'Iowa', code: 'IA', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-93.1, 42.0], zoom: 5 },
  { name: 'Kansas', code: 'KS', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-98.4, 38.5], zoom: 5 },
  { name: 'Kentucky', code: 'KY', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-85.3, 37.5], zoom: 5 },
  { name: 'Louisiana', code: 'LA', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-92.0, 31.2], zoom: 5 },
  { name: 'Maine', code: 'ME', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-69.2, 45.4], zoom: 5 },
  { name: 'Maryland', code: 'MD', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-76.6, 39.0], zoom: 6 },
  { name: 'Massachusetts', code: 'MA', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-71.8, 42.4], zoom: 6 },
  { name: 'Michigan', code: 'MI', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-84.5, 44.3], zoom: 5 },
  { name: 'Minnesota', code: 'MN', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-94.3, 46.3], zoom: 5 },
  { name: 'Mississippi', code: 'MS', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-89.7, 32.7], zoom: 5 },
  { name: 'Missouri', code: 'MO', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-92.3, 38.5], zoom: 5 },
  { name: 'Montana', code: 'MT', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-109.5, 46.9], zoom: 5 },
  { name: 'Nebraska', code: 'NE', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-99.9, 41.5], zoom: 5 },
  { name: 'Nevada', code: 'NV', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-116.9, 39.3], zoom: 5 },
  { name: 'New Hampshire', code: 'NH', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-71.5, 43.7], zoom: 6 },
  { name: 'New Jersey', code: 'NJ', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-74.5, 40.0], zoom: 6 },
  { name: 'New Mexico', code: 'NM', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-106.0, 34.5], zoom: 5 },
  { name: 'New York', code: 'NY', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-75.5, 43.0], zoom: 5 },
  { name: 'North Carolina', code: 'NC', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-79.4, 35.6], zoom: 5 },
  { name: 'North Dakota', code: 'ND', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-100.5, 47.5], zoom: 5 },
  { name: 'Ohio', code: 'OH', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-82.8, 40.4], zoom: 5 },
  { name: 'Oklahoma', code: 'OK', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-97.5, 35.5], zoom: 5 },
  { name: 'Oregon', code: 'OR', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-120.5, 44.0], zoom: 5 },
  { name: 'Pennsylvania', code: 'PA', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-77.2, 41.0], zoom: 5 },
  { name: 'Rhode Island', code: 'RI', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-71.5, 41.7], zoom: 7 },
  { name: 'South Carolina', code: 'SC', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-80.9, 33.9], zoom: 5 },
  { name: 'South Dakota', code: 'SD', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-100.2, 44.4], zoom: 5 },
  { name: 'Tennessee', code: 'TN', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-86.6, 35.8], zoom: 5 },
  { name: 'Texas', code: 'TX', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-99.9, 31.5], zoom: 5 },
  { name: 'Utah', code: 'UT', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-111.9, 39.3], zoom: 5 },
  { name: 'Vermont', code: 'VT', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-72.6, 44.1], zoom: 6 },
  { name: 'Virginia', code: 'VA', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-78.0, 37.5], zoom: 5 },
  { name: 'Washington', code: 'WA', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-120.7, 47.4], zoom: 5 },
  { name: 'West Virginia', code: 'WV', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-80.5, 38.6], zoom: 5 },
  { name: 'Wisconsin', code: 'WI', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-89.6, 44.5], zoom: 5 },
  { name: 'Wyoming', code: 'WY', geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson', center: [-107.5, 43.0], zoom: 5 }
];

/**
 * Get a random state for the quiz
 * @returns {Object} Random state object
 */
export const getRandomState = () => {
  const randomIndex = Math.floor(Math.random() * states.length);
  return states[randomIndex];
};

/**
 * Get a state by its code
 * @param {string} code - State code
 * @returns {Object|undefined} State object or undefined if not found
 */
export const getStateByCode = (code: string) => {
  return states.find(state => state.code === code);
}; 