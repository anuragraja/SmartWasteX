import api from "@/config/api";
import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, MapPin, Clock, CheckCircle, AlertCircle, RefreshCw, Navigation, X } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PickupManagement = () => {
  const { token, user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingModal, setTrackingModal] = useState({ isOpen: false, task: null });

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data.data);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/api/tasks/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Task marked as ${status}`);
      fetchTasks();
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleMessageDriver = async (workerId, workerName) => {
    if (!workerId) return toast.error('Driver not assigned');
    const message = window.prompt(`Message for ${workerName}:`);
    if (!message) return;

    try {
      await api.post(`/api/notifications`, {
        userId: workerId,
        title: 'Message from Dashboard',
        message: message,
        type: 'Alert'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Message sent to driver!');
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const getStatusBadge = (status, priority) => {
    if (priority === 'Emergency') {
      return <span className="flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 animate-pulse"><AlertCircle className="w-3 h-3 mr-1" /> EMERGENCY</span>;
    }
    switch(status) {
      case 'Pending':
        return <span className="flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700"><RefreshCw className="w-3 h-3 mr-1" /> Pending</span>;
      case 'In Progress':
        return <span className="flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700"><Truck className="w-3 h-3 mr-1" /> In Progress</span>;
      case 'Completed':
        return <span className="flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" /> Completed</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Waste Management Trucks</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and track assigned worker trucks in real-time</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task, index) => (
          <motion.div
            key={task._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="glass p-6 rounded-2xl flex flex-col relative overflow-hidden"
          >
            {task.priority === 'Emergency' && <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>}
            {task.priority === 'High' && <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>}
            {task.priority === 'Normal' && <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>}

            <div className="flex justify-between items-start mb-4 pl-2">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 truncate w-32">{task.area}</h3>
                  <p className="text-xs text-gray-500 flex items-center mt-0.5">
                    <Clock className="w-3 h-3 mr-1" /> {new Date(task.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {getStatusBadge(task.status, task.priority)}
            </div>

            <div className="pl-2 mt-2 mb-4">
               <h4 className="font-semibold text-sm mb-2">{task.title}</h4>
               {task.complaint?.image && (
                 <img 
                   src={task.complaint.image} 
                   alt="Waste" 
                   className="w-full h-32 object-cover rounded-xl mt-2 border border-gray-100"
                 />
               )}
            </div>

            <div className="mt-auto pt-4 border-t border-gray-100 pl-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold relative">
                    {task.worker?.name?.charAt(0) || 'W'}
                    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${task.worker?.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Assigned to</p>
                    <p className="text-sm font-semibold text-gray-800 flex items-center">
                      {task.worker?.name || 'Worker'} 
                      <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${task.worker?.isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {task.worker?.isOnline ? 'On Duty' : 'Off Duty'}
                      </span>
                    </p>
                  </div>
                </div>
            </div>

            <div className="mt-6 flex flex-col space-y-2 pl-2">
              <div className="flex space-x-2">
                {(user?.role === 'worker' || user?.role === 'admin') && task.status === 'Pending' && (
                  <button 
                    onClick={() => updateStatus(task._id, 'In Progress')}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 shadow-md shadow-blue-200"
                  >
                    Approve Truck
                  </button>
                )}
                {(user?.role === 'worker' || user?.role === 'admin') && task.status === 'In Progress' && (
                  <button 
                    onClick={() => updateStatus(task._id, 'Completed')}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 shadow-md shadow-green-200"
                  >
                    Mark Complete
                  </button>
                )}
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleMessageDriver(task.worker?._id, task.worker?.name)}
                  className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center justify-center transition-colors"
                >
                  Message Driver
                </button>
                <button 
                  onClick={() => setTrackingModal({ isOpen: true, task })}
                  className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center justify-center transition-colors"
                >
                  <Navigation className="w-4 h-4 mr-2 text-primary" /> Live Tracking
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {trackingModal.isOpen && trackingModal.task && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative"
            >
              <button 
                onClick={() => setTrackingModal({ isOpen: false, task: null })}
                className="absolute top-6 right-6 z-10 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                  <Truck className="w-6 h-6 mr-3 text-primary" /> Live Truck Tracking
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Tracking {trackingModal.task.worker?.name}'s truck to {trackingModal.task.area}
                </p>
              </div>

              <div className="flex-1 relative rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 min-h-[400px]">
                {/* Fake map implementation for UI presentation */}
                <img 
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80" 
                  alt="Map" 
                  className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale"
                />
                
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    <div className="w-12 h-12 bg-primary/20 rounded-full animate-ping absolute -inset-1"></div>
                    <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center relative shadow-lg">
                      <Truck className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                
                <div className="absolute bottom-4 left-4 right-4 glass p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Status</p>
                    <p className="font-bold text-gray-800 flex items-center"><Navigation className="w-4 h-4 mr-1 text-primary animate-bounce" /> En Route to {trackingModal.task.area}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">ETA</p>
                    <p className="font-bold text-gray-800">14 min</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PickupManagement;
