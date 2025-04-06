import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

const fakeData = {
  "Bob McBobbison": { age: 25, gender: "M", situation: "unemployed", coordinates: [] },
  "Ur Mom": { age: 56, gender: "F", situation: "homeless", coordinates: [] },
  "Jesse Richardson": { age: 32, gender: "N/A", situation: "bipolar disorder", coordinates: [] },
  "Susan": { age: 45, gender: "F", situation: "single mother", coordinates: [] },
  "Michael Horston": { age: 65, gender: "M", situation: "substance abuse", coordinates: [] },
};

const defaultPosition = [32.2226, -110.9747];

function MapClickHandler({ onMapClick, active }) {
  useMapEvents({
    click(e) {
      if (active) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
}

export default function Mapping() {
  const [clients, setClients] = useState(() =>
    JSON.parse(localStorage.getItem("clients")) || fakeData
  );
  const [formData, setFormData] = useState({ name: "", age: "", gender: "", situation: "" });
  const [searchName, setSearchName] = useState("");
  const [placedMarkerMode, setPlacedMarkerMode] = useState(false);
  const [activeMarkers, setActiveMarkers] = useState([]);
  const [activePolylines, setActivePolylines] = useState([]);

  useEffect(() => {
    localStorage.setItem("clients", JSON.stringify(clients));
  }, [clients]);

  const handleMapClick = (latlng) => {
    if (!placedMarkerMode) return;

    const time = new Date().toISOString();
    const updatedClients = { ...clients };

    if (!updatedClients[formData.name]) {
      updatedClients[formData.name] = {
        age: formData.age,
        gender: formData.gender,
        situation: formData.situation,
        coordinates: [],
      };
    }

    updatedClients[formData.name].coordinates.push({ ...latlng, timestamp: time });
    setClients(updatedClients);

    setFormData({ name: "", age: "", gender: "", situation: "" });
    setPlacedMarkerMode(false);
  };

  const loadClient = (name) => {
    const client = clients[name];
    if (!client) return alert("Client not found.");

    setFormData({
      name,
      age: client.age,
      gender: client.gender,
      situation: client.situation,
    });

    setActiveMarkers([
      ...client.coordinates.map((c) => ({
        ...c,
        name,
        age: client.age,
        gender: client.gender,
        situation: client.situation,
      })),
    ]);

    if (client.coordinates.length > 1) {
      setActivePolylines([client.coordinates.map((c) => [c.lat, c.lng])]);
    } else {
      setActivePolylines([]);
    }
  };

  const clearMarkers = () => {
    setActiveMarkers([]);
    setActivePolylines([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return alert("Please enter a client name.");
    setPlacedMarkerMode(true);
    alert("Click on the map to place the marker.");
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl text-gray-800">
      <h2 className="text-2xl font-bold mb-4 text-center">React Leaflet Mapping Interface</h2>

      <div className="mb-6">
        <label className="block mb-2 text-blue-800 font-medium">Search for an Individual</label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
            placeholder="Enter Name"
          />
          <button
            onClick={() => loadClient(searchName.trim())}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Search
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
          placeholder="Client Name"
          required
        />
        <input
          type="number"
          value={formData.age}
          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
          placeholder="Age"
          required
        />
        <input
          type="text"
          value={formData.gender}
          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
          placeholder="Gender"
          required
        />
        <input
          type="text"
          value={formData.situation}
          onChange={(e) => setFormData({ ...formData, situation: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
          placeholder="Client's Situation"
          required
        />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
          Place Marker
        </button>
      </form>

      <MapContainer
        center={defaultPosition}
        zoom={13}
        scrollWheelZoom
        className="h-[500px] w-full rounded-md shadow"
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onMapClick={handleMapClick} active={placedMarkerMode} />
        {activeMarkers.map((m, idx) => (
          <Marker position={[m.lat, m.lng]} key={idx}>
            <Popup>
              <strong>{m.name}</strong>
              <br />
              {m.age}, {m.gender}
              <br />
              {m.situation}
              <br />
              {new Date(m.timestamp).toLocaleString()}
            </Popup>
          </Marker>
        ))}
        {activePolylines.map((line, idx) => (
          <Polyline key={idx} positions={line} color="blue" />
        ))}
      </MapContainer>

      <div className="flex justify-center mt-6">
        <button
          onClick={clearMarkers}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          Clear Markers
        </button>
      </div>
    </div>
  );
}
