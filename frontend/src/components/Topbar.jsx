import api from "@/config/api";
import { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, User, LogOut, Menu, Moon, Sun, Settings, ChevronDown } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import axios from 'axios';

const Topbar = () => {
  const { user, logout, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
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
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (user && token) {
      // Fetch initial notifications
      api.get(`/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        const unread = res.data.data.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      }).catch(console.error);

      // Connect Socket
      const socket = io(import.meta.env.VITE_API_URL);
      socket.emit('join', user.id);

      socket.on('newNotification', (notification) => {
        setUnreadCount(prev => prev + 1);
        toast(notification.message, {
          icon: notification.type === 'Task' ? '🚧' : '🔔',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
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

  return (
    <header className="h-16 bg-white/70 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 z-10 sticky top-0 transition-colors">
      <div className="flex items-center md:hidden font-black text-xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
        SmartWasteX
      </div>
      <div className="hidden md:block">
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">Dashboard</h2>
      </div>
      <div className="flex items-center space-x-5">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 text-gray-500 hover:text-primary transition-colors"
        >
          {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>
        <Link to="/notifications" className="p-2 text-gray-500 hover:text-primary transition-colors relative">
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white">
              {unreadCount}
            </span>
          )}
        </Link>
        <div className="relative border-l pl-5 border-gray-200 dark:border-gray-700" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-3 focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-green-600 flex items-center justify-center text-white shadow-md shadow-green-200 dark:shadow-none">
              <User className="w-5 h-5" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in-95">
              <div className="p-2">
                <Link 
                  to="/settings" 
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4 mr-3 text-gray-400" />
                  Profile Settings
                </Link>
                <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
                <button 
                  onClick={handleLogout} 
                  className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
