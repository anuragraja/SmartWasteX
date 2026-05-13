import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Trash2, AlertCircle, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Notifications = () => {
  const { token } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data.data);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'Alert': return <AlertCircle className="w-6 h-6 text-red-500" />;
      case 'Task': return <Check className="w-6 h-6 text-blue-500" />;
      case 'Approval': return <ShieldCheck className="w-6 h-6 text-green-500" />;
      default: return <Bell className="w-6 h-6 text-gray-500" />;
    }
  };

  const getBgColor = (type, isRead) => {
    if (isRead) return 'bg-gray-50';
    switch(type) {
      case 'Alert': return 'bg-red-50/50';
      case 'Task': return 'bg-blue-50/50';
      case 'Approval': return 'bg-green-50/50';
      default: return 'bg-white';
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Notifications</h1>
          <p className="text-gray-500 text-sm mt-1">Stay updated on alerts, tasks, and system messages.</p>
        </div>
      </div>

      <div className="glass rounded-3xl overflow-hidden shadow-lg border border-gray-100">
        {notifications.length === 0 ? (
          <div className="p-16 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-700">All caught up!</h3>
            <p className="text-gray-500">You don't have any notifications right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification, idx) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-6 flex items-start space-x-4 transition-colors ${getBgColor(notification.type, notification.isRead)} hover:bg-gray-50`}
                onClick={() => !notification.isRead && markAsRead(notification._id)}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${notification.isRead ? 'bg-gray-100 opacity-60' : 'bg-white shadow-sm'}`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className={`text-base font-bold ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                      {notification.title}
                    </h4>
                    <span className="text-xs text-gray-400 font-medium whitespace-nowrap ml-4">
                      {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p className={`mt-1 text-sm ${notification.isRead ? 'text-gray-500' : 'text-gray-700 font-medium'}`}>
                    {notification.message}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="w-3 h-3 bg-primary rounded-full mt-2 flex-shrink-0 shadow-sm shadow-green-200"></div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
