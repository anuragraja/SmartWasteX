import api from "@/config/api";
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Filter, MapPin } from 'lucide-react';

const Heatmap = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get(`/api/analytics/heatmap`, {
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
      case 'Empty': return '#10b981'; // green
      default: return '#3b82f6';
    }
  };

  const filteredData = filter === 'All' ? data : data.filter(d => d.status === filter || (filter === 'Critical' && (d.status === 'Overflow' || d.status === 'Full')));

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pollution Heatmap</h1>
          <p className="text-sm text-gray-500 mt-1">Live density of waste reports across regions</p>
        </div>
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="bg-white border border-gray-300 rounded-md flex items-center px-2 py-1.5 shadow-sm">
            <Filter className="w-4 h-4 text-gray-400 mr-2" />
            <select 
              className="bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700 outline-none cursor-pointer"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Regions</option>
              <option value="Critical">Critical (Full/Overflow)</option>
              <option value="Overflow">Overflowing Only</option>
              <option value="Empty">Clean / Empty</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative border border-gray-200 rounded-xl bg-white shadow-sm z-0">
        {!loading && (
          <MapContainer 
            center={[28.6139, 77.2090]} 
            zoom={13} 
            style={{ height: '100%', width: '100%', zIndex: 0 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            {filteredData.map(point => (
              <CircleMarker
                key={point._id}
                center={[point.location.lat, point.location.lng]}
                radius={point.status === 'Overflow' ? 16 : 10}
                fillColor={getStatusColor(point.status)}
                color={getStatusColor(point.status)}
                weight={2}
                opacity={0.8}
                fillOpacity={0.4}
              >
                <Popup>
                  <div className="p-1">
                    <div className="font-bold text-sm text-gray-900 flex items-center mb-1">
                      <MapPin className="w-3 h-3 mr-1 text-gray-400" /> {point.area}
                    </div>
                    <div className={`text-xs font-semibold px-2 py-1 rounded inline-block ${
                      point.status === 'Overflow' ? 'bg-red-50 text-red-700 border border-red-200' :
                      point.status === 'Full' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                      point.status === 'Medium' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : 'bg-green-50 text-green-700 border border-green-200'
                    }`}>
                      {point.status.toUpperCase()}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl flex flex-wrap justify-center gap-6 p-4 shadow-sm">
        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-2 border border-red-600"></span><span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Overflow (Critical)</span></div>
        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-orange-500 mr-2 border border-orange-600"></span><span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Full</span></div>
        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-yellow-400 mr-2 border border-yellow-500"></span><span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Medium</span></div>
        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-[#10B981] mr-2 border border-[#059669]"></span><span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Clean / Empty</span></div>
      </div>
    </div>
  );
};

export default Heatmap;
