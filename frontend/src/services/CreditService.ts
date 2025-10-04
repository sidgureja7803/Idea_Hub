/**
 * Credit Service
 * Handles credit-related operations for FoundrIQ
 */

import { UserCredits, CreditPackage, SearchHistory } from '../models/UserCredits';

// Initial credits for new users
const FREE_CREDITS = 5;

// Local storage keys
const CREDITS_STORAGE_KEY = 'foundriQ_user_credits';
const SEARCH_HISTORY_KEY = 'foundriQ_search_history';

// Credit packages
export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for testing a few startup ideas',
    credits: 5,
    price: 9.99,
    currency: 'USD',
    features: ['5 additional startup analyses', 'Full AI insights', 'PDF reports'],
    popular: false,
    isActive: true
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For serious entrepreneurs',
    credits: 15,
    price: 24.99,
    currency: 'USD',
    features: [
      '15 additional startup analyses',
      'Full AI insights',
      'PDF reports',
      'Competitor analysis',
      'Market trends'
    ],
    popular: true,
    isActive: true
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Maximize your validation efforts',
    credits: 50,
    price: 79.99,
    currency: 'USD',
    features: [
      '50 additional startup analyses',
      'Full AI insights',
      'PDF reports',
      'Competitor analysis',
      'Market trends',
      'Strategic recommendations',
      'Priority support'
    ],
    popular: false,
    isActive: true
  }
];

/**
 * Initialize user credits for a new user
 * @param userId User ID
 * @returns UserCredits object
 */
export const initializeUserCredits = (userId: string): UserCredits => {
  const credits: UserCredits = {
    userId,
    availableCredits: FREE_CREDITS,
    totalCreditsReceived: FREE_CREDITS,
    totalCreditsUsed: 0,
    lastUpdated: new Date()
  };
  
  // Save to localStorage (in real app, this would be saved to a backend)
  localStorage.setItem(`${CREDITS_STORAGE_KEY}_${userId}`, JSON.stringify(credits));
  
  return credits;
};

/**
 * Get user credits
 * @param userId User ID
 * @returns UserCredits object or null if not found
 */
export const getUserCredits = (userId: string): UserCredits | null => {
  // In a real app, this would be an API call
  const storedCredits = localStorage.getItem(`${CREDITS_STORAGE_KEY}_${userId}`);
  
  if (!storedCredits) {
    return null;
  }
  
  try {
    const credits = JSON.parse(storedCredits) as UserCredits;
    return credits;
  } catch (error) {
    console.error('Failed to parse user credits', error);
    return null;
  }
};

/**
 * Check if user has enough credits
 * @param userId User ID
 * @param requiredCredits Number of credits required
 * @returns Boolean indicating if user has enough credits
 */
export const hasEnoughCredits = (userId: string, requiredCredits = 1): boolean => {
  const credits = getUserCredits(userId);
  
  if (!credits) {
    // If no credits found, initialize them
    const newCredits = initializeUserCredits(userId);
    return newCredits.availableCredits >= requiredCredits;
  }
  
  return credits.availableCredits >= requiredCredits;
};

/**
 * Deduct credits from user account
 * @param userId User ID
 * @param creditsToDeduct Number of credits to deduct
 * @param searchData Information about the search being performed
 * @returns Updated UserCredits object or null if failed
 */
export const deductCredits = (
  userId: string, 
  searchData: {
    ideaName: string;
    description: string;
  },
  creditsToDeduct = 1
): UserCredits | null => {
  const credits = getUserCredits(userId);
  
  if (!credits || credits.availableCredits < creditsToDeduct) {
    return null;
  }
  
  // Update credits
  const updatedCredits: UserCredits = {
    ...credits,
    availableCredits: credits.availableCredits - creditsToDeduct,
    totalCreditsUsed: credits.totalCreditsUsed + creditsToDeduct,
    lastUpdated: new Date()
  };
  
  // Save updated credits
  localStorage.setItem(`${CREDITS_STORAGE_KEY}_${userId}`, JSON.stringify(updatedCredits));
  
  // Add to search history
  const searchEntry: SearchHistory = {
    id: `search_${Date.now()}`,
    userId,
    ideaName: searchData.ideaName,
    description: searchData.description,
    searchDate: new Date(),
    credits: creditsToDeduct,
    status: 'in-progress'
  };
  
  addToSearchHistory(userId, searchEntry);
  
  return updatedCredits;
};

/**
 * Add credits to user account (e.g., after purchase)
 * @param userId User ID
 * @param creditsToAdd Number of credits to add
 * @returns Updated UserCredits object or null if failed
 */
export const addCredits = (userId: string, creditsToAdd = 1): UserCredits | null => {
  let credits = getUserCredits(userId);
  
  credits ??= initializeUserCredits(userId);
  
  // Update credits
  const updatedCredits: UserCredits = {
    ...credits,
    availableCredits: credits.availableCredits + creditsToAdd,
    totalCreditsReceived: credits.totalCreditsReceived + creditsToAdd,
    lastUpdated: new Date()
  };
  
  // Save updated credits
  localStorage.setItem(`${CREDITS_STORAGE_KEY}_${userId}`, JSON.stringify(updatedCredits));
  
  return updatedCredits;
};

/**
 * Get user's search history
 * @param userId User ID
 * @param limit Number of entries to return (0 for all)
 * @returns Array of SearchHistory objects
 */
export const getSearchHistory = (userId: string, limit = 0): SearchHistory[] => {
  // In a real app, this would be an API call
  const storedHistory = localStorage.getItem(`${SEARCH_HISTORY_KEY}_${userId}`);
  
  if (!storedHistory) {
    return [];
  }
  
  try {
    const history = JSON.parse(storedHistory) as SearchHistory[];
    // Sort by date, newest first
    history.sort((a, b) => new Date(b.searchDate).getTime() - new Date(a.searchDate).getTime());
    
    if (limit > 0) {
      return history.slice(0, limit);
    }
    
    return history;
  } catch (error) {
    console.error('Failed to parse search history', error);
    return [];
  }
};

/**
 * Add entry to search history
 * @param userId User ID
 * @param searchEntry SearchHistory entry to add
 * @returns Updated search history array
 */
export const addToSearchHistory = (userId: string, searchEntry: SearchHistory): SearchHistory[] => {
  const history = getSearchHistory(userId);
  
  // Add new entry to history
  const updatedHistory = [searchEntry, ...history];
  
  // Save updated history
  localStorage.setItem(`${SEARCH_HISTORY_KEY}_${userId}`, JSON.stringify(updatedHistory));
  
  return updatedHistory;
};

/**
 * Update search status (e.g., from 'in-progress' to 'completed')
 * @param userId User ID
 * @param searchId Search ID to update
 * @param status New status
 * @param resultId Optional result ID for completed searches
 * @returns Updated search history array or null if failed
 */
export const updateSearchStatus = (
  userId: string, 
  searchId: string, 
  status: 'in-progress' | 'completed' | 'failed',
  resultId?: string
): SearchHistory[] | null => {
  const history = getSearchHistory(userId);
  const searchIndex = history.findIndex(item => item.id === searchId);
  
  if (searchIndex === -1) {
    return null;
  }
  
  // Update search entry
  const updatedHistory = [...history];
  updatedHistory[searchIndex] = {
    ...updatedHistory[searchIndex],
    status,
    resultId
  };
  
  // Save updated history
  localStorage.setItem(`${SEARCH_HISTORY_KEY}_${userId}`, JSON.stringify(updatedHistory));
  
  return updatedHistory;
};
