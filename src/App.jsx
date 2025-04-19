import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import AuthForm from './components/AuthForm';
import SearchPanel from './components/SearchPanel';
import MapComponent from './components/MapView';
import PlacesListComponent from './components/PlaceList';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [showRoute, setShowRoute] = useState(false);
  const [routeLayer, setRouteLayer] = useState(null);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handlePlaceChange = (coords) => {
    setMapCenter({ lat: coords[0], lon: coords[1] });
    setShowResults(true);
  };

  const handleBack = () => {
    setShowResults(false);
    setMapCenter(null);
    setResults([]);
    setHoveredIndex(null);
    setShowRoute(false);
    setRouteLayer(null);
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const handlePlaceClick = (lat, lon) => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
    window.open(mapsUrl, '_blank');
  };

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
        <div className="results-view">
          <div className="map-section">
            <MapComponent
              place={mapCenter ? [mapCenter.lat, mapCenter.lon] : null}
              results={results}
              hoveredIndex={hoveredIndex}
              userLocation={mapCenter}
              showRoute={showRoute}
              setShowRoute={setShowRoute}
              routeLayer={routeLayer}
              setRouteLayer={setRouteLayer}
            />
          </div>
          <div className="places-section">
            <PlacesListComponent
              results={results}
              onHover={setHoveredIndex}
              onLeave={() => setHoveredIndex(null)}
              userCoords={mapCenter}
              selectedPlace={mapCenter ? [mapCenter.lat, mapCenter.lon] : null}
              onPlaceClick={handlePlaceClick}
            />
          </div>
          <button className="back-button" onClick={handleBack}>
            🔙 Back
          </button>
        </div>
      )}
    </div>
  );
}

export default App;