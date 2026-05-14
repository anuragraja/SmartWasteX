import api from "@/config/api";
import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, Upload, FileText, User, Clock, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

const KYCForm = () => {
  const { user, token, checkAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'pending', 'rejected', etc
  
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    aadhaarNumber: '',
    address: '',
    mobile: '',
    area: user?.area || '',
    profilePhotoUrl: '',
    documentUrl: '',
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const setter = type === 'photo' ? setUploadingPhoto : setUploadingDoc;
    setter(true);

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const res = await api.post(`/api/kyc/upload`, formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      setFormData(prev => ({
        ...prev,
        [type === 'photo' ? 'profilePhotoUrl' : 'documentUrl']: res.data.url
      }));
      toast.success(`${type === 'photo' ? 'Photo' : 'Document'} uploaded!`);
    } catch (err) {
      toast.error(`Failed to upload ${type}`);
    } finally {
      setter(false);
    }
  };

  useEffect(() => {
    // Check if already submitted
    const checkKycStatus = async () => {
      try {
        const res = await api.get(`/api/kyc/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.data) {
          setStatus(res.data.data.status);
          if (res.data.data.status === 'approved') {
            await checkAuth(); // update context kycVerified
            navigate('/dashboard');
          }
        }
      } catch (err) {
        console.error('Failed to check KYC status', err);
      }
    };
    if (token) checkKycStatus();
  }, [token, navigate, checkAuth]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post(`/api/kyc/submit`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('KYC Submitted Successfully!');
      setStatus('pending');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-xl shadow-sm text-center py-12 px-8">
          <div className="w-16 h-16 bg-yellow-50 border border-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">KYC Under Review</h2>
          <p className="text-sm text-gray-500 mb-8">Your documents have been submitted and are pending admin approval. You will be notified once verified.</p>
          <button 
            className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
            onClick={() => navigate('/login')}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#10B981]/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-[#10B981]/20">
            <ShieldCheck className="w-6 h-6 text-[#10B981]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Complete Your KYC</h2>
          <p className="text-sm text-gray-500 mt-1">Required for all {user?.role?.replace('_', ' ')} accounts before accessing the dashboard.</p>
          
          {status === 'rejected' && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm font-medium border border-red-200">
              Your previous KYC submission was rejected. Please re-submit with correct details.
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-gray-300 focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] outline-none transition-all"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Aadhaar / ID Number</label>
              <input
                type="text"
                name="aadhaarNumber"
                value={formData.aadhaarNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Mobile Number</label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Assigned Area</label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] outline-none transition-all"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Full Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] outline-none transition-all resize-none"
                required
              ></textarea>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
             <div className={`relative border-2 border-dashed rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer group ${formData.profilePhotoUrl ? 'border-[#10B981] bg-green-50/30' : 'border-gray-300'}`}>
               <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'photo')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
               {formData.profilePhotoUrl ? (
                 <div className="flex flex-col items-center">
                   <img src={formData.profilePhotoUrl} alt="Profile" className="w-12 h-12 rounded-full object-cover mb-2 border border-gray-200" />
                   <p className="text-xs font-bold text-[#10B981]">Photo Uploaded</p>
                 </div>
               ) : (
                 <>
                   <Camera className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                   <p className="text-xs font-bold text-gray-700">{uploadingPhoto ? 'Uploading...' : 'Upload Profile Photo'}</p>
                   <p className="text-[10px] text-gray-500 mt-1">Click or drag image here</p>
                 </>
               )}
             </div>
             
             <div className={`relative border-2 border-dashed rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer group ${formData.documentUrl ? 'border-[#10B981] bg-green-50/30' : 'border-gray-300'}`}>
               <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'doc')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
               {formData.documentUrl ? (
                 <div className="flex flex-col items-center">
                   <FileText className="w-8 h-8 text-[#10B981] mb-2" />
                   <p className="text-xs font-bold text-[#10B981]">Document Uploaded</p>
                 </div>
               ) : (
                 <>
                   <FileText className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                   <p className="text-xs font-bold text-gray-700">{uploadingDoc ? 'Uploading...' : 'Upload Aadhaar / ID Card'}</p>
                   <p className="text-[10px] text-gray-500 mt-1">PDF or Image</p>
                 </>
               )}
             </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button 
              type="submit" 
              className="w-full px-4 py-2.5 bg-[#10B981] text-white rounded-md text-sm font-medium hover:bg-[#059669] transition-colors disabled:opacity-50" 
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Documents for Verification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KYCForm;
