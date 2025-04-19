import React, { useState } from 'react';
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

const PlacesListComponent = ({ 
  results, 
  onHover, 
  onLeave, 
  userCoords, 
  selectedPlace,
  onPlaceClick
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [radius, setRadius] = useState(5);

  const filteredResults = results.filter((res) => {
    const [lon, lat] = res.geometry.coordinates;
    const dist = userCoords ? calculateDistance(userCoords.lat, userCoords.lon, lat, lon) : null;
    const matchesSearch = res.properties.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         res.properties.formatted?.toLowerCase().includes(searchTerm.toLowerCase());
    return dist !== null && dist <= radius && matchesSearch;
  });

  return (
    <div className="place-list-container">
      <div className="place-list-header">
        <div className="header-content">
          <svg className="location-icon" viewBox="0 0 24 24">
            <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z" />
          </svg>
          <div>
            <h3>Nearby Places</h3>
            <p className="selected-location">
              {selectedPlace ? `Near ${selectedPlace.join(', ')}` : 'No location selected'}
            </p>
          </div>
        </div>
        
        <div className="search-filter">
          <div className="search-box">
            <svg className="search-icon" viewBox="0 0 24 24">
              <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
            </svg>
            <input
              type="text"
              placeholder="Search places..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="radius-control">
            <label>Radius: {radius} km</label>
            <input
              type="range"
              min="1"
              max="20"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>
      
      <div className="results-info">
        <span className="results-count">{filteredResults.length} places found</span>
        <span className="distance-info">Within {radius} km radius</span>
      </div>

      {filteredResults.length === 0 ? (
        <div className="empty-state">
          <svg className="empty-icon" viewBox="0 0 24 24">
            <path d="M20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12M22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2A10,10 0 0,1 22,12M15.5,8C16.3,8 17,8.7 17,9.5C17,10.3 16.3,11 15.5,11C14.7,11 14,10.3 14,9.5C14,8.7 14.7,8 15.5,8M10,9.5C10,10.3 9.3,11 8.5,11C7.7,11 7,10.3 7,9.5C7,8.7 7.7,8 8.5,8C9.3,8 10,8.7 10,9.5M12,14C13.75,14 15.29,14.72 16.19,15.81L14.77,17.23C14.32,16.5 13.25,16 12,16C10.75,16 9.68,16.5 9.23,17.23L7.81,15.81C8.71,14.72 10.25,14 12,14Z" />
          </svg>
          <h4>No places found</h4>
          <p>Try adjusting your search or increasing the radius</p>
        </div>
      ) : (
        <ul className="place-list">
          {filteredResults.map((res, index) => {
            const name = res.properties.name || 'Unnamed Place';
            const address = res.properties.formatted || 'Address not available';
            const [lon, lat] = res.geometry.coordinates;
            const distance = userCoords
              ? calculateDistance(userCoords.lat, userCoords.lon, lat, lon).toFixed(2)
              : null;

            return (
              <li
                key={index}
                className={`place-card ${onHover && 'hoverable'}`}
                onMouseEnter={() => onHover && onHover(index)}
                onMouseLeave={onLeave}
                onClick={() => onPlaceClick(lat, lon)}
              >
                <div className="place-number">{index + 1}</div>
                <div className="place-content">
                  <h4>{name}</h4>
                  <p className="place-address">{address}</p>
                  {distance && (
                    <div className="place-distance">
                      <svg className="distance-icon" viewBox="0 0 24 24">
                        <path d="M12,2A8,8 0 0,0 4,10C4,16 12,22 12,22C12,22 20,16 20,10A8,8 0 0,0 12,2M12,12.5A2.5,2.5 0 0,1 9.5,10A2.5,2.5 0 0,1 12,7.5A2.5,2.5 0 0,1 14.5,10A2.5,2.5 0 0,1 12,12.5Z" />
                      </svg>
                      <span>{distance} km</span>
                    </div>
                  )}
                </div>
                <div className="place-actions">
                  <button 
                    className="action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlaceClick(lat, lon);
                    }}
                  >
                    <svg viewBox="0 0 24 24">
                      <path d="M14.06,9L15,9.94L5.92,19H5V18.08L14.06,9M17.66,3C17.41,3 17.15,3.1 16.96,3.29L15.13,5.12L18.88,8.87L20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18.17,3.09 17.92,3 17.66,3M14.06,6.19L3,17.25V21H6.75L17.81,9.94L14.06,6.19Z" />
                    </svg>
                    Directions
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default PlacesListComponent;