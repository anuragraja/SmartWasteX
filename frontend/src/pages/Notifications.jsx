import api from "@/config/api";
import { useState, useEffect, useContext } from 'react';
import { Bell, Check, AlertCircle, ShieldCheck } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Notifications = () => {
  const { token } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get(`/api/notifications`, {
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
      await api.put(`/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'Alert': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'Task': return <Check className="w-5 h-5 text-blue-500" />;
      case 'Approval': return <ShieldCheck className="w-5 h-5 text-green-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#10B981]"></div></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">Stay updated on alerts, tasks, and system messages.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
        {notifications.length === 0 ? (
          <div className="p-16 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
              <Bell className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-base font-bold text-gray-900">All caught up!</h3>
            <p className="text-sm text-gray-500 mt-1">You don't have any notifications right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-5 flex items-start space-x-4 transition-colors cursor-pointer ${notification.isRead ? 'bg-white' : 'bg-blue-50/30'} hover:bg-gray-50`}
                onClick={() => !notification.isRead && markAsRead(notification._id)}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notification.isRead ? 'bg-gray-50' : 'bg-white shadow-sm border border-gray-100'}`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className={`text-sm font-bold ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                      {notification.title}
                    </h4>
                    <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap ml-4">
                      {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p className={`mt-1 text-xs ${notification.isRead ? 'text-gray-500' : 'text-gray-700 font-medium'}`}>
                    {notification.message}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-[#10B981] rounded-full mt-1.5 flex-shrink-0"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
