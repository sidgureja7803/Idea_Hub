import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import SimpleHeader from '../components/layout/SimpleHeader';
import Footer from '../components/layout/Footer';

const TermsPage: React.FC = () => {
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
          
          <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-lg mb-6">
              Welcome to IdeaHub. By using our services, you agree to these terms. Please read them carefully.
            </p>
            
            <h2>1. Services and Acceptance</h2>
            <p>
              IdeaHub provides an AI-powered platform for validating and analyzing business ideas. 
              By accessing or using our services, you agree to be bound by these Terms of Service.
            </p>
            
            <h2>2. Account Terms</h2>
            <p>
              You are responsible for maintaining the security of your account and password. 
              IdeaHub cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.
            </p>
            
            <h2>3. API Usage and Rate Limits</h2>
            <p>
              Our service utilizes Cerebras API for AI functionality and Appwrite for backend services. 
              Free tier users are limited to 5 idea analyses per account. Abuse of the API may result in account suspension.
            </p>
            
            <h2>4. Privacy and Data Usage</h2>
            <p>
              We collect and process data as described in our Privacy Policy. By using IdeaHub, you agree to our data practices.
              IdeaHub will not share your private ideas with other users unless you explicitly mark them as public.
            </p>
            
            <h2>5. Public Ideas</h2>
            <p>
              When you mark an idea as public, you grant IdeaHub a license to display this content to other users.
              Do not mark ideas as public if you wish to maintain confidentiality.
            </p>
            
            <h2>6. Intellectual Property</h2>
            <p>
              You retain all rights to your ideas submitted to IdeaHub. The analysis results are provided for your use.
              IdeaHub does not claim ownership over your ideas or their implementation.
            </p>
            
            <h2>7. Disclaimers</h2>
            <p>
              IdeaHub's AI analysis is provided "as is" without warranty of any kind. The platform is designed to assist
              with business validation but does not guarantee business success. All decisions made based on our analysis
              are solely your responsibility.
            </p>
            
            <h2>8. Limitation of Liability</h2>
            <p>
              In no event shall IdeaHub be liable for any indirect, incidental, special, consequential or punitive damages,
              including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
            
            <h2>9. Modifications to Terms</h2>
            <p>
              We may modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
            </p>
            
            <h2>10. Governing Law</h2>
            <p>
              These terms shall be governed by the laws of the jurisdiction in which IdeaHub is registered, without regard to its
              conflict of law provisions.
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

export default TermsPage;
