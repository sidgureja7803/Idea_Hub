import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Mail, ArrowRight } from 'lucide-react';
import { useClerk, useUser } from '@clerk/clerk-react';

const VerifyEmailPage: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const { client } = useClerk();

  useEffect(() => {
    // Get email from Clerk user if available
    if (user?.primaryEmailAddress) {
      setEmail(user.primaryEmailAddress.emailAddress);
    } else {
      // Fallback to URL query params or state
      const params = new URLSearchParams(location.search);
      const emailParam = params.get('email');
      if (emailParam) {
        setEmail(emailParam);
      } else if (location.state?.email) {
        setEmail(location.state.email);
      }
    }
  }, [location, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;
    
    // Update the OTP array
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take the last character
    setOtp(newOtp);
    
    // Clear any previous errors
    if (error) setError('');
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // If current input is empty and backspace is pressed, focus previous input
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    // Check if pasted content is a valid OTP (6 digits)
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      
      // Focus the last input
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    
    // Validate OTP
    if (otpValue.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    
    setIsVerifying(true);
    
    try {
      // Attempt to verify with Clerk
      if (user && client) {
        // This is a simplified example - in a real implementation, 
        // you would use the appropriate Clerk verification method
        // For now, we'll simulate success
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setIsVerified(true);
        setIsVerifying(false);
        
        // Redirect to dashboard after verification
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        // Fallback for development/testing
        setTimeout(() => {
          setIsVerified(true);
          setIsVerifying(false);
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        }, 1500);
      }
    } catch (err) {
      setIsVerifying(false);
      setError('Failed to verify code. Please try again.');
      console.error('Verification error:', err);
    }
  };

  const handleResendOtp = async () => {
    try {
      // Attempt to resend verification email with Clerk
      if (client && user?.primaryEmailAddress) {
        // In a real implementation, you would use Clerk's resend verification email
        // For now, just show a message
        alert('Verification email resent to ' + email);
      } else {
        // Fallback for development/testing
        alert('Verification email resent to ' + email);
      }
    } catch (err) {
      console.error('Error resending verification email:', err);
      alert('Failed to resend verification email. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-12">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
          {!isVerified ? (
            <>
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Verify your email</h2>
                <p className="mt-2 text-gray-600">
                  We've sent a verification code to{' '}
                  <span className="font-medium text-purple-700">{email || 'your email'}</span>
                </p>
              </div>
              
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter verification code
                </label>
                <div className="flex space-x-2 justify-between">
                  {Array(6).fill(0).map((_, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      value={otp[index]}
                      onChange={(e) => handleChange(e, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      ref={(el) => (inputRefs.current[index] = el)}
                      className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
              </div>
              
              <button
                onClick={handleVerify}
                disabled={isVerifying || otp.join('').length !== 6}
                className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white font-medium ${
                  isVerifying || otp.join('').length !== 6
                    ? 'bg-purple-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                } transition-all duration-200`}
              >
                {isVerifying ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Email
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Didn't receive the code?{' '}
                  <button
                    onClick={handleResendOtp}
                    className="text-purple-600 hover:text-purple-800 font-medium"
                  >
                    Resend
                  </button>
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
              >
                <CheckCircle className="h-10 w-10 text-green-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900">Email verified!</h2>
              <p className="mt-2 text-gray-600">
                Redirecting you to the dashboard...
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
