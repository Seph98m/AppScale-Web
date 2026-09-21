
import { useState,useEffect } from "react";
import logo from '../assets/logo.png';
import { useAuth } from '../components/AuthContext';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { API_ORIGIN } from '../api/config';
import {
    LayoutDashboard,
    Users,
    ClipboardList,
    Calendar,
    Bell,
    UserCircle,
    LogOut,
    Menu,
    X,
} from 'lucide-react';


const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Master List', path: '/admin/masterlist', icon: ClipboardList },
    { name: 'Schedule', path: '/admin/schedule', icon: Calendar },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'Settings', path: '/admin/profile', icon: UserCircle },
];



function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const {user} = useAuth();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('role');
        sessionStorage.removeItem('user');
        navigate('/login', { replace: true });
    };

    const pageTitles = {
  '/admin/dashboard': <div className="mb-1 px-4">
        <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-sm text-gray-400">Manage your account information and password</p>
      </div>,


  '/admin/users': <div className="mb-1 px-4">
        <h2 className="text-xl font-bold text-gray-800">User Management</h2>
        <p className="text-sm text-gray-400">Manage BHW and BNS accounts across all barangays</p>
      </div>
,


  '/admin/masterlist': <div className="mb-1 px-4">
        <h2 className="text-xl font-bold text-gray-800">Masterlist</h2>
        <p className="text-sm text-gray-400">Complete registry of children and mothers across all barangays</p>
      </div>,


  '/admin/schedule': <div className="mb-1 px-4">
        <h2 className="text-xl font-bold text-gray-800">Schedule Management</h2>
        <p className="text-sm text-gray-400">Plan and track health activities across barangays</p>
      </div>,


  '/admin/notifications': <div className="mb-1 px-4">
        <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
        <p className="text-sm text-gray-400">Manage your account information and password</p>
      </div>,

  '/admin/profile': <div className="mb-1 px-4">
        <h2 className="text-xl font-bold text-gray-800">Settings</h2>
        <p className="text-sm text-gray-400">Manage your account information and password</p>
      </div>,
};

const currentTitle = pageTitles[location.pathname] || '';


    return (
        <div className="app-shell flex h-screen overflow-hidden">
            {/* Sidebar */}
            <aside className={`app-sidebar ${isSidebarOpen ? 'w-64 mobile-open' : 'w-16'} text-white flex flex-col h-screen transition-all duration-300 shrink-0`}>
              <div className={`app-sidebar-header flex items-center p-4 border-b ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
                    {isSidebarOpen ? (
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="rounded-2xl bg-white/95 p-1 shadow-lg shadow-black/10 ring-2 ring-white/20">
                            <img src={logo} alt="AppScale logo" className="h-10 w-10 rounded-xl object-contain" />
                          </div>
                          <div className="min-w-0 leading-none">
                            <span className="block truncate text-lg font-black tracking-tight text-white">AppScale</span>
                            <span className="mt-1 block truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100/75">Health system</span>
                          </div>
                        </div>
                    ) : null}
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>


                <nav className="flex-1 overflow-y-auto py-4">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={() => {
                                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                                }}
                                className={`app-sidebar-link ${isActive ? 'is-active font-semibold' : ''} flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                                  isActive ? '' : ''
                                    }`}
                            >
                                <Icon size={20} />
                                {isSidebarOpen && <span className="text-sm">{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="app-sidebar-footer app-sidebar-header border-t p-2">
                    <button
                        onClick={handleLogout}
                        className="app-sidebar-link flex items-center gap-3 px-4 py-2 w-full rounded-lg transition-colors duration-150 text-sm"
                    >
                        <LogOut size={18} />
                        {isSidebarOpen && <span className="text-sm">Logout</span>}
                    </button>
                </div>
            </aside>

            {isSidebarOpen && (
              <button
                type="button"
                aria-label="Close sidebar"
                className="mobile-sidebar-backdrop"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}

            {/* Main Content */}
            <div className="app-content-shell flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="app-topbar relative z-40 px-2 py-2 flex justify-between items-center gap-3">
          <div className="min-w-0 flex items-center gap-2">
            {!isSidebarOpen && (
              <button
                type="button"
                aria-label="Open sidebar"
                className="md:hidden p-2 rounded-lg text-green-800 hover:bg-green-50"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu size={20} />
              </button>
            )}
            {currentTitle}
          </div>

          <div className="relative">
            <button
              type="button"
              aria-label="Open profile menu"
              aria-expanded={isProfileMenuOpen}
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 rounded-full p-1 pr-2 transition hover:bg-green-50"
            >
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-green-600 text-sm font-bold text-white shadow-sm ring-1 ring-green-100">
                {user?.profile_picture ? (
                  <img
                    src={`${API_ORIGIN}${user.profile_picture}`}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (user?.first_name?.charAt(0) || user?.full_name?.charAt(0) || user?.username?.charAt(0) || "A").toUpperCase()
                )}
              </span>
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 top-14 z-[100] w-56 rounded-2xl border border-green-100 bg-white p-2 shadow-xl shadow-green-900/10">
                <div className="border-b border-gray-100 px-3 py-2">
                  <p className="truncate text-sm font-bold text-gray-800">{user?.full_name || user?.username || "Admin"}</p>
                  <p className="truncate text-xs text-gray-500">{user?.email || "Administrator account"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigate('/admin/profile');
                  }}
                  className="mt-1 flex w-full items-center rounded-xl px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-800"
                >
                  View profile
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="app-main flex-1 overflow-auto p-6">
          <div key={location.pathname} className="app-route-view">
            <Outlet />
          </div>
        </div>
      </div>
  
                 
            
        </div>
    );
}

export default AdminLayout;