import React from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from 'react-simple-maps';

interface InteractiveMapProps {
  geoUrl: string;
  selectedRegion?: string;
  onRegionClick?: (region: string) => void;
  width?: number;
  height?: number;
  filter?: (feature: Geography) => boolean;
  center?: [number, number];
  zoom?: number;
}

/**
 * Interactive map component that displays GeoJSON data using react-simple-maps
 * @param {InteractiveMapProps} props - Component props
 * @param {string} props.geoUrl - URL to the GeoJSON data
 * @param {string} [props.selectedRegion] - Currently selected region
 * @param {(region: string) => void} [props.onRegionClick] - Callback when a region is clicked
 * @param {number} [props.width=800] - Map width
 * @param {number} [props.height=600] - Map height
 * @param {(feature: Geography) => boolean} [props.filter] - Function to filter features
 * @param {[number, number]} [props.center] - Center coordinates for the map
 * @param {number} [props.zoom] - Zoom level for the map
 */
export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  geoUrl,
  selectedRegion,
  onRegionClick,
  width = 800,
  height = 600,
  filter,
  center = [0, 0],
  zoom = 1
}) => {
  return (
    <ComposableMap
      projection="geoMercator"
      width={width}
      height={height}
      style={{ width: '100%', height: 'auto' }}
    >
      <ZoomableGroup zoom={zoom} center={center}>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies
              .filter(filter || (() => true))
              .map((geo) => {
                const isSelected = selectedRegion === geo.properties.name;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => onRegionClick?.(geo.properties.name)}
                    style={{
                      default: {
                        fill: isSelected ? '#FF5722' : '#ECEFF1',
                        stroke: '#607D8B',
                        strokeWidth: 0.5,
                        outline: 'none',
                      },
                      hover: {
                        fill: '#FF5722',
                        stroke: '#607D8B',
                        strokeWidth: 0.5,
                        outline: 'none',
                      },
                      pressed: {
                        fill: '#E64A19',
                        stroke: '#607D8B',
                        strokeWidth: 0.5,
                        outline: 'none',
                      },
                    }}
                  />
                );
              })
          }
        </Geographies>
      </ZoomableGroup>
    </ComposableMap>
  );
}; 