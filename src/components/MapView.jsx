import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default icon path
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Change map view dynamically
const ChangeMapView = ({ coords }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(coords, 14);
  }, [coords, map]);

  return null;
};

const MapView = ({ place, results }) => {
  if (!place) return null;

  return (
    <MapContainer center={place} zoom={14} style={{ height: '100vh', width: '70%' }}>
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

        return (
          <Marker key={i} position={[lat, lon]}>
            <Popup>
              <b>{name}</b><br />
              {address}<br />
              {distance}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default MapView;