import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';
import { ShieldCheck, Upload, FileText, User } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

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
      const res = await axios.post('http://localhost:5000/api/kyc/upload', formDataUpload, {
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
        const res = await axios.get('http://localhost:5000/api/kyc/status', {
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
      await axios.post('http://localhost:5000/api/kyc/submit', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('KYC Submitted Successfully! Pending Admin Approval.');
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
        <GlassCard className="max-w-md w-full text-center py-12">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-yellow-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">KYC Under Review</h2>
          <p className="text-gray-500">Your documents have been submitted and are pending admin approval. You will be notified once verified.</p>
          <AnimatedButton variant="secondary" className="mt-8 mx-auto" onClick={() => navigate('/login')}>Back to Login</AnimatedButton>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 md:p-6">
      <GlassCard className="max-w-3xl w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">Complete Your KYC</h2>
          <p className="text-gray-500 mt-2">Required for all {user?.role?.replace('_', ' ')} accounts before accessing the dashboard.</p>
          
          {status === 'rejected' && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 font-semibold">
              Your previous KYC submission was rejected. Please re-submit with correct details.
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Aadhaar / ID Number</label>
              <input
                type="text"
                name="aadhaarNumber"
                value={formData.aadhaarNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Mobile Number</label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Assigned Area</label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="2"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                required
              ></textarea>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
             <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group">
               <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'photo')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
               {formData.profilePhotoUrl ? (
                 <div className="flex flex-col items-center">
                   <img src={formData.profilePhotoUrl} alt="Profile" className="w-16 h-16 rounded-full object-cover mb-2 border-2 border-primary" />
                   <p className="text-sm font-bold text-green-600">Photo Uploaded</p>
                 </div>
               ) : (
                 <>
                   <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                     {uploadingPhoto ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div> : <Camera className="w-6 h-6 text-blue-500" />}
                   </div>
                   <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{uploadingPhoto ? 'Uploading...' : 'Upload Profile Photo'}</p>
                   <p className="text-xs text-gray-500 mt-1">Click or drag image here</p>
                 </>
               )}
             </div>
             
             <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group">
               <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'doc')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
               {formData.documentUrl ? (
                 <div className="flex flex-col items-center">
                   <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-2">
                     <FileText className="w-8 h-8 text-green-600" />
                   </div>
                   <p className="text-sm font-bold text-green-600">Document Uploaded</p>
                 </div>
               ) : (
                 <>
                   <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                     {uploadingDoc ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-green-500"></div> : <FileText className="w-6 h-6 text-green-500" />}
                   </div>
                   <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{uploadingDoc ? 'Uploading...' : 'Upload Aadhaar / ID Card'}</p>
                   <p className="text-xs text-gray-500 mt-1">PDF or Image</p>
                 </>
               )}
             </div>
          </div>

          <AnimatedButton type="submit" variant="primary" className="w-full mt-8" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Documents for Verification'}
          </AnimatedButton>
        </form>
      </GlassCard>
    </div>
  );
};

// Also import Clock for the pending screen at the top
import { Clock, Camera } from 'lucide-react';

export default KYCForm;
