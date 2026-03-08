import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Settings, LogOut } from 'lucide-react';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import { generateTrafficData, generateCountryData, DailyData, CountryData, ExtractedDataPoint } from './utils/data';
import { subDays, format } from 'date-fns';

export default function App() {
  const [authRole, setAuthRole] = useState<'admin' | 'client' | null>(null);
  const [view, setView] = useState<'dashboard' | 'admin'>('dashboard');
  
  // Admin settings state
  const [totalViews, setTotalViews] = useState(27000000); // 27 million default
  const [minConversion, setMinConversion] = useState(0.5);
  const [maxConversion, setMaxConversion] = useState(1.0);
  
  const [rangeType, setRangeType] = useState('30days');
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [extractedData, setExtractedData] = useState<ExtractedDataPoint[]>([]);

  // Generated data state
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [countryData, setCountryData] = useState<CountryData[]>([]);
  
  // Loading state
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Fetch settings on initial load
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/get-settings');
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setTotalViews(data.totalViews);
            setMinConversion(data.minConversion);
            setMaxConversion(data.maxConversion);
            setRangeType(data.rangeType);
            setStartDate(new Date(data.startDate));
            setEndDate(new Date(data.endDate));
            setExtractedData(data.extractedData || []);
          }
        }
      } catch (err) {
        console.error('Failed to load settings from DB:', err);
      } finally {
        setIsLoadingSettings(false);
      }
    };

    fetchSettings();
  }, []);

  // Generate data when settings change
  useEffect(() => {
    if (isLoadingSettings) return; // Don't generate while loading
    
    const newData = generateTrafficData(totalViews, startDate, endDate, minConversion, maxConversion, extractedData);
    setDailyData(newData);
    
    const totalTraffic = newData.reduce((sum, day) => sum + day.websiteTraffic, 0);
    setCountryData(generateCountryData(totalTraffic));
  }, [totalViews, minConversion, maxConversion, startDate, endDate, extractedData, isLoadingSettings]);

  const handleSaveAdmin = async (views: number, min: number, max: number, type: string, start: Date, end: Date, extracted: ExtractedDataPoint[]) => {
    // Optimistically update local state immediately
    setTotalViews(views);
    setMinConversion(min);
    setMaxConversion(max);
    setRangeType(type);
    setStartDate(start);
    setEndDate(end);
    setExtractedData(extracted);
    setView('dashboard'); // Switch back to dashboard quickly

    // Save to Vercel KV database in the background
    try {
      await fetch('/api/save-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalViews: views,
          minConversion: min,
          maxConversion: max,
          rangeType: type,
          startDate: start,
          endDate: end,
          extractedData: extracted,
        }),
      });
    } catch (err) {
      console.error('Failed to save settings to DB:', err);
      alert('Failed to save settings to the database.');
    }
  };

  const handleLogin = (role: 'admin' | 'client') => {
    setAuthRole(role);
    setView(role === 'admin' ? 'admin' : 'dashboard');
  };

  const handleLogout = () => {
    setAuthRole(null);
    setView('dashboard');
  };

  const dateRangeLabel = rangeType === '7days' ? 'Last 7 Days' :
                         rangeType === '30days' ? 'Last 30 Days' :
                         rangeType === '90days' ? 'Last 90 Days' :
                         `${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`;

  if (isLoadingSettings) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-black"></div>
        <p className="text-gray-500 font-medium tracking-wide animate-pulse">Loading dashboard data...</p>
      </div>
    );
  }

  if (!authRole) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-black flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-black sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-xl leading-none">G</span>
                </div>
                <span className="font-bold text-xl tracking-tight">Traffic Dashboard</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setView('dashboard')}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === 'dashboard' 
                    ? 'bg-black text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Client View</span>
              </button>
              
              {authRole === 'admin' && (
                <button
                  onClick={() => setView('admin')}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    view === 'admin' 
                      ? 'bg-black text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Admin Panel</span>
                </button>
              )}

              <div className="w-px h-6 bg-gray-300 mx-2"></div>

              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {view === 'dashboard' ? (
          <Dashboard 
            data={dailyData} 
            countryData={countryData} 
            totalViews={totalViews} 
            dateRangeLabel={dateRangeLabel}
          />
        ) : (
          <AdminPanel 
            totalViews={totalViews}
            minConversion={minConversion}
            maxConversion={maxConversion}
            rangeType={rangeType}
            startDate={startDate}
            endDate={endDate}
            extractedData={extractedData}
            onSave={handleSaveAdmin}
          />
        )}
      </main>
    </div>
  );
}
