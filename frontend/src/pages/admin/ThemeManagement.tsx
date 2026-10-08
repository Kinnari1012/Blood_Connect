import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { useTheme } from '../../store/ThemeContext';
import { Palette, CheckCircle, Moon, Sun, Monitor, Activity, RefreshCw, LayoutTemplate } from 'lucide-react';
import toast from 'react-hot-toast';

export function ThemeManagement() {
  const { color, secondaryColor, mode, setColor, setSecondaryColor, setMode, resetTheme } = useTheme();

  const [previewColor, setPreviewColor] = useState(color);
  const [previewSecondary, setPreviewSecondary] = useState(secondaryColor);
  const [previewMode, setPreviewMode] = useState(mode);

  const applyTheme = () => {
    setColor(previewColor);
    setSecondaryColor(previewSecondary);
    setMode(previewMode);
    toast.success('Theme applied successfully across the application!');
  };

  const handleReset = () => {
    resetTheme();
    setPreviewColor('#C62828');
    setPreviewSecondary('#0F172A');
    setPreviewMode('light');
    toast.success('Theme reset to defaults.');
  };

  return (
    <PageLayout title="Theme Management" subtitle="Personalize the visual identity of BloodConnect">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN - CONTROLS */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          
          {/* Display Mode */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden" style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
            <div className="p-5 border-b border-gray-100 flex items-center gap-3" style={{ borderColor: 'var(--c-border)' }}>
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500" style={{ backgroundColor: 'var(--c-background)' }}>
                <Monitor size={16} />
              </div>
              <h3 className="font-bold text-gray-900" style={{ color: 'var(--c-text)' }}>Display Mode</h3>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'light', label: 'Light', icon: Sun },
                  { id: 'dark', label: 'Dark', icon: Moon },
                  { id: 'system', label: 'System', icon: Monitor }
                ].map(m => (
                  <button 
                    key={m.id} 
                    onClick={() => setPreviewMode(m.id as any)}
                    className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      previewMode === m.id 
                        ? 'shadow-md scale-[1.02]' 
                        : 'border-transparent hover:bg-gray-50'
                    }`}
                    style={{ 
                      borderColor: previewMode === m.id ? previewColor : 'transparent',
                      backgroundColor: previewMode === m.id ? `${previewColor}08` : 'var(--c-background)',
                      color: previewMode === m.id ? previewColor : 'var(--c-secondary-text)'
                    }}
                  >
                    <m.icon size={24} className="mb-2" />
                    <span className="text-xs font-bold uppercase tracking-wider">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Primary Color */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden" style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between" style={{ borderColor: 'var(--c-border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500" style={{ backgroundColor: 'var(--c-background)' }}>
                  <Palette size={16} />
                </div>
                <h3 className="font-bold text-gray-900" style={{ color: 'var(--c-text)' }}>Primary Brand Color</h3>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded bg-gray-100" style={{ backgroundColor: 'var(--c-background)', color: previewColor }}>{previewColor}</span>
            </div>
            <div className="p-5">
              <p className="text-xs text-gray-500 mb-4" style={{ color: 'var(--c-secondary-text)' }}>Used for main actions, active states, and brand highlights.</p>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-3">
                {['#C62828', '#DC2626', '#E11D48', '#C026D3', '#9333EA', '#7C3AED', '#4F46E5', '#2563EB', '#0284C7', '#0891B2', '#0D9488', '#059669', '#16A34A', '#65A30D', '#CA8A04', '#D97706'].map(c => (
                  <button 
                    key={c} 
                    onClick={() => setPreviewColor(c)} 
                    className={`aspect-square rounded-full border-2 flex items-center justify-center transition-all ${
                      previewColor === c ? 'scale-110 shadow-lg' : 'border-transparent hover:scale-110 hover:shadow'
                    }`} 
                    style={{ backgroundColor: c, borderColor: previewColor === c ? 'var(--c-text)' : 'transparent' }}
                  >
                    {previewColor === c && <CheckCircle size={16} color="white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Secondary Color */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden" style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between" style={{ borderColor: 'var(--c-border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500" style={{ backgroundColor: 'var(--c-background)' }}>
                  <LayoutTemplate size={16} />
                </div>
                <h3 className="font-bold text-gray-900" style={{ color: 'var(--c-text)' }}>Secondary UI Color</h3>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded bg-gray-100" style={{ backgroundColor: 'var(--c-background)', color: previewSecondary }}>{previewSecondary}</span>
            </div>
            <div className="p-5">
              <p className="text-xs text-gray-500 mb-4" style={{ color: 'var(--c-secondary-text)' }}>Used for sidebar, dark headers, and secondary accents.</p>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-3">
                {['#0F172A', '#1E1B4B', '#064E3B', '#134E4A', '#431407', '#4C0519', '#172554', '#312E81', '#18181B', '#27272A', '#3F3F46', '#1C1917'].map(c => (
                  <button 
                    key={c} 
                    onClick={() => setPreviewSecondary(c)} 
                    className={`aspect-square rounded-full border-2 flex items-center justify-center transition-all ${
                      previewSecondary === c ? 'scale-110 shadow-lg' : 'border-transparent hover:scale-110 hover:shadow'
                    }`} 
                    style={{ backgroundColor: c, borderColor: previewSecondary === c ? 'var(--c-text)' : 'transparent' }}
                  >
                    {previewSecondary === c && <CheckCircle size={16} color="white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-2">
            <button 
              onClick={applyTheme} 
              className="flex-1 py-3.5 px-6 rounded-xl text-white font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
              style={{ backgroundColor: previewColor }}
            >
              Apply Theme Globally
            </button>
            <button 
              onClick={handleReset} 
              className="py-3.5 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border-2"
              style={{ 
                backgroundColor: 'var(--c-surface)', 
                color: 'var(--c-secondary-text)',
                borderColor: 'var(--c-border)'
              }}
            >
              <RefreshCw size={18} />
              Reset
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN - LIVE PREVIEW */}
        <div className="xl:col-span-7">
          <div className="sticky top-6">
            <LiveAppPreview color={previewColor} secondary={previewSecondary} mode={previewMode} />
          </div>
        </div>

      </div>
    </PageLayout>
  );
}

// ---------------------------------------------------------------------------
// Mock UI Component for Live Preview
// ---------------------------------------------------------------------------
function LiveAppPreview({ color, secondary, mode }: { color: string, secondary: string, mode: string }) {
  const isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  const bg = isDark ? '#020617' : '#F8FAFC';
  const surface = isDark ? '#0F172A' : '#FFFFFF';
  const border = isDark ? '#1E293B' : '#E2E8F0';
  const text = isDark ? '#F8FAFC' : '#0F172A';
  const textMuted = isDark ? '#64748B' : '#64748B';

  return (
    <div className="rounded-2xl border-4 shadow-2xl overflow-hidden flex flex-col transition-colors duration-300" style={{ borderColor: border, height: '700px', backgroundColor: bg }}>
      
      {/* Fake Browser Chrome */}
      <div className="px-4 py-3 flex items-center gap-2 border-b" style={{ backgroundColor: isDark ? '#1E293B' : '#F1F5F9', borderColor: border }}>
        <div className="w-3 h-3 rounded-full bg-red-400"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
        <div className="w-3 h-3 rounded-full bg-green-400"></div>
        <div className="ml-4 flex-1 h-6 rounded-md flex items-center px-3" style={{ backgroundColor: surface }}>
           <span className="text-[10px] font-medium" style={{ color: textMuted }}>localhost:3000/dashboard</span>
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        
        {/* Fake Sidebar */}
        <div className="w-48 lg:w-56 border-r flex flex-col transition-colors duration-300" style={{ backgroundColor: secondary, borderColor: border }}>
           <div className="h-16 flex items-center px-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
             <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: color }}>
               <Activity size={16} />
             </div>
             <span className="font-bold text-white ml-3">BloodConnect</span>
           </div>
           
           <div className="p-3 flex flex-col gap-1 flex-1">
             <div className="px-3 py-2 text-[10px] font-bold tracking-wider text-white/50 mt-2">MENU</div>
             
             {/* Active Menu Item */}
             <div className="flex items-center px-3 py-2.5 rounded-lg mb-1" style={{ backgroundColor: color }}>
               <LayoutTemplate size={16} className="text-white opacity-90" />
               <span className="ml-3 text-sm font-semibold text-white">Dashboard</span>
             </div>
             
             {/* Inactive Menu Items */}
             {[1, 2, 3].map(i => (
               <div key={i} className="flex items-center px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/5 transition-colors">
                 <div className="w-4 h-4 rounded-sm bg-white/20"></div>
                 <span className="ml-3 text-sm font-medium">Menu Link {i}</span>
               </div>
             ))}
           </div>
           
           <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-white/20"></div>
               <div>
                 <div className="w-20 h-2.5 bg-white/80 rounded mb-1.5"></div>
                 <div className="w-12 h-2 bg-white/40 rounded"></div>
               </div>
             </div>
           </div>
        </div>

        {/* Fake Main Content */}
        <div className="flex-1 flex flex-col">
          
          {/* Fake Header */}
          <div className="h-16 border-b flex items-center justify-between px-6 transition-colors duration-300" style={{ backgroundColor: surface, borderColor: border }}>
             <div className="w-48 h-9 rounded-lg" style={{ backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }}></div>
             <div className="flex gap-4 items-center">
               <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }}>
                 <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: textMuted }}></div>
               </div>
               <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }}>
                 <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: textMuted }}></div>
               </div>
             </div>
          </div>
          
          {/* Fake Page Content */}
          <div className="p-6 flex-1 flex flex-col gap-6 overflow-hidden">
             
             {/* Page Title */}
             <div className="flex items-center justify-between">
               <div>
                 <h2 className="text-xl font-bold mb-1 transition-colors duration-300" style={{ color: text }}>Welcome Back, Admin</h2>
                 <p className="text-sm transition-colors duration-300" style={{ color: textMuted }}>Here's what's happening today.</p>
               </div>
               <button className="px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all duration-300" style={{ backgroundColor: color }}>
                 New Request
               </button>
             </div>
             
             {/* Stat Cards */}
             <div className="grid grid-cols-3 gap-4">
               {[
                 { title: 'Total Donors', val: '2,481', highlight: false },
                 { title: 'Pending Requests', val: '45', highlight: true },
                 { title: 'Hospitals', val: '112', highlight: false },
               ].map((stat, i) => (
                 <div key={i} className="p-5 rounded-2xl border shadow-sm transition-colors duration-300" style={{ backgroundColor: surface, borderColor: border }}>
                   <div className="flex justify-between items-start mb-4">
                     <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: stat.highlight ? `${color}15` : isDark ? '#1E293B' : '#F1F5F9' }}>
                       <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: stat.highlight ? color : textMuted }}></div>
                     </div>
                     <div className="w-12 h-4 rounded-full" style={{ backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }}></div>
                   </div>
                   <p className="text-xs font-semibold uppercase tracking-wider mb-1 transition-colors duration-300" style={{ color: textMuted }}>{stat.title}</p>
                   <p className="text-2xl font-black transition-colors duration-300" style={{ color: text }}>{stat.val}</p>
                 </div>
               ))}
             </div>
             
             {/* Table Area */}
             <div className="flex-1 rounded-2xl border shadow-sm overflow-hidden flex flex-col transition-colors duration-300" style={{ backgroundColor: surface, borderColor: border }}>
               <div className="px-5 py-4 border-b flex justify-between items-center" style={{ borderColor: border }}>
                 <h3 className="font-bold text-sm" style={{ color: text }}>Recent Activity</h3>
                 <div className="w-20 h-6 rounded border" style={{ borderColor: border }}></div>
               </div>
               <div className="p-5 flex flex-col gap-4">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="flex items-center justify-between pb-4 border-b last:border-0 last:pb-0 transition-colors duration-300" style={{ borderColor: border }}>
                     <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full" style={{ backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }}></div>
                       <div>
                         <div className="h-3.5 w-32 rounded mb-2 transition-colors duration-300" style={{ backgroundColor: text }}></div>
                         <div className="h-2.5 w-20 rounded transition-colors duration-300" style={{ backgroundColor: textMuted }}></div>
                       </div>
                     </div>
                     <div className="px-3 py-1 rounded-full text-[10px] font-bold" style={{ backgroundColor: i === 1 ? `${color}20` : isDark ? '#1E293B' : '#F1F5F9', color: i === 1 ? color : textMuted }}>
                       {i === 1 ? 'URGENT' : 'NORMAL'}
                     </div>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>
      </div>
    </div>
  );
}
