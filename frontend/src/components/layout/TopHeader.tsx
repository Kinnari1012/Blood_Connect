import React, { useState } from 'react';
import { Search, Bell, Globe, ChevronDown, User, LogOut, Settings, Menu, Palette } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { useTheme } from '../../store/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants';

export function TopHeader() {
  const { user, isAdmin, isSuperAdmin, isDonor, logout } = useAuth();
  const { color, secondaryColor, mode, setColor, setSecondaryColor, setMode, resetTheme } = useTheme();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState<'lang' | 'profile' | 'notif' | 'theme' | null>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleLabel = isAdmin
    ? (isSuperAdmin ? 'Super Admin' : 'Admin')
    : isDonor ? 'Donor'
    : 'User';

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'gu', label: 'ગુજરાતી' },
  ];

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('BloodConnect_lang', code);
    setActiveMenu(null);
  };

  const dispatchSidebarEvent = () => {
    window.dispatchEvent(new Event('toggle-mobile-sidebar'));
  };

  return (
    <header className="h-[72px] bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 relative z-40 flex-shrink-0" style={{ backgroundColor: 'var(--c-surface)' }}>
      
      {/* Mobile Menu & Search */}
      <div className="flex items-center flex-1 gap-2 lg:gap-4 max-w-md relative">
        <button onClick={dispatchSidebarEvent} className="lg:hidden p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg focus:outline-none transition-colors">
          <Menu size={24} />
        </button>
        <div className="flex-1 relative hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search for donors or requests..."
            className="w-full h-10 pl-11 pr-4 bg-gray-100/70 border-none rounded-full text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-5 ml-4" ref={menuRef}>
        {/* Language selector */}
        <div className="relative">
          <button 
            onClick={() => setActiveMenu(activeMenu === 'lang' ? null : 'lang')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors focus:outline-none"
            style={{ color: 'var(--c-secondary-text)' }}
          >
            <Globe size={18} />
            <span className="text-sm font-medium">{currentLang.label}</span>
            <ChevronDown size={14} />
          </button>
          
          {activeMenu === 'lang' && (
            <div className="absolute top-full mt-2 right-0 w-32 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden py-1 z-50" style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${i18n.language === lang.code ? 'font-bold' : ''}`}
                  style={{ color: i18n.language === lang.code ? 'var(--c-primary)' : 'var(--c-text)', backgroundColor: i18n.language === lang.code ? 'var(--c-primary-light)' : 'transparent' }}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>



        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setActiveMenu(activeMenu === 'notif' ? null : 'notif')}
            className="relative text-gray-500 hover:text-primary transition-colors focus:outline-none p-2 rounded-full hover:bg-gray-100"
          >
            <Bell size={20} />
            <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-600 border-2 border-white rounded-full flex items-center justify-center text-[9px] font-bold text-white">
              2
            </span>
          </button>

          {activeMenu === 'notif' && (
            <div className="absolute top-full mt-2 -right-2 sm:right-0 w-[calc(100vw-2rem)] sm:w-80 max-w-[320px] bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden py-1 z-50 transform origin-top-right transition-all">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                 <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                 <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">2 New</span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                 <div className="px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex gap-3">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-primary flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Emergency Blood Request</p>
                      <p className="text-xs text-gray-500 mt-0.5">O- blood required at Apollo Hospital.</p>
                    </div>
                 </div>
                 <div className="px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex gap-3">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-primary flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Donation Successful</p>
                      <p className="text-xs text-gray-500 mt-0.5">Your certificate is ready to download.</p>
                    </div>
                 </div>
              </div>
              <div className="p-2 border-t border-gray-100 bg-gray-50/50">
                 <button onClick={() => { setActiveMenu(null); navigate(ROUTES.NOTIFICATIONS); }} className="w-full text-center text-xs font-bold text-primary py-2 hover:bg-primary/5 rounded-lg transition-colors focus:outline-none">
                   View All Notifications
                 </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-gray-200"></div>

        {/* User Profile */}
        <div className="relative">
          <button 
            onClick={() => setActiveMenu(activeMenu === 'profile' ? null : 'profile')}
            className="flex items-center gap-3 hover:bg-gray-50 p-1 pr-2 rounded-full transition-all text-left focus:outline-none"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-primary text-white flex items-center justify-center font-bold shadow-sm">
              {user?.fullName?.charAt(0)?.toUpperCase() || <User size={18} />}
            </div>
            <div className="hidden md:block min-w-0">
              <p className="text-sm font-bold text-gray-900 leading-tight truncate">{user?.fullName || 'Guest User'}</p>
              <span className="inline-flex items-center mt-0.5 text-xs font-semibold text-primary">
                {roleLabel}
              </span>
            </div>
            <ChevronDown size={14} className="text-gray-400 hidden md:block ml-1" />
          </button>

          {activeMenu === 'profile' && (
            <div className="absolute top-full mt-2 -right-2 sm:right-0 w-[calc(100vw-2rem)] sm:w-64 max-w-[280px] bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden py-2 z-50 transform origin-top-right transition-all">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                 <div className="w-12 h-12 rounded-full bg-gradient-primary text-white flex items-center justify-center font-bold shadow-sm text-lg">
                  {user?.fullName?.charAt(0)?.toUpperCase() || <User size={20} />}
                 </div>
                 <div className="flex flex-col min-w-0">
                   <span className="font-bold text-gray-900 truncate">{user?.fullName || 'Guest User'}</span>
                   <span className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</span>
                   <span className="inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary uppercase tracking-wider w-fit">
                    {roleLabel}
                   </span>
                 </div>
              </div>
              <div className="py-2">
                <button onClick={() => { setActiveMenu(null); navigate(ROUTES.PROFILE); }} className="w-full text-left px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <User size={16} className="text-gray-400" /> My Profile
                </button>
                <button onClick={() => { setActiveMenu(null); navigate(ROUTES.SETTINGS); }} className="w-full text-left px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <Settings size={16} className="text-gray-400" /> Settings
                </button>
              </div>
              <div className="h-px bg-gray-100 my-1"></div>
              <div className="py-1">
                <button 
                  onClick={async () => {
                    setActiveMenu(null);
                    await logout();
                    navigate(ROUTES.LOGIN, { replace: true });
                  }} 
                  className="w-full text-left px-5 py-2.5 text-sm hover:bg-red-50 transition-colors text-red-600 font-bold flex items-center gap-2"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
