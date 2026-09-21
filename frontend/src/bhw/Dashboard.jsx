import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { Users, AlertCircle, CheckCircle, Ruler, Triangle, List, MapPin } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function StatCard({ icon: Icon, label, value, sublabel, accent }) {
  return (
    <div className={`motion-card bg-white rounded-xl shadow-sm p-5 border-t-4 ${accent}`}>
      <div className="flex items-start justify-between">
        <p className="text-sm text-gray-500">{label}</p>
        <div className="bg-gray-50 rounded-full p-2">
          <Icon size={16} className="text-gray-700" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-800 mt-2">{value ?? '—'}</p>
      <p className="text-xs text-gray-400 mt-1">{sublabel}</p>
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosClient.get('/bhw/stats', {
          params: { barangay: user.barangay },
        });
        setStats(response.data);
      } catch (err) {
        setError('Failed to load dashboard stats.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <p className="text-gray-500">Loading dashboard...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      

      <div className="bg-gradient-to-r from-green-700 via-emerald-600 to-lime-500 rounded-xl p-5 mb-6 flex items-center justify-between text-white">
        <div>
          <h2 className="text-lg font-semibold">Hello, {user.username}!</h2>
          <p className="text-sm text-green-100">
            {user.barangay} · Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <span className="flex items-center gap-1 bg-green-500/60 text-sm px-3 py-1 rounded-full whitespace-nowrap">
          <MapPin size={14} /> {user.barangay}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard icon={Users} label="Total Children" value={stats.totalChildren} sublabel="Registered" accent="border-green-500" />
        <StatCard icon={Users} label="Total Mothers" value={stats.totalMothers} sublabel="Lactating Mothers" accent="border-emerald-500" />
        <StatCard icon={AlertCircle} label="At-Risk Children" value={stats.atRiskChildren} sublabel="Need attention!" accent="border-amber-500" />
        <StatCard icon={AlertCircle} label="At-Risk Mothers" value={stats.atRiskMothers} sublabel="Need attention!" accent="border-red-500" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={CheckCircle} label="Normal" value={stats.normal} sublabel="Healthy Children" accent="border-green-500" />
        <StatCard icon={Ruler} label="Stunted" value={stats.stunted} sublabel="Height for age" accent="border-orange-500" />
        <StatCard icon={Triangle} label="Wasted" value={stats.wasted} sublabel="Weight for height" accent="border-red-500" />
        <StatCard icon={List} label="Underweight" value={stats.underweight} sublabel="Active monitoring" accent="border-yellow-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="motion-chart-card lg:col-span-2 bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-800">Monthly Monitoring Trend</h3>
          <p className="text-xs text-gray-400 mb-4">{user.barangay} · 6 months overview</p>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={stats.monthlyMonitoring || []} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={28} />
              <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #dcfce7' }} />
              <Line type="monotone" dataKey="monitored" name="Monitored" stroke="#16a34a" strokeWidth={3} dot={{ r: 4, fill: '#16a34a' }} />
              <Line type="monotone" dataKey="atRisk" name="At Risk" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="motion-chart-card bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Quick Access</h3>
          <div className="grid grid-cols-2 gap-3">
            <a href="/bhw/need-attention" className="bg-gradient-to-br from-red-500 to-orange-500 text-white rounded-lg p-3 flex flex-col items-center gap-1 text-xs shadow-sm hover:from-red-600 hover:to-orange-600 transition">
              <AlertCircle size={18} /> Need Attention
            </a>
            <a href="/bhw/referrals" className="bg-gradient-to-br from-lime-500 to-green-600 text-white rounded-lg p-3 flex flex-col items-center gap-1 text-xs shadow-sm hover:from-lime-600 hover:to-green-700 transition">
              <Users size={18} /> Referral
            </a>
            <a href="/bhw/medical-records" className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-lg p-3 flex flex-col items-center gap-1 text-xs shadow-sm hover:from-teal-600 hover:to-emerald-700 transition">
              <List size={18} /> Records
            </a>
            <a href="/bhw/schedule" className="bg-gradient-to-br from-green-600 to-cyan-600 text-white rounded-lg p-3 flex flex-col items-center gap-1 text-xs shadow-sm hover:from-green-700 hover:to-cyan-700 transition">
              <CheckCircle size={18} /> Schedule
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;