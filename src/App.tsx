import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './provider/AuthProvider';
import { LanguageProvider } from './provider/LanguageProvider';
import { ThemeProvider } from './provider/ThemeProvider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Dashboard } from './pages/Dashboard';
import { Stocks } from './pages/stocks/Stocks';
import { Portfolio } from './pages/portfolio/Portfolio';
import { Transactions } from './pages/transactions/Transactions';
import { Profile } from './pages/profile/Profile';
import { Learn } from './pages/learn/Learn';
import { LessonDetail } from './pages/learn/LessonDetail';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { PrivateRoute } from './components/routing/PrivateRoute';

function AppContent() {
  const { logout, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {isAuthenticated && <Header onLogout={logout} />}
      
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
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
          
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
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
            <AppContent />
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
