import React from "react";
import { useAuth } from "../context/AuthContext";

const FormNavbar = () => {
  const { user } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-4 h-4 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 2h6v4H7V6zm8 8v2H5v-2h10z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Employee Form</h2>
        </div>

        <div className="flex items-center space-x-4">
          {user && (
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">
                {user.email || "User"}
              </p>
              <p className="text-xs text-gray-500">Filling form</p>
            </div>
          )}
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </nav>
  );
};

export default FormNavbar;
