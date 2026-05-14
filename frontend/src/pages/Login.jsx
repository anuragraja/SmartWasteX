import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Lock, Mail, Eye, EyeOff, ScanFace } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import FaceAuth from '../components/FaceAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [useFace, setUseFace] = useState(false);

  const navigate = useNavigate();
  const { login, loginFace } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFaceLogin = async (descriptor) => {
    if (!email) {
       toast.error('Please enter your email first to use face login.');
       return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await loginFace(email, descriptor);
      toast.success(`Face match successful! Welcome, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || 'Face login failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#10B981] rounded-xl flex items-center justify-center mb-4">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Log in to SmartWasteX</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-md mb-6 text-sm">
              {error}
            </div>
          )}

          <div className="flex bg-[#F9FAFB] p-1 rounded-md mb-6 border border-gray-200">
            <button
              onClick={() => setUseFace(false)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded transition-colors ${!useFace ? 'bg-white shadow-sm border border-gray-200 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Password
            </button>
            <button
              onClick={() => setUseFace(true)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded transition-colors flex items-center justify-center space-x-1.5 ${useFace ? 'bg-white shadow-sm border border-gray-200 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <ScanFace className="w-3.5 h-3.5" />
              <span>Face ID</span>
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] transition-colors text-sm"
                placeholder="you@example.com"
                required
              />
            </div>

            {!useFace ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Password</label>
                    <a href="#" className="text-xs font-medium text-[#10B981] hover:text-[#059669]">Forgot?</a>
                  </div>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] transition-colors text-sm pr-10"
                      placeholder="••••••••"
                      required={!useFace}
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-[#10B981] text-white rounded-md font-medium text-sm hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-3 text-center">Ensure your face is well-lit and directly facing the camera.</p>
                <FaceAuth mode="login" onCapture={handleFaceLogin} />
              </div>
            )}
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-[#10B981] hover:text-[#059669]">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
