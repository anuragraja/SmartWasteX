import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-green-200">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900">SmartWasteX</h1>
          <p className="text-gray-500 mt-1 text-sm">AI-Powered Waste Management</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome back 👋</h2>
          <p className="text-gray-500 text-sm mb-6">Sign in to your account to continue</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm flex items-start">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          )}

          <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            <button
              onClick={() => setUseFace(false)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${!useFace ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Password
            </button>
            <button
              onClick={() => setUseFace(true)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center space-x-2 ${useFace ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <ScanFace className="w-4 h-4" />
              <span>Face ID</span>
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 transition-all text-sm"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!useFace ? (
                <motion.div
                  key="password-input"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        className="block w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 transition-all text-sm"
                        placeholder="••••••••"
                        required={!useFace}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 text-green-500 rounded border-gray-300" />
                      <span className="ml-2 text-gray-600">Remember me</span>
                    </label>
                    <a href="#" className="font-semibold text-green-600 hover:text-green-700">Forgot password?</a>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-200 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Signing in...
                      </span>
                    ) : 'Sign In →'}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="face-input"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  <p className="text-xs text-gray-500 mb-3 text-center">Ensure your face is well-lit and directly facing the camera.</p>
                  <FaceAuth mode="login" onCapture={handleFaceLogin} />
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-green-600 hover:text-green-700">Create one →</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
