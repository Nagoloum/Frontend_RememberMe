import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Home,
  Clock,
  Calendar,
  ListTodo,
} from 'lucide-react';
import { getLists, setAuthToken } from '../services/api';
import ThemeToggle from './ThemeToggle';

export default function SideBarComponent() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lists, setLists] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = (e) => {
      setIsMobile(e.matches);
      if (e.matches) {
        setCollapsed(false);
        setMobileOpen(false);
      }
    };
    onChange(mq);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getLists();
        setLists(Array.isArray(res) ? res : []);
      } catch {
        setLists([]);
      }
    };

    load();
    const onListsChanged = () => load();
    window.addEventListener('lists:changed', onListsChanged);
    return () => window.removeEventListener('lists:changed', onListsChanged);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthToken(null);
    navigate('/auth', { replace: true });
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className={isMobile ? 'w-0' : 'relative m-4'}>
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-40 px-4 py-3 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200/70 dark:border-gray-800/70">
          <div className="flex items-center justify-between">
            <NavLink to="/home" className="flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="RememberMe" className="w-full h-full object-cover" />
              </div>
              <h1 className="font-bold text-lg text-indigo-600 dark:text-indigo-400">
                RememberMe
              </h1>
            </NavLink>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-3 border border-gray-200 dark:border-gray-700"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? (
                <X className="w-5 h-5 text-gray-700 dark:text-gray-200" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-200" />
              )}
            </button>
          </div>
        </div>
      )}

      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={closeMobile}
        />
      )}

      {(!isMobile || mobileOpen) && (
      <aside
        className={`${
          collapsed ? 'w-20' : 'w-72'
        } transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 shadow-2xl flex flex-col ${
          isMobile
            ? 'fixed z-50 left-0 top-0 h-[100dvh] w-[65vw] max-w-[20rem] rounded-none m-0'
            : 'rounded-3xl h-[calc(100vh-2rem)]'
        }`}
      >
      {/* Header */}
      <div className={`p-5 ${isMobile ? 'hidden' : 'flex'} items-center justify-between`}>
        <NavLink to="/home" className="flex items-center gap-3">
          {/* Logo */}
          <div className="w-9 h-9  flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="RememberMe" className="w-full h-full object-cover" />
          </div>

          {/* Titre */}
          <h1
            className={`font-bold text-xl text-indigo-600 dark:text-indigo-400 transition-opacity overflow-hidden ${
              collapsed ? 'opacity-0 w-0' : 'opacity-100'
            }`}
          >
            RememberMe
          </h1>
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 min-h-0 max- ${collapsed ? 'px-2' : 'px-5'} pt-5 flex flex-col`}>
        {/* Section Tasks */}
        <div className="shrink-0">
          <h3
            className={`text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 transition-opacity ${
              collapsed ? 'opacity-0 h-0 mb-0' : 'opacity-100'
            }`}
          >
            Tasks
          </h3>
          <ul className="space-y-1.5">
            {[
              { icon: Home, label: 'Upcoming', href: '/home' },
              { icon: Clock, label: 'Today', href: '/today' },
              { icon: Calendar, label: 'Calendar', href: '/calendar' },
              { icon: ListTodo, label: 'Sticky Wall', href: '/sticky-wall' },
            ].map((item) => (
              <li key={item.label}>
                <NavLink
                  to={item.href}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `w-full flex items-center transition-all group rounded-xl ${
                      collapsed ? 'justify-center px-0' : 'justify-start px-3'
                    } py-2 ${
                      isActive
                        ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium'
                        : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-700 dark:text-gray-200'
                    }`
                  }
                >
                  <div className={`flex items-center ${collapsed ? 'justify-center w-full' : 'gap-3'}`}>
                    <item.icon className="w-4.5 h-4.5 flex-shrink-0 text-gray-600 dark:text-gray-300" />
                    {!collapsed && (
                      <span className="text-sm font-medium overflow-hidden transition-opacity">
                        {item.label}
                      </span>
                    )}
                  </div>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Section Lists */}
        <div className="mt-6 flex-1 min-h-0 flex flex-col">
          <h3
            className={`text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 transition-opacity ${
              collapsed ? 'opacity-0 h-0 mb-0' : 'opacity-100'
            }`}
          >
            Lists
          </h3>
          <ul className="space-y-1.5 flex-1 min-h-0 overflow-y-auto pr-1">
            {['General', ...lists.map((l) => l.name)].filter((v, i, a) => a.indexOf(v) === i).map((name) => (
              <li key={name}>
                <NavLink
                  to={`/lists/${encodeURIComponent(name)}`}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `w-full flex items-center transition-all group rounded-xl ${
                      collapsed ? 'justify-center px-0' : 'justify-start px-3'
                    } py-2 ${
                      isActive
                        ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium'
                        : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-700 dark:text-gray-200'
                    }`
                  }
                >
                  <div className={`flex items-center ${collapsed ? 'justify-center w-full' : 'gap-3'}`}>
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 flex-shrink-0" />
                    {!collapsed && (
                      <span className="text-sm font-medium overflow-hidden transition-opacity">
                        {name}
                      </span>
                    )}
                  </div>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-5 space-y-2 border-t border-gray-200 dark:border-gray-700">
        <div className="md:hidden">
          <div className={`w-full flex items-center transition-all group border rounded-xl ${collapsed ? 'justify-center px-0' : 'justify-start px-3'} py-2`}>
            <ThemeToggle floating={false} variant="sidebar" className='pl-1'/>
            {!collapsed && (
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 ml-3">
                ←  Change Theme
              </span>
            )}
          </div>
        </div>

        {/* Settings */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `w-full flex items-center transition-all group rounded-xl ${
              collapsed ? 'justify-center px-0' : 'justify-start px-3'
            } py-2 ${
              isActive
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
            }`
          }
        >
          <div className={`flex items-center ${collapsed ? 'justify-center w-full' : 'gap-3'}`}>
            <Settings className="w-4.5 h-4.5 text-gray-600 dark:text-gray-300 flex-shrink-0" />
            {!collapsed && (
              <span className="text-sm font-medium overflow-hidden transition-opacity">
                Settings
              </span>
            )}
          </div>
        </NavLink>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center transition-all group rounded-xl ${
            collapsed ? 'justify-center px-0' : 'justify-start px-3'
          } py-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400`}
        >
          <div className={`flex items-center ${collapsed ? 'justify-center w-full' : 'gap-3'}`}>
            <LogOut className="w-4.5 h-4.5 flex-shrink-0" />
            {!collapsed && (
              <span className="text-sm font-medium overflow-hidden transition-opacity">
                Logout
              </span>
            )}
          </div>
        </button>
      </div>
      </aside>
      )}

      {!isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-6 bottom-10 z-10 bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-3 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          )}
        </button>
      )}
    </div>
  );
}
