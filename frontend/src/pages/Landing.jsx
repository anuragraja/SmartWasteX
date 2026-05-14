import { Link } from 'react-router-dom';
import { Leaf, ShieldCheck, Map, Activity, ArrowRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#0F1117] text-white flex flex-col font-sans">
      <nav className="border-b border-gray-800 bg-[#0F1117]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Leaf className="w-6 h-6 text-[#10B981]" />
            <span className="font-bold text-xl tracking-tight">SmartWasteX</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Log in</Link>
            <Link to="/register" className="px-4 py-2 bg-white text-gray-900 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 mt-32 mb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-tight">
            Smart Waste. <br className="hidden sm:block" /> Cleaner Cities.
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto font-medium">
            Real-time monitoring, AI-based bin analysis, and optimized garbage collection for a sustainable future.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/register" className="px-8 py-3 bg-white text-gray-900 rounded-md text-base font-medium w-full sm:w-auto hover:bg-gray-100 transition-colors">
              Get Started
            </Link>
            <Link to="/about" className="px-8 py-3 bg-transparent border border-gray-700 text-white rounded-md text-base font-medium w-full sm:w-auto hover:bg-gray-800 transition-colors">
              Learn More
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-32 max-w-5xl mx-auto w-full text-left">
          <div>
            <Map className="w-8 h-8 text-[#10B981] mb-4" />
            <h3 className="text-lg font-bold mb-2">Live Heatmaps</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Monitor pollution levels across areas in real-time with interactive geospatial mapping.
            </p>
          </div>
          <div>
            <Activity className="w-8 h-8 text-[#10B981] mb-4" />
            <h3 className="text-lg font-bold mb-2">AI Analysis</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Automatically detect bin fill levels and categorize waste urgency from uploaded images.
            </p>
          </div>
          <div>
            <ShieldCheck className="w-8 h-8 text-[#10B981] mb-4" />
            <h3 className="text-lg font-bold mb-2">Smart Routes</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Assign pickups effectively and track worker efficiency for maximum cleanliness.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-800 py-12 bg-[#0F1117]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Leaf className="w-5 h-5 text-[#10B981]" />
              <span className="font-bold text-lg">SmartWasteX</span>
            </div>
            <p className="text-xs text-gray-500">Built by Antigravity</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
