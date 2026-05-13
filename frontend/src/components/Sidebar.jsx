import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Upload, Map, Users, Award, Truck, ShieldCheck, Camera, Bell, Settings, X, Leaf, DollarSign } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import clsx from 'clsx';

const Sidebar = ({ mobile }) => {
  const { user } = useContext(AuthContext);

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
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-gray-200 dark:border-gray-800 pb-safe z-50">
        <ul className="flex items-center justify-around px-2 py-3">
          {links.slice(0, 5).map((link) => (
            <li key={link.name} className="flex-1">
              <NavLink
                to={link.path}
                className={({ isActive }) => clsx(
                  'flex flex-col items-center justify-center space-y-1 w-full transition-all duration-200',
                  isActive 
                    ? 'text-primary transform scale-110' 
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                )}
              >
                <link.icon className="w-6 h-6" />
                <span className="text-[10px] font-medium truncate w-full text-center">{link.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  return (
    <aside className="w-64 glass dark:bg-gray-900/60 shadow-xl flex flex-col h-full border-r border-gray-100 dark:border-gray-800">
      <div className="h-20 flex items-center px-6 font-black text-2xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
        SmartWasteX
      </div>
      <nav className="flex-1 py-6 overflow-y-auto px-4">
        <div className="mb-4 text-xs font-bold text-gray-400 uppercase tracking-widest px-2">
          Main Menu
        </div>
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.name}>
              <NavLink
                to={link.path}
                className={({ isActive }) => clsx(
                  'flex items-center px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300',
                  isActive 
                    ? 'bg-gradient-to-r from-primary/10 to-blue-500/10 text-primary shadow-sm border border-primary/20 dark:border-primary/30 dark:text-primary dark:bg-primary/20' 
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white hover:translate-x-1'
                )}
              >
                <link.icon className={clsx("w-5 h-5 mr-3 transition-colors", window.location.pathname === link.path ? 'text-primary' : 'text-gray-400')} />
                {link.name}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mb-4 mt-10 text-xs font-bold text-gray-400 uppercase tracking-widest px-2">
          Settings
        </div>
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/notifications"
              className={({ isActive }) => clsx(
                'flex items-center px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300',
                isActive 
                  ? 'bg-gradient-to-r from-primary/10 to-blue-500/10 text-primary shadow-sm border border-primary/20' 
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white hover:translate-x-1'
              )}
            >
              <Bell className={clsx("w-5 h-5 mr-3 transition-colors", window.location.pathname === '/notifications' ? 'text-primary' : 'text-gray-400')} />
              Notifications
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/settings"
              className={({ isActive }) => clsx(
                'flex items-center px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300',
                isActive 
                  ? 'bg-gradient-to-r from-primary/10 to-blue-500/10 text-primary shadow-sm border border-primary/20' 
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white hover:translate-x-1'
              )}
            >
              <Settings className={clsx("w-5 h-5 mr-3 transition-colors", window.location.pathname === '/settings' ? 'text-primary' : 'text-gray-400')} />
              Settings
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
