import React from "react";
import axiosInstance from "../services/axiosInstance.js";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import * as yup from "yup";

// Validation schema
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{6,}$/;
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
    <div className="flex border rounded-2xl flex-col justify-center items-center text-white">
      <div className="m-5">
        <h2 className="text-3xl">Register</h2>
      </div>
      <div className="mt-2">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="text-xl">Email</label>
            <input
              type="email"
              {...register("email")}
              placeholder="Enter NMDC Email"
              className="p-2 ml-8 border rounded-md"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="text-xl">SAP ID</label>
            <input
              type="text"
              {...register("sapId")}
              placeholder="Enter SAP ID"
              className="p-2 ml-8 border rounded-md"
            />
            {errors.sapId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.sapId.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="text-xl">Password</label>
            <input
              type="password"
              {...register("password")}
              placeholder="Enter Password"
              className="p-2 ml-2 border rounded-md"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="text-xl">Confirm Password</label>
            <input
              type="password"
              {...register("cpassword")}
              placeholder="Confirm Password"
              className="p-2 ml-2 border rounded-md"
            />
            {errors.cpassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.cpassword.message}
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Register
            </button>
          </div>
        </form>
        <div className="mt-4 text-center">
          <Link to="/" className="text-blue-400 hover:text-blue-300">
            Already have an account? Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
