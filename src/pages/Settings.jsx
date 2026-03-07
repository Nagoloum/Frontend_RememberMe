import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, Save, User, Clock as ClockIcon, Plus } from 'lucide-react';
import { getMe, getTodayNotifications, updateMe } from '../services/api';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    notificationsEnabled: true,
    notificationTime: '09:00',
  });
  const [savedProfile, setSavedProfile] = useState(null);

  const [notifLoading, setNotifLoading] = useState(true);
  const [notifDate, setNotifDate] = useState(new Date().toISOString().slice(0, 10));
  const [notifTodos, setNotifTodos] = useState([]);
  const [selectedTodo, setSelectedTodo] = useState(null);

  const dirty = useMemo(() => {
    if (!savedProfile) return false;
    return (
      savedProfile.name !== profile.name ||
      Boolean(savedProfile.notificationsEnabled) !== Boolean(profile.notificationsEnabled) ||
      (savedProfile.notificationTime || '09:00') !== (profile.notificationTime || '09:00')
    );
  }, [profile, savedProfile]);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const me = await getMe();
      const normalized = {
        name: me?.name || '',
        email: me?.email || '',
        notificationsEnabled: Boolean(me?.notificationsEnabled),
        notificationTime: me?.notificationTime || '09:00',
      };
      setProfile(normalized);
      setSavedProfile(normalized);
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      setNotifLoading(true);
      setError('');
      const res = await getTodayNotifications();
      setNotifDate(res?.date || new Date().toISOString().slice(0, 10));
      setNotifTodos(Array.isArray(res?.todos) ? res.todos : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur lors du chargement des notifications');
      setNotifTodos([]);
    } finally {
      setNotifLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (selectedTodo && !notifTodos.some((t) => t._id === selectedTodo._id)) setSelectedTodo(null);
  }, [notifTodos, selectedTodo]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      const updated = await updateMe({
        name: profile.name,
        notificationsEnabled: Boolean(profile.notificationsEnabled),
        notificationTime: profile.notificationTime,
      });
      const normalized = {
        name: updated?.name || profile.name,
        email: updated?.email || profile.email,
        notificationsEnabled: Boolean(updated?.notificationsEnabled),
        notificationTime: updated?.notificationTime || profile.notificationTime || '09:00',
      };
      setProfile(normalized);
      setSavedProfile(normalized);
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          localStorage.setItem('user', JSON.stringify({ ...parsed, name: normalized.name, email: normalized.email }));
        } catch {
          localStorage.setItem('user', JSON.stringify({ name: normalized.name, email: normalized.email }));
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur lors de la sauvegarde des paramètres');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {error && (
        <div className="col-span-12 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-2xl p-4 flex items-start justify-between gap-4">
          <div className="text-sm">{error}</div>
          <button
            onClick={() => setError('')}
            className="px-3 py-1.5 rounded-lg bg-transparent hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 text-sm"
          >
            Fermer
          </button>
        </div>
      )}

      <div className="col-span-12 md:col-span-5 bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Settings</h2>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || saving || !dirty}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>

        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">Nom</p>
              <input
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                disabled={loading || saving}
                className="mt-1 w-full px-3 py-2 rounded-lg border dark:text-white border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-5 h-5 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
              @
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <input
                value={profile.email}
                disabled
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Affiche les tâches dont la date correspond à aujourd’hui
                </p>
              </div>
              <button
                type="button"
                onClick={() => setProfile((p) => ({ ...p, notificationsEnabled: !p.notificationsEnabled }))}
                disabled={loading || saving}
                className={`w-12 h-7 rounded-full transition flex items-center px-1 ${
                  profile.notificationsEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                aria-label="Activer les notifications"
              >
                <span
                  className={`h-5 w-5 rounded-full bg-white transition transform ${
                    profile.notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <ClockIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Heure (préférence)</p>
                <input
                  type="time"
                  value={profile.notificationTime}
                  onChange={(e) => setProfile((p) => ({ ...p, notificationTime: e.target.value }))}
                  disabled={loading || saving}
                  className="mt-1 px-3 py-2 rounded-lg border dark:text-white border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

     
    </>
  );
}
