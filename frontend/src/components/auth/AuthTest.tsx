import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import useApi from '../../utils/api';

/**
 * Component to test authentication integration between frontend and backend
 */
const AuthTest: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const api = useApi();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from the authentication endpoints
  const fetchAuthData = async () => {
    try {
      setError(null);
      const status = await api.get('/auth/whoami', false); // Use the optional auth endpoint
      setAuthStatus(status);
      
      if (isAuthenticated) {
        try {
          // Only try this if we're authenticated - requires auth endpoint
          const user = await api.get('/auth/me');
          setUserInfo(user);
        } catch (err) {
          console.error('Error fetching user info:', err);
          setError('Error fetching authenticated user info');
        }
      }
    } catch (err) {
      console.error('Error fetching auth status:', err);
      setError('Error checking authentication status');
    }
  };

  // Test the authentication when component mounts or auth state changes
  useEffect(() => {
    if (!isLoading) {
      fetchAuthData();
    }
  }, [isLoading, isAuthenticated]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 my-4">
      <h2 className="text-2xl font-bold mb-4">Authentication Test</h2>
      
      {isLoading ? (
        <p>Loading authentication status...</p>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Frontend Auth Status:</h3>
            <p>
              {isAuthenticated 
                ? `Authenticated as ${user?.firstName} ${user?.lastName} (${user?.email})`
                : 'Not authenticated'}
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold">Backend Auth Status:</h3>
            {error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <>
                <p>
                  Status: {authStatus ? 
                    (authStatus.authenticated ? 'Authenticated' : 'Not authenticated') 
                    : 'Loading...'}
                </p>
                {authStatus && authStatus.authenticated && (
                  <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-x-auto">
                    {JSON.stringify(authStatus.user, null, 2)}
                  </pre>
                )}
              </>
            )}
          </div>
          
          {isAuthenticated && (
            <div>
              <h3 className="text-lg font-semibold">Protected Endpoint Response:</h3>
              {userInfo ? (
                <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-x-auto">
                  {JSON.stringify(userInfo, null, 2)}
                </pre>
              ) : (
                <p>Loading protected data...</p>
              )}
            </div>
          )}
          
          <button 
            onClick={fetchAuthData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Test Authentication
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthTest;
