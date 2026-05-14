import { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Upload, Map, Users, Award, Truck, ShieldCheck, Camera, Bell, Settings, Leaf, ChevronLeft, ChevronRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import clsx from 'clsx';

const Sidebar = ({ mobile }) => {
  const { user } = useContext(AuthContext);
  const [expanded, setExpanded] = useState(true);

  const adminLinks = [
    { name: 'Dashboard', icon: Home, path: '/dashboard' },
    { name: 'Requests', icon: ShieldCheck, path: '/requests' },
    { name: 'Heatmap', icon: Map, path: '/heatmap' },
    { name: 'Workers', icon: Users, path: '/workers' },
    { name: 'Rankings', icon: Award, path: '/rankings' },
    { name: 'Waste Trucks', icon: Truck, path: '/pickups' },
  ];

  const societyLinks = [
    { name: 'Dashboard', icon: Home, path: '/dashboard' },
    { name: 'Upload', icon: Upload, path: '/upload' },
    { name: 'Heatmap', icon: Map, path: '/heatmap' },
    { name: 'Waste Trucks', icon: Truck, path: '/pickups' },
    { name: 'Recycle', icon: Leaf, path: '/recycle' },
    { name: 'Rankings', icon: Award, path: '/rankings' },
  ];

  const workerLinks = [
    { name: 'Dashboard', icon: Home, path: '/dashboard' },
    { name: 'Rankings', icon: Award, path: '/rankings' },
  ];

  const recyclerLinks = [
    { name: 'Dashboard', icon: Home, path: '/recycler-dashboard' }
  ];

  const publicLinks = [
    { name: 'Dashboard', icon: Home, path: '/dashboard' },
    { name: 'Report', icon: Camera, path: '/complaint' },
    { name: 'Recycle', icon: Leaf, path: '/recycle' },
    { name: 'Rankings', icon: Award, path: '/rankings' },
  ];

  let links = [];
  if (user?.role === 'admin') links = adminLinks;
  else if (user?.role === 'society_head') links = societyLinks;
  else if (user?.role === 'worker') links = workerLinks;
  else if (user?.role === 'recycler') links = recyclerLinks;
  else if (user?.role === 'public') links = publicLinks;

  if (mobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
        <ul className="flex items-center justify-around px-2 py-3">
          {links.slice(0, 5).map((link) => (
            <li key={link.name} className="flex-1">
              <NavLink
                to={link.path}
                className={({ isActive }) => clsx(
                  'flex flex-col items-center justify-center space-y-1 w-full transition-colors',
                  isActive ? 'text-[#10B981]' : 'text-gray-500'
                )}
              >
                <link.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium truncate w-full text-center">{link.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  return (
    <aside className={clsx(
      "bg-[#0F1117] text-white transition-all duration-300 flex flex-col h-full border-r border-gray-800 relative",
      expanded ? "w-[240px]" : "w-[64px]"
    )}>
      {/* Toggle button */}
      <button 
        onClick={() => setExpanded(!expanded)}
        className="absolute -right-3 top-6 bg-gray-800 text-white rounded-full p-1 border border-gray-700 hover:bg-gray-700 z-10"
      >
        {expanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      <div className="h-16 flex items-center px-4 border-b border-gray-800">
        <Leaf className="w-6 h-6 text-[#10B981] flex-shrink-0" />
        {expanded && <span className="ml-3 font-semibold text-lg whitespace-nowrap">SmartWasteX</span>}
      </div>

      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden hide-scrollbar">
        <ul className="space-y-1 px-2">
          {links.map((link) => (
            <li key={link.name}>
              <NavLink
                to={link.path}
                className={({ isActive }) => clsx(
                  'flex items-center px-2 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive 
                    ? 'bg-gray-800/50 text-white border-l-2 border-[#10B981]' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/30 border-l-2 border-transparent'
                )}
                title={!expanded ? link.name : undefined}
              >
                <link.icon className="w-5 h-5 flex-shrink-0" />
                {expanded && <span className="ml-3 whitespace-nowrap">{link.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mt-8 px-2 space-y-1">
          <NavLink
            to="/notifications"
            className={({ isActive }) => clsx(
              'flex items-center px-2 py-2 rounded-md text-sm font-medium transition-colors',
              isActive 
                ? 'bg-gray-800/50 text-white border-l-2 border-[#10B981]' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800/30 border-l-2 border-transparent'
            )}
            title={!expanded ? "Notifications" : undefined}
          >
            <Bell className="w-5 h-5 flex-shrink-0" />
            {expanded && <span className="ml-3 whitespace-nowrap">Notifications</span>}
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) => clsx(
              'flex items-center px-2 py-2 rounded-md text-sm font-medium transition-colors',
              isActive 
                ? 'bg-gray-800/50 text-white border-l-2 border-[#10B981]' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800/30 border-l-2 border-transparent'
            )}
            title={!expanded ? "Settings" : undefined}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {expanded && <span className="ml-3 whitespace-nowrap">Settings</span>}
          </NavLink>
        </div>
      </nav>

      {/* Footer User Info */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center text-gray-300 flex-shrink-0 uppercase text-sm font-bold border border-gray-700">
            {user?.name?.charAt(0) || 'U'}
          </div>
          {expanded && (
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize truncate">{user?.role?.replace('_', ' ')}</p>
            </div>
          )}
        </div>
        {expanded && (
          <div className="mt-4 text-xs text-gray-400">
            Built by Antigravity
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
