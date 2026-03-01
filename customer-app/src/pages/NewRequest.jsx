import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { requestService } from '../services/api';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'sonner';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? (
    <Marker position={position}>
      <Popup>Selected Location</Popup>
    </Marker>
  ) : null;
}

function NewRequest({ user }) {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState(user.name);
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');
  const [position, setPosition] = useState([25.197197, 55.274376]); // Default: Dubai
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        customer_name: customerName,
        location,
        latitude: position[0],
        longitude: position[1],
        note,
      };

      const response = await requestService.createRequest(data);
      if (response.data.success) {
        toast.success('Towing request created successfully!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create request. Please try again.');
      console.error('Error creating request:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12" data-testid="new-request-page">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-4 py-4 mb-8">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">Tareeqk - Towing Services</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">{user.name}</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center"
            data-testid="back-to-dashboard"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">New Towing Request</h1>
            <p className="text-gray-500">Fill in the details and select your location on the map</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  data-testid="customer-name-input"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location Description</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Downtown Dubai"
                  required
                  data-testid="location-input"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Describe your situation..."
                rows="3"
                data-testid="note-input"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Location on Map (Click to set marker)
              </label>
              <div className="h-[300px] w-full rounded-lg overflow-hidden border border-gray-300 z-0">
                <MapContainer
                  center={position}
                  zoom={12}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationPicker position={position} setPosition={setPosition} />
                </MapContainer>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                <p className="text-xs text-gray-500 font-mono">
                  Coordinates: {position[0].toFixed(6)}, {position[1].toFixed(6)}
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
              disabled={loading}
              data-testid="submit-request-btn"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default NewRequest;
