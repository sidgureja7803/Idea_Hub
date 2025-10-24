/**
 * Appwrite Service
 * Handles all interactions with Appwrite backend
 */

const sdk = require('node-appwrite');
const { Client, Databases, Users, ID, Permission, Role } = sdk;

// Initialize Appwrite client
const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1') // Replace with your Appwrite endpoint
  .setProject('foundriQ') // Replace with your project ID
  .setKey(process.env.APPWRITE_API_KEY); // Use server API key from env vars

// Initialize Appwrite services
const databases = new Databases(client);
const users = new Users(client);

// Collection and database IDs
const DATABASE_ID = 'foundriQ';
const COLLECTIONS = {
  IDEAS: 'ideas',
  USERS: 'users',
  ANALYSIS_RESULTS: 'analysisResults',
  JOBS: 'jobs'
};

/**
 * Appwrite service for backend operations
 */
class AppwriteService {
  /**
   * Create a new idea document
   * @param {object} ideaData - Idea data to save
   * @returns {Promise<object>} Created idea document
   */
  async createIdea(ideaData) {
    try {
      const { userId, title, description, isPublic = false } = ideaData;
      
      // Create idea document
      const idea = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        ID.unique(),
        {
          userId,
          title,
          description,
          isPublic,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        [
          Permission.read(Role.user(userId)),
          ...(isPublic ? [Permission.read(Role.any())] : [])
        ]
      );
      
      return idea;
    } catch (error) {
      console.error('Appwrite Error - Create Idea:', error);
      throw new Error(`Failed to create idea: ${error.message}`);
    }
  }
  
  /**
   * Update an existing idea
   * @param {string} ideaId - ID of idea to update
   * @param {object} ideaData - Updated idea data
   * @returns {Promise<object>} Updated idea document
   */
  async updateIdea(ideaId, ideaData) {
    try {
      const { title, description, isPublic } = ideaData;
      
      // Update the permissions if visibility changed
      let permissions = [];
      if (isPublic !== undefined) {
        // Get current document to check userId
        const currentIdea = await databases.getDocument(
          DATABASE_ID,
          COLLECTIONS.IDEAS,
          ideaId
        );
        
        permissions = [
          Permission.read(Role.user(currentIdea.userId)),
          ...(isPublic ? [Permission.read(Role.any())] : [])
        ];
      }
      
      // Update idea document
      const updatedIdea = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        ideaId,
        {
          ...(title && { title }),
          ...(description && { description }),
          ...(isPublic !== undefined && { isPublic }),
          updatedAt: new Date().toISOString()
        },
        permissions.length > 0 ? permissions : undefined
      );
      
      return updatedIdea;
    } catch (error) {
      console.error('Appwrite Error - Update Idea:', error);
      throw new Error(`Failed to update idea: ${error.message}`);
    }
  }
  
  /**
   * Get idea by ID
   * @param {string} ideaId - ID of idea to retrieve
   * @returns {Promise<object>} Idea document
   */
  async getIdea(ideaId) {
    try {
      return await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        ideaId
      );
    } catch (error) {
      console.error('Appwrite Error - Get Idea:', error);
      throw new Error(`Failed to get idea: ${error.message}`);
    }
  }
  
  /**
   * Get ideas by user ID
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of idea documents
   */
  async getUserIdeas(userId) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        [
          sdk.Query.equal('userId', userId)
        ]
      );
      
      return response.documents;
    } catch (error) {
      console.error('Appwrite Error - Get User Ideas:', error);
      throw new Error(`Failed to get user ideas: ${error.message}`);
    }
  }
  
  /**
   * Get all public ideas
   * @returns {Promise<Array>} Array of public idea documents
   */
  async getPublicIdeas() {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        [
          sdk.Query.equal('isPublic', true)
        ]
      );
      
      return response.documents;
    } catch (error) {
      console.error('Appwrite Error - Get Public Ideas:', error);
      throw new Error(`Failed to get public ideas: ${error.message}`);
    }
  }
  
  /**
   * Delete an idea
   * @param {string} ideaId - ID of idea to delete
   * @returns {Promise<void>}
   */
  async deleteIdea(ideaId) {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        ideaId
      );
    } catch (error) {
      console.error('Appwrite Error - Delete Idea:', error);
      throw new Error(`Failed to delete idea: ${error.message}`);
    }
  }
  
  /**
   * Save analysis results
   * @param {string} ideaId - ID of related idea
   * @param {object} resultsData - Analysis results data
   * @returns {Promise<object>} Created analysis document
   */
  async saveAnalysisResults(ideaId, resultsData) {
    try {
      // Get the idea to check user ID and permissions
      const idea = await this.getIdea(ideaId);
      
      // Create analysis results document
      const analysisResults = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.ANALYSIS_RESULTS,
        ID.unique(),
        {
          ideaId,
          userId: idea.userId,
          results: resultsData,
          createdAt: new Date().toISOString()
        },
        [
          Permission.read(Role.user(idea.userId)),
          ...(idea.isPublic ? [Permission.read(Role.any())] : [])
        ]
      );
      
      // Update the idea with reference to analysis
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        ideaId,
        {
          analysisResultId: analysisResults.$id,
          hasAnalysis: true,
          updatedAt: new Date().toISOString()
        }
      );
      
      return analysisResults;
    } catch (error) {
      console.error('Appwrite Error - Save Analysis Results:', error);
      throw new Error(`Failed to save analysis results: ${error.message}`);
    }
  }
  
  /**
   * Get analysis results for an idea
   * @param {string} ideaId - ID of related idea
   * @returns {Promise<object>} Analysis results document
   */
  async getAnalysisResults(ideaId) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ANALYSIS_RESULTS,
        [
          sdk.Query.equal('ideaId', ideaId)
        ]
      );
      
      if (response.documents.length === 0) {
        return null;
      }
      
      return response.documents[0];
    } catch (error) {
      console.error('Appwrite Error - Get Analysis Results:', error);
      throw new Error(`Failed to get analysis results: ${error.message}`);
    }
  }
  
  /**
   * Create or update job status
   * @param {string} jobId - Job ID
   * @param {object} jobData - Job data
   * @returns {Promise<object>} Created/updated job document
   */
  async saveJobStatus(jobId, jobData) {
    try {
      // Check if job already exists
      let job;
      try {
        job = await databases.getDocument(
          DATABASE_ID,
          COLLECTIONS.JOBS,
          jobId
        );
        
        // Update existing job
        return await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.JOBS,
          jobId,
          {
            ...jobData,
            updatedAt: new Date().toISOString()
          }
        );
      } catch (error) {
        // Job doesn't exist, create new one
        return await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.JOBS,
          jobId,
          {
            ...jobData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        );
      }
    } catch (error) {
      console.error('Appwrite Error - Save Job Status:', error);
      throw new Error(`Failed to save job status: ${error.message}`);
    }
  }
  
  /**
   * Get a job by ID
   * @param {string} jobId - Job ID
   * @returns {Promise<object>} Job document
   */
  async getJobStatus(jobId) {
    try {
      return await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.JOBS,
        jobId
      );
    } catch (error) {
      console.error('Appwrite Error - Get Job Status:', error);
      throw new Error(`Failed to get job status: ${error.message}`);
    }
  }
  
  /**
   * Check if user has reached free tier limit
   * @param {string} userId - User ID
   * @returns {Promise<object>} Count and limit status
   */
  async checkFreeTierLimit(userId) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        [
          sdk.Query.equal('userId', userId)
        ]
      );
      
      const FREE_TIER_LIMIT = 5;
      const count = response.total;
      
      return {
        total: count,
        limit: FREE_TIER_LIMIT,
        reachedLimit: count >= FREE_TIER_LIMIT
      };
    } catch (error) {
      console.error('Appwrite Error - Check Free Tier Limit:', error);
      throw new Error(`Failed to check free tier limit: ${error.message}`);
    }
  }
}

module.exports = new AppwriteService();
