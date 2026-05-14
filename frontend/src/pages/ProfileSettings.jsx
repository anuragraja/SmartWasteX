import { useContext, useState } from 'react';
import { User, Mail, Shield, MapPin, Edit3, ScanFace } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import FaceAuth from '../components/FaceAuth';
import toast from 'react-hot-toast';

const ProfileSettings = () => {
  const { user, registerFace } = useContext(AuthContext);
  const [showFaceReg, setShowFaceReg] = useState(false);

  if (!user) return null;

  const handleFaceCapture = async (descriptor) => {
    try {
      await registerFace(descriptor);
      toast.success('Face data registered successfully!');
      setShowFaceReg(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to register face data');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account details and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="md:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center text-center relative shadow-sm">
            <div className="w-full h-24 bg-gray-100 rounded-t-xl absolute top-0 left-0 border-b border-gray-200"></div>
            
            <div className="relative mt-8 mb-4">
              <div className="w-20 h-20 bg-white p-1 rounded-full shadow-sm border border-gray-200">
                <div className="w-full h-full bg-gray-50 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 bg-white border border-gray-200 rounded-full shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50">
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>

            <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
            <p className="text-[10px] font-bold text-[#10B981] mt-1 uppercase tracking-wider bg-green-50 border border-green-200 px-2 py-0.5 rounded">
              {user.role.replace('_', ' ')}
            </p>

            <div className="w-full mt-6 pt-5 border-t border-gray-100 space-y-3">
              <div className="flex items-center text-sm text-gray-600 text-left">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600 text-left">
                <Shield className="w-4 h-4 mr-2 text-gray-400" />
                <span>Status: <strong className={user.isApproved ? "text-[#10B981]" : "text-yellow-600"}>{user.isApproved ? 'Active' : 'Pending'}</strong></span>
              </div>
              {user.area && (
                <div className="flex items-center text-sm text-gray-600 text-left">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{user.area}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Edit Form */}
        <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Personal Information</h3>
          
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Full Name</label>
                <input
                  type="text"
                  defaultValue={user.name}
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Email Address</label>
                <input
                  type="email"
                  defaultValue={user.email}
                  disabled
                  className="block w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed.</p>
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4 pt-6 border-t border-gray-100">Face Recognition</h3>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Register your face data to enable fast, secure logins without a password.
              </p>
              
              {!showFaceReg ? (
                <button
                  type="button"
                  onClick={() => setShowFaceReg(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-[#10B981] text-[#10B981] rounded-md text-sm font-medium hover:bg-green-50 transition-colors"
                >
                  <ScanFace className="w-4 h-4" />
                  <span>Register Face Data</span>
                </button>
              ) : (
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-sm text-gray-900">Scan Your Face</h4>
                    <button 
                      type="button" 
                      onClick={() => setShowFaceReg(false)}
                      className="text-gray-400 hover:text-gray-600 text-xs font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                  <FaceAuth mode="register" onCapture={handleFaceCapture} />
                </div>
              )}
            </div>

            <div className="flex justify-end pt-6 mt-8 border-t border-gray-100">
              <button
                type="button"
                className="px-6 py-2 bg-[#10B981] text-white rounded-md text-sm font-medium hover:bg-[#059669] transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
