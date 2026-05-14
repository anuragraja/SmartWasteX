import api from "@/config/api";
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Activity, AlertTriangle, CheckCircle, Clock, Trash2, MapPin, Users, Navigation, Camera, Award, Database, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const mockData = [
  { name: 'Mon', complaints: 40, overflows: 12 },
  { name: 'Tue', complaints: 30, overflows: 8 },
  { name: 'Wed', complaints: 55, overflows: 15 },
  { name: 'Thu', complaints: 45, overflows: 10 },
  { name: 'Fri', complaints: 60, overflows: 20 },
  { name: 'Sat', complaints: 35, overflows: 5 },
  { name: 'Sun', complaints: 42, overflows: 7 },
];

const StatCard = ({ title, value, icon: Icon, borderClass, trend }) => (
  <div className={`bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between shadow-sm`}>
    <div className="flex justify-between items-start mb-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
      <Icon className={`w-5 h-5 ${borderClass.replace('border-', 'text-')}`} />
    </div>
    <div className="flex items-baseline space-x-2">
      <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
      {trend && <span className="text-xs font-medium text-[#10B981] flex items-center">↑ {trend}%</span>}
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  let color = 'bg-gray-500';
  let bg = 'bg-gray-100 border border-gray-200';
  if (status === 'Resolved' || status === 'Completed' || status === 'approved') {
    color = 'bg-[#10B981]';
    bg = 'bg-green-50 text-green-700 border border-green-200';
  } else if (status === 'In Progress' || status === 'Assigned') {
    color = 'bg-blue-500';
    bg = 'bg-blue-50 text-blue-700 border border-blue-200';
  } else if (status === 'Overflow' || status === 'Emergency' || status === 'rejected') {
    color = 'bg-red-500';
    bg = 'bg-red-50 text-red-700 border border-red-200';
  } else if (status === 'Pending' || status === 'pending') {
    color = 'bg-yellow-500';
    bg = 'bg-yellow-50 text-yellow-700 border border-yellow-200';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${bg}`}>
      {status}
    </span>
  );
};

const AdminDashboard = ({ reports }) => (
  <div className="space-y-6 max-w-7xl mx-auto pb-10">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Platform overview and AI insights</p>
      </div>
      <div className="flex space-x-3 w-full sm:w-auto">
        <Link to="/requests" className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
          Pending Approvals
        </Link>
        <button className="px-4 py-2 bg-[#10B981] text-white rounded-md text-sm font-medium hover:bg-[#059669] transition-colors">
          Download Report
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Total Complaints" value="1,284" icon={Trash2} borderClass="border-blue-500" trend="12" />
      <StatCard title="Resolved Issues" value="1,092" icon={CheckCircle} borderClass="border-[#10B981]" trend="8" />
      <StatCard title="Active Workers" value="45" icon={Users} borderClass="border-purple-500" />
      <StatCard title="AI Emergencies" value={reports?.filter(r => r.status === 'Overflow').length || 12} icon={AlertTriangle} borderClass="border-red-500" trend="3" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center"><BarChart2 className="w-4 h-4 mr-2" /> Complaint Volume</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{fill: '#F9FAFB'}} contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px' }} />
              <Bar dataKey="complaints" fill="#9CA3AF" radius={[4, 4, 0, 0]} />
              <Bar dataKey="overflows" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-gray-900">Recent AI Reports</h3>
          <Link to="/pickups" className="text-[10px] uppercase font-bold text-[#10B981] hover:underline tracking-wider">View All</Link>
        </div>
        <div className="flex-1 overflow-y-auto space-y-0 divide-y divide-gray-100 pr-2">
          {reports?.length === 0 && <p className="text-sm text-gray-500 py-4 text-center">No reports generated yet.</p>}
          {reports?.slice(0, 8).map((report) => (
            <div key={report._id} className="py-3 flex justify-between items-center hover:bg-[#F9FAFB] transition-colors -mx-4 px-4">
              <div>
                <p className="text-sm font-medium text-gray-900">{report.area}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{report.quantity} kg • {new Date(report.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              </div>
              <StatusBadge status={report.status} />
            </div>
          ))}
        </div>
      </div>
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
  <div className="space-y-6 max-w-7xl mx-auto pb-10">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Society Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Keep your area clean and green</p>
      </div>
      <Link to="/upload" className="px-4 py-2 bg-[#10B981] text-white rounded-md text-sm font-medium hover:bg-[#059669] transition-colors">
        Request Pickup
      </Link>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Area Score" value={grade} icon={CheckCircle} borderClass="border-[#10B981]" />
      <StatCard title="Total Pickups" value={complaints?.filter(c => c.status === 'Resolved').length || 0} icon={Trash2} borderClass="border-blue-500" />
      <StatCard title="Active Reports" value={complaints?.filter(c => c.status !== 'Resolved').length || 0} icon={AlertTriangle} borderClass="border-yellow-500" />
      <StatCard title="Area Rank" value={myRank > 0 ? `#${myRank}` : 'N/A'} icon={Award} borderClass="border-purple-500" />
    </div>

    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <h3 className="text-sm font-bold text-gray-900">Recent Area Activity</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(!complaints || complaints.length === 0) ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500 text-sm">No recent activity.</td></tr>
            ) : (
              complaints.map(comp => (
                <tr key={comp._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{comp.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(comp.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4"><StatusBadge status={comp.status} /></td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[10px] font-bold text-[#10B981] hover:text-[#059669] uppercase tracking-wider">Track</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
}

const WorkerDashboard = ({ tasks }) => {
  const { user } = useContext(AuthContext);
  const [isOnline, setIsOnline] = useState(user?.isOnline || false);

  const completeTask = async (id) => {
    try {
      await api.put(`/api/tasks/${id}/status`, { status: 'Completed' }, {
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
      await api.put(`/api/tasks/${id}/status`, { status: 'In Progress' }, {
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
      const res = await api.put(`/api/auth/status`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setIsOnline(res.data.data.isOnline);
      toast.success(res.data.data.isOnline ? 'You are now On Duty' : 'You are now Off Duty');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
  <div className="space-y-6 max-w-7xl mx-auto pb-10">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Worker Portal</h1>
        <p className="text-sm text-gray-500 mt-1">Your daily tasks and route</p>
      </div>
      <button 
        onClick={toggleStatus} 
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isOnline ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50' : 'bg-[#10B981] text-white hover:bg-[#059669]'}`}
      >
        {isOnline ? 'End Shift' : 'Start Shift'}
      </button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard title="Tasks Today" value={tasks?.length || 0} icon={Activity} borderClass="border-blue-500" />
      <StatCard title="Completed" value={tasks?.filter(t => t.status === 'Completed').length || 0} icon={CheckCircle} borderClass="border-[#10B981]" />
      <StatCard title="Performance" value="94%" icon={Award} borderClass="border-purple-500" />
    </div>

    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-bold text-gray-900">Assigned Tasks</h3>
      </div>
      <div className="p-0">
        {(!tasks || tasks.length === 0) ? (
          <p className="text-gray-500 text-center text-sm py-8">No tasks assigned.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {tasks?.map(task => (
              <div key={task._id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded border border-gray-200 overflow-hidden bg-white flex-shrink-0 flex items-center justify-center">
                     {task.complaint?.image ? (
                       <img src={task.complaint.image} alt="Task" className="w-full h-full object-cover" />
                     ) : (
                       <Trash2 className="w-5 h-5 text-gray-400" />
                     )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{task.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 flex items-center"><MapPin className="w-3 h-3 mr-1" /> {task.area}</p>
                    <div className="mt-2 flex space-x-2">
                      <StatusBadge status={task.status} />
                      {task.priority === 'Emergency' && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 uppercase tracking-wider">Emergency</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  {task.status === 'Pending' && (
                    <button onClick={() => startTask(task._id)} className="flex-1 sm:flex-none px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">Accept</button>
                  )}
                  {task.status === 'In Progress' && (
                    <button onClick={() => completeTask(task._id)} className="flex-1 sm:flex-none px-4 py-2 bg-[#10B981] text-white rounded-md text-sm font-medium hover:bg-[#059669] transition-colors">Complete</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);
};

const PublicDashboard = ({ complaints }) => (
  <div className="space-y-6 max-w-5xl mx-auto pb-10">
    <div className="bg-[#0F1117] rounded-xl p-8 sm:p-12 text-white relative overflow-hidden border border-gray-800 shadow-md">
      <div className="relative z-10 max-w-xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight">Help keep our city clean.</h1>
        <p className="text-gray-400 text-sm mb-6">Report garbage, track cleanup trucks in real-time, and make your area a better place.</p>
        <Link to="/complaint" className="inline-block px-5 py-2.5 bg-[#10B981] text-white rounded-md text-sm font-medium hover:bg-[#059669] transition-colors shadow-sm">
          Report Garbage
        </Link>
      </div>
      <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none hidden sm:block">
         <Navigation className="w-64 h-64" />
      </div>
    </div>

    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h3 className="text-sm font-bold text-gray-900">Your Reports</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-gray-200">
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Area</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(!complaints || complaints.length === 0) ? (
              <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-500 text-sm">No reports filed yet.</td></tr>
            ) : (
              complaints.map(comp => (
                <tr key={comp._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{comp.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{comp.area}</td>
                  <td className="px-6 py-4"><StatusBadge status={comp.status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
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
          const wasteRes = await api.get(`/api/waste`, { headers });
          setReports(wasteRes.data.data.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)));
        }
        
        if (user?.role === 'worker' || user?.role === 'admin') {
          const taskRes = await api.get(`/api/tasks`, { headers });
          setTasks(taskRes.data.data);
        }

        if (user?.role === 'public' || user?.role === 'society_head') {
          const compRes = await api.get(`/api/complaints`, { headers });
          setComplaints(compRes.data.data);
        }

        if (user?.role === 'society_head') {
          const rankRes = await api.get(`/api/analytics/rankings`, { headers });
          setRankings(rankRes.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      }
    };
    if (user) fetchDashboardData();
  }, [user]);

  if (!user) return <div className="p-8 text-center"><p className="text-sm text-gray-500">Loading dashboard...</p></div>;

  return (
    <div className="p-6">
      {user.role === 'admin' && <AdminDashboard reports={reports} />}
      {user.role === 'society_head' && <SocietyDashboard complaints={complaints} rankings={rankings} user={user} />}
      {user.role === 'worker' && <WorkerDashboard tasks={tasks} />}
      {user.role === 'public' && <PublicDashboard complaints={complaints} />}
    </div>
  );
};

export default Dashboard;
