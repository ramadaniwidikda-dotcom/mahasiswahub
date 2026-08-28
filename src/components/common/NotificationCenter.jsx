import React, { useState, useRef, useEffect } from 'react';
import { Bell, AlertTriangle, Clock, Calendar as CalendarIcon, CheckCircle2, Check } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';

export default function NotificationCenter({ setActiveTab }) {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAppData();
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (item) => {
    markNotificationRead(item.id);
    if (item.linkTo && setActiveTab) {
      setActiveTab(item.linkTo);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Pemberitahuan & Pengingat"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary-500" />
              <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                Notifikasi & Pengingat
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
                  {unreadCount} baru
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 font-medium"
              >
                <Check className="h-3 w-3" /> Tandai Dibaca
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500 opacity-80" />
                Tidak ada pengingat mendesak saat ini. Semua tugas terkendali!
              </div>
            ) : (
              notifications.map((item) => {
                const isUrgent = item.type === 'urgent';
                const isWarning = item.type === 'warning';
                const isEvent = item.type === 'event';

                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors flex gap-3 ${
                      !item.read ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {isUrgent && (
                        <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                      )}
                      {isWarning && (
                        <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                          <Clock className="h-4 w-4" />
                        </div>
                      )}
                      {(!isUrgent && !isWarning) && (
                        <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                          <CalendarIcon className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {item.title}
                        </p>
                        {!item.read && (
                          <span className="h-2 w-2 rounded-full bg-primary-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                        {item.message}
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 block">
                        {item.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
