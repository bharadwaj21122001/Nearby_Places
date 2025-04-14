// PlaceList.jsx
import React from 'react';
import './PlaceList.css';

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const PlaceList = ({ results, onHover, onLeave, userCoords }) => {
  const filteredResults = results.filter((res) => {
    const [lon, lat] = res.geometry.coordinates;
    const dist = userCoords ? calculateDistance(userCoords.lat, userCoords.lon, lat, lon) : null;
    return dist !== null && dist <= 5;
  });

  return (
    <div className="place-list-wrapper">
      <h2 className="place-list-title">Nearby Places (within 5 km)</h2>
      {filteredResults.length === 0 ? (
        <p className="no-results">No nearby places found within 5 km.</p>
      ) : (
        <ul className="place-list">
          {filteredResults.map((res, index) => {
            const name = res.properties.name || 'Unnamed Place';
            const address = res.properties.formatted || 'Address not available';
            const [lon, lat] = res.geometry.coordinates;
            const distance = userCoords
              ? `${calculateDistance(userCoords.lat, userCoords.lon, lat, lon).toFixed(2)} km`
              : 'Distance not available';

            const handleClick = () => {
              const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
              window.open(mapsUrl, '_blank');
            };

            return (
              <li
                key={index}
                className="place-card"
                onMouseEnter={() => onHover(index)}
                onMouseLeave={onLeave}
                onClick={handleClick}
              >
                <h4>{name}</h4>
                <p>{address}</p>
                <p><strong>Distance:</strong> {distance}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default PlaceList;