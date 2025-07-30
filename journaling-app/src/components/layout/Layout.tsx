import React from 'react';
import { useSession } from 'next-auth/react';
import Navigation from './Navigation';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  showNavigation?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  className = '',
  showNavigation = true 
}) => {
  const { status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your journal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {showNavigation && <Navigation />}
      
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`${className}`}
      >
        {children}
      </motion.main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  J
                </div>
                <span className="text-lg font-semibold text-gray-800">
                  JournalAI
                </span>
              </div>
              <p className="text-gray-600 text-sm max-w-md">
                Your AI-powered personal journaling companion. Reflect, grow, and discover insights about yourself through intelligent analysis and personalized recommendations.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/dashboard" className="text-gray-600 hover:text-green-600 transition-colors">
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="/journal" className="text-gray-600 hover:text-green-600 transition-colors">
                    Journal
                  </a>
                </li>
                <li>
                  <a href="/goals" className="text-gray-600 hover:text-green-600 transition-colors">
                    Goals
                  </a>
                </li>
                <li>
                  <a href="/insights" className="text-gray-600 hover:text-green-600 transition-colors">
                    Insights
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/help" className="text-gray-600 hover:text-green-600 transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="text-gray-600 hover:text-green-600 transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-gray-600 hover:text-green-600 transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-gray-600 hover:text-green-600 transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              © 2024 JournalAI. Made with ❤️ for mindful journaling.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 