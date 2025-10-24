/**
 * PayPal Provider Component
 * Provides PayPal context and functionality for the application
 */

import React, { ReactNode } from 'react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

// PayPal client ID from environment variables
const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID || '';

interface PayPalProviderProps {
  children: ReactNode;
  currency?: string;
  clientId?: string;
}

const PayPalProvider: React.FC<PayPalProviderProps> = ({
  children,
  currency = 'USD',
  clientId = PAYPAL_CLIENT_ID
}) => {
  // Initial options for PayPal script
  const initialOptions = {
    'client-id': clientId,
    currency,
    intent: 'capture',
    'data-client-token': 'abc123xyz==',
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      {children}
    </PayPalScriptProvider>
  );
};

export default PayPalProvider;
