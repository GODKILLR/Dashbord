import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { ArrowUpRight, Users, Eye, Globe, Info } from 'lucide-react';
import { DailyData, CountryData } from '../utils/data';

interface DashboardProps {
  data: DailyData[];
  countryData: CountryData[];
  totalViews: number;
  dateRangeLabel: string;
}

const COLORS = ['#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#E5E5E5'];

export default function Dashboard({ data, countryData, totalViews, dateRangeLabel }: DashboardProps) {
  const totalTraffic = data.reduce((sum, day) => sum + day.websiteTraffic, 0);
  const avgConversion = data.length > 0 
    ? (data.reduce((sum, day) => sum + day.conversionRate, 0) / data.length).toFixed(2)
    : "0.00";

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen text-black">
      {/* Disclaimer Banner */}
      <div className="bg-gray-50 border border-gray-200 text-gray-600 px-4 py-3 rounded-xl flex items-start sm:items-center text-sm">
        <Info className="w-5 h-5 mr-3 flex-shrink-0 text-gray-400" />
        <p>
          <strong className="font-semibold text-gray-900">Data Refresh Notice:</strong> To optimize performance and ensure data accuracy, this dashboard's metrics are refreshed every 7 days.
        </p>
      </div>

      <div className="flex justify-between items-center border-b border-black pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Traffic Overview</h1>
          <p className="text-gray-500 mt-1">Client Performance Dashboard</p>
        </div>
        <div className="text-sm font-medium px-4 py-2 bg-black text-white rounded-full">
          {dateRangeLabel}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border border-black rounded-xl bg-white shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Giphy Views</p>
              <h3 className="text-4xl font-bold mt-2">{(totalViews / 1000000).toFixed(1)}M</h3>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <Eye className="w-6 h-6 text-black" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm font-medium text-black">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            <span>Across selected period</span>
          </div>
        </div>

        <div className="p-6 border border-black rounded-xl bg-black text-white shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Est. Website Traffic</p>
              <h3 className="text-4xl font-bold mt-2">{totalTraffic.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm font-medium text-gray-300">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            <span>Based on Bitly clicks</span>
          </div>
        </div>

        <div className="p-6 border border-black rounded-xl bg-white shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Avg. Conversion Rate</p>
              <h3 className="text-4xl font-bold mt-2">{avgConversion}%</h3>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <ArrowUpRight className="w-6 h-6 text-black" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm font-medium text-black">
            <span>Calculated daily average</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Traffic Chart */}
        <div className="lg:col-span-2 p-6 border border-black rounded-xl bg-white">
          <h3 className="text-lg font-bold mb-6">Daily Website Traffic (Estimated)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#666', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#666', fontSize: 12 }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', color: '#fff', borderRadius: '8px', border: 'none' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => [value.toLocaleString(), 'Traffic']}
                />
                <Line 
                  type="monotone" 
                  dataKey="websiteTraffic" 
                  stroke="#000000" 
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: '#000', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Country Distribution */}
        <div className="p-6 border border-black rounded-xl bg-white flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Traffic by Country</h3>
            <Globe className="w-5 h-5 text-gray-500" />
          </div>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={countryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {countryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => value.toLocaleString()}
                  contentStyle={{ backgroundColor: '#000', color: '#fff', borderRadius: '8px', border: 'none' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-sm text-gray-700">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Giphy Views Bar Chart */}
      <div className="p-6 border border-black rounded-xl bg-white">
        <h3 className="text-lg font-bold mb-6">Daily Giphy Views</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#666', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#666', fontSize: 12 }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip 
                cursor={{ fill: '#f5f5f5' }}
                contentStyle={{ backgroundColor: '#000', color: '#fff', borderRadius: '8px', border: 'none' }}
                formatter={(value: number) => [value.toLocaleString(), 'Views']}
              />
              <Bar dataKey="giphyViews" fill="#000000" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
