import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { ReactComponent as SearchIcon } from '../assets/search.svg';
import { ReactComponent as LocationIcon } from '../assets/location.svg';
import { ReactComponent as ClockIcon } from '../assets/clock.svg';
import { ReactComponent as CategoryIcon } from '../assets/category.svg';
import './SearchPanel.css';

const GEOAPIFY_API_KEY = '4b28120fb4e44015a35cdfa05fa0432d';

const categories = [
  { value: '', label: 'Select Category', icon: '📋' },
  { value: 'Restaurant', label: 'Restaurant', icon: '🍽️' },
  { value: 'Medical', label: 'Medical', icon: '💊' },
  { value: 'Hospital', label: 'Hospital', icon: '🏥' },
  { value: 'Fuel', label: 'Fuel Station', icon: '⛽' },
  { value: 'School', label: 'School', icon: '🏫' },
  { value: 'College', label: 'College', icon: '🎓' },
  { value: 'Grocery', label: 'Grocery Store', icon: '🛒' }
];

const categoryToGeoapify = {
  Restaurant: 'catering.restaurant',
  Medical: 'healthcare.pharmacy',
  Hospital: 'healthcare.hospital',
  Fuel: 'service.vehicle.fuel',
  School: 'education.school',
  College: 'education.college',
  Grocery: 'commercial.supermarket'
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = v => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function SearchPanel({ user, onPlaceChange, setResults }) {
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    const q = query(collection(db, 'searchHistory'), where('uid', '==', user.uid));
    const snap = await getDocs(q);
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setHistory(data.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis()));
  };

  useEffect(() => { 
    if (user) fetchHistory(); 
  }, [user]);

  const fetchCoordinates = async location => {
    const res = await axios.get('https://api.geoapify.com/v1/geocode/search', {
      params: { text: location, apiKey: GEOAPIFY_API_KEY }
    });
    if (!res.data.features.length) throw new Error('Location not found');
    const [lon, lat] = res.data.features[0].geometry.coordinates;
    return [lat, lon];
  };

  const fetchNearbyPlaces = async (lat, lon, category) => {
    const catKey = categoryToGeoapify[category];
    const res = await axios.get('https://api.geoapify.com/v2/places', {
      params: {
        categories: catKey,
        filter: `circle:${lon},${lat},5000`,
        limit: 50,
        apiKey: GEOAPIFY_API_KEY
      }
    });
    return res.data.features;
  };

  const handleSearch = async () => {
    if (!city || !area || !selectedCategory) {
      setError('Please enter City, Area & select a Category');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    const location = `${area}, ${city}`;
    try {
      const coords = await fetchCoordinates(location);
      const places = await fetchNearbyPlaces(coords[0], coords[1], selectedCategory);
      const filtered = places.filter(p => {
        const [lon, lat] = p.geometry.coordinates;
        return calculateDistance(coords[0], coords[1], lat, lon) <= 5;
      });
      
      onPlaceChange(coords);
      setResults(filtered);
      
      await addDoc(collection(db, 'searchHistory'), {
        uid: user.uid,
        city,
        area,
        category: selectedCategory,
        timestamp: new Date()
      });
      fetchHistory();
    } catch (err) {
      console.error(err);
      setError(err.response?.status === 401 
        ? 'API Error: Check your Geoapify key' 
        : 'Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistoryClick = async (historyItem) => {
    setCity(historyItem.city);
    setArea(historyItem.area);
    setSelectedCategory(historyItem.category);
    
    try {
      setIsLoading(true);
      const location = `${historyItem.area}, ${historyItem.city}`;
      const coords = await fetchCoordinates(location);
      const places = await fetchNearbyPlaces(coords[0], coords[1], historyItem.category);
      const filtered = places.filter(p => {
        const [lon, lat] = p.geometry.coordinates;
        return calculateDistance(coords[0], coords[1], lat, lon) <= 5;
      });
      
      onPlaceChange(coords);
      setResults(filtered);
      
      await addDoc(collection(db, 'searchHistory'), {
        uid: user.uid,
        city: historyItem.city,
        area: historyItem.area,
        category: historyItem.category,
        timestamp: new Date()
      });
      fetchHistory();
    } catch (err) {
      console.error(err);
      setError('Failed to load previous search. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="search-panel">
      <div className="search-card">
        <div className="search-header">
          <h1>Discover Places Around You</h1>
          <p>Find nearby locations based on your search criteria</p>
        </div>

        <div className="search-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="input-group">
            <LocationIcon className="input-icon" />
            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={e => setCity(e.target.value)}
              className="input-field"
            />
          </div>
          
          <div className="input-group">
            <LocationIcon className="input-icon" />
            <input
              type="text"
              placeholder="Area/Neighborhood"
              value={area}
              onChange={e => setArea(e.target.value)}
              className="input-field"
            />
          </div>
          
          <div className="input-group">
            <CategoryIcon className="input-icon" />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="select-field"
            >
              {categories.map(c => (
                <option key={c.value} value={c.value}>
                  {c.icon} {c.label}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={handleSearch}
            className="search-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="spinner"></div>
            ) : (
              <>
                <SearchIcon className="search-icon" />
                <span>Search Places</span>
              </>
            )}
          </button>
        </div>

        <div className="search-history">
          <div className="history-header">
            <ClockIcon className="history-icon" />
            <h3>Recent Searches</h3>
          </div>
          
          {history.length === 0 ? (
            <p className="no-history">No search history yet</p>
          ) : (
            <ul className="history-list">
              {history.slice(0, 5).map(h => (
                <li 
                  key={h.id} 
                  onClick={() => handleHistoryClick(h)}
                  className={`history-item ${isLoading ? 'loading' : ''}`}
                >
                  <span className="history-category">
                    {categories.find(c => c.value === h.category)?.icon || '📌'}
                  </span>
                  <div className="history-details">
                    <span className="history-location">{h.area}, {h.city}</span>
                    <span className="history-category-label">
                      {categories.find(c => c.value === h.category)?.label || h.category}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}