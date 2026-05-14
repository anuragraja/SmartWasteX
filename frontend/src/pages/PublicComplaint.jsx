import api from "@/config/api";
import { useState, useContext, useRef } from 'react';
import { Camera, MapPin, Image as ImageIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

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

      const res = await api.post(`/api/complaints`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Complaint submitted successfully!');
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
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Report Issue</h1>
          <p className="text-sm text-gray-500 mt-1">Submit a new garbage complaint.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Issue Title</label>
                <input
                  type="text"
                  {...register('title', { required: 'Title is required' })}
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981]"
                  placeholder="e.g. Overflowing bin near park"
                />
                {errors.title && <span className="text-xs text-red-500 mt-1">{errors.title.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Area / Location</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    defaultValue={user?.area}
                    {...register('area')}
                    className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981]"
                    placeholder="e.g. Anand Nagar (Optional)"
                  />
                </div>
                {errors.area && <span className="text-xs text-red-500 mt-1">{errors.area.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Description</label>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  rows="4"
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] resize-none"
                  placeholder="Provide more details about the garbage location and severity..."
                ></textarea>
                {errors.description && <span className="text-xs text-red-500 mt-1">{errors.description.message}</span>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Evidence Image</label>
              <div 
                className={`h-[268px] border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all overflow-hidden ${imagePreview ? 'border-[#10B981] bg-green-50/30' : 'border-gray-300 hover:bg-gray-50'}`}
                onClick={() => fileInputRef.current.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-md" />
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-gray-400 mb-3" />
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Click to upload image</h3>
                    <p className="text-xs text-gray-500 mb-4 px-8">Take a photo of the garbage for AI analysis.</p>
                    <span className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50">
                      <ImageIcon className="w-3.5 h-3.5 mr-2" /> Browse Files
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

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#10B981] text-white rounded-md font-medium text-sm hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center w-full sm:w-auto"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>

      {aiResult && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">AI Analysis Result</h3>
          
          <div className="space-y-1 mb-6 max-w-2xl">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-500">Priority</span>
              <span className="text-sm font-bold text-gray-900">{aiResult.priority}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-500">Waste Level</span>
              <span className="text-sm font-bold text-gray-900">{aiResult.wasteLevel}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-500">Pollution Score</span>
              <span className="text-sm font-bold text-gray-900">{aiResult.pollutionScore}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-500">Overflow</span>
              <span className="text-sm font-bold text-gray-900">{aiResult.overflow ? 'Detected' : 'None'}</span>
            </div>
          </div>

          <div className="space-y-3 max-w-2xl">
            {aiResult.recyclable && (
              <div className="w-full bg-green-50 border border-green-200 text-green-700 rounded-md px-3 py-2 text-sm font-medium">
                ♻️ AI detected recyclable materials
              </div>
            )}

            {['Emergency', 'High'].includes(aiResult.priority) && (
              <div className="w-full bg-red-50 border border-red-200 text-red-700 rounded-md px-3 py-2 text-sm font-medium">
                🚨 Alert sent to admin and nearest available worker
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicComplaint;
