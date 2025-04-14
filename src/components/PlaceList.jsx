import React from 'react';
import './PlaceList.css';

const PlaceList = ({ results, onHover, onLeave }) => {
  return (
    <div className="place-list-wrapper">
      <h2 className="place-list-title">Nearby Places</h2>
      {results.length === 0 ? (
        <p className="no-results">No places found.</p>
      ) : (
        <ul className="place-list">
          {results.map((res, index) => (
            <li
              key={index}
              className="place-card"
              onMouseEnter={() => onHover(index)} // 👈 Call onHover
              onMouseLeave={() => onLeave()}      // 👈 Call onLeave
            >
              <h4>{res.properties.name || 'Unnamed Place'}</h4>
              <p>{res.properties.formatted || 'Address not available'}</p>
              <p><strong>Distance:</strong> {(res.properties.distance / 1000).toFixed(2)} km</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlaceList;