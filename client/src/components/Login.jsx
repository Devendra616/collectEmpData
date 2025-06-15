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
        toast.success(res?.data?.msg || "Login successful!");
        toast.success("Getting employee's data...");

        // Fetch all sections of data
        const sections = ["personal", "education", "family", "address", "work"];
        const allData = {
          emp: user, // Add the user data at the top level
        };

        for (const section of sections) {
          try {
            const result = await axiosInstance.get(`/${section}`);
            allData[section] = result?.data || {};
            console.log(`Fetched ${section} data:`, result?.data);
          } catch (error) {
            console.error(`Error fetching ${section}:`, error);
            allData[section] = {};
          }
        }

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
    <div className="flex border rounded-2xl flex-col justify-center items-center text-white">
      <div className="m-5">
        <h2 className="text-3xl">Login</h2>
      </div>
      <div className="mt-2 ">
        <form onSubmit={handleSubmit}>
          <label className="text-xl">SAP ID</label>
          <input
            type="text"
            name="sapId"
            placeholder="Enter SAP ID"
            value={formData.sapId}
            onChange={handleChange}
            required
            className="p-2 ml-8 mb-5 border rounded-md"
          />
          <br />

          <label className="text-xl">Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="p-2 border rounded-md ml-2 mb-5"
          />
          <br />

          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Login
            </button>
          </div>
        </form>
        <div className="mt-4 text-center">
          <Link to="/register" className="text-blue-400 hover:text-blue-300">
            Don't have an account? Register here
          </Link>
        </div>
      </div>
      {/* {error && <p >{error}</p>} */}
    </div>
  );
};

export default Login;
