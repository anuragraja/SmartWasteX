import api from "@/config/api";
import { useState, useEffect, useContext, useRef } from 'react';
import { Leaf, MapPin, Map as MapIcon, DollarSign, Star, Camera, Truck, X, Phone, CheckCircle, Package, MapPinned, Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
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
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [locationLoading, setLocationLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported on this device.');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        setPickupAddress(`GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        toast.success('Location fetched successfully ✅');
        setLocationLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Unable to fetch location. Please allow GPS access.');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [recRes, statsRes, histRes] = await Promise.all([
        api.get(`/api/recycle/recyclers`, { headers }),
        api.get(`/api/recycle/stats`, { headers }),
        api.get(`/api/recycle/requests`, { headers })
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
      if (!coords.lat || !coords.lng) {
        toast.error('Please fetch your location first by clicking "Auto Fetch Location".');
        setSubmitting(false);
        return;
      }
      formData.append('notes', notes);
      formData.append('lat', coords.lat);
      formData.append('lng', coords.lng);

      await api.post(`/api/recycle/request`, formData, {
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
      setCoords({ lat: null, lng: null });
      fetchData(); // refresh history and stats
    } catch (err) {
      toast.error('Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 text-sm">Loading marketplace...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center">
            <Leaf className="w-5 h-5 mr-2 text-[#10B981]" /> Smart Recycling
          </h1>
          <p className="text-sm text-gray-500 mt-1">Sell your recyclable waste and earn EcoPoints.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
          <button 
            onClick={() => setActiveTab('marketplace')} 
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'marketplace' ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Marketplace
          </button>
          <button 
            onClick={() => setActiveTab('history')} 
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
          >
            My History
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 p-5 rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">EcoPoints</p>
          <h3 className="text-3xl font-bold text-[#10B981]">{stats.ecoPoints}</h3>
          <Leaf className="w-8 h-8 absolute top-5 right-5 text-gray-100" />
        </div>
        <div className="bg-white border border-gray-200 p-5 rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Total Recycled</p>
          <h3 className="text-3xl font-bold text-gray-900">{stats.totalRecycled} <span className="text-sm text-gray-500 font-medium">kg</span></h3>
          <Package className="w-8 h-8 absolute top-5 right-5 text-gray-100" />
        </div>
        <div className="bg-white border border-gray-200 p-5 rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Estimated Earnings</p>
          <h3 className="text-3xl font-bold text-gray-900">₹{stats.totalEarnings}</h3>
          <DollarSign className="w-8 h-8 absolute top-5 right-5 text-gray-100" />
        </div>
      </div>

      {activeTab === 'marketplace' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center mb-4 border-b border-gray-200 pb-2">
              <MapPin className="w-4 h-4 mr-2 text-[#10B981]" /> Nearby Recycling Plants
            </h2>
            {recyclers.length === 0 ? (
              <div className="bg-white border border-gray-200 text-center py-12 rounded-xl shadow-sm">
                <Leaf className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-900">No recyclers found</h3>
                <p className="text-sm text-gray-500 mt-1">There are no registered recycling plants in your area yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recyclers.map(recycler => (
                  <div key={recycler._id} className="bg-white border border-gray-200 p-5 rounded-xl flex flex-col shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-sm text-gray-900">{recycler.companyName}</h3>
                        <p className="text-xs text-gray-500 flex items-center mt-1"><MapPin className="w-3 h-3 mr-1" /> {recycler.address}</p>
                      </div>
                      <div className="flex items-center bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded border border-yellow-200 text-[10px] font-bold">
                        <Star className="w-3 h-3 mr-1 fill-current" /> {recycler.rating}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-[10px] text-gray-500 font-bold mb-2 uppercase tracking-wider">Buying Prices (per kg)</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(recycler.prices || {}).map(([type, price]) => (
                           <span key={type} className="text-[10px] font-bold bg-gray-50 text-gray-700 px-2 py-1 rounded border border-gray-200">
                             {type}: ₹{price}
                           </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <button className="w-full bg-[#10B981] text-white rounded-md text-sm font-medium py-2 hover:bg-[#059669] transition-colors" onClick={() => setSelectedRecycler(recycler)}>
                        Sell Waste Here
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl h-full min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
              <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80" alt="Map" className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale" />
              <div className="relative z-10 flex flex-col items-center p-6 text-center bg-white/90 backdrop-blur-sm rounded-xl m-6 border border-gray-200 shadow-sm">
                <MapIcon className="w-10 h-10 text-[#10B981] mb-3" />
                <h3 className="font-bold text-sm text-gray-900 mb-1">Live Map View</h3>
                <p className="text-xs text-gray-500 mb-4">See all recyclers on the interactive map.</p>
                <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-50 transition-colors">Open Map</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="mt-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
             <h2 className="text-sm font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Recycling History & Tracking</h2>
             <div className="space-y-4">
               {history.length === 0 ? (
                 <p className="text-gray-500 text-center py-8 text-sm">No recycling requests yet.</p>
               ) : (
                 history.map(req => (
                   <div key={req._id} className="border border-gray-200 rounded-xl p-4 md:p-5 flex flex-col md:flex-row gap-5 bg-gray-50/50">
                     <div className="w-full md:w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 border border-gray-200">
                       {req.image && <img src={req.image} alt="Waste" className="w-full h-full object-cover" />}
                     </div>
                     <div className="flex-1">
                       <div className="flex justify-between items-start mb-2">
                         <div>
                           <h3 className="font-bold text-sm text-gray-900">{req.quantity}kg of {req.wasteType}</h3>
                           <p className="text-xs text-gray-500 flex items-center mt-1"><Truck className="w-3.5 h-3.5 mr-1" /> {req.recycler?.companyName || 'Unknown Recycler'}</p>
                         </div>
                         <div className="text-right">
                           <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${
                             req.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                             req.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                             req.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                             'bg-blue-50 text-blue-700 border-blue-200'
                           }`}>
                             {req.status}
                           </span>
                           <p className="text-sm font-bold text-gray-900 mt-2">₹{req.estimatedPrice}</p>
                         </div>
                       </div>
                       
                       {/* Timeline Tracker */}
                       <div className="mt-4 pt-3 border-t border-gray-200 relative">
                         <div className="absolute top-5 left-4 right-4 h-px bg-gray-200 z-0 hidden sm:block"></div>
                         <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 relative z-10">
                           <div className="flex flex-col items-center text-center">
                             <div className="w-3 h-3 rounded-full bg-[#10B981] mb-1.5 border-2 border-white ring-1 ring-gray-200"></div>
                             <span className="text-[10px] font-medium text-gray-700">Requested</span>
                           </div>
                           <div className="flex flex-col items-center text-center">
                             <div className={`w-3 h-3 rounded-full mb-1.5 border-2 border-white ring-1 ring-gray-200 ${['Accepted', 'Scheduled', 'Collected', 'Completed'].includes(req.status) ? 'bg-[#10B981]' : 'bg-gray-200'}`}></div>
                             <span className="text-[10px] font-medium text-gray-700">Accepted</span>
                           </div>
                           <div className="flex flex-col items-center text-center">
                             <div className={`w-3 h-3 rounded-full mb-1.5 border-2 border-white ring-1 ring-gray-200 ${['Scheduled', 'Collected', 'Completed'].includes(req.status) ? 'bg-[#10B981]' : 'bg-gray-200'}`}></div>
                             <span className="text-[10px] font-medium text-gray-700">Scheduled</span>
                             {req.scheduledDate && <span className="text-[9px] text-gray-500 mt-0.5">{new Date(req.scheduledDate).toLocaleDateString()} {req.scheduledTime}</span>}
                           </div>
                           <div className="flex flex-col items-center text-center">
                             <div className={`w-3 h-3 rounded-full mb-1.5 border-2 border-white ring-1 ring-gray-200 ${req.status === 'Completed' ? 'bg-[#10B981]' : 'bg-gray-200'}`}></div>
                             <span className="text-[10px] font-medium text-gray-700">Completed</span>
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                 ))
               )}
             </div>
          </div>
        </div>
      )}

      {/* Sell Waste Modal */}
      {selectedRecycler && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl relative">
            <button 
              onClick={() => setSelectedRecycler(null)}
              className="absolute top-6 right-6 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-1">Sell Waste to {selectedRecycler.companyName}</h2>
            <p className="text-gray-500 text-xs mb-6 pb-4 border-b border-gray-200">Fill out the details below to request a pickup.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Waste Category</label>
                  <select 
                    value={wasteType} 
                    onChange={(e) => setWasteType(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] outline-none"
                  >
                    {['Plastic', 'Iron', 'Copper', 'Paper', 'E-waste'].map(t => (
                      <option key={t} value={t}>{t} (₹{selectedRecycler.prices[t] || 0}/kg)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Quantity (kg)</label>
                  <input 
                    type="number" 
                    min="1"
                    value={quantity} 
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Waste Image</label>
                <div 
                  className={`border border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${preview ? 'border-[#10B981] bg-green-50' : 'border-gray-300 hover:bg-gray-50'}`}
                  onClick={() => fileInputRef.current.click()}
                >
                  {preview ? (
                    <img src={preview} alt="Preview" className="max-h-32 rounded object-contain mb-2 shadow-sm border border-gray-200" />
                  ) : (
                    <>
                      <div className="w-10 h-10 bg-gray-100 text-gray-400 border border-gray-200 rounded-full flex items-center justify-center mb-2">
                        <Camera className="w-5 h-5" />
                      </div>
                      <p className="text-sm text-gray-700 font-medium mb-1">Upload Photo</p>
                      <p className="text-xs text-gray-400">Clear picture of the items</p>
                    </>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Pickup Address</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      value={pickupAddress} 
                      onChange={(e) => setPickupAddress(e.target.value)}
                      placeholder="Full pickup address"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] outline-none"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={fetchLocation}
                    disabled={locationLoading}
                    className="flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md font-medium text-xs hover:bg-blue-100 transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {locationLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <MapPinned className="w-4 h-4 mr-2" />
                    )}
                    {locationLoading ? 'Fetching...' : 'Auto Fetch Location'}
                  </button>
                </div>
                {coords.lat && coords.lng && (
                  <p className="text-xs text-green-600 mt-1.5 font-medium flex items-center">
                    ✓ Coordinates acquired: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                  </p>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex justify-between items-center">
                <div>
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Estimated Payment</p>
                  <p className="text-xs text-gray-500 mt-0.5">Based on {quantity || 0}kg × ₹{selectedRecycler.prices[wasteType] || 0}</p>
                </div>
                <div className="text-xl font-bold text-gray-900">
                  ₹{calculateEstimate()}
                </div>
              </div>

              <button type="submit" disabled={submitting} className="w-full py-2 text-sm font-medium text-white bg-[#10B981] hover:bg-[#059669] rounded-md transition-colors disabled:opacity-50">
                {submitting ? 'Submitting Request...' : 'Confirm Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecycleMarketplace;
