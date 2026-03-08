import React, { useState, useRef } from 'react';
import { Settings, Save, RefreshCw, UploadCloud, Calendar, Image as ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';

import { format, subDays, parseISO } from 'date-fns';
import { ExtractedDataPoint } from '../utils/data';

interface AdminPanelProps {
  totalViews: number;
  minConversion: number;
  maxConversion: number;
  rangeType: string;
  startDate: Date;
  endDate: Date;
  extractedData: ExtractedDataPoint[];
  onSave: (views: number, min: number, max: number, rangeType: string, start: Date, end: Date, extractedData: ExtractedDataPoint[]) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

export default function AdminPanel({
  totalViews: initialViews,
  minConversion: initialMin,
  maxConversion: initialMax,
  rangeType: initialRangeType,
  startDate: initialStart,
  endDate: initialEnd,
  extractedData: initialExtractedData,
  onSave
}: AdminPanelProps) {
  const [views, setViews] = useState(initialViews.toString());
  const [min, setMin] = useState(initialMin.toString());
  const [max, setMax] = useState(initialMax.toString());

  const [rangeType, setRangeType] = useState(initialRangeType);
  const [customStart, setCustomStart] = useState(format(initialStart, 'yyyy-MM-dd'));
  const [customEnd, setCustomEnd] = useState(format(initialEnd, 'yyyy-MM-dd'));

  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedDataPoint[]>(initialExtractedData);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedImage(URL.createObjectURL(file));
    setIsExtracting(true);

    try {
      const base64 = await fileToBase64(file);

      const res = await fetch('/api/extract-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${res.status}`);
      }

      const parsed = await res.json();

      if (parsed.totalViews) {
        setViews(parsed.totalViews.toString());
      }
      if (parsed.dailyData && Array.isArray(parsed.dailyData) && parsed.dailyData.length > 0) {
        setExtractedData(parsed.dailyData);
      } else {
        alert("Could not extract daily data points. We will use a random distribution instead.");
        setExtractedData([]);
      }
    } catch (error) {
      console.error("Error extracting data:", error);
      alert("Failed to parse data from image. Please enter total views manually.");
      setExtractedData([]);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    let finalStart = new Date();
    let finalEnd = new Date();

    if (rangeType === '7days') {
      finalStart = subDays(new Date(), 7);
    } else if (rangeType === '30days') {
      finalStart = subDays(new Date(), 30);
    } else if (rangeType === '90days') {
      finalStart = subDays(new Date(), 90);
    } else {
      finalStart = parseISO(customStart);
      finalEnd = parseISO(customEnd);
    }

    onSave(
      parseInt(views.replace(/,/g, ''), 10) || 0,
      parseFloat(min) || 0,
      parseFloat(max) || 0,
      rangeType,
      finalStart,
      finalEnd,
      extractedData
    );
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white min-h-screen text-black">
      <div className="flex items-center space-x-3 border-b border-black pb-4 mb-8">
        <div className="p-3 bg-black text-white rounded-xl">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
          <p className="text-gray-500 mt-1">Upload Giphy data and configure simulation</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">

        {/* Date Range Selection */}
        <div className="p-6 border border-black rounded-xl bg-gray-50">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-gray-500" />
            Select Date Range
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { id: '7days', label: 'Last 7 Days' },
              { id: '30days', label: 'Last 30 Days' },
              { id: '90days', label: 'Last 90 Days' },
              { id: 'custom', label: 'Custom Range' },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setRangeType(option.id)}
                className={`px-4 py-3 border rounded-lg text-sm font-medium transition-colors ${rangeType === option.id
                    ? 'border-black bg-black text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-black'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {rangeType === 'custom' && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full px-4 py-2 border border-black rounded-lg focus:ring-2 focus:ring-black outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full px-4 py-2 border border-black rounded-lg focus:ring-2 focus:ring-black outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Image Upload & Data Extraction */}
        <div className="p-6 border border-black rounded-xl bg-gray-50">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <ImageIcon className="w-5 h-5 mr-2 text-gray-500" />
            Giphy Data Source
          </h3>

          <div className="space-y-6">
            {/* Upload Area */}
            <div
              className="border-2 border-dashed border-gray-400 rounded-xl p-8 text-center hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              {isExtracting ? (
                <div className="flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-black" />
                  <p className="text-sm font-medium">Extracting daily views with AI...</p>
                </div>
              ) : uploadedImage ? (
                <div className="flex flex-col items-center space-y-4">
                  <img src={uploadedImage} alt="Uploaded dashboard" className="h-32 object-contain rounded-lg border border-gray-200" />
                  <p className="text-sm font-medium text-black flex items-center">
                    <UploadCloud className="w-4 h-4 mr-2" />
                    Click to upload a different screenshot
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <UploadCloud className="w-10 h-10 text-gray-400" />
                  <p className="text-base font-medium text-black">Upload Giphy Dashboard Screenshot</p>
                  <p className="text-sm text-gray-500">We will automatically extract the total views and daily chart data</p>
                </div>
              )}
            </div>

            {/* Extracted/Manual Value */}
            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Total Giphy Views
                </label>
                {extractedData.length > 0 && (
                  <span className="text-xs font-medium text-green-600 flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Daily chart data extracted
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={views}
                  onChange={(e) => setViews(e.target.value)}
                  className="w-full px-4 py-3 border border-black rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all font-mono text-lg"
                  placeholder="e.g. 27000000"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 font-mono">
                  views
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Extracted automatically from your screenshot, or you can edit it manually.
              </p>
            </div>
          </div>
        </div>

        {/* Conversion Simulation */}
        <div className="p-6 border border-black rounded-xl bg-gray-50">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <RefreshCw className="w-5 h-5 mr-2 text-gray-500" />
            Conversion Simulation
          </h3>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Conversion Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={min}
                onChange={(e) => setMin(e.target.value)}
                className="w-full px-4 py-3 border border-black rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all font-mono text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Conversion Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={max}
                onChange={(e) => setMax(e.target.value)}
                className="w-full px-4 py-3 border border-black rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all font-mono text-lg"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center px-6 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
        >
          <Save className="w-5 h-5 mr-2" />
          Save & Update Dashboard
        </button>
      </form>
    </div>
  );
}
