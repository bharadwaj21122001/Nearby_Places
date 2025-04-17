// src/App.jsx
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import AuthForm from './components/AuthForm';
import SearchPanel from './components/SearchPanel';
import MapView from './components/MapView';
import PlaceList from './components/PlaceList';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // Update map center and show results panel
  const handlePlaceChange = (coords) => {
    setMapCenter({ lat: coords[0], lon: coords[1] });
    setShowResults(true);
  };

  // Back to search panel
  const handleBack = () => {
    setShowResults(false);
    setMapCenter(null);
    setResults([]);
    setHoveredIndex(null);
  };

  // Logout function
  const handleLogout = () => {
    signOut(auth);
  };

  // If user not logged in
  if (!user) {
    return <AuthForm onLogin={setUser} />;
  }

  return (
    <div className="app-container">
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>

      {!showResults ? (
        <SearchPanel
          user={user}
          onPlaceChange={handlePlaceChange}
          setResults={setResults}
        />
      ) : (
        <>
          <div className="map-and-list">
            <MapView
              place={mapCenter}
              results={results}
              hoveredIndex={hoveredIndex}
            />
            <PlaceList
              results={results}
              onHover={(idx) => setHoveredIndex(idx)}
              onLeave={() => setHoveredIndex(null)}
              userCoords={mapCenter}
            />
          </div>
          <button className="back-button" onClick={handleBack}>
            🔙 Back
          </button>
        </>
      )}
    </div>
  );
}

export default App;