import api from "@/config/api";
import { useState, useEffect, useContext } from 'react';
import { DollarSign, MapPin, Calendar, Clock, CheckCircle, Settings, Truck, TrendingUp, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RecyclerDashboard = () => {
  const { user, token } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  
  // Settings modal
  const [showSettings, setShowSettings] = useState(false);
  const [prices, setPrices] = useState({ Plastic: 15, Iron: 25, Copper: 450, Paper: 10, 'E-waste': 50 });
  
  // Schedule modal
  const [scheduleModal, setScheduleModal] = useState({ isOpen: false, request: null });
  const [schedDate, setSchedDate] = useState('');
  const [schedTime, setSchedTime] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      // Initialize profile implicitly by getting prices
      const profileRes = await api.post(`/api/recycle/profile`, {}, { headers });
      setProfile(profileRes.data.data);
      if (profileRes.data.data.prices) setPrices(profileRes.data.data.prices);

      const reqs = await api.get(`/api/recycle/requests`, { headers });
      setRequests(reqs.data.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status, extra = {}) => {
    try {
      await api.put(`/api/recycle/request/${id}`, { status, ...extra }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let msg = `Request marked as ${status}`;
      if (status === 'Scheduled') msg = 'Pickup scheduled successfully!';
      if (status === 'Completed') msg = 'Transaction successfully completed!';
      if (status === 'Accepted') msg = 'Request accepted successfully!';
      
      toast.success(msg);
      fetchData();
      if (scheduleModal.isOpen) setScheduleModal({ isOpen: false, request: null });
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleSchedule = (e) => {
    e.preventDefault();
    if (!schedDate || !schedTime) return toast.error('Select date and time');
    updateStatus(scheduleModal.request._id, 'Scheduled', { scheduledDate: schedDate, scheduledTime: schedTime });
  };

  const savePrices = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/recycle/profile`, { prices }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Prices updated successfully');
      setShowSettings(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to update prices');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 text-sm">Loading dashboard...</div>;

  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const activeCount = requests.filter(r => ['Accepted', 'Scheduled', 'Collected'].includes(r.status)).length;
  const completedCount = requests.filter(r => r.status === 'Completed').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Recycling Center</h1>
          <p className="text-sm text-gray-500 mt-1">Manage incoming waste pickups and pricing</p>
        </div>
        <button onClick={() => setShowSettings(true)} className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
          <Settings className="w-4 h-4 mr-2" /> Price Management
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">New Requests</p>
            <h3 className="text-3xl font-bold text-gray-900">{pendingCount}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Active Pickups</p>
            <h3 className="text-3xl font-bold text-gray-900">{activeCount}</h3>
          </div>
          <div className="w-12 h-12 bg-yellow-50 border border-yellow-100 rounded-lg flex items-center justify-center">
            <Truck className="w-6 h-6 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Completed</p>
            <h3 className="text-3xl font-bold text-gray-900">{completedCount}</h3>
          </div>
          <div className="w-12 h-12 bg-green-50 border border-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-sm font-bold text-gray-900">Manage Requests</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {requests.length === 0 ? (
               <p className="text-gray-500 text-center py-8 text-sm">No requests yet.</p>
            ) : (
              requests.map(req => (
                <div key={req._id} className="border border-gray-200 p-5 rounded-xl flex flex-col lg:flex-row gap-5 bg-white hover:bg-gray-50 transition-colors shadow-sm">
                  <div className="w-full lg:w-40 h-28 bg-gray-100 border border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {req.image && <img src={req.image} alt="Waste" className="w-full h-full object-cover" />}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border mb-2 inline-block ${
                          req.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                          req.status === 'Pending' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {req.status}
                        </span>
                        <h3 className="font-bold text-sm text-gray-900">{req.quantity}kg of {req.wasteType}</h3>
                        <p className="text-xs text-gray-500 flex items-center mt-1"><MapPin className="w-3.5 h-3.5 mr-1" /> {req.pickupAddress}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Est. Payout</p>
                        <p className="text-lg font-bold text-[#10B981]">₹{req.estimatedPrice}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-col md:flex-row items-start md:items-center justify-between border-t border-gray-100 pt-4">
                      <div className="mb-4 md:mb-0">
                        <p className="text-xs font-bold text-gray-700">{req.user?.name}</p>
                        <p className="text-xs text-gray-500">{req.user?.phone || req.user?.email}</p>
                        {req.scheduledDate && (
                          <p className="text-xs font-medium text-[#10B981] mt-1 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" /> {new Date(req.scheduledDate).toLocaleDateString()} at {req.scheduledTime}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex space-x-2 w-full md:w-auto">
                        {req.status === 'Pending' && (
                          <>
                            <button onClick={() => updateStatus(req._id, 'Rejected')} className="flex-1 md:flex-none px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-xs font-bold hover:bg-gray-50 transition-colors">Reject</button>
                            <button onClick={() => updateStatus(req._id, 'Accepted')} className="flex-1 md:flex-none px-4 py-2 bg-[#10B981] text-white rounded-md text-xs font-bold hover:bg-[#059669] transition-colors">Accept</button>
                          </>
                        )}
                        {req.status === 'Accepted' && (
                          <button onClick={() => setScheduleModal({ isOpen: true, request: req })} className="w-full px-4 py-2 bg-[#10B981] text-white rounded-md text-xs font-bold hover:bg-[#059669] transition-colors">Schedule Pickup</button>
                        )}
                        {req.status === 'Scheduled' && (
                          <button onClick={() => updateStatus(req._id, 'Collected')} className="w-full px-4 py-2 bg-[#10B981] text-white rounded-md text-xs font-bold hover:bg-[#059669] transition-colors">Mark Collected</button>
                        )}
                        {req.status === 'Collected' && (
                          <button onClick={() => updateStatus(req._id, 'Completed')} className="w-full px-4 py-2 bg-[#10B981] text-white rounded-md text-xs font-bold hover:bg-[#059669] transition-colors">Finish & Pay</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-xl relative">
            <button onClick={() => setShowSettings(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800"><X className="w-5 h-5" /></button>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Price Management</h2>
            <p className="text-sm text-gray-500 mb-6">Set your buying prices per kg. These will be visible to users.</p>
            
            <form onSubmit={savePrices} className="space-y-4">
              {['Plastic', 'Iron', 'Copper', 'Paper', 'E-waste'].map(type => (
                <div key={type} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <label className="text-sm font-semibold text-gray-700">{type} (₹/kg)</label>
                  <input 
                    type="number" 
                    value={prices[type] || 0}
                    onChange={(e) => setPrices({...prices, [type]: Number(e.target.value)})}
                    className="w-24 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md text-right focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] outline-none"
                  />
                </div>
              ))}
              <div className="pt-4 mt-2">
                <button type="submit" className="w-full py-2 bg-[#10B981] text-white rounded-md text-sm font-bold hover:bg-[#059669] transition-colors">Save Prices</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {scheduleModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-xl relative">
            <button onClick={() => setScheduleModal({ isOpen: false, request: null })} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800"><X className="w-5 h-5" /></button>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Schedule Pickup</h2>
            <p className="text-sm text-gray-500 mb-6 border-b border-gray-100 pb-4">Select a date and time for collection.</p>
            
            <form onSubmit={handleSchedule} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Date</label>
                <input 
                  type="date" 
                  value={schedDate}
                  onChange={(e) => setSchedDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Time</label>
                <input 
                  type="time" 
                  value={schedTime}
                  onChange={(e) => setSchedTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] outline-none"
                  required
                />
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full py-2 bg-[#10B981] text-white rounded-md text-sm font-bold hover:bg-[#059669] transition-colors">Confirm Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecyclerDashboard;
