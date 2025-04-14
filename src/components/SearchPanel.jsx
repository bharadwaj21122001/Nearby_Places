import React, { useState } from 'react';
import axios from 'axios';
import './SearchPanel.css';

const categories = [
  'Select Category',
  'Restaurant',
  'Medical',
  'Hospital',
  'Fuel',
  'School',
  'College',
  'Grocery Store/ Super Market'
];

const categoryToGeoapify = {
  Restaurant: 'catering.restaurant',
  Medical: 'healthcare.pharmacy',
  Hospital: 'healthcare.hospital',
  Fuel: 'service.vehicle',
  School: 'education.school',
  College: 'education.college',
  'Grocery Store/ Super Market': 'commercial.supermarket'
};

// Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Radius of Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const SearchPanel = ({ onPlaceChange, setResults }) => {
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  const fetchCoordinates = async (location) => {
    const geoUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
      location
    )}&apiKey=4b28120fb4e44015a35cdfa05fa0432d`;

    const response = await axios.get(geoUrl);
    const { features } = response.data;

    if (features.length > 0) {
      const coords = [
        features[0].geometry.coordinates[1],
        features[0].geometry.coordinates[0],
      ];
      return coords;
    } else {
      throw new Error('Location not found');
    }
  };

  const fetchNearbyPlaces = async (lat, lon, category) => {
    const catKey = categoryToGeoapify[category];
    const placeUrl = `https://api.geoapify.com/v2/places?categories=${catKey}&filter=circle:${lon},${lat},5000&limit=50&apiKey=4b28120fb4e44015a35cdfa05fa0432d`;

    const response = await axios.get(placeUrl);
    return response.data.features;
  };

  const handleSearch = async () => {
    if (!city || !area || selectedCategory === 'Select Category') {
      alert('Please enter City, Area, and select a valid Category.');
      return;
    }

    const fullLocation = `${area}, ${city}`;

    try {
      const coords = await fetchCoordinates(fullLocation);
      onPlaceChange(coords); // updates mapCenter in App.jsx

      const places = await fetchNearbyPlaces(coords[0], coords[1], selectedCategory);

      // Filter results to include only places within 5 km using Haversine
      const filteredPlaces = places.filter((place) => {
        const [lon, lat] = place.geometry.coordinates;
        const distance = calculateDistance(coords[0], coords[1], lat, lon);
        return distance <= 5;
      });

      setResults(filteredPlaces);
    } catch (error) {
      console.error('Search error:', error);
      alert('Could not find location or places. Please check your input.');
    }
  };

  return (
    <div className="search-wrapper">
      <div className="glass-container">
        <h1>🌍 Find Places Around You</h1>
        <p>Enter your City and Area to discover what's nearby!</p>

        <div className="input-group">
          <input
            className="input-field"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <input
            className="input-field"
            placeholder="Area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
          />
        </div>

        <select
          className="select-field"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <button className="search-button" onClick={handleSearch}>
          🔍 Search
        </button>
      </div>
    </div>
  );
};

export default SearchPanel;