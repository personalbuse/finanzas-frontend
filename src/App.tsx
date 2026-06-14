import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './provider/AuthProvider';
import { LanguageProvider } from './provider/LanguageProvider';
import { ThemeProvider } from './provider/ThemeProvider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { PrivateRoute } from './components/routing/PrivateRoute';
import { SEOHead } from './components/seo/SEOHead';
import { GuidedTour } from './components/tour/GuidedTour';

const Login = lazy(() => import('./pages/auth/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/auth/Register').then(m => ({ default: m.Register })));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword').then(m => ({ default: m.ResetPassword })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Stocks = lazy(() => import('./pages/stocks/Stocks').then(m => ({ default: m.Stocks })));
const Portfolio = lazy(() => import('./pages/portfolio/Portfolio').then(m => ({ default: m.Portfolio })));
const Transactions = lazy(() => import('./pages/transactions/Transactions').then(m => ({ default: m.Transactions })));
const Profile = lazy(() => import('./pages/profile/Profile').then(m => ({ default: m.Profile })));
const EditProfile = lazy(() => import('./pages/profile/EditProfile').then(m => ({ default: m.EditProfile })));
const Learn = lazy(() => import('./pages/learn/Learn').then(m => ({ default: m.Learn })));
const LessonDetail = lazy(() => import('./pages/learn/LessonDetail').then(m => ({ default: m.LessonDetail })));
const Admin = lazy(() => import('./pages/admin/Admin').then(m => ({ default: m.Admin })));
const Maintenance = lazy(() => import('./pages/Maintenance').then(m => ({ default: m.Maintenance })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));
const Markets = lazy(() => import('./pages/markets/Markets').then(m => ({ default: m.Markets })));
const Indices = lazy(() => import('./pages/indices/Indices').then(m => ({ default: m.Indices })));
const Forex = lazy(() => import('./pages/forex/Forex').then(m => ({ default: m.Forex })));
const Leaderboard = lazy(() => import('./pages/leaderboard/Leaderboard').then(m => ({ default: m.Leaderboard })));

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white"></div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#000000] transition-colors duration-200">
      {isAuthenticated && <Header />}

      <GuidedTour />

      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/stocks"
              element={
                <PrivateRoute>
                  <Stocks />
                </PrivateRoute>
              }
            />

            <Route
              path="/markets"
              element={
                <PrivateRoute>
                  <Markets />
                </PrivateRoute>
              }
            />

            <Route
              path="/indices"
              element={
                <PrivateRoute>
                  <Indices />
                </PrivateRoute>
              }
            />

            <Route
              path="/forex"
              element={
                <PrivateRoute>
                  <Forex />
                </PrivateRoute>
              }
            />

            <Route
              path="/leaderboard"
              element={
                <PrivateRoute>
                  <Leaderboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/portfolio"
              element={
                <PrivateRoute>
                  <Portfolio />
                </PrivateRoute>
              }
            />

            <Route
              path="/transactions"
              element={
                <PrivateRoute>
                  <Transactions />
                </PrivateRoute>
              }
            />

            <Route
              path="/learn"
              element={
                <PrivateRoute>
                  <Learn />
                </PrivateRoute>
              }
            />
            <Route
              path="/learn/:id"
              element={
                <PrivateRoute>
                  <LessonDetail />
                </PrivateRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile/edit"
              element={
                <PrivateRoute>
                  <EditProfile />
                </PrivateRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <PrivateRoute requireAdmin>
                  <Admin />
                </PrivateRoute>
              }
            />

            <Route path="/maintenance" element={<Maintenance />} />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {isAuthenticated && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <SEOHead />
            <ToastContainer
              position="bottom-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              pauseOnHover
              theme="colored"
              className="toast-container"
            />
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
