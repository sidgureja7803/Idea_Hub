/**
 * CreditPackages Component Tests
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import axios from 'axios';
import CreditPackages from '../components/payments/CreditPackages';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock PayPal Buttons
jest.mock('@paypal/react-paypal-js', () => {
  return {
    PayPalScriptProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    PayPalButtons: (props: any) => (
      <div data-testid="paypal-buttons">
        <button 
          onClick={() => {
            const orderID = 'test-order-123';
            props.createOrder().then((id: string) => {
              props.onApprove({ 
                orderID, 
                paymentID: 'test-payment-123', 
                payerID: 'test-payer-123'
              });
            });
          }}
        >
          PayPal Checkout
        </button>
      </div>
    )
  };
});

describe('CreditPackages Component', () => {
  const mockUserId = 'test-user-123';
  const mockApiUrl = 'http://test-api';
  
  // Mock credit packages data
  const mockPackages = [
    {
      _id: 'pkg1',
      name: 'Basic Package',
      description: 'Entry-level credits',
      credits: 100,
      price: 9.99,
      currency: 'USD',
      features: ['5 AI Analyses', 'Basic Reports'],
      popular: false
    },
    {
      _id: 'pkg2',
      name: 'Pro Package',
      description: 'Professional credits',
      credits: 500,
      price: 39.99,
      currency: 'USD',
      features: ['30 AI Analyses', 'Advanced Reports', 'Priority Support'],
      popular: true
    },
    {
      _id: 'pkg3',
      name: 'Enterprise Package',
      description: 'Enterprise-grade credits',
      credits: 1500,
      price: 99.99,
      currency: 'USD',
      features: ['Unlimited AI Analyses', 'Custom Reports', '24/7 Support', 'API Access'],
      popular: false
    }
  ];
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders loading state initially', () => {
    mockedAxios.get.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<CreditPackages userId={mockUserId} apiBaseUrl={mockApiUrl} />);
    
    // Check for loading indicator
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
  
  test('displays credit packages when loaded', async () => {
    mockedAxios.get.mockResolvedValue({ data: mockPackages });
    
    render(<CreditPackages userId={mockUserId} apiBaseUrl={mockApiUrl} />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Basic Package')).toBeInTheDocument();
    });
    
    // Should display all packages
    expect(screen.getByText('Pro Package')).toBeInTheDocument();
    expect(screen.getByText('Enterprise Package')).toBeInTheDocument();
    
    // Should display package details
    expect(screen.getByText('100 Credits')).toBeInTheDocument();
    expect(screen.getByText('$9.99')).toBeInTheDocument();
    expect(screen.getByText('5 AI Analyses')).toBeInTheDocument();
    
    // Should mark popular package
    expect(screen.getByText('Most Popular')).toBeInTheDocument();
  });
  
  test('selects a package when clicked', async () => {
    mockedAxios.get.mockResolvedValue({ data: mockPackages });
    
    render(<CreditPackages userId={mockUserId} apiBaseUrl={mockApiUrl} />);
    
    // Wait for packages to load
    await waitFor(() => {
      expect(screen.getByText('Basic Package')).toBeInTheDocument();
    });
    
    // Initially, no package should be selected
    expect(screen.queryByText('Complete Your Purchase')).not.toBeInTheDocument();
    
    // Click on a package
    fireEvent.click(screen.getByText('Select Package').closest('button')!);
    
    // Should show purchase UI
    expect(screen.getByText('Complete Your Purchase')).toBeInTheDocument();
    expect(screen.getByText('Selected Package:')).toBeInTheDocument();
    
    // PayPal buttons should be visible
    expect(screen.getByTestId('paypal-buttons')).toBeInTheDocument();
  });
  
  test('shows error state when API fails', async () => {
    mockedAxios.get.mockRejectedValue(new Error('API Error'));
    
    render(<CreditPackages userId={mockUserId} apiBaseUrl={mockApiUrl} />);
    
    // Wait for error to display
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
    
    expect(screen.getByText(/failed to load credit packages/i)).toBeInTheDocument();
  });
  
  test('processes payment successfully', async () => {
    // Mock API responses
    mockedAxios.get.mockResolvedValue({ data: mockPackages });
    mockedAxios.post.mockImplementation((url) => {
      if (url.includes('/credits/create-order')) {
        return Promise.resolve({ data: { orderID: 'test-order-123' } });
      } else if (url.includes('/credits/process-payment')) {
        return Promise.resolve({ 
          data: { 
            success: true, 
            credits: 100, 
            balance: 100,
            message: 'Credits added successfully'
          } 
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
    
    const onPurchaseComplete = jest.fn();
    
    render(
      <CreditPackages 
        userId={mockUserId} 
        apiBaseUrl={mockApiUrl}
        onPurchaseComplete={onPurchaseComplete}
      />
    );
    
    // Wait for packages to load
    await waitFor(() => {
      expect(screen.getByText('Basic Package')).toBeInTheDocument();
    });
    
    // Select a package
    fireEvent.click(screen.getAllByText('Select Package')[0].closest('button')!);
    
    // Click PayPal checkout
    fireEvent.click(screen.getByText('PayPal Checkout'));
    
    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/successfully purchased/i)).toBeInTheDocument();
    });
    
    // Should call the API endpoints
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/credits/create-order'), 
      expect.objectContaining({ 
        packageId: mockPackages[0]._id,
        userId: mockUserId
      })
    );
    
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/credits/process-payment'),
      expect.objectContaining({ 
        orderID: 'test-order-123',
        packageId: mockPackages[0]._id,
        userId: mockUserId
      })
    );
    
    // Should call the onPurchaseComplete callback
    expect(onPurchaseComplete).toHaveBeenCalledTimes(1);
    expect(onPurchaseComplete).toHaveBeenCalledWith(
      expect.objectContaining({ 
        success: true,
        credits: 100
      })
    );
  });
  
  test('handles payment error gracefully', async () => {
    // Mock API responses
    mockedAxios.get.mockResolvedValue({ data: mockPackages });
    mockedAxios.post.mockImplementation((url) => {
      if (url.includes('/credits/create-order')) {
        return Promise.resolve({ data: { orderID: 'test-order-123' } });
      } else if (url.includes('/credits/process-payment')) {
        return Promise.reject(new Error('Payment processing failed'));
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
    
    render(<CreditPackages userId={mockUserId} apiBaseUrl={mockApiUrl} />);
    
    // Wait for packages to load
    await waitFor(() => {
      expect(screen.getByText('Basic Package')).toBeInTheDocument();
    });
    
    // Select a package
    fireEvent.click(screen.getAllByText('Select Package')[0].closest('button')!);
    
    // Click PayPal checkout
    fireEvent.click(screen.getByText('PayPal Checkout'));
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/failed to process payment/i)).toBeInTheDocument();
    });
  });
});
