/**
 * User Menu Component
 * Displays current user information and sign-out option
 */

import React, { useState, useRef } from 'react';
import { 
  useUser, 
  useClerk, 
  UserButton
} from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  User, 
  LogOut, 
  Settings, 
  CreditCard 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserMenuProps {
  className?: string;
  showCredits?: boolean;
  creditBalance?: number;
}

const UserMenu: React.FC<UserMenuProps> = ({
  className = '',
  showCredits = false,
  creditBalance
}) => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuRef]);

  // Format user's name
  let userName = 'User';
  if (user?.firstName) {
    userName = user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName;
  } else if (user?.emailAddresses?.[0]?.emailAddress) {
    userName = user.emailAddresses[0].emailAddress.split('@')[0];
  }

  const handleSignOut = () => {
    signOut(() => navigate('/sign-in'));
  };

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      {/* User Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full px-3 py-1.5 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
      >
        <UserButton />
        <span className="text-sm font-medium hidden sm:block truncate max-w-[100px]">
          {userName}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Credit Balance Badge (optional) */}
      {showCredits && (
        <div className="absolute -top-3 -right-2 bg-blue-600 text-white text-xs font-medium rounded-full px-2 py-0.5 flex items-center gap-1">
          <CreditCard size={10} />
          <span>{creditBalance}</span>
        </div>
      )}

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 z-30"
          >
            <div className="py-1">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>

              {/* Menu Items */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/profile');
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <User size={16} />
                <span>Profile</span>
              </button>

              {showCredits && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/credits');
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <CreditCard size={16} />
                  <span>Manage Credits</span>
                </button>
              )}

              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/settings');
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Settings size={16} />
                <span>Settings</span>
              </button>

              {/* Sign Out */}
              <div className="border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <LogOut size={16} />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
