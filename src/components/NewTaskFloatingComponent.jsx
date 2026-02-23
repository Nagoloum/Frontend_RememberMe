import React, { useEffect, useMemo, useState } from 'react';
import { X, Calendar, Flag, ChevronDown, Plus, Clock } from 'lucide-react';
import { createList, createTodo, getLists } from '../services/api';

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
  { value: 'high', label: 'High', color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
];

export default function NewTaskFloatingComponent({ open, onOpenChange, onSuccess, onError }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [list, setList] = useState('General');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lists, setLists] = useState([]);
  const [listsLoading, setListsLoading] = useState(false);
  const [listMenuOpen, setListMenuOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [addingList, setAddingList] = useState(false);
  const minDate = new Date().toISOString().split('T')[0];

  const isOpen = Boolean(open);
  const setIsOpen = (next) => {
    if (onOpenChange) onOpenChange(next);
  };

  const getApiMessage = (err, fallback) => {
    const data = err?.response?.data;
    if (typeof data === 'string' && data.trim()) return data;
    return data?.message || data?.details || fallback;
  };

  const listOptions = useMemo(() => {
    return ['General', ...lists.map((l) => l.name)].filter((v, i, a) => a.indexOf(v) === i);
  }, [lists]);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      try {
        setListsLoading(true);
        const res = await getLists();
        setLists(Array.isArray(res) ? res : []);
      } catch {
        setLists([]);
      } finally {
        setListsLoading(false);
      }
    };
    load();
  }, [isOpen]);

  const handleAddList = async () => {
    const name = newListName.trim();
    if (!name) return;
    try {
      setAddingList(true);
      setError('');
      const created = await createList(name);
      setNewListName('');
      const res = await getLists();
      setLists(Array.isArray(res) ? res : []);
      setList(created?.name || name);
      window.dispatchEvent(new Event('lists:changed'));
    } catch (err) {
      const message = getApiMessage(err, 'Erreur lors de la création de la liste');
      setError(message);
      if (onError) onError(message);
    } finally {
      setAddingList(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Le titre est requis');
      return;
    }

    setLoading(true);
    try {
      const todoData = {
        title: trimmedTitle,
      };

      if (description.trim()) todoData.description = description.trim();
      if (dueDate) todoData.dueDate = dueDate;
      if (dueTime) todoData.dueTime = dueTime;
      if (list && list !== 'General') todoData.list = list; // General est déjà la valeur par défaut
      if (priority && priority !== 'medium') todoData.priority = priority;

      const newTodo = await createTodo(todoData); // ← directement l'objet todo
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(newTodo);
      }
      
      // Réinitialisation du formulaire
      setTitle('');
      setDescription('');
      setDueDate('');
      setDueTime('');
      setList('General');
      setPriority('medium');
      setListMenuOpen(false);
      setNewListName('');
      setIsOpen(false);

    } catch (err) {
      console.error('Erreur création tâche:', err);
      const message = getApiMessage(err, 'Erreur lors de la création de la tâche');
      setError(message);
      if (onError) onError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 m-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">New Task</h2>
              <button onClick={() => setIsOpen(false)} disabled={loading}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Titre */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Buy groceries"
                  className="w-full px-4 py-3 rounded-xl border dark:text-white border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  autoFocus
                  required
                  disabled={loading}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional details..."
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border dark:text-white border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 resize-none text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  disabled={loading}
                />
              </div>

              {/* Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={minDate}
                  className="w-full px-4 py-3 rounded-xl dark:text-white border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  disabled={loading}
                />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Time
                  </label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl dark:text-white border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* List */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  List
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setListMenuOpen((v) => !v)}
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-base text-left flex items-center justify-between gap-3 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <span className="truncate">{list}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${listMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {listMenuOpen && (
                    <div className="absolute z-10 mt-2 w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl overflow-hidden">
                      <div className="max-h-56 overflow-y-auto p-2">
                        {listOptions.map((name) => (
                          <button
                            key={name}
                            type="button"
                            onClick={() => {
                              setList(name);
                              setListMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition ${
                              name === list
                                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                            }`}
                          >
                            {name}
                          </button>
                        ))}
                        {!listsLoading && listOptions.length === 0 && (
                          <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                            No lists
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="Add a new list"
                    className="flex-1 min-w-0 px-4 py-3 rounded-xl border dark:text-white border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    disabled={loading || addingList}
                  />
                  <button
                    type="button"
                    onClick={handleAddList}
                    disabled={loading || addingList || !newListName.trim()}
                    className="shrink-0 px-3 sm:px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add</span>
                  </button>
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5" />
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {PRIORITY_OPTIONS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value)}
                      disabled={loading}
                      className={`py-2.5 px-3 rounded-xl text-sm  font-medium transition-all ${priority === p.value
                        ? `${p.color} ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-gray-800`
                        : 'bg-gray-100 dark:bg-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Boutons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 transition disabled:opacity-50 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !title.trim()}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-medium transition text-sm flex items-center gap-2"
                >
                  {loading ? 'Adding...' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
