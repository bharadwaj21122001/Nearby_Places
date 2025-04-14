import React from 'react';
import './PlaceList.css';

const PlaceList = ({ results }) => {
  return (
    <div className="place-list-container">
      <h3>Nearby Places</h3>
      {results.length === 0 ? (
        <p>No places found.</p>
      ) : (
        <ul className="place-list">
          {results.map((res, index) => (
            <li key={index} className="place-card">
              <strong>{res.properties.name || 'Unnamed Place'}</strong><br />
              <span>{res.properties.formatted || 'Address not available'}</span><br />
              <span>Distance: {(res.properties.distance / 1000).toFixed(2)} km</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlaceList;