import { ToastContainer } from 'react-toastify';

// Dans votre composant racine (ex. App)
<ToastContainer
  position="top-right" // Position (top-right, bottom-center, etc.)
  autoClose={5000} // Ferme automatiquement après 5s
  hideProgressBar={false}
  newestOnTop={true}
  closeOnClick
  rtl={false}
  pauseOnFocusLoss
  draggable
  pauseOnHover
  theme="colored" // Ou "dark", "light" – on le rend dynamique ci-dessous
/>