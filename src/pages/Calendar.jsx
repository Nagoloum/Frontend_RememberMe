import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { getTodos } from '../services/api';
import TaskCalendar from '../components/TaskCalendar';
import TodoListComponent from '../components/TodoListComponent';
import TodoDetailsComponent from '../components/TodoDetailsComponent';
import NewTaskFloatingComponent from '../components/NewTaskFloatingComponent';

const toYMD = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseYMD = (ymd) => {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
  const [y, m, d] = ymd.split('-').map((v) => Number(v));
  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const getTodoDateKey = (todo) => {
  if (todo?.dueDate) {
    if (typeof todo.dueDate === 'string' && todo.dueDate.length >= 10) return todo.dueDate.slice(0, 10);
    const d = new Date(todo.dueDate);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  if (todo?.createdAt) {
    const d = new Date(todo.createdAt);
    if (!Number.isNaN(d.getTime())) return toYMD(d);
  }
  return null;
};

export default function Calendar() {
  const params = useParams();
  const navigate = useNavigate();

  const initialSelected = useMemo(() => {
    const fromParam = parseYMD(params?.date);
    return fromParam || new Date();
  }, [params?.date]);

  const [month, setMonth] = useState(() => new Date(initialSelected.getFullYear(), initialSelected.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(initialSelected);
  const [allTodos, setAllTodos] = useState([]);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    const fromParam = parseYMD(params?.date);
    if (!fromParam) return;
    setSelectedDate(fromParam);
    setMonth(new Date(fromParam.getFullYear(), fromParam.getMonth(), 1));
  }, [params?.date]);

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getTodos();
      setAllTodos(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur lors du chargement des tâches');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const selectedYMD = useMemo(() => toYMD(selectedDate), [selectedDate]);

  const todosForSelectedDate = useMemo(() => {
    const items = allTodos.filter((t) => getTodoDateKey(t) === selectedYMD);
    const timeValue = (t) => (t?.dueTime && /^\d{2}:\d{2}$/.test(t.dueTime) ? t.dueTime : '99:99');
    return items.sort((a, b) => timeValue(a).localeCompare(timeValue(b)) || a.title.localeCompare(b.title));
  }, [allTodos, selectedYMD]);

  useEffect(() => {
    if (selectedTodo && !todosForSelectedDate.some((t) => t._id === selectedTodo._id)) {
      setSelectedTodo(null);
    }
  }, [selectedTodo, todosForSelectedDate]);

  const countsByDate = useMemo(() => {
    const map = {};
    for (const t of allTodos) {
      const key = getTodoDateKey(t);
      if (!key) continue;
      map[key] = (map[key] || 0) + 1;
    }
    return map;
  }, [allTodos]);

  const title = useMemo(() => {
    return selectedDate.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [selectedDate]);

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    navigate(`/calendar/${toYMD(date)}`);
  };

  const handleTodoCreated = (newTodo) => {
    setError('');
    setAllTodos((prev) => [newTodo, ...prev]);
    setSelectedTodo(newTodo);
  };

  const handleTodoUpdated = (updatedTodo) => {
    setError('');
    setAllTodos((prev) => prev.map((t) => (t._id === updatedTodo._id ? updatedTodo : t)));
    if (selectedTodo?._id === updatedTodo._id) setSelectedTodo(updatedTodo);
  };

  const handleTodoDeleted = (deletedId) => {
    setError('');
    setAllTodos((prev) => prev.filter((t) => t._id !== deletedId));
    if (selectedTodo?._id === deletedId) setSelectedTodo(null);
  };

  return (
    <>
      {error && (
        <div className="col-span-12 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-2xl p-4 flex items-start justify-between gap-4">
          <div className="text-sm">{error}</div>
          <div className="flex gap-2">
            <button
              onClick={fetchTodos}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm"
            >
              Réessayer
            </button>
            <button
              onClick={() => setError('')}
              className="px-3 py-1.5 rounded-lg bg-transparent hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 text-sm"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      <TaskCalendar
        month={month}
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        onMonthChange={setMonth}
        countsByDate={countsByDate}
      />

      <TodoListComponent
        title={title}
        todos={todosForSelectedDate}
        selectedTodoId={selectedTodo?._id}
        onSelectTodo={setSelectedTodo}
        onTodoUpdated={handleTodoUpdated}
        onTodoDeleted={handleTodoDeleted}
        onError={(message) => setError(message)}
        compact
        containerClassName="col-span-12 md:col-span-4 bg-gray-50 dark:bg-gray-900"
        headerRight={
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        }
        loading={loading}
      />

      <TodoDetailsComponent
        todo={selectedTodo}
        onUpdate={handleTodoUpdated}
        onError={(message) => setError(message)}
        containerClassName="col-span-12 md:col-span-4"
      />

      <NewTaskFloatingComponent
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={handleTodoCreated}
        onError={(message) => setError(message)}
        defaultDueDate={selectedYMD}
      />
    </>
  );
}
