import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Employee Data Management</h1>
              <p className="text-blue-100 text-sm">
                Complete your profile information
              </p>
            </div>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{user.email || "User"}</p>
                <p className="text-xs text-blue-200">Welcome back!</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
