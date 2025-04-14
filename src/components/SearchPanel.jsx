import React, { useState } from 'react';
import axios from 'axios';
import './SearchPanel.css';

const categories = [
  'restaurant',
  'medical',
  'hospital',
  'petrol_station',
  'school',
  'college'
];

const categoryToGeoapify = {
  restaurant: 'catering.restaurant',
  medical: 'healthcare.pharmacy',
  hospital: 'healthcare.hospital',
  petrol_station: 'service.vehicle',
  school: 'education.school',
  college: 'education.college'
};

const SearchPanel = ({ onPlaceChange, setResults }) => {
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
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
    const placeUrl = `https://api.geoapify.com/v2/places?categories=${catKey}&filter=circle:${lon},${lat},5000&limit=20&apiKey=4b28120fb4e44015a35cdfa05fa0432d`;

    const response = await axios.get(placeUrl);
    return response.data.features;
  };

  const handleSearch = async () => {
    if (!country || !state || !city || !area) {
      alert('Please fill all fields: Country, State, City, Area');
      return;
    }

    const fullLocation = `${area}, ${city}, ${state}, ${country}`;

    try {
      const coords = await fetchCoordinates(fullLocation);
      onPlaceChange(coords);
      const places = await fetchNearbyPlaces(coords[0], coords[1], selectedCategory);
      setResults(places);
    } catch (error) {
      console.error('Search error:', error);
      alert('Could not find location or places. Please check your input.');
    }
  };

  return (
    <div className="search-panel">
      <h3 className="search-title">Search Nearby Places</h3>

      <div className="input-group">
        <input
          className="input-field"
          placeholder="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
        <input
          className="input-field"
          placeholder="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
        />
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

      <div className="select-group">
        <label className="select-label">Category:</label>
        <select
          className="select-field"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <button className="search-button" onClick={handleSearch}>Search</button>
    </div>
  );
};

export default SearchPanel;