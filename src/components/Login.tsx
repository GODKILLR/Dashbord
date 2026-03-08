import React, { useState } from 'react';
import { Lock, User, Shield, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: (role: 'admin' | 'client') => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [activeTab, setActiveTab] = useState<'client' | 'admin'>('client');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Hardcoded passwords for prototype purposes
    if (activeTab === 'admin' && password === 'admin123') {
      onLogin('admin');
    } else if (activeTab === 'client' && password === 'client123') {
      onLogin('client');
    } else {
      setError('Invalid password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-black">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-3xl leading-none">G</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Traffic Dashboard
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to access your analytics
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-black rounded-2xl sm:px-10">
          
          {/* Tabs */}
          <div className="flex space-x-2 mb-8 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => { setActiveTab('client'); setPassword(''); setError(''); }}
              className={`flex-1 flex justify-center items-center py-2.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'client' ? 'bg-white text-black shadow-sm border border-gray-200' : 'text-gray-500 hover:text-black'
              }`}
            >
              <User className="w-4 h-4 mr-2" />
              Client
            </button>
            <button
              onClick={() => { setActiveTab('admin'); setPassword(''); setError(''); }}
              className={`flex-1 flex justify-center items-center py-2.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'admin' ? 'bg-white text-black shadow-sm border border-gray-200' : 'text-gray-500 hover:text-black'
              }`}
            >
              <Shield className="w-4 h-4 mr-2" />
              Admin
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-black focus:border-black block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3 border outline-none transition-colors"
                  placeholder={activeTab === 'admin' ? 'Hint: admin123' : 'Hint: client123'}
                />
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600" id="password-error">
                  {error}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
              >
                Sign in
                <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
