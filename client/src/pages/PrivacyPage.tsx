import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import SimpleHeader from '../components/layout/SimpleHeader';
import Footer from '../components/layout/Footer';

const PrivacyPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <SimpleHeader />
      
      <main className="flex-grow container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <Link to="/" className="inline-flex items-center text-primary-400 hover:text-primary-300 mb-8">
            <ChevronLeft size={16} className="mr-1" />
            <span>Back to Home</span>
          </Link>
          
          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-lg mb-6">
              Your privacy is important to us. This Privacy Policy explains how IdeaHub collects, uses, and protects your information.
            </p>
            
            <h2>1. Information We Collect</h2>
            <p>
              We collect information you provide when you create an account, including your email address and name.
              We also collect information about the business ideas you submit for analysis, including any descriptions,
              market information, or other details you provide.
            </p>
            
            <h2>2. How We Use Your Information</h2>
            <p>
              We use your information to:
            </p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Process and analyze your business ideas using our AI systems</li>
              <li>Communicate with you about your account and ideas</li>
              <li>Protect against fraud and abuse</li>
              <li>Analyze usage patterns to improve our platform</li>
            </ul>
            
            <h2>3. Technology Partners</h2>
            <p>
              IdeaHub uses Cerebras for AI processing and Appwrite for authentication, database, and storage services.
              Your data is processed according to their respective privacy policies and our data processing agreements with them.
            </p>
            
            <h2>4. Data Storage</h2>
            <p>
              Your account information is stored securely in Appwrite's infrastructure. Business ideas and analysis results
              are also stored in encrypted databases. We implement appropriate security measures to protect against unauthorized
              access, alteration, disclosure, or destruction of your information.
            </p>
            
            <h2>5. Public vs. Private Ideas</h2>
            <p>
              By default, your ideas are private and visible only to you. If you choose to mark an idea as public, it will be
              visible to other users in the public gallery. You can change this setting at any time.
            </p>
            
            <h2>6. AI Training</h2>
            <p>
              We do not use your business ideas or personal information to train our AI models. Our AI processing is performed
              using pre-trained models from Cerebras, and your data is used solely to generate analysis results for you.
            </p>
            
            <h2>7. Data Retention</h2>
            <p>
              We retain your information for as long as your account is active or as needed to provide services to you.
              You can request deletion of your account and associated data at any time.
            </p>
            
            <h2>8. Cookies and Analytics</h2>
            <p>
              We use cookies and similar technologies to analyze usage patterns and improve our services.
              You can control cookie preferences through your browser settings.
            </p>
            
            <h2>9. Third-Party Services</h2>
            <p>
              Our service may contain links to third-party websites or services. We are not responsible for the privacy
              practices of these third parties.
            </p>
            
            <h2>10. Changes to This Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
              Privacy Policy on this page.
            </p>
            
            <h2>11. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at privacy@ideahub.com.
            </p>
            
            <p className="mt-8 text-gray-400">
              Last updated: October 25, 2025
            </p>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PrivacyPage;
