import { Routes, Route, Navigate } from 'react-router-dom';

// Pages publiques
import GetStartedPage from './pages/GetStarted';
import AuthPage from './pages/Auth';
import ForgotPassword from './pages/ForgotPassword';
import VerificationCode from './pages/VerificationCode';
import ResetPassword from './pages/ResetPassword';
import TermsOfUseComponent from './components/TermOfUseComponent';
import PrivacyPolicyComponent from './components/PrivacyPolicyComponent';
import ErrorPage from './pages/ErrorPage';

// Pages privées
import UpcomingPage from './pages/Upcoming';
import CalendarPage from './pages/Calendar';
import HomePage from './pages/Home';
import ListePage from './pages/Liste';
import SettingsPage from './pages/Settings';

// Layouts
import RouteLayout from './layouts/RouteLayout';
import Layout from './components/Layout';

// Composants globaux
import ThemeToggle from './components/ThemeToggle';

function App() {
  return (
    // PAS de <BrowserRouter> ici ! Il est déjà dans main.jsx
    <RouteLayout>
      <Routes>
        {/* Redirection racine */}
        <Route path="/" element={<Navigate to="/getstarted" replace />} />

        {/* Routes publiques */}
        <Route path="/getstarted" element={<GetStartedPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verification-code" element={<VerificationCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/terms-of-use" element={<TermsOfUseComponent />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyComponent />} />

        {/* Routes protégées */}
        <Route
          path="/home"
          element={
            <RouteLayout requireAuth={true}>
              <Layout>
                <HomePage />
              </Layout>
            </RouteLayout>
          }
        />

        <Route
          path="/upcoming"
          element={
            <RouteLayout requireAuth={true}>
              <Layout>
                <UpcomingPage />
              </Layout>
            </RouteLayout>
          }
        />

        <Route
          path="/calendar"
          element={
            <RouteLayout requireAuth={true}>
              <Layout>
                <CalendarPage />
              </Layout>
            </RouteLayout>
          }
        />

        <Route
          path="/calendar/:date"
          element={
            <RouteLayout requireAuth={true}>
              <Layout>
                <CalendarPage />
              </Layout>
            </RouteLayout>
          }
        />

        <Route
          path="/settings"
          element={
            <RouteLayout requireAuth={true}>
              <Layout>
                <SettingsPage />
              </Layout>
            </RouteLayout>
          }
        />

        <Route
          path="/lists/:name"
          element={
            <RouteLayout requireAuth={true}>
              <Layout>
                <ListePage />
              </Layout>
            </RouteLayout>
          }
        />

        {/* 404 */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>

      {/* Composants globaux */}
      <ThemeToggle className="hidden md:block" />
    </RouteLayout>
  );
}

export default App;