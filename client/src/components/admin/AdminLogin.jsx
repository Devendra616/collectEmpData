import React, { useState } from "react";
import axiosInstance from "../../services/axiosInstance.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    sapId: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post("/admin/login", formData);
      const { token, user } = res.data;
      if (user && user.isAdmin) {
        // Store admin token in sessionStorage
        sessionStorage.setItem("adminToken", token);
        sessionStorage.setItem("adminUser", JSON.stringify(user));
        toast.success("Admin login successful!");
        navigate("/admin/dashboard");
      } else {
        toast.error("You are not authorized as an admin.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error?.response?.data?.msg || "Login failed.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-full">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Admin Login</h2>
          <p className="text-gray-600 mt-2">Sign in to the Admin Dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SAP ID
            </label>
            <input
              type="text"
              name="sapId"
              placeholder="Enter SAP ID"
              value={formData.sapId}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 cursor-pointer"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
