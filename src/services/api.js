// services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Change si besoin

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fonction pour définir le token dynamiquement
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Charger le token au démarrage (si déjà connecté)
const storedToken = localStorage.getItem('token');
if (storedToken) {
  setAuthToken(storedToken);
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  } else if (config.headers) {
    delete config.headers.Authorization;
  }
  return config;
});

// Intercepteur pour gérer les erreurs globalement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optionnel : gérer 401 (déconnexion)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setAuthToken(null);
      if (window.location.pathname !== '/auth') {
        window.location.assign('/auth');
      }
      // window.location.href = '/login'; // Décommente si tu as une page login
    }
    return Promise.reject(error);
  }
);

// ========================
// Fonctions API
// ========================

export const getTodos = async (params) => {
  const response = await api.get('/todos', params ? { params } : undefined);
  return response.data; // ← On retourne directement les données
};

export const createTodo = async (todoData) => {
  const response = await api.post('/todos', todoData);
  return response.data; // ← Todo créé avec _id, etc.
};

export const updateTodo = async (id, updates) => {
  const response = await api.put(`/todos/${id}`, updates);
  return response.data; // ← Todo mis à jour
};

export const deleteTodo = async (id) => {
  const response = await api.delete(`/todos/${id}`);
  return response.data; // ← { message, todos } d'après ton controller
};

export const getLists = async () => {
  const response = await api.get('/lists');
  return response.data;
};

export const createList = async (name) => {
  const response = await api.post('/lists', { name });
  return response.data;
};

// Bonus : fonction pour login (si tu en as besoin plus tard)
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  const token = response.data.token;
  if (token) {
    localStorage.setItem('token', token);
    setAuthToken(token);
  }
  return response.data;
};

export default api;
