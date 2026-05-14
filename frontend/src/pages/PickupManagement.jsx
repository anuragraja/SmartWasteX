import api from "@/config/api";
import { useState, useEffect, useContext } from 'react';
import { Truck, MapPin, Clock, Navigation, X } from 'lucide-react';
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
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">EMERGENCY</span>;
    }
    switch(status) {
      case 'Pending':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-50 text-yellow-700 border border-yellow-200">PENDING</span>;
      case 'In Progress':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">IN PROGRESS</span>;
      case 'Completed':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">COMPLETED</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-50 text-gray-700 border border-gray-200">{status.toUpperCase()}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pickup Management</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage assigned worker trucks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <div
            key={task._id}
            className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col relative shadow-sm hover:shadow-md transition-shadow"
          >
            {task.priority === 'Emergency' && <div className="absolute top-0 left-0 w-1 h-full bg-red-500 rounded-l-xl"></div>}
            {task.priority === 'High' && <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 rounded-l-xl"></div>}
            {task.priority === 'Normal' && <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-xl"></div>}

            <div className="flex justify-between items-start mb-3 pl-2">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <h3 className="font-bold text-sm text-gray-900 truncate w-32">{task.area}</h3>
                  <p className="text-[10px] text-gray-500 flex items-center mt-0.5">
                    <Clock className="w-3 h-3 mr-1" /> {new Date(task.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {getStatusBadge(task.status, task.priority)}
            </div>

            <div className="pl-2 mt-2 mb-4">
               <h4 className="font-medium text-xs text-gray-700 mb-2">{task.title}</h4>
               {task.complaint?.image && (
                 <img 
                   src={task.complaint.image} 
                   alt="Waste" 
                   className="w-full h-24 object-cover rounded-md border border-gray-200"
                 />
               )}
            </div>

            <div className="mt-auto pt-3 border-t border-gray-100 pl-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Assigned To</p>
                    <p className="text-sm font-medium text-gray-900 flex items-center mt-0.5">
                      {task.worker?.name || 'Unassigned'} 
                      <span className={`ml-2 w-2 h-2 rounded-full ${task.worker?.isOnline ? 'bg-[#10B981]' : 'bg-gray-300'}`}></span>
                    </p>
                  </div>
                </div>
            </div>

            <div className="mt-4 flex flex-col space-y-2 pl-2">
              <div className="flex space-x-2">
                {(user?.role === 'worker' || user?.role === 'admin') && task.status === 'Pending' && (
                  <button 
                    onClick={() => updateStatus(task._id, 'In Progress')}
                    className="flex-1 bg-white border border-gray-300 text-gray-700 py-1.5 rounded-md text-xs font-medium hover:bg-gray-50 transition-colors"
                  >
                    Approve
                  </button>
                )}
                {(user?.role === 'worker' || user?.role === 'admin') && task.status === 'In Progress' && (
                  <button 
                    onClick={() => updateStatus(task._id, 'Completed')}
                    className="flex-1 bg-[#10B981] text-white py-1.5 rounded-md text-xs font-medium hover:bg-[#059669] transition-colors"
                  >
                    Mark Complete
                  </button>
                )}
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleMessageDriver(task.worker?._id, task.worker?.name)}
                  className="flex-1 bg-white border border-gray-200 text-gray-600 py-1.5 rounded-md text-xs font-medium hover:bg-gray-50 transition-colors"
                >
                  Message
                </button>
                <button 
                  onClick={() => setTrackingModal({ isOpen: true, task })}
                  className="flex-1 bg-white border border-gray-200 text-gray-600 py-1.5 rounded-md text-xs font-medium hover:bg-gray-50 flex items-center justify-center transition-colors"
                >
                  <Navigation className="w-3 h-3 mr-1" /> Track
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {trackingModal.isOpen && trackingModal.task && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl relative border border-gray-200">
            <button 
              onClick={() => setTrackingModal({ isOpen: false, task: null })}
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-white border border-gray-200 rounded-md flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <Truck className="w-5 h-5 mr-2" /> Live Tracking
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Tracking {trackingModal.task.worker?.name}'s truck to {trackingModal.task.area}
              </p>
            </div>

            <div className="flex-1 relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200 min-h-[400px]">
              <img 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80" 
                alt="Map" 
                className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale"
              />
              
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="w-10 h-10 bg-[#10B981]/20 rounded-full animate-ping absolute -inset-1"></div>
                  <div className="w-8 h-8 bg-[#10B981] text-white rounded-full flex items-center justify-center relative shadow-sm border-2 border-white">
                    <Truck className="w-4 h-4" />
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-4 left-4 right-4 bg-white border border-gray-200 p-3 rounded-lg flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide mb-0.5">Status</p>
                  <p className="font-bold text-sm text-gray-900 flex items-center">
                    <Navigation className="w-3.5 h-3.5 mr-1 text-[#10B981]" /> En Route
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide mb-0.5">ETA</p>
                  <p className="font-bold text-sm text-gray-900">14 min</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PickupManagement;
