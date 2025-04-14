import React, { useState } from 'react';
import SearchPanel from './components/SearchPanel';
import MapView from './components/MapView';
import PlaceList from './components/PlaceList';
import './App.css';

function App() {
  const [mapCenter, setMapCenter] = useState(null);
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null); // 👈 NEW

  const handlePlaceChange = (coords) => {
    setMapCenter(coords);
    setShowResults(true);
  };

  const handleBack = () => {
    setShowResults(false);
    setResults([]);
    setMapCenter(null);
    setHoveredIndex(null); // 👈 RESET ON BACK
  };

  return (
    <div className="app-container">
      {!showResults ? (
        <div className="search-container-centered">
          <SearchPanel
            onPlaceChange={handlePlaceChange}
            setResults={setResults}
          />
        </div>
      ) : (
        <>
          <div className="map-and-list">
            <MapView
              place={mapCenter}
              results={results}
              hoveredIndex={hoveredIndex} // 👈 Pass it to MapView
            />
            <div className="places-wrapper">
              <PlaceList
                results={results}
                onHover={(index) => setHoveredIndex(index)} // 👈 On hover
                onLeave={() => setHoveredIndex(null)}       // 👈 On leave
              />
            </div>
          </div>
          <button className="back-button" onClick={handleBack}>Back</button>
        </>
      )}
    </div>
  );
}

export default App;