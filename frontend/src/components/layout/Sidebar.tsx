import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Search, FileText, AlertCircle, Users,
  ClipboardList, Bell, BarChart2, Settings, Home, LogOut, Heart, ShieldCheck, HelpCircle, Database, X
} from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { ROUTES } from '../../constants';
import { useTranslation } from 'react-i18next';

type NavItem = { path: string; icon: any; label: string; subItems?: {path: string, label: string}[] };
type NavGroup = { title?: string; items: NavItem[] };

export function Sidebar() {
  const [expandedMenus, setExpandedMenus] = React.useState<Record<string, boolean>>(() => {
    try {
      const saved = sessionStorage.getItem('sidebar_expanded_menus');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, isDonor } = useAuth();
  
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });
  
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const handleToggle = () => setIsMobileOpen(prev => !prev);
    window.addEventListener('toggle-mobile-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-mobile-sidebar', handleToggle);
  }, []);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('sidebar_collapsed', String(next));
  };

  const getNavGroups = (): NavGroup[] => {
    if (!user) return [];
    
    if (user.role === 'SUPER_ADMIN') {
      return [
        { items: [{ path: ROUTES.SUPER_ADMIN_DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' }] },
        {
          title: 'Management',
          items: [
            { path: '/super-admin/admins', icon: ShieldCheck, label: 'Admin Management' },
            { path: '/super-admin/users', icon: Users, label: 'User Management' },
            { path: '/super-admin/donors', icon: Heart, label: 'Donor Management' },
          ]
        },
        {
          title: 'Blood Ecosystem',
          items: [
            { path: '/super-admin/requests', icon: FileText, label: 'Blood Requests' },
          ]
        },
        {
          title: 'Insights & System',
          items: [
            { path: '/super-admin/reports', icon: BarChart2, label: 'Reports & Analytics' },
            { path: '/super-admin/audit', icon: Database, label: 'Audit Logs' },
            { path: '/super-admin/settings', icon: Settings, label: 'System Settings' },
            { path: '/super-admin/security', icon: ShieldCheck, label: 'Security' },
          ]
        }
      ];
    } else if (user.role === 'ADMIN') {
      return [
        { items: [{ path: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' }] },
        {
          title: 'Blood Operations',
          items: [
            { path: ROUTES.BLOOD_REQUESTS, icon: FileText, label: 'Blood Requests' },
            { path: '/requests/emergency', icon: AlertCircle, label: 'Emergency Requests' },
            { path: ROUTES.DONORS, icon: Heart, label: 'Donor Management' },
            { path: '/admin/matching', icon: Heart, label: 'Donor Matching' },
            { path: ROUTES.BLOOD_DONATIONS, icon: ClipboardList, label: 'Donation Management' },
          ]
        },
        {
          title: 'Management',
          items: [
            { path: ROUTES.USERS, icon: Users, label: 'Users' },
            { path: ROUTES.NOTIFICATIONS, icon: Bell, label: 'Notifications' },
          ]
        },
        {
          title: 'Insights',
          items: [
            { path: ROUTES.REPORTS, icon: BarChart2, label: 'Reports' },
          ]
        },
        {
          title: 'Account',
          items: [
            { path: ROUTES.SETTINGS, icon: Settings, label: 'Settings' },
            { path: '/help', icon: HelpCircle, label: 'Help & Support' },
          ]
        }
      ];
    } else if (isDonor) {
      return [
        {
          items: [
            { path: ROUTES.DONOR_DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
            { 
              path: ROUTES.BLOOD_REQUESTS, 
              icon: FileText, 
              label: 'Blood Requests',
              subItems: [
                { path: '/requests/incoming', label: 'Matching Requests' },
                { path: '/requests/my', label: 'My Requests' }
              ]
            },
            { path: '/donation-history', icon: ClipboardList, label: 'Donation History' },
            { path: ROUTES.NOTIFICATIONS, icon: Bell, label: 'Notifications' },
            { path: ROUTES.SETTINGS, icon: Settings, label: 'Settings' },
          ]
        }
      ];
    } else {
      return [
        {
          items: [
            { path: ROUTES.USER_DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
            { path: ROUTES.FIND_BLOOD, icon: Search, label: 'Find Donors' },
            { 
              path: ROUTES.BLOOD_REQUESTS, 
              icon: FileText, 
              label: 'Blood Requests',
              subItems: [
                { path: '/requests/create', label: 'Create Request' },
                { path: '/requests/my', label: 'My Requests' }
              ]
            },
            { path: ROUTES.NOTIFICATIONS, icon: Bell, label: 'Notifications' },
            { path: ROUTES.SETTINGS, icon: Settings, label: 'Settings' },
          ]
        }
      ];
    }
  };

  const navGroups = getNavGroups();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <>
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs z-[990] lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`fixed lg:sticky top-0 lg:flex flex-col h-[100dvh] flex-shrink-0 bg-[#FFFFFF] border-r border-[#E0E0E0] z-[1000] lg:z-30 shadow-2xl lg:shadow-none transition-all duration-300 ease-in-out 
        ${isCollapsed ? 'w-[80px]' : 'w-[260px]'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand */}
        <div className="h-[72px] flex items-center px-5 border-b border-[#E0E0E0] flex-shrink-0 justify-between">
          <Link to={ROUTES.HOME} onClick={() => setIsMobileOpen(false)} className={`flex items-center gap-3 focus:outline-none overflow-hidden ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full overflow-hidden bg-primary/10">
              <img src="/logo.jpg" alt="LifeLink" className="w-full h-full object-cover" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1 whitespace-nowrap animate-in fade-in duration-300">
                <p className="font-bold text-sm leading-tight text-primary">LifeLink</p>
                <p className="text-[10px] text-gray-500 leading-tight mt-0.5 truncate">{t('home.tagline')}</p>
              </div>
            )}
          </Link>
          {!isCollapsed && (
            <button onClick={toggleSidebar} className="text-gray-400 hover:text-primary transition-colors focus:outline-none p-1 rounded-md hover:bg-gray-100 hidden lg:block">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
          )}
          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="text-gray-400 hover:text-primary transition-colors focus:outline-none p-1.5 rounded-lg hover:bg-gray-100 lg:hidden"
            title="Close Menu"
          >
            <X size={20} />
          </button>
        </div>

        {isCollapsed && (
          <button onClick={toggleSidebar} className="w-full py-2 flex justify-center text-gray-400 hover:text-primary transition-colors focus:outline-none hidden lg:flex border-b border-gray-100">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        )}

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto py-4 space-y-5 ${isCollapsed ? 'px-3' : 'px-3'}`}>
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && group.title && (
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{group.title}</p>
              )}
              {group.items.map(({ path, icon: Icon, label, subItems }) => {
                const hasActiveChild = Boolean(subItems?.some(sub => location.pathname === sub.path || location.pathname.startsWith(sub.path)));
                const active = location.pathname === path || hasActiveChild || (path !== ROUTES.HOME && location.pathname.startsWith(path) && path !== ROUTES.USER_DASHBOARD && path !== ROUTES.ADMIN_DASHBOARD && path !== ROUTES.SUPER_ADMIN_DASHBOARD);
                const isExpanded = expandedMenus[label] !== undefined ? expandedMenus[label] : hasActiveChild;

                const handleToggleSub = () => {
                  setExpandedMenus(prev => {
                    const current = prev[label] !== undefined ? prev[label] : hasActiveChild;
                    const next = { ...prev, [label]: !current };
                    try { sessionStorage.setItem('sidebar_expanded_menus', JSON.stringify(next)); } catch {}
                    return next;
                  });
                };
                
                return (
                  <div key={label} className="relative group">
                    <div className="flex flex-col">
                      {subItems ? (
                        <button
                          onClick={handleToggleSub}
                          className={`flex items-center justify-between rounded-lg text-sm font-medium transition-colors focus:outline-none w-full ${
                            isCollapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2.5'
                          } ${
                            active 
                              ? 'bg-primary/10 text-primary' 
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                          title={isCollapsed ? label : ''}
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={isCollapsed ? 22 : 18} strokeWidth={active ? 2.5 : 2} className={active ? 'text-primary' : 'text-gray-500 group-hover:text-gray-800'} />
                            {!isCollapsed && <span className="truncate whitespace-nowrap">{label}</span>}
                          </div>
                          {!isCollapsed && (
                            <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </button>
                      ) : (
                        <Link
                          to={path}
                          onClick={() => setIsMobileOpen(false)}
                          className={`flex items-center rounded-lg text-sm font-medium transition-colors focus:outline-none ${
                            isCollapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2.5'
                          } ${
                            active 
                              ? 'bg-primary/10 text-primary' 
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                          title={isCollapsed ? label : ''}
                        >
                          <Icon size={isCollapsed ? 22 : 18} strokeWidth={active ? 2.5 : 2} className={active ? 'text-primary' : 'text-gray-500 group-hover:text-gray-800'} />
                          {!isCollapsed && <span className="truncate whitespace-nowrap">{label}</span>}
                          {!isCollapsed && active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
                        </Link>
                      )}

                      {!isCollapsed && subItems && isExpanded && (
                        <div className="mt-1 ml-9 flex flex-col gap-1 border-l-2 border-gray-100 pl-3">
                          {subItems.map((sub) => {
                            const isSubActive = location.pathname === sub.path || location.pathname.startsWith(sub.path + '/');
                            return (
                              <Link
                                key={sub.path}
                                to={sub.path}
                                onClick={() => setIsMobileOpen(false)}
                                className={`text-sm py-2 px-3 rounded-lg transition-all flex items-center justify-between ${
                                  isSubActive 
                                    ? 'bg-primary/10 text-primary font-bold shadow-xs' 
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                              >
                                <span>{sub.label}</span>
                                {isSubActive && <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    
                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg pointer-events-none">
                        {label}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-[#E0E0E0]">
          <div className="relative group">
            <button
              onClick={handleLogout}
              className={`flex items-center w-full rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors focus:outline-none ${
                isCollapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2.5'
              }`}
            >
              <LogOut size={isCollapsed ? 22 : 18} className="group-hover:text-red-600" />
              {!isCollapsed && <span className="whitespace-nowrap">{t('nav.logout')}</span>}
            </button>
            
            {isCollapsed && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg pointer-events-none">
                {t('nav.logout')}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
