import api from "@/config/api";
import { useState, useRef, useContext } from 'react';
import { UploadCloud, Camera, MapPin, MapPinned, Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const UploadImage = () => {
  const { user } = useContext(AuthContext);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [area, setArea] = useState(user?.area || '');
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setResult(null);
    }
  };

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
        setArea(`GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
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

  const handleUpload = async () => {
    if (!image || !area) return;
    
    if (!coords.lat || !coords.lng) {
      toast.error('Please fetch your location first by clicking "Auto Fetch Location".');
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('image', image);
      formData.append('title', `Waste Report - ${area}`);
      formData.append('description', 'Image analysis request');
      formData.append('area', area);
      formData.append('lat', coords.lat);
      formData.append('lng', coords.lng);

      const res = await api.post(`/api/complaints`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setResult({ aiAnalysis: res.data.data?.aiAnalysis || res.data.aiAnalysis, ...res.data.data });
      toast.success('Image analyzed successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to analyze image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">Upload Image</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Location / Area</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981]"
                  placeholder="e.g. Anand Nagar, Sector 4"
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

          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Dustbin Image</label>
            <div 
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${preview ? 'border-[#10B981] bg-green-50/30' : 'border-gray-300 hover:bg-gray-50'}`}
              onClick={() => fileInputRef.current.click()}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-64 rounded-md object-contain mb-4" />
              ) : (
                <>
                  <Camera className="w-8 h-8 text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-gray-700 mb-1">Click to upload image</p>
                  <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
                </>
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment"
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageChange}
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={!image || !area || loading}
            className="w-full py-2 bg-[#10B981] text-white rounded-md font-medium text-sm hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {loading ? 'Analyzing...' : 'Analyze Image'}
          </button>
        </div>

        <div className="h-full">
          {result ? (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full flex flex-col">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Analysis Results</h2>

              {result.aiAnalysis ? (
                <div className="space-y-1 mb-8">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Priority</span>
                    <span className="text-sm font-bold text-gray-900">{result.aiAnalysis.priority}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Waste Level</span>
                    <span className="text-sm font-bold text-gray-900">{result.aiAnalysis.wasteLevel}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Pollution Score</span>
                    <span className="text-sm font-bold text-gray-900">{result.aiAnalysis.pollutionScore}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Overflow Status</span>
                    <span className="text-sm font-bold text-gray-900">{result.aiAnalysis.overflow ? 'Detected' : 'None'}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-8">No AI analysis data returned.</p>
              )}

              <div className="mt-auto space-y-3">
                {result.aiAnalysis?.recyclable && (
                  <div className="w-full bg-green-50 border border-green-200 text-green-700 rounded-md px-3 py-2 text-sm font-medium">
                    ♻️ Recyclables detected in image
                  </div>
                )}

                {result.aiAnalysis && ['Emergency', 'High'].includes(result.aiAnalysis.priority) && (
                  <div className="w-full bg-red-50 border border-red-200 text-red-700 rounded-md px-3 py-2 text-sm font-medium">
                    🚨 High priority: Alert dispatched to nearest worker
                  </div>
                )}

                <button
                  onClick={() => { setImage(null); setPreview(''); setResult(null); setArea(''); setCoords({ lat: null, lng: null }); }}
                  className="w-full py-2 mt-4 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Upload Another Image
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 border-dashed rounded-xl p-6 h-full flex flex-col justify-center items-center text-center">
              <UploadCloud className="w-8 h-8 text-gray-400 mb-3" />
              <h3 className="text-sm font-medium text-gray-900 mb-1">Awaiting Image</h3>
              <p className="text-xs text-gray-500 max-w-[200px]">Upload an image of a dustbin to see AI analysis results here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadImage;
