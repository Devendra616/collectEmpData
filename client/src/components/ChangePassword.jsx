import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import axiosInstance from "../services/axiosInstance.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ChangePassword = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    } else {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
      if (!passwordRegex.test(formData.newPassword)) {
        newErrors.newPassword =
          "Password must be of minimum length 6 and contain at least 1 lowercase letter, 1 uppercase letter, and can include numbers";
      }
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword =
        "New password must be different from current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      toast.success(response.data.msg || "Password changed successfully!");

      // Clear form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Navigate back to form or dashboard
      navigate("/form");
    } catch (error) {
      console.error("Change password error:", error);
      toast.error(error?.response?.data?.msg || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-full">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Change Password</h2>
          <p className="text-gray-600 mt-2">
            Update your password to keep your account secure
          </p>
          {user && (
            <p className="text-sm text-gray-500 mt-1">
              Logged in as: {user.email}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              placeholder="Enter current password"
              value={formData.currentPassword}
              onChange={handleChange}
              required
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.currentPassword ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.currentPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.currentPassword}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              placeholder="Enter new password"
              value={formData.newPassword}
              onChange={handleChange}
              required
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.newPassword ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.newPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 6 characters with 1 lowercase and 1 uppercase
              letter
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors duration-200 cursor-pointer ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isLoading ? "Changing Password..." : "Change Password"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/form")}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to Form
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
