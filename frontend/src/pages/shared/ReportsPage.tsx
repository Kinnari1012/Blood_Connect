import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { BarChart2, TrendingUp, Users, Droplet, Download } from 'lucide-react';

export function ReportsPage() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Report downloaded successfully!');
    }, 1500);
  };

  return (
    <PageLayout 
      title="Reports & Analytics" 
      subtitle="Platform metrics and performance trends"
      actions={
        <button onClick={handleExport} disabled={isExporting} className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:opacity-90 flex items-center gap-2 focus:outline-none disabled:opacity-70 transition-all shadow-sm">
          <Download size={16} /> {isExporting ? 'Generating Report...' : 'Download Full Report'}
        </button>
      }
    >
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4"><Users size={24} /></div>
            <h3 className="text-3xl font-black text-gray-900 mb-1">24,590</h3>
            <p className="text-sm text-gray-500 font-medium">Total Registered Donors</p>
         </div>
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4"><Droplet size={24} /></div>
            <h3 className="text-3xl font-black text-gray-900 mb-1">8,240</h3>
            <p className="text-sm text-gray-500 font-medium">Successful Donations</p>
         </div>
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-4"><BarChart2 size={24} /></div>
            <h3 className="text-3xl font-black text-gray-900 mb-1">9,105</h3>
            <p className="text-sm text-gray-500 font-medium">Blood Requests Handled</p>
         </div>
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-4"><TrendingUp size={24} /></div>
            <h3 className="text-3xl font-black text-gray-900 mb-1">92.4%</h3>
            <p className="text-sm text-gray-500 font-medium">Fulfillment Rate</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-96 flex flex-col">
           <h3 className="font-bold text-gray-900 mb-4">Donation vs Request Trends (YTD)</h3>
           <div className="flex-1 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-gray-400">
             <BarChart2 size={48} className="text-gray-300 mb-3" />
             <p className="text-sm font-medium">Chart Visualization Coming Soon</p>
           </div>
         </div>
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-96 flex flex-col">
           <h3 className="font-bold text-gray-900 mb-4">Blood Group Distribution</h3>
           <div className="flex-1 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-gray-400">
             <TrendingUp size={48} className="text-gray-300 mb-3" />
             <p className="text-sm font-medium">Chart Visualization Coming Soon</p>
           </div>
         </div>
      </div>
    </PageLayout>
  );
}
