import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, AlertCircle, Github, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import SimpleHeader from '../../components/layout/SimpleHeader';
import Footer from '../../components/layout/Footer';

const SignUpPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordRequirements = [
    { met: password.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
    { met: /[0-9]/.test(password), text: 'One number' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!passwordRequirements.every(req => req.met)) {
      setError('Please meet all password requirements');
      return;
    }
    
    if (name && email && password) {
      setIsLoading(true);
      try {
        await register(email, password, name);
        navigate('/my-ideas');
      } catch (err: any) {
        setError(err.message || 'Failed to create account. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const appwriteEndpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
      const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;
      const successUrl = `${window.location.origin}/my-ideas`;
      const failureUrl = `${window.location.origin}/sign-up?error=oauth-failed`;
      
      window.location.href = `${appwriteEndpoint}/account/sessions/oauth2/google?project=${projectId}&success=${successUrl}&failure=${failureUrl}`;
    } catch (err: any) {
      setError('Failed to initialize Google sign-up');
    }
  };

  const handleGithubSignUp = async () => {
    try {
      const appwriteEndpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
      const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;
      const successUrl = `${window.location.origin}/my-ideas`;
      const failureUrl = `${window.location.origin}/sign-up?error=oauth-failed`;
      
      window.location.href = `${appwriteEndpoint}/account/sessions/oauth2/github?project=${projectId}&success=${successUrl}&failure=${failureUrl}`;
    } catch (err: any) {
      setError('Failed to initialize GitHub sign-up');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <SimpleHeader />
      
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-dark-900/70 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-dark-700">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.h1 
                className="text-3xl font-bold mb-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Create Account
              </motion.h1>
              <motion.p 
                className="text-dark-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Start validating your ideas today
              </motion.p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-200"
              >
                <AlertCircle size={18} />
                <span className="text-sm">{error}</span>
                <button 
                  onClick={() => setError(null)}
                  className="ml-auto text-dark-400 hover:text-white"
                >
                  ✕
                </button>
              </motion.div>
            )}

            {/* OAuth Buttons */}
            <motion.div 
              className="space-y-3 mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignUp}
                className="w-full h-11 bg-dark-800 border-dark-700 hover:bg-dark-700 hover:border-dark-600 text-white"
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleGithubSignUp}
                className="w-full h-11 bg-dark-800 border-dark-700 hover:bg-dark-700 hover:border-dark-600 text-white"
              >
                <Github className="mr-2 h-5 w-5" />
                Continue with GitHub
              </Button>
            </motion.div>

            {/* Divider */}
            <motion.div 
              className="relative mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Separator className="bg-dark-700" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-dark-900 px-2 text-sm text-dark-400">Or continue with email</span>
              </div>
            </motion.div>

            {/* Email/Password Form */}
            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="space-y-2">
                <Label htmlFor="name" className="text-dark-300">
                  Full Name
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-dark-500" />
                  </div>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-dark-800 border-dark-700 focus:border-primary-500 text-white"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-dark-300">
                  Email Address
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-dark-500" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-dark-800 border-dark-700 focus:border-primary-500 text-white"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-dark-300">
                  Password
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-dark-500" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-12 bg-dark-800 border-dark-700 focus:border-primary-500 text-white"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-dark-400 hover:text-white"
                  >
                    <span className="text-sm font-medium">{showPassword ? "Hide" : "Show"}</span>
                  </button>
                </div>
                
                {/* Password Requirements */}
                {password && (
                  <div className="space-y-1 mt-2">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <CheckCircle 
                          size={14} 
                          className={req.met ? 'text-accent-emerald' : 'text-dark-600'}
                        />
                        <span className={req.met ? 'text-accent-emerald' : 'text-dark-500'}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-dark-300">
                  Confirm Password
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-dark-500" />
                  </div>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 bg-dark-800 border-dark-700 focus:border-primary-500 text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-primary-600 hover:bg-primary-700 mt-6"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  <span>Create Account</span>
                )}
              </Button>
            </motion.form>

            {/* Footer Links */}
            <motion.div 
              className="mt-8 text-center space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-dark-400 text-sm">
                Already have an account?{' '}
                <Link to="/sign-in" className="text-primary-400 hover:text-primary-300 font-medium">
                  Sign in
                </Link>
              </p>
              <p className="text-xs text-dark-500">
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="text-primary-400 hover:underline">Terms</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-primary-400 hover:underline">Privacy Policy</Link>
              </p>
              <Link to="/" className="text-dark-400 hover:text-white text-sm inline-block">
                ← Back to Home
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default SignUpPage;

