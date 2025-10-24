/**
 * CopilotKit Provider Component
 * Sets up the CopilotKit context with page-specific AI assistance
 */

import React, { ReactNode } from 'react';
import { 
  CopilotKit, 
  useCopilotAction,
  useCopilotContext
} from '@copilotkit/react-core';
import { CopilotTextarea } from '@copilotkit/react-textarea';
import { CopilotSidebar } from '@copilotkit/react-ui';
import { useLocation } from 'react-router-dom';

// Define the props interface
interface CopilotProviderProps {
  children: ReactNode;
}

// CopilotKit API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Map pathname to context name for CopilotKit
 */
const getPageContextFromPathname = (pathname: string): string => {
  if (pathname === '/') return 'general';
  if (pathname.includes('/dashboard')) return 'dashboard';
  if (pathname.includes('/add-idea') || pathname.includes('/submit')) return 'addIdea';
  if (pathname.includes('/results') || pathname.includes('/analysis')) return 'analysis';
  if (pathname.includes('/profile')) return 'profile';
  if (pathname.includes('/credits') || pathname.includes('/payment')) return 'credits';
  return 'general';
};

/**
 * Register CopilotKit actions for various pages
 */
const CopilotActions: React.FC = () => {
  // Register profile update action
  useCopilotAction({
    name: 'updateProfile',
    description: 'Update user profile information',
    parameters: [
      {
        name: 'name',
        description: 'User\'s full name',
        type: 'string',
        required: false
      },
      {
        name: 'bio',
        description: 'User\'s bio or description',
        type: 'string',
        required: false
      },
      {
        name: 'preferences',
        description: 'User\'s preferences',
        type: 'object',
        required: false
      }
    ],
    handler: async (params) => {
      try {
        const response = await fetch(`${API_BASE_URL}/copilot/action`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'updateProfile',
            parameters: params
          })
        });
        
        const result = await response.json();
        return result;
      } catch (error) {
        console.error('Failed to execute updateProfile action:', error);
        return { error: 'Failed to update profile' };
      }
    }
  });

  // Register idea management action
  useCopilotAction({
    name: 'manageIdea',
    description: 'Update idea metadata, tags, or visibility',
    parameters: [
      {
        name: 'ideaId',
        description: 'ID of the idea to manage',
        type: 'string',
        required: true
      },
      {
        name: 'tags',
        description: 'New tags for the idea',
        type: 'array',
        required: false
      },
      {
        name: 'visibility',
        description: 'Idea visibility (private/public)',
        type: 'string',
        required: false
      },
      {
        name: 'category',
        description: 'Idea category',
        type: 'string',
        required: false
      }
    ],
    handler: async (params) => {
      try {
        const response = await fetch(`${API_BASE_URL}/copilot/action`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'manageIdea',
            parameters: params
          })
        });
        
        const result = await response.json();
        return result;
      } catch (error) {
        console.error('Failed to execute manageIdea action:', error);
        return { error: 'Failed to update idea' };
      }
    }
  });

  // Register summary generation action
  useCopilotAction({
    name: 'generateSummary',
    description: 'Generate a summary of the analysis results',
    parameters: [
      {
        name: 'analysisId',
        description: 'ID of the analysis to summarize',
        type: 'string',
        required: true
      },
      {
        name: 'format',
        description: 'Summary format (brief/detailed)',
        type: 'string',
        required: false
      }
    ],
    handler: async (params) => {
      try {
        const response = await fetch(`${API_BASE_URL}/copilot/action`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'generateSummary',
            parameters: params
          })
        });
        
        const result = await response.json();
        return result;
      } catch (error) {
        console.error('Failed to execute generateSummary action:', error);
        return { error: 'Failed to generate summary' };
      }
    }
  });

  // Register recommendation creation action
  useCopilotAction({
    name: 'createRecommendation',
    description: 'Create a personalized recommendation based on idea analysis',
    parameters: [
      {
        name: 'ideaId',
        description: 'ID of the idea to create recommendations for',
        type: 'string',
        required: true
      },
      {
        name: 'focus',
        description: 'Focus area for recommendations (market/product/funding)',
        type: 'string',
        required: false
      }
    ],
    handler: async (params) => {
      try {
        const response = await fetch(`${API_BASE_URL}/copilot/action`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'createRecommendation',
            parameters: params
          })
        });
        
        const result = await response.json();
        return result;
      } catch (error) {
        console.error('Failed to execute createRecommendation action:', error);
        return { error: 'Failed to create recommendation' };
      }
    }
  });

  return null;
};

/**
 * Page context provider for CopilotKit
 */
const CopilotPageContext: React.FC = () => {
  const { setContext } = useCopilotContext();
  const location = useLocation();
  
  React.useEffect(() => {
    // Get the current page context based on the URL pathname
    const pageContext = getPageContextFromPathname(location.pathname);
    
    // Set the context for CopilotKit
    setContext({
      page: pageContext,
      // Additional context can be added here depending on the page
      // This would be populated with relevant data from the page
      data: {}
    });
  }, [location.pathname, setContext]);
  
  return null;
};

/**
 * Main CopilotKit Provider Component
 */
const CopilotProvider: React.FC<CopilotProviderProps> = ({ children }) => {
  return (
    <CopilotKit
      chatApiEndpoint={`${API_BASE_URL}/copilot/assist`}
      initialMessages={[
        {
          role: 'assistant',
          content: 'Hi! I\'m your IdeaHub assistant. I can help you with idea submission, analysis results, and more. What can I help you with?'
        }
      ]}
    >
      {/* Register all actions */}
      <CopilotActions />
      
      {/* Set page-specific context */}
      <CopilotPageContext />
      
      {/* Render children */}
      {children}
      
      {/* Include CopilotKit UI components */}
      <CopilotSidebar 
        defaultOpen={false}
        poweredByText="Powered by IdeaHub"
      />
    </CopilotKit>
  );
};

export default CopilotProvider;

/**
 * Exportable CopilotTextarea component with default styling
 */
export const EnhancedCopilotTextarea: React.FC<any> = (props) => {
  return (
    <CopilotTextarea
      className="min-h-[100px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Enter your text here. Ask the AI for help or suggestions..."
      {...props}
    />
  );
};
