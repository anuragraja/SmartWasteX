import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { Filter, Layers } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Heatmap = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/analytics/heatmap', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Mock data if empty
        const mapData = res.data.data.length ? res.data.data : [
          { _id: 1, area: 'Anand Nagar', location: { lat: 28.6139, lng: 77.2090 }, status: 'Overflow' },
          { _id: 2, area: 'Sector 4', location: { lat: 28.6200, lng: 77.2100 }, status: 'Medium' },
          { _id: 3, area: 'Green Park', location: { lat: 28.6100, lng: 77.2200 }, status: 'Empty' },
          { _id: 4, area: 'Lajpat Nagar', location: { lat: 28.6300, lng: 77.2000 }, status: 'Full' },
        ];
        setData(mapData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Overflow': return '#ef4444'; // red
      case 'Full': return '#f97316'; // orange
      case 'Medium': return '#eab308'; // yellow
      case 'Empty': return '#22c55e'; // green
      default: return '#3b82f6';
    }
  };

  const filteredData = filter === 'All' ? data : data.filter(d => d.status === filter || (filter === 'Critical' && (d.status === 'Overflow' || d.status === 'Full')));

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-900/50 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">Pollution Heatmap</h1>
            <p className="text-sm text-gray-500">Live density of waste reports</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-xl flex items-center">
            <Filter className="w-5 h-5 text-gray-400 mx-2" />
            <select 
              className="bg-transparent border-none focus:ring-0 text-sm font-semibold text-gray-700 dark:text-gray-200 py-1 px-2 outline-none cursor-pointer"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Bins</option>
            <option value="Critical">Critical (Full/Overflow)</option>
            <option value="Overflow">Overflowing Only</option>
            <option value="Empty">Clean / Empty</option>
            </select>
          </div>
        </div>
      </div>

      <GlassCard className="flex-1 overflow-hidden relative p-2 shadow-2xl">
        {!loading && (
          <MapContainer 
            center={[28.6139, 77.2090]} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredData.map(point => (
              <CircleMarker
                key={point._id}
                center={[point.location.lat, point.location.lng]}
                radius={point.status === 'Overflow' ? 20 : 12}
                fillColor={getStatusColor(point.status)}
                color={getStatusColor(point.status)}
                weight={2}
                opacity={0.8}
                fillOpacity={0.5}
              >
                <Popup>
                  <div className="font-semibold">{point.area}</div>
                  <div className={`font-bold mt-1 ${
                    point.status === 'Overflow' ? 'text-red-500' :
                    point.status === 'Full' ? 'text-orange-500' :
                    point.status === 'Medium' ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    Status: {point.status}
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )}
      </GlassCard>

      <GlassCard className="flex flex-wrap justify-center gap-6 p-4">
        <div className="flex items-center"><span className="w-4 h-4 rounded-full bg-red-500 mr-2"></span><span className="text-sm font-medium">Overflow (Critical)</span></div>
        <div className="flex items-center"><span className="w-4 h-4 rounded-full bg-orange-500 mr-2"></span><span className="text-sm font-medium">Full</span></div>
        <div className="flex items-center"><span className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></span><span className="text-sm font-medium">Medium</span></div>
        <div className="flex items-center"><span className="w-4 h-4 rounded-full bg-green-500 mr-2 shadow-sm shadow-green-500/50"></span><span className="text-sm font-bold text-gray-700 dark:text-gray-300">Clean / Empty</span></div>
      </GlassCard>
    </div>
  );
};

export default Heatmap;
