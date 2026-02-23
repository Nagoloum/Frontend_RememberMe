import React, { useCallback, useEffect, useState } from 'react';
import TodoListComponent from '../components/TodoListComponent';
import TodoDetailsComponent from '../components/TodoDetailsComponent';
import NewTaskFloatingComponent from '../components/NewTaskFloatingComponent'; // À ajouter
import { getTodos } from '../services/api';
import { Plus } from 'lucide-react';

export default function MainPage({ listName, title = 'Upcoming tasks' }) {
  const [todos, setTodos] = useState([]);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getTodos(listName ? { list: listName } : undefined);
      setTodos(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Erreur chargement tâches:', err);
      setError(err?.response?.data?.message || 'Erreur lors du chargement des tâches');
    } finally {
      setLoading(false);
    }
  }, [listName]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Quand une nouvelle tâche est créée
  const handleTodoCreated = (newTodo) => {
    setError('');
    setTodos((prev) => [newTodo, ...prev]);
    // setSelectedTodo(newTodo); // Optionnel : sélectionner automatiquement
  };

  // Quand une tâche est mise à jour (depuis détails ou toggle)
  const handleTodoUpdated = (updatedTodo) => {
    setError('');
    setTodos(prev => prev.map(t => t._id === updatedTodo._id ? updatedTodo : t));
    if (selectedTodo?._id === updatedTodo._id) {
      setSelectedTodo(updatedTodo);
    }
  };

  // Quand une tâche est supprimée
  const handleTodoDeleted = (deletedId) => {
    setError('');
    setTodos(prev => prev.filter(t => t._id !== deletedId));
    if (selectedTodo?._id === deletedId) {
      setSelectedTodo(null);
    }
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

      {/* Liste des tâches */}
      <TodoListComponent
        title={title}
        todos={todos}
        selectedTodoId={selectedTodo?._id}
        onSelectTodo={setSelectedTodo}
        onTodoUpdated={handleTodoUpdated}
        onTodoDeleted={handleTodoDeleted}
        onError={(message) => setError(message)}
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

      {/* Détails de la tâche sélectionnée */}
      <TodoDetailsComponent
        todo={selectedTodo}
        onUpdate={handleTodoUpdated}
        onError={(message) => setError(message)}
      />

      {/* Bouton flottant pour ajouter une tâche */}
      <NewTaskFloatingComponent
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={handleTodoCreated}
        onError={(message) => setError(message)}
      />
    </>
  );
}
