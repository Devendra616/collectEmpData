import { useAuth } from "../context/AuthContext.jsx";
import { useFormData } from "../context/FormContext";
import React, { useState } from "react";
import axiosInstance from "../services/axiosInstance.js";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {
  const { login, fetchData } = useAuth();
  const { dispatch: formDispatch } = useFormData();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    sapId: "",
    password: "",
  });

  // const [result, setResult] =useState(null);
  // const [error, setError] = useState("")

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post("/login", formData);
      const { token, user } = res.data;

      login(token, user);
      if (token) {
        console.log("login token", token);
        toast.success(res?.data?.msg || "Login successful!");
        toast.success("Getting employee's data...");

        // Fetch all sections of data
        const sections = ["personal", "education", "family", "address", "work"];
        const allData = {
          emp: user, // Add the user data at the top level
        };

        const fetchPromises = sections.map(async (section) => {
          try {
            const result = await axiosInstance.get(`/${section}`);
            return { section, data: result?.data || {} };
          } catch (error) {
            console.error(`Error fetching ${section}:`, error);
            return { section, data: {} };
          }
        });
        const results = await Promise.all(fetchPromises);
        results.forEach(({ section, data }) => {
          allData[section] = data;
        });

        /*  for (const section of sections) {
          try {
            const result = await axiosInstance.get(`/${section}`);
            allData[section] = result?.data || {};
            console.log(`Fetched ${section} data:`, result?.data);
          } catch (error) {
            console.error(`Error fetching ${section}:`, error);
            allData[section] = {};
          }
        } */

        // Update both AuthContext and FormContext with all fetched data
        fetchData(allData);

        // Store all sections in FormContext
        formDispatch({
          type: "SET_ALL",
          payload: allData,
        });

        console.log("All data dispatched to FormContext:", allData);
        toast.success("Data loaded successfully!");
        navigate("/form");
      }

      // const successMsg = res?.data?.msg || "Login successful!"
      // setResult(successMsg);
      // You can save user info or token here, e.g. localStorage
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error?.response?.data?.msg || "Login failed.");
      // const errorMsg = error?.response?.data?.msg || "Login failed."
      // setError(errorMsg);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-full">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Login</h2>
          <p className="text-gray-600 mt-2">
            Welcome back to Employee Data Management
          </p>
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/register"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Don't have an account? Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
