import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // clears token & user
    navigate("/"); // redirect to login
  };

  return (
    <nav className="flex justify-between items-center px-6 py-3 bg-blue-600 text-white shadow-md">
      <h1 className="text-xl font-semibold">Employee Portal</h1>

      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm hidden sm:inline">
            Welcome, {user.email || "User"}
          </span>
        )}
        <button
          onClick={handleLogout}
          className="bg-white text-red-600 px-3 py-1 rounded hover:bg-gray-100"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
