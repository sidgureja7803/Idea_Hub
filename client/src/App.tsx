import { Routes, Route } from 'react-router-dom';
// import HomePage from './pages/HomePage';
import IdeaSubmissionPage from './pages/IdeaSubmissionPage';
import ResultsDashboardPage from './pages/ResultsDashboardPage';
import ReportPage from './pages/ReportPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import UserDashboardPage from './pages/UserDashboardPage';
import HackathonDemoPage from './pages/HackathonDemoPage';
import IdeaRefinerPage from './pages/IdeaRefinerPage';
import EvidenceExtractorPage from './pages/EvidenceExtractorPage';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ClerkProvider, { AuthenticatedRoute } from './components/auth/ClerkProvider';
import { AuthProvider } from './hooks/useAuth';
import CreditGuard from './components/user/CreditGuard';
import LandingPage from './pages/LandingPage';
function App() {
  return (
    <ClerkProvider>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-dark-950 text-white">
        <Header />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            <Route path="/sign-up/verify-email-address" element={<VerifyEmailPage />} />
            <Route path="/hackathon-demo" element={<HackathonDemoPage />} />
            <Route path="/idea-refiner" element={<IdeaRefinerPage />} />
            <Route path="/evidence-extractor" element={<EvidenceExtractorPage />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <AuthenticatedRoute>
                <UserDashboardPage />
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
