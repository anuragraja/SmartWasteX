import { useState, useRef, useContext } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Camera, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';
import { AuthContext } from '../context/AuthContext';

const UploadImage = () => {
  const { user } = useContext(AuthContext);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [area, setArea] = useState(user?.area || '');
  const [loading, setLoading] = useState(false);
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

  const handleUpload = async () => {
    if (!image || !area) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // In a real app, upload image to Cloudinary here first
      
      const formData = new FormData();
      formData.append('image', image);
      formData.append('title', `Waste Report - ${area}`);
      formData.append('description', 'Image analysis request');
      formData.append('area', area);
      formData.append('lat', 28.6139);
      formData.append('lng', 77.2090);

      const res = await axios.post('http://localhost:5000/api/complaints', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update result with the AI data from backend
      setResult({ aiAnalysis: res.data.aiAnalysis, ...res.data.data });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Upload Waste Image</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <GlassCard className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Location / Area</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary bg-white/50 backdrop-blur-sm"
                placeholder="e.g. Anand Nagar, Sector 4"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Dustbin Image</label>
            <div 
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${preview ? 'border-primary bg-green-50' : 'border-gray-300 hover:bg-gray-50'}`}
              onClick={() => fileInputRef.current.click()}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-64 rounded-xl object-contain mb-4 shadow-md" />
              ) : (
                <>
                  <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-4">
                    <Camera className="w-8 h-8" />
                  </div>
                  <p className="text-gray-600 font-medium mb-1">Click to capture or upload</p>
                  <p className="text-sm text-gray-400">JPG, PNG up to 5MB</p>
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

          <AnimatedButton
            onClick={handleUpload}
            variant="primary"
            disabled={!image || !area || loading}
            className="w-full py-4 text-lg relative overflow-hidden"
          >
            {loading ? (
              <div className="flex items-center justify-center w-full">
                <div className="absolute inset-0 bg-primary/20 animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-[200%] animate-[shimmer_2s_infinite]"></div>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3 z-10"></div>
                <span className="z-10 font-medium tracking-wide">AI analyzing waste...</span>
              </div>
            ) : (
              <>
                <UploadCloud className="w-6 h-6 mr-2" /> Submit Image
              </>
            )}
          </AnimatedButton>
        </GlassCard>

        <div className="h-full">
          {result ? (
            <GlassCard className="h-full flex flex-col justify-center items-center text-center p-8">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg ${
                result.aiAnalysis.priority === 'Emergency' ? 'bg-red-100 text-red-500 shadow-red-200' :
                result.aiAnalysis.priority === 'High'      ? 'bg-orange-100 text-orange-500 shadow-orange-200' :
                result.aiAnalysis.priority === 'Normal'    ? 'bg-blue-100 text-blue-500 shadow-blue-200' :
                'bg-green-100 text-green-500 shadow-green-200'
              }`}>
                {['Emergency', 'High'].includes(result.aiAnalysis.priority) ? (
                  <AlertCircle className="w-12 h-12" />
                ) : (
                  <CheckCircle className="w-12 h-12" />
                )}
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-6">AI Analysis Complete</h2>

              <div className="w-full grid grid-cols-2 gap-3 mb-6 text-left">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
                  <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Priority</span>
                  <span className={`text-base font-bold ${
                    result.aiAnalysis.priority === 'Emergency' ? 'text-red-600' :
                    result.aiAnalysis.priority === 'High' ? 'text-orange-600' :
                    result.aiAnalysis.priority === 'Normal' ? 'text-blue-600' : 'text-gray-600'
                  }`}>{result.aiAnalysis.priority}</span>
                </div>
                
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
                  <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Waste Level</span>
                  <span className={`text-base font-bold ${
                    result.aiAnalysis.wasteLevel === 'Critical' ? 'text-red-600' :
                    result.aiAnalysis.wasteLevel === 'High' ? 'text-orange-600' :
                    result.aiAnalysis.wasteLevel === 'Normal' ? 'text-blue-600' : 'text-green-600'
                  }`}>{result.aiAnalysis.wasteLevel}</span>
                </div>

                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
                  <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Pollution</span>
                  <span className={`text-xl font-black ${
                    result.aiAnalysis.pollutionScore > 75 ? 'text-red-500' :
                    result.aiAnalysis.pollutionScore > 40 ? 'text-yellow-500' : 'text-green-500'
                  }`}>{result.aiAnalysis.pollutionScore}</span>
                </div>

                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
                  <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Overflow</span>
                  <span className={`text-base font-bold ${result.aiAnalysis.overflow ? 'text-red-600' : 'text-green-600'}`}>
                    {result.aiAnalysis.overflow ? 'Detected' : 'None'}
                  </span>
                </div>
              </div>

              {result.aiAnalysis.recyclable && (
                <div className="w-full bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-4 flex items-center font-medium shadow-sm text-sm">
                  <span className="text-lg mr-2">♻️</span> Recyclables detected!
                </div>
              )}

              {['Emergency', 'High'].includes(result.aiAnalysis.priority) && (
                <div className="w-full bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-xs font-bold flex items-center shadow-sm text-left">
                  <span className="animate-pulse mr-2 text-base">🚨</span> Alert sent to admin and nearest worker.
                </div>
              )}

              <button
                onClick={() => { setImage(null); setPreview(''); setResult(null); setArea(''); }}
                className="text-primary font-medium hover:text-green-600 transition-colors mt-2"
              >
                Upload Another Image
              </button>
            </GlassCard>
          ) : (
            <GlassCard className="h-full flex flex-col justify-center items-center text-center p-8 opacity-70">
              <UploadCloud className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-500 mb-2">Awaiting Image</h3>
              <p className="text-gray-400">Upload a photo to see the AI analysis results here.</p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadImage;
