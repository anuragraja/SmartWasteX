import api from "@/config/api";
import { useState, useEffect, useContext } from 'react';
import { CheckCircle, XCircle, Shield, User, MapPin, FileText } from 'lucide-react';
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
        api.get(`/api/admin/requests`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.get(`/api/kyc/all`, {
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
      await api.post(`/api/admin/requests/${id}`, { action }, {
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
      await api.put(`/api/kyc/${id}/verify`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`KYC ${status} successfully`);
      fetchRequests();
    } catch (err) {
      toast.error(`Failed to ${status} KYC`);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#10B981]"></div></div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Account & KYC Queue</h1>
          <p className="text-sm text-gray-500 mt-1">Review and manage access and documents.</p>
        </div>
        <div className="flex p-1 bg-gray-100 rounded-lg border border-gray-200">
          <button 
            onClick={() => setActiveTab('login')}
            className={`px-4 py-1.5 rounded-md font-medium text-sm transition-all ${activeTab === 'login' ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Login Requests
          </button>
          <button 
            onClick={() => setActiveTab('kyc')}
            className={`px-4 py-1.5 rounded-md font-medium text-sm transition-all ${activeTab === 'kyc' ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
          >
            KYC Requests
          </button>
        </div>
      </div>

      {activeTab === 'login' ? (
        requests.length === 0 ? (
          <div className="bg-white border border-gray-200 p-12 rounded-xl flex flex-col items-center text-center shadow-sm">
            <Shield className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-base font-bold text-gray-900 mb-1">No Login Requests</h3>
            <p className="text-sm text-gray-500">All account login requests have been processed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((req) => (
              <div
                key={req._id}
                className="bg-white border border-gray-200 p-5 rounded-xl flex flex-col shadow-sm"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{req.name}</h3>
                    <p className="text-xs text-gray-500">{req.email}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-6 flex-grow">
                  <div className="flex items-center justify-between py-1 border-b border-gray-50">
                    <span className="text-xs text-gray-500 font-medium">Role</span>
                    <span className="text-[10px] font-bold text-gray-700 uppercase bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                      {req.role.replace('_', ' ')}
                    </span>
                  </div>
                  {req.area && (
                    <div className="flex items-center justify-between py-1 border-b border-gray-50">
                      <span className="text-xs text-gray-500 font-medium">Area Assigned</span>
                      <span className="text-xs font-medium text-gray-800 flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" /> {req.area}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-1">
                    <span className="text-xs text-gray-500 font-medium">Status</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${req.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : req.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                      {req.status}
                    </span>
                  </div>
                </div>

                {req.status === 'Pending' && (
                  <div className="flex space-x-2 mt-auto pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => handleAction(req._id, 'reject')}
                      className="flex-1 flex justify-center items-center py-2 bg-white border border-red-200 text-red-600 rounded-md text-xs font-bold hover:bg-red-50 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1.5" /> Reject
                    </button>
                    <button 
                      onClick={() => handleAction(req._id, 'approve')}
                      className="flex-1 flex justify-center items-center py-2 bg-[#10B981] text-white rounded-md text-xs font-bold hover:bg-[#059669] transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Approve
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        kycRequests.length === 0 ? (
          <div className="bg-white border border-gray-200 p-12 rounded-xl flex flex-col items-center text-center shadow-sm">
            <Shield className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-base font-bold text-gray-900 mb-1">No KYC Requests</h3>
            <p className="text-sm text-gray-500">All KYC requests have been processed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kycRequests.map((req) => (
              <div
                key={req._id}
                className="bg-white border border-gray-200 p-5 rounded-xl flex flex-col shadow-sm"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <img src={req.profilePhotoUrl || 'https://via.placeholder.com/150'} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{req.fullName}</h3>
                    <p className="text-xs text-gray-500">{req.user?.email || 'N/A'}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4 flex-grow">
                  <div className="flex items-center justify-between py-1 border-b border-gray-50">
                    <span className="text-xs text-gray-500 font-medium">Role</span>
                    <span className="text-[10px] font-bold text-gray-700 uppercase bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                      {req.role?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-gray-50">
                    <span className="text-xs text-gray-500 font-medium">Aadhaar</span>
                    <span className="text-xs font-medium text-gray-900">{req.aadhaarNumber}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-gray-50">
                    <span className="text-xs text-gray-500 font-medium">Mobile</span>
                    <span className="text-xs font-medium text-gray-900">{req.mobile}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-xs text-gray-500 font-medium">Status</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${req.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : req.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                      {req.status}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <a href={req.documentUrl} target="_blank" rel="noreferrer" className="flex justify-center items-center py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-100 transition-colors">
                    <FileText className="w-3.5 h-3.5 mr-1.5 text-gray-500" /> View Document
                  </a>
                </div>

                {req.status === 'pending' && (
                  <div className="flex space-x-2 mt-auto pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => handleKycAction(req._id, 'rejected')}
                      className="flex-1 flex justify-center items-center py-2 bg-white border border-red-200 text-red-600 rounded-md text-xs font-bold hover:bg-red-50 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1.5" /> Reject
                    </button>
                    <button 
                      onClick={() => handleKycAction(req._id, 'approved')}
                      className="flex-1 flex justify-center items-center py-2 bg-blue-600 text-white rounded-md text-xs font-bold hover:bg-blue-700 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Approve
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default AccountRequests;
