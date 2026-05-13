import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Shield, User, MapPin, FileText, Check, Clock } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AccountRequests = () => {
  const { token } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [kycRequests, setKycRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const [resReq, resKyc] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/requests', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/kyc/all', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setRequests(resReq.data.data);
      setKycRequests(resKyc.data.data);
    } catch (err) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, action) => {
    try {
      await axios.post(`http://localhost:5000/api/admin/requests/${id}`, { action }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Request ${action}d successfully`);
      fetchRequests();
    } catch (err) {
      toast.error(`Failed to ${action} request`);
    }
  };

  const handleKycAction = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/kyc/${id}/verify`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`KYC ${status} successfully`);
      fetchRequests();
    } catch (err) {
      toast.error(`Failed to ${status} KYC`);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Account & KYC Approval Queue</h1>
          <p className="text-gray-500 text-sm mt-1">Review and manage access and documents for Workers and Society Heads.</p>
        </div>
        <div className="flex p-1 bg-gray-100 rounded-xl">
          <button 
            onClick={() => setActiveTab('login')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'login' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Login Requests
          </button>
          <button 
            onClick={() => setActiveTab('kyc')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'kyc' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            KYC Requests
          </button>
        </div>
      </div>

      {activeTab === 'login' ? (
        requests.length === 0 ? (
          <div className="glass p-12 rounded-3xl flex flex-col items-center text-center opacity-70">
            <Shield className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">No Login Requests</h3>
            <p className="text-gray-400">All account login requests have been processed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
            {requests.map((req, index) => (
              <motion.div
                key={req._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="glass p-6 rounded-3xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
                
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-sm">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{req.name}</h3>
                    <p className="text-sm text-gray-500">{req.email}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-8 bg-white/50 p-4 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Role</span>
                    <span className="text-sm font-bold text-primary capitalize bg-green-50 px-3 py-1 rounded-full">
                      {req.role.replace('_', ' ')}
                    </span>
                  </div>
                  {req.area && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Area Assigned</span>
                      <span className="text-sm font-medium text-gray-800 flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" /> {req.area}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Status</span>
                    <span className={`text-sm font-bold capitalize px-3 py-1 rounded-full ${req.status === 'Pending' ? 'bg-yellow-50 text-yellow-600' : req.status === 'Approved' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {req.status}
                    </span>
                  </div>
                </div>

                {req.status === 'Pending' && (
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => handleAction(req._id, 'reject')}
                      className="flex-1 flex justify-center items-center py-3 bg-white border-2 border-red-100 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-colors"
                    >
                      <XCircle className="w-5 h-5 mr-2" /> Reject
                    </button>
                    <button 
                      onClick={() => handleAction(req._id, 'approve')}
                      className="flex-1 flex justify-center items-center py-3 bg-gradient-to-r from-primary to-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" /> Approve
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        )
      ) : (
        kycRequests.length === 0 ? (
          <div className="glass p-12 rounded-3xl flex flex-col items-center text-center opacity-70">
            <Shield className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">No KYC Requests</h3>
            <p className="text-gray-400">All KYC requests have been processed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
            {kycRequests.map((req, index) => (
              <motion.div
                key={req._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="glass p-6 rounded-3xl relative overflow-hidden flex flex-col"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full" />
                
                <div className="flex items-center space-x-4 mb-6">
                  <img src={req.profilePhotoUrl || 'https://via.placeholder.com/150'} alt="Profile" className="w-14 h-14 rounded-full object-cover shadow-sm border border-gray-200" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{req.fullName}</h3>
                    <p className="text-sm text-gray-500">{req.user?.email || 'N/A'}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6 bg-white/50 p-4 rounded-2xl flex-grow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Role</span>
                    <span className="text-sm font-bold text-blue-600 capitalize bg-blue-50 px-3 py-1 rounded-full">
                      {req.role?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Aadhaar</span>
                    <span className="text-sm font-medium text-gray-800">{req.aadhaarNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Mobile</span>
                    <span className="text-sm font-medium text-gray-800">{req.mobile}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Status</span>
                    <span className={`text-sm font-bold capitalize px-3 py-1 rounded-full ${req.status === 'pending' ? 'bg-yellow-50 text-yellow-600' : req.status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {req.status}
                    </span>
                  </div>
                </div>

                <div className="mb-6 flex gap-2">
                  <a href={req.documentUrl} target="_blank" rel="noreferrer" className="flex-1 flex justify-center items-center py-2 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors text-sm">
                    <FileText className="w-4 h-4 mr-2" /> View Doc
                  </a>
                </div>

                {req.status === 'pending' && (
                  <div className="flex space-x-3 mt-auto">
                    <button 
                      onClick={() => handleKycAction(req._id, 'rejected')}
                      className="flex-1 flex justify-center items-center py-3 bg-white border-2 border-red-100 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-colors"
                    >
                      <XCircle className="w-5 h-5 mr-2" /> Reject
                    </button>
                    <button 
                      onClick={() => handleKycAction(req._id, 'approved')}
                      className="flex-1 flex justify-center items-center py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" /> Approve
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        )
      )}
    </div>
  );
};

export default AccountRequests;
