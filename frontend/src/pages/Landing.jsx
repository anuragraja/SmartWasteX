import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, ShieldCheck, Map, Activity, ArrowRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200 to-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-60 h-60 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-40 right-1/4 w-40 h-40 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-20 animate-pulse animation-delay-4000"></div>
      </div>
      <nav className="bg-white/70 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <Leaf className="w-8 h-8 text-primary" />
              <span className="font-extrabold text-2xl text-gray-900 tracking-tight">SmartWasteX</span>
            </div>
            <div className="flex space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-primary font-medium px-3 py-2 transition-colors">Login</Link>
              <Link to="/register" className="bg-primary hover:bg-green-600 text-white px-4 py-2 rounded-full font-medium transition-colors shadow-lg shadow-green-200">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 mt-16 md:mt-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-green-100 text-green-800 text-sm font-semibold mb-6">
            AI-Powered Smart City Solution
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
            Smarter Waste Management <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">For Cleaner Cities</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-500 mb-10">
            Real-time monitoring, AI-based bin analysis, and optimized garbage collection for a sustainable, green future.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/register" className="w-full sm:w-auto bg-primary text-white text-lg px-8 py-4 rounded-full font-bold shadow-xl shadow-green-200 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center">
              Start Now <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link to="/login" className="w-full sm:w-auto bg-white text-gray-800 text-lg px-8 py-4 rounded-full font-bold shadow-md hover:bg-gray-50 transition-all border border-gray-200">
              Access Dashboard
            </Link>
          </div>
        </motion.div>

        {/* Features Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-6xl w-full pb-20"
        >
          <div className="glass p-8 rounded-3xl flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
            <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
              <Map className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">Live Heatmaps</h3>
            <p className="text-gray-500">Monitor pollution levels across areas in real-time with interactive geospatial mapping.</p>
          </div>
          <div className="glass p-8 rounded-3xl flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-2xl flex items-center justify-center mb-6">
              <Activity className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">AI Analysis</h3>
            <p className="text-gray-500">Automatically detect bin fill levels (Empty, Medium, Full, Overflow) from images.</p>
          </div>
          <div className="glass p-8 rounded-3xl flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
            <div className="w-16 h-16 bg-purple-100 text-purple-500 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">Smart Routes</h3>
            <p className="text-gray-500">Assign pickups effectively and track worker efficiency for maximum cleanliness.</p>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl w-full mb-20"
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">10K+</div>
            <div className="text-gray-500 text-sm">Complaints Resolved</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">500+</div>
            <div className="text-gray-500 text-sm">Active Workers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">50+</div>
            <div className="text-gray-500 text-sm">Cities Covered</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">98%</div>
            <div className="text-gray-500 text-sm">Accuracy Rate</div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Leaf className="w-8 h-8 text-primary" />
                <span className="font-extrabold text-2xl">SmartWasteX</span>
              </div>
              <p className="text-gray-400 text-sm">
                Revolutionizing waste management with AI-powered smart city solutions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            © 2024 SmartWasteX. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
