import { Check, Trash2 } from 'lucide-react';
import { updateTodo, deleteTodo } from '../services/api';

const PRIORITY_COLORS = {
  low: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  medium: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
  high: 'text-red-600 bg-red-100 dark:bg-red-900/30',
};

export default function TodoListComponent({
  title = 'Upcoming tasks',
  todos,
  selectedTodoId,
  onSelectTodo,
  onTodoUpdated,
  onTodoDeleted,
  onError,
  headerRight,
  loading,
  compact = false,
  containerClassName = 'col-span-12 md:col-span-5 bg-gray-50 dark:bg-gray-900',
}) {
  const toggleComplete = async (todo) => {
    try {
      const res = await updateTodo(todo._id, { completed: !todo.completed });
      onTodoUpdated(res);
    } catch (err) {
      console.error('Erreur toggle completed:', err);
      if (onError) onError(err?.response?.data?.message || 'Erreur lors de la mise à jour de la tâche');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTodo(id);
      onTodoDeleted(id);
    } catch (err) {
      console.error('Erreur suppression:', err);
      if (onError) onError(err?.response?.data?.message || 'Erreur lors de la suppression de la tâche');
    }
  };

  return (
    <div className={`${containerClassName} rounded-3xl p-4 overflow-y-auto max-h-[calc(100vh-6rem)]`}>
      <div className="flex items-center justify-between gap-3 mb-6 px-2 lg:mt-0 mt-7">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
        {headerRight}
      </div>
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading tasks...</div>
      ) : todos.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="text-5xl mb-4">📝</div>
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-1">No tasks yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Click the + button to add your first task!</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {todos.map((todo) => (
            <li
              key={todo._id}
              onClick={() => onSelectTodo(todo)}
              className={`${compact ? 'px-4 py-3' : 'p-3.5'} rounded-2xl cursor-pointer transition-all duration-200 ${selectedTodoId === todo._id
                ? 'bg-indigo-100 dark:bg-indigo-900/50 ring-2 ring-indigo-500 shadow-md'
                : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm'
                }`}
            >
              {compact ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleComplete(todo);
                      }}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${todo.completed
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'border-gray-400 dark:border-gray-500 hover:border-indigo-500 dark:hover:border-indigo-400'
                        }`}
                      aria-label={todo.completed ? 'Marquer comme non terminée' : 'Marquer comme terminée'}
                    >
                      {todo.completed && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>

                    <h4
                      className={`flex-1 min-w-0 text-sm font-medium truncate ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}
                      title={todo.title}
                    >
                      {todo.title}
                    </h4>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(todo._id);
                    }}
                    className="text-red-500 hover:text-red-700 transition p-1.5 shrink-0"
                    aria-label="Supprimer la tâche"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleComplete(todo);
                      }}
                      className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${todo.completed
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'border-gray-400 dark:border-gray-500'
                        }`}
                    >
                      {todo.completed && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <h4 className={`text-base font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                        {todo.title}
                      </h4>
                    </div>
                  </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(todo._id);
                      }}
                      className="text-red-500 hover:text-red-700 transition p-1.5"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>

                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
