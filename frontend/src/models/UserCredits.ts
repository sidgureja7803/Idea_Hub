/**
 * User Credits Model
 * Manages the credit system for startup idea searches
 */

export interface CreditPackage {
  id: string;
  name: string;
  description: string;
  credits: number;
  price: number;
  currency: string;
  features: string[];
  popular: boolean;
  isActive: boolean;
}

export interface UserCredits {
  userId: string;
  availableCredits: number;
  totalCreditsReceived: number;
  totalCreditsUsed: number;
  lastPurchaseDate?: Date;
  lastUpdated: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SearchHistory {
  id: string;
  userId: string;
  ideaName: string;
  description: string;
  searchDate: Date;
  credits: number; // Credits spent on this search
  status: 'completed' | 'in-progress' | 'failed';
  resultId?: string; // ID of the analysis result
}
