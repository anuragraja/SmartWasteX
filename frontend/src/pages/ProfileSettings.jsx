import { useContext, useState } from 'react';
import { motion } from 'framer-motion';
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Profile Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account details and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-1"
        >
          <div className="glass p-8 rounded-3xl flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 w-full h-32 bg-gradient-to-r from-primary to-blue-500"></div>
            
            <div className="relative mt-12 mb-4">
              <div className="w-24 h-24 bg-white p-1 rounded-full shadow-lg">
                <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-gray-400" />
                </div>
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-primary hover:bg-gray-50">
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-sm font-medium text-primary mt-1 capitalize bg-green-50 px-3 py-1 rounded-full">
              {user.role.replace('_', ' ')}
            </p>

            <div className="w-full mt-8 pt-6 border-t border-gray-100 space-y-4">
              <div className="flex items-center text-sm text-gray-600 text-left">
                <Mail className="w-4 h-4 mr-3 text-gray-400" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600 text-left">
                <Shield className="w-4 h-4 mr-3 text-gray-400" />
                <span>Account Status: <strong className={user.isApproved ? "text-green-500" : "text-yellow-500"}>{user.isApproved ? 'Active' : 'Pending'}</strong></span>
              </div>
              {user.area && (
                <div className="flex items-center text-sm text-gray-600 text-left">
                  <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                  <span>{user.area}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Column - Edit Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-2 glass p-8 rounded-3xl"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-6">Personal Information</h3>
          
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  defaultValue={user.name}
                  className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-white/50"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  defaultValue={user.email}
                  disabled
                  className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-800 mt-8 mb-6 pt-6 border-t border-gray-100">Face Recognition</h3>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Register your face data to enable fast, secure logins without a password.
              </p>
              
              {!showFaceReg ? (
                <button
                  type="button"
                  onClick={() => setShowFaceReg(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-white border-2 border-green-500 text-green-600 rounded-xl font-bold hover:bg-green-50 transition-colors"
                >
                  <ScanFace className="w-5 h-5" />
                  <span>Register Face Data</span>
                </button>
              ) : (
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-gray-800">Scan Your Face</h4>
                    <button 
                      type="button" 
                      onClick={() => setShowFaceReg(false)}
                      className="text-gray-400 hover:text-gray-600 text-sm"
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
                className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-green-600 shadow-md shadow-green-200 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileSettings;
