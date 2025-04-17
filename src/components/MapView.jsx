import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './MapView.css';

// Custom Icon Setup
delete L.Icon.Default.prototype._getIconUrl;
const customIcon = (color = 'green', size = [30, 50]) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: size,
  iconAnchor: [size[0]/2, size[1]],
  popupAnchor: [0, -size[1]],
  shadowSize: [size[0], size[1]]
});

// Dynamic view update
const ChangeMapView = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, 14);
  }, [coords, map]);
  return null;
};

// Route overlay with hook safety
const RouteLayer = ({ showRoute, routeLayer }) => {
  const map = useMap();

  useEffect(() => {
    if (showRoute && routeLayer) {
      routeLayer.addTo(map);
    } else {
      routeLayer?.remove();
    }

    return () => {
      routeLayer?.remove();
    };
  }, [showRoute, routeLayer, map]);

  return null;
};

const MapControls = () => {
  const map = useMap();
  const [isSatellite, setIsSatellite] = useState(false);

  const toggleSatellite = () => {
    setIsSatellite(!isSatellite);
  };

  return (
    <div className="map-controls">
      <button 
        className={`control-btn ${isSatellite ? 'active' : ''}`}
        onClick={toggleSatellite}
        title="Toggle Satellite View"
      >
        <svg viewBox="0 0 24 24">
          <path d="M12,2L4,5V11.09C4,16.14 7.41,20.85 12,22C16.59,20.85 20,16.14 20,11.09V5L12,2M12,4.15L18,6.69V11.09C18,14.94 15.58,18.36 12,19.92C8.42,18.36 6,14.94 6,11.09V6.69L12,4.15M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10A2,2 0 0,1 12,12C11.46,12 10.95,11.78 10.59,11.41L12,10L10.59,8.59C11.24,7.94 12,7.94 12.66,8.59L14.24,10C14.24,10 14.24,10 14.24,10A4,4 0 0,0 12,6Z" />
        </svg>
      </button>
      <button 
        className="control-btn"
        onClick={() => map.locate()}
        title="Locate Me"
      >
        <svg viewBox="0 0 24 24">
          <path d="M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M3.05,13H1V11H3.05C3.5,6.83 6.83,3.5 11,3.05V1H13V3.05C17.17,3.5 20.5,6.83 20.95,11H23V13H20.95C20.5,17.17 17.17,20.5 13,20.95V23H11V20.95C6.83,20.5 3.5,17.17 3.05,13M12,5A7,7 0 0,0 5,12A7,7 0 0,0 12,19A7,7 0 0,0 19,12A7,7 0 0,0 12,5Z" />
        </svg>
      </button>
      <button 
        className="control-btn"
        onClick={() => map.setZoom(map.getZoom() + 1)}
        title="Zoom In"
      >
        <svg viewBox="0 0 24 24">
          <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
        </svg>
      </button>
      <button 
        className="control-btn"
        onClick={() => map.setZoom(map.getZoom() - 1)}
        title="Zoom Out"
      >
        <svg viewBox="0 0 24 24">
          <path d="M19,13H5V11H19V13Z" />
        </svg>
      </button>
      {isSatellite ? (
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri"
        />
      ) : (
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
        />
      )}
    </div>
  );
};

const MapView = ({ place, results, hoveredIndex, userLocation }) => {
  const [showRoute, setShowRoute] = useState(false);
  const [routeLayer, setRouteLayer] = useState(null);

  useEffect(() => {
    if (showRoute && place && userLocation) {
      const route = L.polyline([
        [userLocation.lat, userLocation.lon],
        [place[0], place[1]]
      ], {color: '#3498db', weight: 4, dashArray: '10, 10'});

      setRouteLayer(route);
    } else {
      if (routeLayer) {
        routeLayer.remove();
        setRouteLayer(null);
      }
    }
  }, [showRoute, place, userLocation]);

  if (!place) return (
    <div className="map-placeholder">
      <div className="placeholder-content">
        <svg className="compass-icon" viewBox="0 0 24 24">
          <path d="M12,2L15.09,8.26L22,9.27L17,14.14L18.18,21.02L12,17.77L5.82,21.02L7,14.14L2,9.27L8.91,8.26L12,2Z" />
        </svg>
        <h3>Select a location to begin exploring</h3>
        <p>Search for places or click on the map to get started</p>
      </div>
    </div>
  );

  return (
    <div className="map-wrapper">
      <MapContainer 
        center={place} 
        zoom={14} 
        className="styled-map"
        zoomControl={false}
      >
        <ChangeMapView coords={place} />
        <MapControls />
        <ZoomControl position="bottomright" />
        <RouteLayer showRoute={showRoute} routeLayer={routeLayer} />

        {userLocation && (
          <Marker 
            position={[userLocation.lat, userLocation.lon]} 
            icon={customIcon('blue')}
          >
            <Popup className="custom-popup">
              <div className="popup-content">
                <span className="popup-pin"></span>
                <h4>Your Location</h4>
              </div>
            </Popup>
          </Marker>
        )}

        <Marker position={place} icon={customIcon('red')}>
          <Popup className="custom-popup">
            <div className="popup-content">
              <span className="popup-pin"></span>
              <h4>Selected Location</h4>
              {userLocation && (
                <button 
                  className="route-btn"
                  onClick={() => setShowRoute(!showRoute)}
                >
                  {showRoute ? 'Hide Route' : 'Show Route'}
                </button>
              )}
            </div>
          </Popup>
        </Marker>

        {results?.map((res, i) => {
          const name = res.properties.name || 'Unnamed Place';
          const address = res.properties.formatted || 'Address not available';
          const distance = res.properties.distance ? `${res.properties.distance} m` : '';
          const [lon, lat] = res.geometry.coordinates;

          return (
            <Marker 
              key={i} 
              position={[lat, lon]} 
              icon={customIcon('orange', hoveredIndex === i ? [45, 75] : [30, 50])}
            >
              {hoveredIndex === i && (
                <Popup className="custom-popup" autoOpen={true}>
                  <div className="popup-content">
                    <span className="popup-pin"></span>
                    <h4>{name}</h4>
                    <p className="popup-address">{address}</p>
                    {distance && <p className="popup-distance">{distance}</p>}
                    <button 
                      className="directions-btn"
                      onClick={() => {
                        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
                        window.open(mapsUrl, '_blank');
                      }}
                    >
                      Get Directions
                    </button>
                  </div>
                </Popup>
              )}
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;