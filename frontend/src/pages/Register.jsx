import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'public',
    area: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await register(formData);

      if (res.token) {
        toast.success('Account created! Welcome to SmartWasteX 🎉');
        navigate('/dashboard');
      } else {
        setSuccess(res.message || 'Registration request submitted! Awaiting Admin approval.');
        toast.success('Request sent to Admin for approval!');
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const roleLabels = {
    public: 'Public User (Citizen)',
    worker: 'Worker (Safai Karmachari)',
    society_head: 'Society Head / Sarpanch',
    recycler: 'Recycling Plant / Admin',
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#10B981] rounded-xl flex items-center justify-center mb-4">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-md mb-5 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-100 text-[#10B981] p-3 rounded-md mb-5 text-sm">
              {success}
              <div className="mt-2">
                <Link to="/login" className="font-medium underline">Go to Login</Link>
              </div>
            </div>
          )}

          {!success && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] transition-colors text-sm"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] transition-colors text-sm"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] transition-colors text-sm pr-10"
                    placeholder="Min 6 characters"
                    required
                    minLength="6"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Account Type</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] transition-colors text-sm bg-white"
                >
                  {Object.entries(roleLabels).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
                {(formData.role === 'worker' || formData.role === 'society_head' || formData.role === 'recycler') && (
                  <p className="text-[11px] text-gray-500 mt-1">
                    Requires Admin approval before login.
                  </p>
                )}
              </div>

              {(formData.role === 'society_head' || formData.role === 'worker') && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Assigned Area</label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] transition-colors text-sm"
                    placeholder="e.g. Anand Nagar, Sector 4"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 mt-4 bg-[#10B981] text-white rounded-md font-medium text-sm hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#10B981] hover:text-[#059669]">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
