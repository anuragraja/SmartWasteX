import api from "@/config/api";
import { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Bell, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const Topbar = () => {
  const { user, logout, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user && token) {
      api.get(`/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        const unread = res.data.data.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      }).catch(console.error);

      const socket = io(import.meta.env.VITE_API_URL);
      socket.emit('join', user.id);

      socket.on('newNotification', (notification) => {
        setUnreadCount(prev => prev + 1);
        toast(notification.message, {
          icon: notification.type === 'Task' ? '🚧' : '🔔',
          style: {
            borderRadius: '4px',
            background: '#fff',
            color: '#111827',
            border: '1px solid #E5E7EB'
          },
        });
      });

      return () => socket.disconnect();
    }
  }, [user, token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Convert pathname to title
  const getPageTitle = () => {
    const path = location.pathname.split('/')[1] || 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">{getPageTitle()}</h2>
      </div>
      
      <div className="flex items-center space-x-6">
        <Link to="/notifications" className="relative text-gray-500 hover:text-gray-900 transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </Link>

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 focus:outline-none group"
          >
            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-600 border border-gray-200 uppercase text-sm font-semibold group-hover:border-gray-300 transition-colors">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-sm border border-gray-200 py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-100 mb-1">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
              <Link 
                to="/settings" 
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Settings className="w-4 h-4 mr-2 text-gray-400" />
                Settings
              </Link>
              <button 
                onClick={handleLogout} 
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;

