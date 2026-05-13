import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';
import { Activity, AlertTriangle, CheckCircle, Clock, Trash2, MapPin, Map as MapIcon, Users, Navigation, Camera, Award, Database } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

// Mock Data for Charts
const mockData = [
  { name: 'Mon', complaints: 40, overflows: 2 },
  { name: 'Tue', complaints: 30, overflows: 1 },
  { name: 'Wed', complaints: 55, overflows: 4 },
  { name: 'Thu', complaints: 45, overflows: 3 },
  { name: 'Fri', complaints: 60, overflows: 5 },
  { name: 'Sat', complaints: 35, overflows: 2 },
  { name: 'Sun', complaints: 42, overflows: 2 },
];

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
  <GlassCard className="flex items-center justify-between" delay={delay}>
    <div>
      <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-3xl font-black text-gray-800 dark:text-white">{value}</h3>
    </div>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${color}`}>
      <Icon className="w-7 h-7 text-white" />
    </div>
  </GlassCard>
);

const AdminDashboard = ({ reports }) => (
  <div className="space-y-6">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">Admin Control Center</h1>
        <p className="text-gray-500 mt-1">Platform overview and AI insights</p>
      </div>
      <div className="flex space-x-3 w-full md:w-auto">
        <Link to="/requests" className="flex-1 md:flex-none">
          <AnimatedButton variant="secondary" className="w-full">Pending Approvals</AnimatedButton>
        </Link>
        <AnimatedButton variant="primary" className="flex-1 md:flex-none">Download Report</AnimatedButton>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Total Complaints" value="1,284" icon={Trash2} color="bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/40" />
      <StatCard title="Resolved Issues" value="1,092" icon={CheckCircle} color="bg-gradient-to-br from-primary to-green-600 shadow-green-500/40" />
      <StatCard title="Active Workers" value="45" icon={Users} color="bg-gradient-to-br from-purple-400 to-purple-600 shadow-purple-500/40" />
      <StatCard title="AI Emergencies" value={reports?.filter(r => r.status === 'Overflow').length || 12} icon={AlertTriangle} color="bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/40" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <GlassCard className="lg:col-span-2 min-h-[400px]">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Complaint Volume & Overflows</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorOverflows" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} />
              <Legend />
              <Area type="monotone" dataKey="complaints" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorComplaints)" />
              <Area type="monotone" dataKey="overflows" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorOverflows)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard className="flex flex-col">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex justify-between items-center">
          Live Tracking Reports
          <Link to="/pickups" className="text-xs text-primary font-bold hover:underline">Control Tasks</Link>
        </h3>
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {reports?.length === 0 && <p className="text-sm text-gray-500">No reports generated yet.</p>}
          {reports?.slice(0, 10).map((report) => (
            <div key={report._id} className={`flex items-start space-x-4 p-4 rounded-2xl border ${report.status === 'Overflow' || report.status === 'Full' ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30' : 'bg-blue-50 border-blue-100'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${report.status === 'Overflow' || report.status === 'Full' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                {report.status === 'Overflow' ? <AlertTriangle className="w-5 h-5" /> : <Database className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-bold ${report.status === 'Overflow' || report.status === 'Full' ? 'text-red-900' : 'text-blue-900'}`}>AI Detect: {report.status}</p>
                <p className={`text-xs mt-1 ${report.status === 'Overflow' || report.status === 'Full' ? 'text-red-700' : 'text-blue-700'}`}>{report.area}</p>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-[10px] font-semibold text-gray-600 bg-white px-2 py-0.5 rounded shadow-sm">{report.quantity} kg Waste</p>
                  <p className="text-[10px] text-gray-500">{new Date(report.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  </div>
);

const SocietyDashboard = ({ complaints, rankings, user }) => {
  const myRank = rankings?.findIndex(r => r.area === user?.area) + 1;
  const myScore = rankings?.find(r => r.area === user?.area)?.score || 100;
  
  let grade = 'A+';
  if (myScore < 80) grade = 'A';
  if (myScore < 60) grade = 'B';
  if (myScore < 40) grade = 'C';
  if (myScore < 20) grade = 'D';

  return (
  <div className="space-y-6">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">Society Monitor</h1>
        <p className="text-gray-500 mt-1">Keep your area clean and green</p>
      </div>
      <Link to="/upload">
        <AnimatedButton variant="primary">
          <Trash2 className="w-5 h-5 mr-2 inline" /> Request Urgent Pickup
        </AnimatedButton>
      </Link>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Area Score" value={grade} icon={CheckCircle} color="bg-gradient-to-br from-green-400 to-green-600 shadow-green-500/40" />
      <StatCard title="Total Pickups" value={complaints?.filter(c => c.status === 'Resolved').length || 0} icon={Trash2} color="bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/40" />
      <StatCard title="Active Reports" value={complaints?.filter(c => c.status !== 'Resolved').length || 0} icon={AlertTriangle} color="bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-yellow-500/40" />
      <StatCard title="Area Rank" value={myRank > 0 ? `#${myRank}` : 'N/A'} icon={Award} color="bg-gradient-to-br from-purple-400 to-purple-600 shadow-purple-500/40" />
    </div>

    {/* Placeholder for Map and Worker Activity */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <GlassCard className="min-h-[300px] flex flex-col items-center justify-center text-center">
        <MapIcon className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Live Area Heatmap</h3>
        <p className="text-gray-500 mt-2 mb-6">Monitor pollution density in your sector.</p>
        <Link to="/heatmap">
          <AnimatedButton variant="secondary">View Heatmap</AnimatedButton>
        </Link>
      </GlassCard>

      <GlassCard className="min-h-[300px] flex flex-col max-h-[400px]">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Recent Area Activity</h3>
        <div className="space-y-4 overflow-y-auto pr-2 flex-1">
          {(!complaints || complaints.length === 0) ? (
             <p className="text-gray-500 text-center py-4">No recent activity.</p>
          ) : (
            complaints.map(comp => (
              <div key={comp._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${comp.status === 'Resolved' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                    {comp.status === 'Resolved' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-800 dark:text-white">{comp.title}</p>
                    <p className="text-xs text-gray-500">Status: {comp.status}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className="text-xs font-semibold text-gray-400">{new Date(comp.createdAt).toLocaleDateString()}</span>
                  <AnimatedButton 
                    variant="secondary" 
                    className="text-xs py-1 px-3"
                    onClick={() => {
                      let msg = `TRACKING REPORT\n\nTitle: ${comp.title}\nStatus: ${comp.status}\nArea: ${comp.area}\nPriority: ${comp.aiAnalysis?.priority || 'Normal'}`;
                      if (comp.assignedTask && comp.assignedTask.worker) {
                        msg += `\n\nAssigned Worker: ${comp.assignedTask.worker.name}`;
                        msg += `\nTask Status: ${comp.assignedTask.status}`;
                      } else {
                        msg += `\n\nWorker Allocation: Pending/Searching...`;
                      }
                      window.alert(msg);
                    }}
                  >
                    Track Report
                  </AnimatedButton>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  </div>
);
}

const WorkerDashboard = ({ tasks }) => {
  const { user } = useContext(AuthContext);
  const [isOnline, setIsOnline] = useState(user?.isOnline || false);

  const completeTask = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/tasks/${id}/status`, { status: 'Completed' }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Task Marked Complete');
      window.location.reload();
    } catch (err) {
      toast.error('Failed to complete task');
    }
  };

  const startTask = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/tasks/${id}/status`, { status: 'In Progress' }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Task Started');
      window.location.reload();
    } catch (err) {
      toast.error('Failed to start task');
    }
  };

  const toggleStatus = async () => {
    try {
      const res = await axios.put('http://localhost:5000/api/auth/status', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setIsOnline(res.data.data.isOnline);
      toast.success(res.data.data.isOnline ? 'You are now On Duty' : 'You are now Off Duty');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
  <div className="space-y-6">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">Worker Portal</h1>
        <p className="text-gray-500 mt-1">Your daily tasks and route</p>
      </div>
      <AnimatedButton onClick={toggleStatus} variant={isOnline ? "secondary" : "success"}>
        {isOnline ? 'End Shift' : 'Start Shift'}
      </AnimatedButton>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <StatCard title="Tasks Today" value={tasks?.length || 0} icon={Activity} color="bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/40" />
      <StatCard title="Completed" value={tasks?.filter(t => t.status === 'Completed').length || 0} icon={CheckCircle} color="bg-gradient-to-br from-green-400 to-green-600 shadow-green-500/40" />
      <StatCard title="Performance" value="94%" icon={Award} color="bg-gradient-to-br from-purple-400 to-purple-600 shadow-purple-500/40" />
    </div>

    <GlassCard>
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Assigned Tasks</h3>
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {(!tasks || tasks.length === 0) && (
          <p className="text-gray-500 text-center py-4">No tasks assigned to you right now.</p>
        )}
        {tasks?.map(task => (
          <div key={task._id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
            <div className="flex items-start space-x-4">
               <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                 {task.complaint?.image ? (
                   <img src={task.complaint.image} alt="Garbage" className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center bg-gray-200"><Trash2 className="w-5 h-5 text-gray-400" /></div>
                 )}
               </div>
               <div>
                 <div className="flex items-center gap-2 mb-1">
                   <span className={`px-2 py-1 text-[10px] font-black uppercase rounded-md tracking-wider ${
                     task.priority === 'Emergency' ? 'bg-red-100 text-red-700' :
                     task.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                     'bg-blue-100 text-blue-700'
                   }`}>{task.priority}</span>
                   <span className="px-2 py-1 bg-gray-100 text-gray-700 text-[10px] font-black uppercase rounded-md tracking-wider">{task.status}</span>
                 </div>
                 <h4 className="font-bold text-gray-900 dark:text-white">{task.title}</h4>
                 <p className="text-xs text-gray-500 mt-1 flex items-center"><MapPin className="w-3 h-3 mr-1" /> {task.area}</p>
                 <p className="text-xs text-gray-400 mt-1">{task.complaint?.description}</p>
               </div>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <button 
                onClick={() => trackTask(task)}
                className="flex-1 md:flex-none text-sm py-2 px-4 rounded-xl font-bold transition-all bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Details
              </button>
              <Link to="/heatmap" className="flex-1 md:flex-none">
                <AnimatedButton variant="secondary" className="w-full text-sm py-2">View Map</AnimatedButton>
              </Link>
              {task.status === 'Pending' && (
                <AnimatedButton onClick={() => startTask(task._id)} variant="primary" className="flex-1 md:flex-none text-sm py-2">Accept Task</AnimatedButton>
              )}
              {task.status === 'In Progress' && (
                <AnimatedButton onClick={() => completeTask(task._id)} variant="success" className="flex-1 md:flex-none text-sm py-2">Mark Complete</AnimatedButton>
              )}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  </div>
);
};

const PublicDashboard = ({ complaints }) => (
  <div className="space-y-6 max-w-5xl mx-auto">
    {/* Hero Section */}
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary to-blue-600 text-white p-8 md:p-12 shadow-2xl shadow-primary/20">
      <div className="relative z-10 max-w-lg">
        <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">Help keep our city clean.</h1>
        <p className="text-blue-50 text-lg mb-8">Report garbage, track cleanup trucks in real-time, and make your area a better place.</p>
        <Link to="/complaint">
          <AnimatedButton variant="secondary" className="bg-white text-primary border-none text-lg px-8 py-4 shadow-xl">
            <Camera className="w-6 h-6" /> Report Garbage Now
          </AnimatedButton>
        </Link>
      </div>
      {/* Decorative Circles */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 bg-blue-400 opacity-20 rounded-full blur-2xl"></div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <GlassCard className="flex flex-col items-center justify-center text-center py-10">
        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
          <Navigation className="w-10 h-10 text-blue-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Live Truck Tracking</h3>
        <p className="text-gray-500 px-6 mb-6">See where the nearest garbage truck is and its ETA to your location.</p>
        <Link to="/heatmap">
          <AnimatedButton variant="primary">Open Live Map</AnimatedButton>
        </Link>
      </GlassCard>

      <GlassCard className="flex flex-col max-h-[400px]">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Your Recent Reports</h3>
        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
          {(!complaints || complaints.length === 0) ? (
            <div className="flex flex-col items-center justify-center text-center text-gray-500 py-10">
              <CheckCircle className="w-16 h-16 text-gray-200 mb-4" />
              <p>You haven't reported any garbage yet.</p>
              <p className="text-sm mt-1">Thank you for keeping the city clean!</p>
            </div>
          ) : (
            complaints.map(comp => (
              <div 
                key={comp._id} 
                className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => {
                  let msg = `TRACKING REPORT\n\nTitle: ${comp.title}\nStatus: ${comp.status}\nArea: ${comp.area}\nPriority: ${comp.aiAnalysis?.priority || 'Normal'}`;
                  if (comp.assignedTask && comp.assignedTask.worker) {
                    msg += `\n\nAssigned Worker: ${comp.assignedTask.worker.name}`;
                    msg += `\nTask Status: ${comp.assignedTask.status}`;
                  } else {
                    msg += `\n\nWorker Allocation: Pending/Searching...`;
                  }
                  window.alert(msg);
                }}
              >
                <div>
                  <h4 className="font-bold text-sm text-gray-800 dark:text-white truncate max-w-[150px]">{comp.title}</h4>
                  <p className="text-xs text-gray-500 flex items-center mt-1"><MapPin className="w-3 h-3 mr-1" /> {comp.area}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                    comp.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                    comp.status === 'Assigned' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {comp.status}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-2 font-bold underline">Track Report</p>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [rankings, setRankings] = useState([]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      
      try {
        if (user?.role === 'admin' || user?.role === 'worker') {
          const wasteRes = await axios.get('http://localhost:5000/api/waste', { headers });
          setReports(wasteRes.data.data.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)));
        }
        
        if (user?.role === 'worker' || user?.role === 'admin') {
          const taskRes = await axios.get('http://localhost:5000/api/tasks', { headers });
          setTasks(taskRes.data.data);
        }

        if (user?.role === 'public' || user?.role === 'society_head') {
          const compRes = await axios.get('http://localhost:5000/api/complaints', { headers });
          setComplaints(compRes.data.data);
        }

        if (user?.role === 'society_head') {
          const rankRes = await axios.get('http://localhost:5000/api/analytics/rankings', { headers });
          setRankings(rankRes.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      }
    };
    if (user) fetchDashboardData();
  }, [user]);

  if (!user) return <div className="p-8 text-center"><p className="animate-pulse">Loading dashboard...</p></div>;

  return (
    <div className="animate-fade-in">
      {user.role === 'admin' && <AdminDashboard reports={reports} />}
      {user.role === 'society_head' && <SocietyDashboard complaints={complaints} rankings={rankings} user={user} />}
      {user.role === 'worker' && <WorkerDashboard tasks={tasks} />}
      {user.role === 'public' && <PublicDashboard complaints={complaints} />}
    </div>
  );
};

export default Dashboard;
