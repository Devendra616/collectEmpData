import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Employee Data Management
            </h3>
            <p className="text-gray-300 text-xs">
              Streamlined employee information collection and management system.
              Complete your profile with ease and security.
            </p>
          </div>

          {/*  <div>
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
          </div> */}

          <div></div>

          <div className="md:text-right">
            <h4 className="text-md font-semibold mb-2">Contact Information</h4>
            <div className="text-xs text-gray-300 space-y-1">
              <p>📧 kdlest@nmdc.co.in</p>
              <p>📞 6747, 6453</p>
              <p>🏢 Admin Block, NMDC Kirandul</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-2 pt-2">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-xs text-gray-400">
              © 2025 Employee Data Management. All rights reserved.
            </p>
            <div className="flex space-x-2 mt-2 md:mt-0">
              <span className="text-xs text-gray-400">Version 1.0.0</span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-400">
                Developed by C&IT, Kirandul
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
