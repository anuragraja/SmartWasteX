import api from "@/config/api";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Activity, CheckCircle, Clock, X, MessageSquare, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Worker Tracking</h1>
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search workers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkers.map((workerData, index) => (
          <GlassCard
            key={workerData._id}
            delay={index * 0.1}
            className="flex flex-col h-full"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold text-xl">
                  {workerData.worker?.name?.charAt(0) || 'W'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{workerData.worker?.name}</h3>
                  <p className="text-xs text-gray-500">{workerData.worker?.email}</p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  workerData.performance >= 90 ? 'bg-green-100 text-green-700' : 
                  workerData.performance >= 75 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                }`}>
                  {workerData.performance}% Score
                </span>
                {workerData.ranking && (
                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                    Rank #{workerData.ranking}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3 mt-auto">
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 mr-2 text-blue-500" />
                <span>Tasks Completed: <span className="font-semibold text-gray-900">{workerData.uploadsCount}</span></span>
              </div>
              <div className="flex items-start text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2 text-orange-500 mt-0.5" />
                <span>Areas: <span className="font-medium">{workerData.areasCovered.join(', ') || 'None'}</span></span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                <span>Active: <span className="font-medium">
                  {new Date(workerData.lastActive).toLocaleDateString()} {new Date(workerData.lastActive).toLocaleTimeString()}
                </span></span>
              </div>
            </div>

            <div className="mt-8 flex space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <AnimatedButton variant="secondary" className="flex-1 py-2 text-sm" onClick={() => handleViewHistory(workerData._id, workerData.worker.name)}>
                View History
              </AnimatedButton>
              <AnimatedButton variant="primary" className="flex-1 py-2 text-sm" onClick={() => handleMessage(workerData._id, workerData.worker.name)}>
                Message
              </AnimatedButton>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* History Modal */}
      <AnimatePresence>
        {historyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl relative"
            >
              <button 
                onClick={() => setHistoryModalOpen(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 pr-10">
                Upload History - {selectedWorkerHistory?.name}
              </h2>

              {historyLoading ? (
                <div className="flex justify-center p-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : selectedWorkerHistory?.uploads?.length === 0 ? (
                <div className="text-center p-8 text-gray-500">
                  No uploads found for this worker.
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedWorkerHistory?.uploads?.map((upload) => (
                    <div key={upload._id} className="flex gap-4 p-4 border border-gray-100 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800/50 items-center">
                      {upload.image ? (
                        <img src={upload.image} alt="Waste" className="w-20 h-20 object-cover rounded-xl shadow-sm" />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-xl flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-800 dark:text-white flex items-center">
                            <MapPin className="w-4 h-4 mr-1 text-primary" /> {upload.area}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            upload.status === 'Empty' ? 'bg-green-100 text-green-700' :
                            upload.status === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {upload.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {new Date(upload.createdAt).toLocaleDateString()}</span>
                          {upload.verified && <span className="text-green-600 font-medium flex items-center"><CheckCircle className="w-4 h-4 mr-1" /> Verified</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkerTracking;
