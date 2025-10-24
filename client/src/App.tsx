import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/AuthPages/SignInPage';
import SignUpPage from './pages/AuthPages/SignUpPage';
import MyIdeasPage from './pages/MyIdeasPage';
import GalleryPage from './pages/GalleryPage';
import IdeaSubmissionPage from './pages/IdeaSubmissionPage';
import IdeaDetailsPage from './pages/IdeaDetailsPage';
import NotFoundPage from './pages/NotFoundPage';

// Theme provider
import { ThemeProvider } from './context/ThemeContext';

const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            
            {/* Protected routes */}
            <Route path="/my-ideas" element={<MyIdeasPage />} />
            <Route path="/validate-idea" element={<IdeaSubmissionPage />} />
            <Route path="/idea/:ideaId" element={<IdeaDetailsPage />} />
            
            {/* 404 Not found */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;