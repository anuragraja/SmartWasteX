import api from "@/config/api";
import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, MapPin, Calendar, Clock, CheckCircle, Settings, Truck, TrendingUp, X } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';
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

  if (loading) return <div className="p-8 text-center animate-pulse">Loading dashboard...</div>;

  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const activeCount = requests.filter(r => ['Accepted', 'Scheduled', 'Collected'].includes(r.status)).length;
  const completedCount = requests.filter(r => r.status === 'Completed').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">Recycling Center</h1>
          <p className="text-gray-500 mt-1">Manage incoming waste pickups and pricing</p>
        </div>
        <AnimatedButton onClick={() => setShowSettings(true)} variant="secondary" className="flex items-center">
          <Settings className="w-5 h-5 mr-2" /> Price Management
        </AnimatedButton>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <GlassCard className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">New Requests</p>
            <h3 className="text-3xl font-black text-gray-800">{pendingCount}</h3>
          </div>
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
            <Clock className="w-7 h-7 text-blue-600" />
          </div>
        </GlassCard>
        <GlassCard className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Active Pickups</p>
            <h3 className="text-3xl font-black text-gray-800">{activeCount}</h3>
          </div>
          <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center">
            <Truck className="w-7 h-7 text-yellow-600" />
          </div>
        </GlassCard>
        <GlassCard className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Total Completed</p>
            <h3 className="text-3xl font-black text-gray-800">{completedCount}</h3>
          </div>
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <h2 className="text-xl font-bold text-gray-800 mb-6">Manage Requests</h2>
        <div className="space-y-4">
          {requests.length === 0 ? (
             <p className="text-gray-500 text-center py-8">No requests yet.</p>
          ) : (
            requests.map(req => (
              <div key={req._id} className="border border-gray-100 p-6 rounded-2xl flex flex-col lg:flex-row gap-6 bg-gray-50 hover:bg-white transition-colors shadow-sm hover:shadow-md">
                <div className="w-full lg:w-48 h-32 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                  {req.image && <img src={req.image} alt="Waste" className="w-full h-full object-cover" />}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md mb-2 inline-block ${
                        req.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        req.status === 'Pending' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {req.status}
                      </span>
                      <h3 className="font-bold text-xl text-gray-900">{req.quantity}kg of {req.wasteType}</h3>
                      <p className="text-sm text-gray-500 flex items-center mt-1"><MapPin className="w-4 h-4 mr-1" /> {req.pickupAddress}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 font-semibold uppercase">Est. Payout</p>
                      <p className="text-2xl font-black text-green-600">₹{req.estimatedPrice}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-col md:flex-row items-start md:items-center justify-between border-t border-gray-200 pt-4">
                    <div className="mb-4 md:mb-0">
                      <p className="text-sm font-bold text-gray-700">{req.user?.name}</p>
                      <p className="text-xs text-gray-500">{req.user?.phone || req.user?.email}</p>
                      {req.scheduledDate && (
                        <p className="text-xs font-bold text-blue-600 mt-1 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" /> {new Date(req.scheduledDate).toLocaleDateString()} at {req.scheduledTime}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 w-full md:w-auto">
                      {req.status === 'Pending' && (
                        <>
                          <AnimatedButton onClick={() => updateStatus(req._id, 'Rejected')} variant="secondary" className="flex-1 md:flex-none">Reject</AnimatedButton>
                          <AnimatedButton onClick={() => updateStatus(req._id, 'Accepted')} variant="primary" className="flex-1 md:flex-none">Accept</AnimatedButton>
                        </>
                      )}
                      {req.status === 'Accepted' && (
                        <AnimatedButton onClick={() => setScheduleModal({ isOpen: true, request: req })} variant="primary" className="w-full">Schedule Pickup</AnimatedButton>
                      )}
                      {req.status === 'Scheduled' && (
                        <AnimatedButton onClick={() => updateStatus(req._id, 'Collected')} variant="primary" className="w-full">Mark Collected</AnimatedButton>
                      )}
                      {req.status === 'Collected' && (
                        <AnimatedButton onClick={() => updateStatus(req._id, 'Completed')} variant="success" className="w-full">Finish & Pay</AnimatedButton>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
              <button onClick={() => setShowSettings(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800"><X className="w-6 h-6" /></button>
              <h2 className="text-2xl font-black mb-6">Price Management</h2>
              <p className="text-sm text-gray-500 mb-6">Set your buying prices per kg. These will be visible to users.</p>
              
              <form onSubmit={savePrices} className="space-y-4">
                {['Plastic', 'Iron', 'Copper', 'Paper', 'E-waste'].map(type => (
                  <div key={type} className="flex items-center justify-between">
                    <label className="font-bold text-gray-700">{type} (₹/kg)</label>
                    <input 
                      type="number" 
                      value={prices[type] || 0}
                      onChange={(e) => setPrices({...prices, [type]: Number(e.target.value)})}
                      className="w-24 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-right focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>
                ))}
                <div className="pt-6 border-t border-gray-100">
                  <AnimatedButton type="submit" variant="primary" className="w-full py-3">Save Prices</AnimatedButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Schedule Modal */}
      <AnimatePresence>
        {scheduleModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
              <button onClick={() => setScheduleModal({ isOpen: false, request: null })} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800"><X className="w-6 h-6" /></button>
              <h2 className="text-2xl font-black mb-2">Schedule Pickup</h2>
              <p className="text-sm text-gray-500 mb-6">Select a date and time for collection.</p>
              
              <form onSubmit={handleSchedule} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
                  <input 
                    type="date" 
                    value={schedDate}
                    onChange={(e) => setSchedDate(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Time</label>
                  <input 
                    type="time" 
                    value={schedTime}
                    onChange={(e) => setSchedTime(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                    required
                  />
                </div>
                <div className="pt-4">
                  <AnimatedButton type="submit" variant="primary" className="w-full py-3">Confirm Schedule</AnimatedButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecyclerDashboard;
