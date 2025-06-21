import React from "react";
import axiosInstance from "../services/axiosInstance.js";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import * as yup from "yup";

// Validation schema
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
const schema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .matches(
      /^[a-zA-Z0-9._%+-]+@nmdc\.co\.in$/,
      "Email ID must be a valid NMDC mail Id."
    ),
  sapId: yup
    .string()
    .required("SAP ID is required")
    .matches(/^[0-9]{8}$/, "Provide a valid SAP ID"),
  password: yup
    .string()
    .required("Password is required")
    .matches(
      passwordRegex,
      "Password must be of minimum length 6 and contain at least 1 lowercase letter, 1 uppercase letter, and can include numbers"
    ),
  cpassword: yup
    .string()
    .required("Confirm password is required")
    .oneOf([yup.ref("password")], "Passwords must match"),
  location: yup.string().required("Location is required"),
});

const Register = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await axiosInstance.post("/register", data);
      toast.success(response.data.msg || "Registration successful!");
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error?.response?.data?.msg || "Registration failed.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-full">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Register</h2>
          <p className="text-gray-600 mt-2">
            Create your Employee Data Management account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              {...register("email")}
              placeholder="Enter NMDC Email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SAP ID
            </label>
            <input
              type="text"
              {...register("sapId")}
              placeholder="Enter SAP ID"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.sapId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.sapId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              {...register("password")}
              placeholder="Enter Password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              {...register("cpassword")}
              placeholder="Confirm Password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.cpassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.cpassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <select
              {...register("location")}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Location</option>
              <option value="BCH">Bacheli</option>
              <option value="DNM">Donimalai</option>
              <option value="HO">Head Office</option>
              <option value="KDL">Kirandul</option>
              <option value="Panna">Panna</option>
            </select>
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">
                {errors.location.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 cursor-pointer"
          >
            Register
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Already have an account? Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
