import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import axios from 'axios';

const Rankings = () => {
  const [rankings, setRankings] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/analytics/rankings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const userRes = await axios.get('http://localhost:5000/api/analytics/top-users', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setTopUsers(userRes.data.data.length ? userRes.data.data : [
          { name: 'Aarav Sharma', ecoPoints: 1250, area: 'Green Park' },
          { name: 'Neha Gupta', ecoPoints: 980, area: 'Sector 4' },
          { name: 'Rohan Singh', ecoPoints: 850, area: 'Anand Nagar' }
        ]);
        
        setRankings(res.data.data.length ? res.data.data : [
          { area: 'Green Park', score: 98, totalUploads: 150, overflows: 0, full: 2 },
          { area: 'Sector 4', score: 85, totalUploads: 200, overflows: 1, full: 5 },
          { area: 'Anand Nagar', score: 60, totalUploads: 300, overflows: 3, full: 10 },
          { area: 'Lajpat Nagar', score: 45, totalUploads: 250, overflows: 5, full: 8 },
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Cleanliness Leaderboard</h1>
          <p className="text-gray-500 text-sm mt-1">Societies ranked by automated AI cleanliness score</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {rankings.slice(0, 3).map((rank, index) => (
          <motion.div
            key={rank.area}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={`glass p-6 rounded-3xl flex flex-col items-center text-center relative overflow-hidden ${
              index === 0 ? 'border-yellow-300 border-2' : 
              index === 1 ? 'border-gray-300 border-2' : 
              'border-orange-300 border-2'
            }`}
          >
            {index === 0 && <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-100 rounded-bl-full flex items-start justify-end p-3"><Trophy className="w-6 h-6 text-yellow-500" /></div>}
            {index === 1 && <div className="absolute top-0 right-0 w-16 h-16 bg-gray-100 rounded-bl-full flex items-start justify-end p-3"><Medal className="w-6 h-6 text-gray-500" /></div>}
            {index === 2 && <div className="absolute top-0 right-0 w-16 h-16 bg-orange-100 rounded-bl-full flex items-start justify-end p-3"><Medal className="w-6 h-6 text-orange-500" /></div>}
            
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black mb-4 ${
              index === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-white shadow-lg shadow-yellow-200' :
              index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-lg shadow-gray-200' :
              'bg-gradient-to-br from-orange-300 to-orange-500 text-white shadow-lg shadow-orange-200'
            }`}>
              #{index + 1}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{rank.area}</h3>
            <div className="flex items-center space-x-1 text-primary font-bold text-lg">
              <span>{Math.max(0, rank.score)}</span>
              <span className="text-xs text-gray-500 font-normal">pts</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Rank</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Society / Area</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Score</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Overflows (Penalty)</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Trend</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((rank, index) => (
                <motion.tr 
                  key={rank.area}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <span className={`font-bold w-8 h-8 rounded-full flex items-center justify-center ${index < 3 ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-gray-800">{rank.area}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      rank.score >= 80 ? 'bg-green-100 text-green-700' :
                      rank.score >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {Math.max(0, rank.score)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {rank.overflows > 0 ? (
                      <span className="flex items-center text-red-500 font-medium text-sm">
                        <AlertTriangle className="w-4 h-4 mr-1" /> {rank.overflows} alerts
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">None</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    {index % 2 === 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-500" />
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Users Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Top 3 Eco-Warriors</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topUsers.map((user, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`glass p-6 rounded-3xl flex flex-col items-center text-center relative overflow-hidden border-2 ${
                index === 0 ? 'border-yellow-300' : 
                index === 1 ? 'border-gray-300' : 
                'border-orange-300'
              }`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black mb-4 text-white shadow-lg ${
                index === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-yellow-200' :
                index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 shadow-gray-200' :
                'bg-gradient-to-br from-orange-300 to-orange-500 shadow-orange-200'
              }`}>
                #{index + 1}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{user.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{user.area || 'Unknown Area'}</p>
              <div className="px-4 py-2 bg-green-50 text-green-700 rounded-full font-bold flex items-center shadow-sm">
                <span className="mr-2">🌱</span> {user.ecoPoints || 0} EcoPoints
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Rankings;
