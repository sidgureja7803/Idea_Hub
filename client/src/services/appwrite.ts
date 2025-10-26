import { Client, Account, Databases, ID, Query, Storage } from 'appwrite';

// Initialize Appwrite
const client = new Client();

client
  .setEndpoint('https://cloud.appwrite.io/v1') 
  .setProject('testProject') // Using a generic project ID for now

// Export initialized instances
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Collection IDs
export const COLLECTIONS = {
  IDEAS: 'ideas',
  USERS: 'users',
};

// Database ID
export const DATABASE_ID = 'testDatabase';

// User authentication
export const appwriteAuth = {
  // Create a new account
  createAccount: async (email: string, password: string, name: string) => {
    try {
      const newAccount = await account.create(
        ID.unique(),
        email,
        password,
        name
      );
      
      if (newAccount) {
        // Create session (login)
        return await appwriteAuth.login(email, password);
      }
      
      return newAccount;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  },

  // Login
  login: async (email: string, password: string) => {
    try {
      return await account.createEmailSession(email, password);
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      return await account.deleteSession('current');
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      return await account.get();
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
  
  // Check if user is logged in
  isLoggedIn: async () => {
    try {
      const user = await account.get();
      return !!user;
    } catch (error) {
      return false;
    }
  }
};

// Ideas management
export const ideaService = {
  // Create a new idea
  createIdea: async (userId: string, ideaData: any, isPublic: boolean = false) => {
    try {
      return await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        ID.unique(),
        {
          userId,
          ...ideaData,
          isPublic,
          createdAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('Error creating idea:', error);
      throw error;
    }
  },

  // Get user's ideas
  getUserIdeas: async (userId: string) => {
    try {
      return await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        [
          Query.equal('userId', userId)
        ]
      );
    } catch (error) {
      console.error('Error getting user ideas:', error);
      throw error;
    }
  },

  // Get public ideas for gallery
  getPublicIdeas: async () => {
    try {
      return await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        [
          Query.equal('isPublic', true)
        ]
      );
    } catch (error) {
      console.error('Error getting public ideas:', error);
      throw error;
    }
  },

  // Update idea visibility
  updateIdeaVisibility: async (ideaId: string, isPublic: boolean) => {
    try {
      return await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        ideaId,
        {
          isPublic
        }
      );
    } catch (error) {
      console.error('Error updating idea visibility:', error);
      throw error;
    }
  },

  // Delete an idea
  deleteIdea: async (ideaId: string) => {
    try {
      return await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        ideaId
      );
    } catch (error) {
      console.error('Error deleting idea:', error);
      throw error;
    }
  },

  // Check if user has reached free tier limit (5 ideas)
  checkFreeTierLimit: async (userId: string) => {
    try {
      const ideas = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        [
          Query.equal('userId', userId)
        ]
      );
      
      return {
        total: ideas.total,
        reachedLimit: ideas.total >= 5
      };
    } catch (error) {
      console.error('Error checking free tier limit:', error);
      throw error;
    }
  }
};

export default {
  client,
  account,
  databases,
  storage,
  appwriteAuth,
  ideaService
};
