import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import IdeaSubmissionPage from './pages/IdeaSubmissionPage';
import ResultsDashboardPage from './pages/ResultsDashboardPage';
import ReportPage from './pages/ReportPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ClerkProvider, { AuthenticatedRoute } from './components/auth/ClerkProvider';
import { AuthProvider } from './hooks/useAuth';
import CreditGuard from './components/user/CreditGuard';
import NewLandingPage from './pages/NewLandingPage';
function App() {
  return (
    <ClerkProvider>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
        <Header />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<NewLandingPage />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <AuthenticatedRoute>
                <HomePage />
              </AuthenticatedRoute>
            } />
            <Route path="/submit" element={
              <AuthenticatedRoute>
                <CreditGuard>
                  <IdeaSubmissionPage />
                </CreditGuard>
              </AuthenticatedRoute>
            } />
            <Route path="/results/:analysisId" element={
              <AuthenticatedRoute>
                <ResultsDashboardPage />
              </AuthenticatedRoute>
            } />
            <Route path="/report/:analysisId" element={
              <AuthenticatedRoute>
                <ReportPage />
              </AuthenticatedRoute>
            } />
          </Routes>
        </main>
        <Footer />
        </div>
      </AuthProvider>
    </ClerkProvider>
  );
}

export default App;
