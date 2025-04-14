import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './MapView.css';

// Default Icon Fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Dynamic view update
const ChangeMapView = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, 14);
  }, [coords, map]);
  return null;
};

const MapView = ({ place, results, hoveredIndex }) => {
  if (!place) return null;

  return (
    <div className="map-wrapper">
      <MapContainer center={place} zoom={14} className="styled-map">
        <ChangeMapView coords={place} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <Marker position={place}>
          <Popup>Selected Area</Popup>
        </Marker>

        {results?.map((res, i) => {
          const name = res.properties.name || 'Unnamed Place';
          const address = res.properties.formatted || 'Address not available';
          const distance = res.properties.distance ? `${res.properties.distance} m` : '';
          const [lon, lat] = res.geometry.coordinates;

          const iconSize = hoveredIndex === i ? [50, 82] : [25, 41];
          const customIcon = new L.Icon({
            iconUrl:
              'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl:
              'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: iconSize,
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          });

          return (
            <Marker key={i} position={[lat, lon]} icon={customIcon}>
              {hoveredIndex === i && (
                <Popup autoOpen={true}>
                  <b>{name}</b><br />
                  {address}<br />
                  {distance}
                </Popup>
              )}
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;