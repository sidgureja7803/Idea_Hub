import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Lightbulb, Github, Twitter, Linkedin, Cpu, Zap, Globe, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-dark-900/50 border-t border-white/10 mt-auto backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary-500 to-accent-cyan p-2.5">
                  <Brain className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-accent-orange to-accent-purple p-1">
                  <Lightbulb className="h-4 w-4 text-white" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black gradient-text">
                  IdeaHub
                </span>
                <div className="text-xs text-dark-400 font-medium">
                  Powered by Cerebras + Llama
                </div>
              </div>
            </div>
            <p className="text-dark-300 mb-6 max-w-md leading-relaxed">
              Transform your startup ideas into comprehensive, data-driven market analyses with AI-powered insights. 
              Validate faster, launch smarter.
            </p>
            
            {/* Tech Stack */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full glass-effect">
                <Cpu className="h-4 w-4 text-accent-cyan" />
                <span className="text-xs font-medium text-white">Cerebras</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full glass-effect">
                <Brain className="h-4 w-4 text-accent-purple" />
                <span className="text-xs font-medium text-white">Llama 3</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full glass-effect">
                <Zap className="h-4 w-4 text-accent-emerald" />
                <span className="text-xs font-medium text-white">Multi-Agent AI</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 rounded-lg glass-effect flex items-center justify-center text-dark-400 hover:text-primary-400 transition-colors duration-200 group"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5 group-hover:animate-pulse" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg glass-effect flex items-center justify-center text-dark-400 hover:text-primary-400 transition-colors duration-200 group"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5 group-hover:animate-pulse" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg glass-effect flex items-center justify-center text-dark-400 hover:text-primary-400 transition-colors duration-200 group"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5 group-hover:animate-pulse" />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-sm font-bold text-white tracking-wider uppercase mb-6 flex items-center">
              <Globe className="h-4 w-4 mr-2 text-primary-400" />
              Platform
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="/" className="text-dark-300 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 rounded-full bg-primary-400 mr-3 group-hover:animate-pulse"></span>
                  Home
                </a>
              </li>
              <li>
                <a href="/validate-idea" className="text-dark-300 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 rounded-full bg-primary-400 mr-3 group-hover:animate-pulse"></span>
                  Validate Idea
                </a>
              </li>
              <li>
                <a href="/my-ideas" className="text-dark-300 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 rounded-full bg-primary-400 mr-3 group-hover:animate-pulse"></span>
                  My Ideas
                </a>
              </li>
              <li>
                <a href="/hackathon-demo" className="text-dark-300 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 rounded-full bg-accent-purple mr-3 group-hover:animate-pulse"></span>
                  Live Demo
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-bold text-white tracking-wider uppercase mb-6 flex items-center">
              <Mail className="h-4 w-4 mr-2 text-accent-cyan" />
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-dark-300 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 rounded-full bg-accent-cyan mr-3 group-hover:animate-pulse"></span>
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-dark-300 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 rounded-full bg-accent-cyan mr-3 group-hover:animate-pulse"></span>
                  API Reference
                </a>
              </li>
              <li>
                <a href="/terms" className="text-dark-300 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 rounded-full bg-accent-cyan mr-3 group-hover:animate-pulse"></span>
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-dark-300 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 rounded-full bg-accent-cyan mr-3 group-hover:animate-pulse"></span>
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-dark-400 text-sm">
              © 2025 IdeaHub. All rights reserved. Built with ❤️ for entrepreneurs.
            </p>
            <div className="flex items-center space-x-6 text-sm text-dark-400">
              <span className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse"></div>
                <span>System Operational</span>
              </span>
              <span>v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
