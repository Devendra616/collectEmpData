import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Employee Data Management
            </h3>
            <p className="text-gray-300 text-sm">
              Streamlined employee information collection and management system.
              Complete your profile with ease and security.
            </p>
          </div>

          <div>
            <h4 className="text-md font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Support
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-md font-semibold mb-4">Contact Information</h4>
            <div className="text-sm text-gray-300 space-y-2">
              <p>📧 support@employeedata.com</p>
              <p>📞 +1 (555) 123-4567</p>
              <p>🏢 123 Business Ave, Suite 100</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © 2024 Employee Data Management. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <span className="text-xs text-gray-400">Version 1.0.0</span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-400">
                Last updated: {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
