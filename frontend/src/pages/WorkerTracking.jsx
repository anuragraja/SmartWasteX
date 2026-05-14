import api from "@/config/api";
import { useState, useEffect } from 'react';
import { Search, MapPin, CheckCircle, Clock, X, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const WorkerTracking = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedWorkerHistory, setSelectedWorkerHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get(`/api/worker`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWorkers(res.data.data.length ? res.data.data : [
          { _id: '1', worker: { name: 'Rahul Kumar', email: 'rahul@example.com' }, areasCovered: ['Anand Nagar', 'Sector 4'], uploadsCount: 45, performance: 92, ranking: 1, lastActive: new Date() },
          { _id: '2', worker: { name: 'Suresh Singh', email: 'suresh@example.com' }, areasCovered: ['Green Park'], uploadsCount: 28, performance: 78, ranking: 3, lastActive: new Date(Date.now() - 3600000) },
          { _id: '3', worker: { name: 'Amit Patel', email: 'amit@example.com' }, areasCovered: ['Lajpat Nagar', 'Kalkaji'], uploadsCount: 60, performance: 98, ranking: 2, lastActive: new Date() }
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
  }, []);

  const handleMessage = async (workerId, workerName) => {
    const message = window.prompt(`Enter message for ${workerName}:`);
    if (!message) return;

    try {
      const token = localStorage.getItem('token');
      await api.post(`/api/notifications`, {
        userId: workerId,
        title: 'Message from Admin',
        message: message,
        type: 'Alert'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Message sent successfully!');
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const handleViewHistory = async (workerId, workerName) => {
    setHistoryModalOpen(true);
    setHistoryLoading(true);
    setSelectedWorkerHistory({ name: workerName, uploads: [] });
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/api/worker/history/${workerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedWorkerHistory({ name: workerName, uploads: res.data.data });
    } catch (err) {
      toast.error('Failed to load history');
      setHistoryModalOpen(false);
    } finally {
      setHistoryLoading(false);
    }
  };

  const filteredWorkers = workers.filter(w => w.worker?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Worker Tracking</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor performance and active routes of workers.</p>
        </div>
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search workers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkers.map((workerData) => (
          <div
            key={workerData._id}
            className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#10B981]/10 text-[#10B981] rounded-lg flex items-center justify-center font-bold text-lg">
                  {workerData.worker?.name?.charAt(0) || 'W'}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{workerData.worker?.name}</h3>
                  <p className="text-[10px] text-gray-500">{workerData.worker?.email}</p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1.5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  workerData.performance >= 90 ? 'bg-green-50 text-green-700 border-green-200' : 
                  workerData.performance >= 75 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {workerData.performance}% SCORE
                </span>
                {workerData.ranking && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    RANK #{workerData.ranking}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2 mt-auto">
              <div className="flex items-center text-xs text-gray-600">
                <CheckCircle className="w-3.5 h-3.5 mr-2 text-gray-400" />
                <span>Tasks Completed: <span className="font-medium text-gray-900">{workerData.uploadsCount}</span></span>
              </div>
              <div className="flex items-start text-xs text-gray-600">
                <MapPin className="w-3.5 h-3.5 mr-2 text-gray-400 mt-0.5" />
                <span>Areas: <span className="font-medium">{workerData.areasCovered.join(', ') || 'None'}</span></span>
              </div>
              <div className="flex items-center text-xs text-gray-600">
                <Clock className="w-3.5 h-3.5 mr-2 text-gray-400" />
                <span>Active: <span className="font-medium">
                  {new Date(workerData.lastActive).toLocaleDateString()} {new Date(workerData.lastActive).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span></span>
              </div>
            </div>

            <div className="mt-5 flex space-x-2 pt-4 border-t border-gray-100">
              <button 
                onClick={() => handleViewHistory(workerData._id, workerData.worker.name)}
                className="flex-1 bg-white border border-gray-300 text-gray-700 py-1.5 rounded-md text-xs font-medium hover:bg-gray-50 transition-colors"
              >
                View History
              </button>
              <button 
                onClick={() => handleMessage(workerData._id, workerData.worker.name)}
                className="flex-1 bg-[#10B981] text-white py-1.5 rounded-md text-xs font-medium hover:bg-[#059669] transition-colors"
              >
                Message
              </button>
            </div>
          </div>
        ))}
      </div>

      {historyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] flex flex-col shadow-xl relative border border-gray-200">
            <button 
              onClick={() => setHistoryModalOpen(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-white border border-gray-200 rounded-md flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-bold text-gray-900 mb-4 pr-10 border-b border-gray-100 pb-3">
              Upload History <span className="font-normal text-gray-500 ml-1">/ {selectedWorkerHistory?.name}</span>
            </h2>

            <div className="flex-1 overflow-y-auto pr-2">
              {historyLoading ? (
                <div className="flex justify-center p-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#10B981]"></div>
                </div>
              ) : selectedWorkerHistory?.uploads?.length === 0 ? (
                <div className="text-center p-8 text-sm text-gray-500">
                  No uploads found for this worker.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedWorkerHistory?.uploads?.map((upload) => (
                    <div key={upload._id} className="flex gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50 items-center">
                      {upload.image ? (
                        <img src={upload.image} alt="Waste" className="w-16 h-16 object-cover rounded-md border border-gray-200" />
                      ) : (
                        <div className="w-16 h-16 bg-white border border-gray-200 rounded-md flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1.5">
                          <h4 className="font-bold text-sm text-gray-900 flex items-center">
                            <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" /> {upload.area}
                          </h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            upload.status === 'Empty' ? 'bg-green-50 text-green-700 border-green-200' :
                            upload.status === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {upload.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-gray-500 font-medium">
                          <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {new Date(upload.createdAt).toLocaleDateString()}</span>
                          {upload.verified && <span className="text-[#10B981] flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> VERIFIED</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerTracking;
