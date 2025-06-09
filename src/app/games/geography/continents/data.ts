import { Geography } from 'react-simple-maps';

interface Continent {
  name: string;
  code: string;
  geoUrl: string;
  filter: (feature: Geography) => boolean;
  center: [number, number];
  zoom: number;
}

/**
 * Data for continents display
 * Uses Natural Earth Data GeoJSON for accurate continent outlines
 */
export const continents: Continent[] = [
  { 
    name: 'Africa', 
    code: 'AF', 
    geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson',
    filter: (feature: Geography) => feature.properties.CONTINENT === 'Africa',
    center: [20, 0],
    zoom: 0.75
  },
  { 
    name: 'Antarctica', 
    code: 'AN', 
    geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson',
    filter: (feature: Geography) => feature.properties.CONTINENT === 'Antarctica',
    center: [0, -60],
    zoom: 0.25
  },
  { 
    name: 'Asia', 
    code: 'AS', 
    geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson',
    filter: (feature: Geography) => feature.properties.CONTINENT === 'Asia',
    center: [100, 40],
    zoom: 0.75
  },
  { 
    name: 'Europe', 
    code: 'EU', 
    geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson',
    filter: (feature: Geography) => feature.properties.CONTINENT === 'Europe',
    center: [15, 55],
    zoom: 0.75
  },
  { 
    name: 'North America', 
    code: 'NA', 
    geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson',
    filter: (feature: Geography) => feature.properties.CONTINENT === 'North America',
    center: [-100, 60],
    zoom: 0.40
  },
  { 
    name: 'Oceania', 
    code: 'OC', 
    geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson',
    filter: (feature: Geography) => feature.properties.CONTINENT === 'Oceania',
    center: [150, -20],
    zoom: 1
  },
  { 
    name: 'South America', 
    code: 'SA', 
    geoUrl: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson',
    filter: (feature: Geography) => feature.properties.CONTINENT === 'South America',
    center: [-60, -20],
    zoom: 0.75
  }
];

/**
 * Get a random continent for the quiz
 * @returns {Object} Random continent object
 */
export const getRandomContinent = () => {
  const randomIndex = Math.floor(Math.random() * continents.length);
  return continents[randomIndex];
};

/**
 * Get a continent by its code
 * @param {string} code - Continent code
 * @returns {Object|undefined} Continent object or undefined if not found
 */
export const getContinentByCode = (code: string) => {
  return continents.find(continent => continent.code === code);
}; 