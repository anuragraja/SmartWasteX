import api from "@/config/api";
import { useState, useEffect } from 'react';
import { Trophy, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

const Rankings = () => {
  const [rankings, setRankings] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get(`/api/analytics/rankings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const userRes = await api.get(`/api/analytics/top-users`, {
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
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Cleanliness Leaderboard</h1>
          <p className="text-sm text-gray-500 mt-1">Societies ranked by automated AI cleanliness score</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {rankings.slice(0, 3).map((rank, index) => (
          <div
            key={rank.area}
            className={`bg-white border rounded-xl p-5 flex flex-col items-center text-center relative shadow-sm ${
              index === 0 ? 'border-yellow-300 bg-yellow-50/10' : 
              index === 1 ? 'border-gray-300 bg-gray-50/10' : 
              'border-orange-300 bg-orange-50/10'
            }`}
          >
            {index === 0 && <div className="absolute top-3 right-3 text-yellow-500"><Trophy className="w-5 h-5" /></div>}
            
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mb-3 ${
              index === 0 ? 'bg-yellow-100 text-yellow-700' :
              index === 1 ? 'bg-gray-100 text-gray-700' :
              'bg-orange-100 text-orange-700'
            }`}>
              #{index + 1}
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">{rank.area}</h3>
            <div className="flex items-center space-x-1 text-[#10B981] font-bold text-xl">
              <span>{Math.max(0, rank.score)}</span>
              <span className="text-xs text-gray-500 font-normal">pts</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rank</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Society / Area</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Score</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Alerts</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rankings.map((rank, index) => (
                <tr 
                  key={rank.area}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="font-bold text-sm text-gray-900">
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-sm text-gray-900">{rank.area}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      rank.score >= 80 ? 'bg-green-50 text-green-700 border-green-200' :
                      rank.score >= 50 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {Math.max(0, rank.score)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {rank.overflows > 0 ? (
                      <span className="flex items-center text-red-600 font-medium text-xs">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1" /> {rank.overflows}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {index % 2 === 0 ? (
                      <TrendingUp className="w-4 h-4 text-[#10B981]" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pt-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Top Eco-Warriors</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topUsers.map((user, index) => (
            <div
              key={index}
              className={`bg-white border rounded-xl p-5 flex flex-col items-center text-center relative shadow-sm ${
                index === 0 ? 'border-yellow-300' : 
                index === 1 ? 'border-gray-300' : 
                'border-orange-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-3 ${
                index === 0 ? 'bg-yellow-100 text-yellow-700' :
                index === 1 ? 'bg-gray-100 text-gray-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                #{index + 1}
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">{user.name}</h3>
              <p className="text-[10px] text-gray-500 mb-3">{user.area || 'Unknown Area'}</p>
              <div className="px-3 py-1 bg-green-50 text-green-700 rounded-md text-xs font-bold flex items-center border border-green-200">
                <span className="mr-1.5">🌱</span> {user.ecoPoints || 0} pts
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Rankings;
