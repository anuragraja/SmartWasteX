import { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, MapPin, Map as MapIcon, DollarSign, Star, Camera, Truck, X, Phone, CheckCircle, Package } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';
import toast from 'react-hot-toast';

const RecycleMarketplace = () => {
  const { user, token } = useContext(AuthContext);
  const [recyclers, setRecyclers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ ecoPoints: 0, totalRecycled: 0, totalEarnings: 0 });
  const [activeTab, setActiveTab] = useState('marketplace'); // 'marketplace' or 'history'
  const [history, setHistory] = useState([]);
  
  // Form State
  const [selectedRecycler, setSelectedRecycler] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [wasteType, setWasteType] = useState('Plastic');
  const [quantity, setQuantity] = useState('');
  const [pickupAddress, setPickupAddress] = useState(user?.area || '');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [recRes, statsRes, histRes] = await Promise.all([
        axios.get('http://localhost:5000/api/recycle/recyclers', { headers }),
        axios.get('http://localhost:5000/api/recycle/stats', { headers }),
        axios.get('http://localhost:5000/api/recycle/requests', { headers })
      ]);
      setRecyclers(recRes.data.data);
      setStats(statsRes.data.data);
      setHistory(histRes.data.data);
    } catch (err) {
      toast.error('Failed to load marketplace data');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const calculateEstimate = () => {
    if (!selectedRecycler || !quantity) return 0;
    const pricePerKg = selectedRecycler.prices[wasteType] || 0;
    return pricePerKg * quantity;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image || !quantity || !pickupAddress) {
      return toast.error('Please fill all required fields and upload an image');
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('recyclerId', selectedRecycler.user._id);
      formData.append('wasteType', wasteType);
      formData.append('quantity', quantity);
      formData.append('pickupAddress', pickupAddress);
      formData.append('estimatedPrice', calculateEstimate());
      formData.append('notes', notes);
      formData.append('lat', 28.6139);
      formData.append('lng', 77.2090);

      await axios.post('http://localhost:5000/api/recycle/request', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Sell waste request successfully completed!');
      setSelectedRecycler(null);
      setImage(null);
      setPreview('');
      setQuantity('');
      setNotes('');
      fetchData(); // refresh history and stats
    } catch (err) {
      toast.error('Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center animate-pulse text-gray-500">Loading marketplace...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight flex items-center">
            <Leaf className="w-8 h-8 mr-3 text-green-500" /> Smart Recycling
          </h1>
          <p className="text-gray-500 mt-1">Sell your recyclable waste and earn EcoPoints.</p>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('marketplace')} 
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'marketplace' ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm' : 'text-gray-500'}`}
          >
            Marketplace
          </button>
          <button 
            onClick={() => setActiveTab('history')} 
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm' : 'text-gray-500'}`}
          >
            My History
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="bg-gradient-to-br from-green-400 to-green-600 text-white flex flex-col justify-between">
          <p className="text-green-100 text-sm font-semibold uppercase tracking-wider mb-1">EcoPoints</p>
          <h3 className="text-4xl font-black">{stats.ecoPoints}</h3>
          <Leaf className="w-12 h-12 absolute top-6 right-6 text-green-300/30" />
        </GlassCard>
        <GlassCard className="flex flex-col justify-between">
          <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Total Recycled</p>
          <h3 className="text-3xl font-black text-gray-800 dark:text-white">{stats.totalRecycled} <span className="text-lg text-gray-400 font-medium">kg</span></h3>
          <Package className="w-10 h-10 absolute top-6 right-6 text-blue-100 dark:text-blue-900/30" />
        </GlassCard>
        <GlassCard className="flex flex-col justify-between">
          <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Estimated Earnings</p>
          <h3 className="text-3xl font-black text-gray-800 dark:text-white">₹{stats.totalEarnings}</h3>
          <DollarSign className="w-10 h-10 absolute top-6 right-6 text-yellow-100 dark:text-yellow-900/30" />
        </GlassCard>
      </div>

      {activeTab === 'marketplace' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center mb-4">
              <MapPin className="w-5 h-5 mr-2 text-green-500" /> Nearby Recycling Plants
            </h2>
            {recyclers.length === 0 ? (
              <GlassCard className="text-center py-12">
                <Leaf className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-700">No recyclers found</h3>
                <p className="text-gray-500">There are no registered recycling plants in your area yet.</p>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recyclers.map(recycler => (
                  <GlassCard key={recycler._id} className="flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-green-500 transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{recycler.companyName}</h3>
                        <p className="text-xs text-gray-500 flex items-center mt-1"><MapPin className="w-3 h-3 mr-1" /> {recycler.address}</p>
                      </div>
                      <div className="flex items-center bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg text-xs font-bold">
                        <Star className="w-3 h-3 mr-1 fill-current" /> {recycler.rating}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wider">Buying Prices (per kg)</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(recycler.prices || {}).map(([type, price]) => (
                           <span key={type} className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-1 rounded-md border border-green-100">
                             {type}: ₹{price}
                           </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                      <AnimatedButton variant="primary" className="w-full text-sm py-2" onClick={() => setSelectedRecycler(recycler)}>
                        Sell Waste Here
                      </AnimatedButton>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
          
          <div className="lg:col-span-1">
            <GlassCard className="h-full min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
              <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80" alt="Map" className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale" />
              <div className="relative z-10 flex flex-col items-center p-6 text-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-3xl m-6 border border-white/50">
                <MapIcon className="w-12 h-12 text-green-500 mb-4" />
                <h3 className="font-bold text-gray-800 dark:text-white mb-2">Live Map View</h3>
                <p className="text-sm text-gray-500 mb-4">See all recyclers on the interactive map.</p>
                <AnimatedButton variant="secondary" className="text-sm px-6">Open Map</AnimatedButton>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="mt-8">
          <GlassCard>
             <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Recycling History & Tracking</h2>
             <div className="space-y-4">
               {history.length === 0 ? (
                 <p className="text-gray-500 text-center py-8">No recycling requests yet.</p>
               ) : (
                 history.map(req => (
                   <div key={req._id} className="border border-gray-100 dark:border-gray-700 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow bg-gray-50/50 dark:bg-gray-800/30">
                     <div className="w-full md:w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200">
                       {req.image && <img src={req.image} alt="Waste" className="w-full h-full object-cover" />}
                     </div>
                     <div className="flex-1">
                       <div className="flex justify-between items-start mb-2">
                         <div>
                           <h3 className="font-bold text-lg text-gray-900 dark:text-white">{req.quantity}kg of {req.wasteType}</h3>
                           <p className="text-sm text-gray-500 flex items-center mt-1"><Truck className="w-4 h-4 mr-1" /> {req.recycler?.companyName || 'Unknown Recycler'}</p>
                         </div>
                         <div className="text-right">
                           <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                             req.status === 'Completed' ? 'bg-green-100 text-green-700' :
                             req.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                             req.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                             'bg-blue-100 text-blue-700'
                           }`}>
                             {req.status}
                           </span>
                           <p className="text-lg font-black text-green-600 mt-2">₹{req.estimatedPrice}</p>
                         </div>
                       </div>
                       
                       {/* Timeline Tracker */}
                       <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 relative">
                         <div className="absolute top-6 left-2 right-2 h-0.5 bg-gray-200 dark:bg-gray-700 z-0 hidden sm:block"></div>
                         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
                           <div className="flex flex-col items-center text-center">
                             <div className="w-4 h-4 rounded-full bg-green-500 mb-2 border-4 border-white dark:border-gray-800"></div>
                             <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">Requested</span>
                           </div>
                           <div className="flex flex-col items-center text-center">
                             <div className={`w-4 h-4 rounded-full mb-2 border-4 border-white dark:border-gray-800 ${['Accepted', 'Scheduled', 'Collected', 'Completed'].includes(req.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                             <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">Accepted</span>
                           </div>
                           <div className="flex flex-col items-center text-center">
                             <div className={`w-4 h-4 rounded-full mb-2 border-4 border-white dark:border-gray-800 ${['Scheduled', 'Collected', 'Completed'].includes(req.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                             <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">Scheduled</span>
                             {req.scheduledDate && <span className="text-[9px] text-gray-500">{new Date(req.scheduledDate).toLocaleDateString()} {req.scheduledTime}</span>}
                           </div>
                           <div className="flex flex-col items-center text-center">
                             <div className={`w-4 h-4 rounded-full mb-2 border-4 border-white dark:border-gray-800 ${req.status === 'Completed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                             <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">Completed</span>
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                 ))
               )}
             </div>
          </GlassCard>
        </div>
      )}

      {/* Sell Waste Modal */}
      <AnimatePresence>
        {selectedRecycler && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedRecycler(null)}
                className="absolute top-6 right-6 w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-2">Sell Waste to {selectedRecycler.companyName}</h2>
              <p className="text-gray-500 text-sm mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">Fill out the details below to request a pickup.</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Waste Category</label>
                    <select 
                      value={wasteType} 
                      onChange={(e) => setWasteType(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                    >
                      {['Plastic', 'Iron', 'Copper', 'Paper', 'E-waste'].map(t => (
                        <option key={t} value={t}>{t} (₹{selectedRecycler.prices[t] || 0}/kg)</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Quantity (kg)</label>
                    <input 
                      type="number" 
                      min="1"
                      value={quantity} 
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="e.g. 5"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Waste Image</label>
                  <div 
                    className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${preview ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'}`}
                    onClick={() => fileInputRef.current.click()}
                  >
                    {preview ? (
                      <img src={preview} alt="Preview" className="max-h-48 rounded-xl object-contain mb-2 shadow-sm" />
                    ) : (
                      <>
                        <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                          <Camera className="w-6 h-6" />
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 font-bold mb-1">Upload Photo</p>
                        <p className="text-xs text-gray-400">Clear picture of the items</p>
                      </>
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Pickup Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="text" 
                      value={pickupAddress} 
                      onChange={(e) => setPickupAddress(e.target.value)}
                      placeholder="Full pickup address"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-100 dark:border-green-900/30 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-green-800 dark:text-green-300 font-semibold">Estimated Payment</p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">Based on {quantity || 0}kg × ₹{selectedRecycler.prices[wasteType] || 0}</p>
                  </div>
                  <div className="text-2xl font-black text-green-700 dark:text-green-400">
                    ₹{calculateEstimate()}
                  </div>
                </div>

                <AnimatedButton type="submit" variant="primary" disabled={submitting} className="w-full py-4 text-lg bg-green-600 hover:bg-green-700">
                  {submitting ? 'Submitting Request...' : 'Confirm Request'}
                </AnimatedButton>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecycleMarketplace;
