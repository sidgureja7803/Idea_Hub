/**
 * UserCredits Component Tests
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import axios from 'axios';
import UserCredits from '../components/credits/UserCredits';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('UserCredits Component', () => {
  const mockUserId = 'test-user-123';
  const mockApiUrl = 'http://test-api';
  
  // Mock credit data
  const mockCreditData = {
    balance: 250,
    transactions: [
      {
        id: 'tx1',
        amount: 100,
        type: 'purchase',
        description: 'Purchased Basic Package',
        createdAt: '2025-07-25T10:30:00Z',
        metadata: { packageId: 'pkg1' }
      },
      {
        id: 'tx2',
        amount: -25,
        type: 'usage',
        description: 'Market Analysis',
        createdAt: '2025-07-26T14:15:00Z'
      },
      {
        id: 'tx3',
        amount: 200,
        type: 'purchase',
        description: 'Purchased Pro Package',
        createdAt: '2025-07-26T15:45:00Z'
      },
      {
        id: 'tx4',
        amount: -30,
        type: 'usage',
        description: 'Competitive Analysis',
        createdAt: '2025-07-27T09:20:00Z'
      }
    ]
  };
  
  // Mock empty credit data
  const mockEmptyData = {
    balance: 0,
    transactions: []
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders loading state initially', () => {
    mockedAxios.get.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<UserCredits userId={mockUserId} apiBaseUrl={mockApiUrl} />);
    
    expect(screen.getByText(/loading credit information/i)).toBeInTheDocument();
  });
  
  test('displays user credit balance and transactions', async () => {
    mockedAxios.get.mockResolvedValue({ data: mockCreditData });
    
    render(<UserCredits userId={mockUserId} apiBaseUrl={mockApiUrl} />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('250')).toBeInTheDocument();
    });
    
    // Should show credit balance
    expect(screen.getByText('Available Credits')).toBeInTheDocument();
    
    // Should show recent transactions header
    expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
    
    // Should show transaction items
    expect(screen.getByText('Market Analysis')).toBeInTheDocument();
    expect(screen.getByText('Purchased Pro Package')).toBeInTheDocument();
    
    // Should format transaction amounts correctly
    expect(screen.getByText('-25')).toBeInTheDocument();
    expect(screen.getByText('+200')).toBeInTheDocument();
  });
  
  test('displays empty state when no transactions', async () => {
    mockedAxios.get.mockResolvedValue({ data: mockEmptyData });
    
    render(<UserCredits userId={mockUserId} apiBaseUrl={mockApiUrl} />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument();
    });
    
    // Should show empty state message
    expect(screen.getByText('No transaction history available')).toBeInTheDocument();
  });
  
  test('shows error message when API fails', async () => {
    mockedAxios.get.mockRejectedValue(new Error('API Error'));
    
    render(<UserCredits userId={mockUserId} apiBaseUrl={mockApiUrl} />);
    
    // Wait for error to display
    await waitFor(() => {
      expect(screen.getByText('Failed to load credit information')).toBeInTheDocument();
    });
  });
  
  test('refreshes data when refresh button is clicked', async () => {
    // First load
    mockedAxios.get.mockResolvedValueOnce({ data: mockCreditData });
    
    render(<UserCredits userId={mockUserId} apiBaseUrl={mockApiUrl} />);
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText('250')).toBeInTheDocument();
    });
    
    // Setup mock for refresh
    const updatedData = {
      ...mockCreditData,
      balance: 300
    };
    mockedAxios.get.mockResolvedValueOnce({ data: updatedData });
    
    // Click refresh button
    const refreshButton = screen.getByLabelText('Refresh credit information');
    fireEvent.click(refreshButton);
    
    // Should show updated balance
    await waitFor(() => {
      expect(screen.getByText('300')).toBeInTheDocument();
    });
    
    // Should have called API twice
    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
  });
  
  test('toggles between showing all and limited transactions', async () => {
    // Create mock data with many transactions
    const manyTransactions = {
      balance: 500,
      transactions: Array(10).fill(null).map((_, i) => ({
        id: `tx${i}`,
        amount: i % 2 === 0 ? 100 : -50,
        type: i % 2 === 0 ? 'purchase' : 'usage',
        description: `Transaction ${i + 1}`,
        createdAt: new Date().toISOString()
      }))
    };
    
    mockedAxios.get.mockResolvedValue({ data: manyTransactions });
    
    render(<UserCredits userId={mockUserId} apiBaseUrl={mockApiUrl} />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Transaction 1')).toBeInTheDocument();
    });
    
    // Should initially show limited transactions and a "Show More" button
    expect(screen.getByText('Show More')).toBeInTheDocument();
    expect(screen.queryByText('Transaction 6')).not.toBeInTheDocument();
    
    // Click "Show More"
    fireEvent.click(screen.getByText('Show More'));
    
    // Should now show all transactions and a "Show Less" button
    expect(screen.getByText('Show Less')).toBeInTheDocument();
    expect(screen.getByText('Transaction 6')).toBeInTheDocument();
    expect(screen.getByText('Transaction 10')).toBeInTheDocument();
    
    // Click "Show Less"
    fireEvent.click(screen.getByText('Show Less'));
    
    // Should go back to limited view
    expect(screen.getByText('Show More')).toBeInTheDocument();
    expect(screen.queryByText('Transaction 6')).not.toBeInTheDocument();
  });
  
  test('calls onPurchaseClick when purchase button is clicked', async () => {
    mockedAxios.get.mockResolvedValue({ data: mockCreditData });
    
    const mockOnPurchaseClick = jest.fn();
    
    render(
      <UserCredits 
        userId={mockUserId} 
        apiBaseUrl={mockApiUrl} 
        onPurchaseClick={mockOnPurchaseClick} 
      />
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Purchase More Credits')).toBeInTheDocument();
    });
    
    // Click purchase button
    fireEvent.click(screen.getByText('Purchase More Credits'));
    
    // Should call the callback
    expect(mockOnPurchaseClick).toHaveBeenCalledTimes(1);
  });
});
