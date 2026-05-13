import { useState, useContext, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, MapPin, Send, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';

const PublicComplaint = () => {
  const { token, user } = useContext(AuthContext);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const fileInputRef = useRef(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    if (!imagePreview) {
      toast.error('Please upload an image of the garbage.');
      return;
    }
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', fileInputRef.current.files[0]);
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('area', data.area);
      formData.append('lat', 28.6139);
      formData.append('lng', 77.2090);

      const res = await axios.post('http://localhost:5000/api/complaints', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Complaint submitted successfully! AI will analyze urgency.');
      setAiResult(res.data.data?.aiAnalysis ?? null);
      reset();
      setImagePreview('');
    } catch (err) {
      toast.error('Failed to submit complaint.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-12 h-12 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Report Garbage Issue</h1>
          <p className="text-gray-500 text-sm">Help keep our city clean by reporting overflowing or uncollected garbage.</p>
        </div>
      </div>

      <GlassCard className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column - Details */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Issue Title</label>
                <input
                  type="text"
                  {...register('title', { required: 'Title is required' })}
                  className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-white/50 backdrop-blur-sm transition-all"
                  placeholder="e.g. Overflowing bin near park"
                />
                {errors.title && <span className="text-xs text-red-500 mt-1">{errors.title.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Area / Location</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    defaultValue={user?.area}
                    {...register('area')}
                    className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-white/50 backdrop-blur-sm transition-all"
                    placeholder="e.g. Anand Nagar (Optional)"
                  />
                </div>
                {errors.area && <span className="text-xs text-red-500 mt-1">{errors.area.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  rows="4"
                  className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-white/50 backdrop-blur-sm transition-all resize-none"
                  placeholder="Provide more details about the garbage location and severity..."
                ></textarea>
                {errors.description && <span className="text-xs text-red-500 mt-1">{errors.description.message}</span>}
              </div>
            </div>

            {/* Right Column - Image Upload */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Evidence Image</label>
              <div 
                className={`h-[300px] border-2 border-dashed rounded-3xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all overflow-hidden ${imagePreview ? 'border-primary bg-green-50/50' : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'}`}
                onClick={() => fileInputRef.current.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-2xl shadow-sm" />
                ) : (
                  <>
                    <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4 shadow-sm">
                      <Camera className="w-10 h-10" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-700 mb-1">Capture Image</h3>
                    <p className="text-sm text-gray-500 mb-4 px-8">Take a photo of the garbage so our AI can analyze the severity level.</p>
                    <span className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 shadow-sm">
                      <ImageIcon className="w-4 h-4 mr-2" /> Browse Files
                    </span>
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

          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
            <AnimatedButton
              type="submit"
              variant="primary"
              disabled={loading}
              className="px-8 py-4 text-lg w-full sm:w-auto relative overflow-hidden"
            >
              {loading ? (
                <div className="flex items-center justify-center w-full">
                  <div className="absolute inset-0 bg-primary/20 animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-[200%] animate-[shimmer_2s_infinite]"></div>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3 z-10"></div>
                  <span className="z-10 font-medium tracking-wide">AI analyzing waste...</span>
                </div>
              ) : (
                <><Send className="w-5 h-5 mr-2" /> Submit Report</>
              )}
            </AnimatedButton>
          </div>
        </form>
      </GlassCard>
      {aiResult && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <GlassCard className="p-8 relative overflow-hidden bg-gradient-to-br from-white to-gray-50 border-t-4 border-t-indigo-500 shadow-xl">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <AlertTriangle className="w-32 h-32" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="bg-indigo-100 text-indigo-600 p-2 rounded-xl mr-3">
                <AlertTriangle className="w-6 h-6" />
              </span>
              AI Analysis Result
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Priority</span>
                <span className={`text-lg font-bold ${
                  aiResult.priority === 'Emergency' ? 'text-red-600' :
                  aiResult.priority === 'High' ? 'text-orange-600' :
                  aiResult.priority === 'Normal' ? 'text-blue-600' : 'text-gray-600'
                }`}>{aiResult.priority}</span>
              </div>
              
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Waste Level</span>
                <span className={`text-lg font-bold ${
                  aiResult.wasteLevel === 'Critical' ? 'text-red-600' :
                  aiResult.wasteLevel === 'High' ? 'text-orange-600' :
                  aiResult.wasteLevel === 'Normal' ? 'text-blue-600' : 'text-green-600'
                }`}>{aiResult.wasteLevel}</span>
              </div>
              
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Pollution Score</span>
                <span className={`text-2xl font-black ${
                  aiResult.pollutionScore > 75 ? 'text-red-500' :
                  aiResult.pollutionScore > 40 ? 'text-yellow-500' : 'text-green-500'
                }`}>{aiResult.pollutionScore}</span>
              </div>
              
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Overflow</span>
                <span className={`text-lg font-bold ${aiResult.overflow ? 'text-red-600' : 'text-green-600'}`}>
                  {aiResult.overflow ? 'Detected' : 'None'}
                </span>
              </div>
            </div>

            {aiResult.recyclable && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 rounded-2xl px-6 py-4 flex items-center font-medium shadow-sm">
                <span className="text-2xl mr-3">♻️</span> AI detected recyclable materials in this waste.
              </div>
            )}

            {['Emergency', 'High'].includes(aiResult.priority) && (
              <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 rounded-2xl px-6 py-4 text-sm font-bold flex items-center shadow-sm">
                <span className="animate-pulse mr-3 text-xl">🚨</span> Action Required: Alert sent to admin and nearest available worker automatically.
              </div>
            )}
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
};

export default PublicComplaint;
