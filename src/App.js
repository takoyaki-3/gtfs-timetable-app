import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import 'leaflet/dist/leaflet.css';
import './App.css';
import Butter from 'butter-lib/dist.js'
await Butter.init()

function App() {
  const [panelHeight, setPanelHeight] = useState(30); // initial height of the panel
  const [{ y }, set] = useSpring(() => ({ y: 0 })); // state for dragging
  const [data, setData] = useState(null);
  const [aroundStops, setAroundStops] = useState(null);

  useEffect(() => {
    const fetchDataAsync = async () => {
      const aroundStops = await Butter.getStopsWithinRadius(35.6895, 139.6917, 1000)
      setAroundStops(aroundStops);
      setData('fetched')
    };

    fetchDataAsync();
  }, []);

  const bind = useDrag(({ down, movement: [_, my], last }) => {
    if (down) {
      // dragging the panel
      set({ y: my, immediate: true });
    } else if (last) {
      // dragging ended
      const newHeight = Math.max(10, Math.min(90, panelHeight - my / 10));
      setPanelHeight(newHeight);
      set({ y: 0, immediate: true });
    }
  }, { axis: 'y' });

  const panelStyle = {
    height: y.to(v => `${Math.max(10, Math.min(90, panelHeight - v / 10))}vh`),
    touchAction: 'none' // stop browser from scrolling
  };

  return (
    <div className="App">
      <div className="map-container">
        <MapContainer center={[35.6895, 139.6917]} zoom={13} style={{ height: '100vh', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&amp;copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={[35.6895, 139.6917]}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker>
        </MapContainer>
      </div>
      <animated.div {...bind()} className="info-panel" style={panelStyle}>
        <h2>Information Panel</h2>
        <p>{data ? data : "Loading..."}</p>
      </animated.div>
    </div>
  );
}

export default App;
