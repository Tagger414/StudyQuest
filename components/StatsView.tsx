import React, { useState, useMemo } from 'react';
import { UserData, ThemeColors, SessionLog } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// Fix: Added missing TrophyIcon import.
import { ChartBarIcon, ClockIcon, AcademicCapIcon, TrophyIcon } from './icons/Icons';

interface StatsViewProps {
  userData: UserData;
  theme: ThemeColors;
}

type Filter = '7days' | '5weeks' | 'year';

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

const processChartData = (logs: SessionLog[], filter: Filter) => {
    const now = new Date();
    let data: { name: string; minutes: number }[] = [];

    if (filter === '7days') {
        data = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(now.getDate() - i);
            return { name: d.toLocaleDateString('en-US', { weekday: 'short' }), minutes: 0 };
        }).reverse();

        logs.forEach(log => {
            const logDate = new Date(log.date);
            const diffDays = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 3600 * 24));
            if (diffDays < 7) {
                const dayIndex = 6 - diffDays;
                data[dayIndex].minutes += log.duration / 60;
            }
        });
    } else if (filter === '5weeks') {
        data = Array.from({ length: 5 }, (_, i) => {
             const d = new Date();
             d.setDate(now.getDate() - (i * 7));
             return { name: `Week of ${d.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}`, minutes: 0 }
        }).reverse();
        
        logs.forEach(log => {
            const logDate = new Date(log.date);
            const diffWeeks = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 3600 * 24 * 7));
             if (diffWeeks < 5) {
                const weekIndex = 4 - diffWeeks;
                data[weekIndex].minutes += log.duration / 60;
            }
        })

    } else if (filter === 'year') {
         data = Array.from({ length: 12 }, (_, i) => {
            const d = new Date();
            d.setMonth(now.getMonth() - i);
            return { name: d.toLocaleDateString('en-US', { month: 'short' }), minutes: 0 };
        }).reverse();

        logs.forEach(log => {
            const logDate = new Date(log.date);
            if (logDate.getFullYear() === now.getFullYear()) {
                 const monthIndex = logDate.getMonth();
                 data[monthIndex].minutes += log.duration / 60;
            }
        });
    }
    
    return data.map(d => ({ ...d, minutes: Math.round(d.minutes) }));
};

// Fix: Map Tailwind classes to hex codes for recharts compatibility.
const themeColorHex: Record<string, string> = {
    'bg-orange-500': '#f97316',
    'bg-green-600': '#16a34a',
    'bg-blue-500': '#3b82f6',
    'bg-red-500': '#ef4444',
    'bg-purple-600': '#9333ea',
    'bg-[#FFFBEB]': '#FFFBEB',
    'bg-green-50': '#f0fdf4',
    'bg-blue-50': '#eff6ff',
    'bg-red-50': '#fef2f2',
    'bg-gray-900': '#111827'
};


const StatsView: React.FC<StatsViewProps> = ({ userData, theme }) => {
  const [filter, setFilter] = useState<Filter>('7days');

  const chartData = useMemo(() => processChartData(userData.sessionLogs, filter), [userData.sessionLogs, filter]);

  const StatCard = ({ icon, title, value }: { icon: React.ReactNode, title: string, value: string | number }) => (
    <div className={`p-4 rounded-xl shadow-md ${theme.cardBg} flex flex-col items-center justify-center text-center`}>
      {icon}
      <p className="text-sm opacity-80 mt-2">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );

  // Fix: Get hex colors from the map for recharts components
  const barFillColor = themeColorHex[theme.primaryBg] || '#f97316';
  const tooltipBgColor = themeColorHex[theme.bg] || '#FFFBEB';

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <div className="pb-20 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <ChartBarIcon className={`mx-auto h-12 w-12 ${theme.primary}`} />
          <h1 className="text-3xl md:text-4xl font-bold mt-2">Study Analytics</h1>
          <p className="mt-2 opacity-80">Visualize your focus journey.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <StatCard icon={<ClockIcon className="w-8 h-8"/>} title="Total Study Time" value={formatTime(userData.totalStudyTime)} />
          <StatCard icon={<AcademicCapIcon className="w-8 h-8"/>} title="Total Sessions" value={userData.sessionLogs.length} />
          <StatCard icon={<TrophyIcon className="w-8 h-8"/>} title="Current Streak" value={`${userData.streak} Days`} />
        </div>

        <div className={`p-4 rounded-xl shadow-md ${theme.cardBg}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">Study Minutes</h2>
            <div className={`flex space-x-1 p-1 rounded-full text-sm ${theme.secondaryBg}`}>
              <button onClick={() => setFilter('7days')} className={`px-3 py-1 rounded-full ${filter === '7days' ? `${theme.primaryBg} ${theme.buttonText}` : ''}`}>7 Days</button>
              <button onClick={() => setFilter('5weeks')} className={`px-3 py-1 rounded-full ${filter === '5weeks' ? `${theme.primaryBg} ${theme.buttonText}` : ''}`}>5 Weeks</button>
              <button onClick={() => setFilter('year')} className={`px-3 py-1 rounded-full ${filter === 'year' ? `${theme.primaryBg} ${theme.buttonText}` : ''}`}>Year</button>
            </div>
          </div>
          <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                  <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.2} />
                      <XAxis dataKey="name" stroke="currentColor" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="currentColor" fontSize={12} tickLine={false} axisLine={false} />
                      {/* Fix: Use valid CSS color for tooltip background */}
                      <Tooltip contentStyle={{ backgroundColor: tooltipBgColor, border: 'none', borderRadius: '0.5rem' }} />
                      {/* Fix: Resolved errors with THEME_COLORS and theme.id by using a direct color value. */}
                      <Bar dataKey="minutes" fill={barFillColor} radius={[4, 4, 0, 0]} />
                  </BarChart>
              </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsView;