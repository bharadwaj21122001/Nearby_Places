// src/components/SearchPanel.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import './SearchPanel.css';

// ─── Your Geoapify API key ─────────────────────────────────────────────────────
const GEOAPIFY_API_KEY = '4b28120fb4e44015a35cdfa05fa0432d';

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
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    const q = query(collection(db, 'searchHistory'), where('uid', '==', user.uid));
    const snap = await getDocs(q);
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setHistory(data.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis()));
  };

  useEffect(() => { if (user) fetchHistory(); }, [user]);

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
    if (!city || !area || selectedCategory === categories[0]) {
      alert('Please enter City, Area & select a Category');
      return;
    }
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
      if (err.response?.status === 401) {
        alert('Unauthorized: check your Geoapify API key');
      } else {
        alert('Search failed. See console for details.');
      }
    }
  };

  return (
    <div className="search-wrapper">
      <div className="glass-container">
        <h1>🌍 Find Places Around You</h1>
        <div className="input-group">
          <input placeholder="City" value={city} onChange={e => setCity(e.target.value)} />
          <input placeholder="Area" value={area} onChange={e => setArea(e.target.value)} />
        </div>
        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={handleSearch}>🔍 Search</button>
        <div className="history">
          <h3>Search History</h3>
          <ul>
            {history.map(h => (
              <li key={h.id}>{h.area}, {h.city} — {h.category}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}