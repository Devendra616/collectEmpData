import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import * as yup from "yup";

const apiUrl = import.meta.env.VITE_API_URL;

// Validation schema
const passwordRegex =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%!?*&])[a-zA-Z\d@#$%!?*&]{8,}$/;
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
      "Password must be of minimum length 8 and contain digits, lowercase, uppercase and special characters"
    ),
  cpassword: yup
    .string()
    .required("Confirm password is required")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

const Register = () => {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (formData) => {
    try {
      const res = await axios.post(`${apiUrl}/register`, formData);
      const { success, msg } = res?.data;
      if (success) {
        toast.success(msg || "Registration successful!");
        setMessage(msg || "Registration successful!");
        navigate("/login");
      } else {
        toast.warn(msg || "SAP ID is already registered! Please login");
        setMessage(msg || "Already registered!");
      }
    } catch (error) {
      const errMsg =
        error.response?.data?.msg ||
        error.message ||
        "Registration failed. Please try again.";
      toast.error(errMsg);
      console.error("API error:", error);
      setMessage(errMsg);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center text-white border rounded-2xl">
      <div className="m-5">
        <h2 className="text-3xl">Register</h2>
      </div>

      <div className="mt-2">
        <form onSubmit={handleSubmit(onSubmit)} className="w-80">
          <div className="mb-4 flex flex-col">
            <label className="text-xl mb-1">Email</label>
            <input
              type="email"
              {...register("email")}
              placeholder="Email"
              className="p-2 border rounded-md"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="mb-4 flex flex-col">
            <label className="text-xl mb-1">SAP ID</label>
            <input
              type="text"
              {...register("sapId")}
              placeholder="SAP ID"
              className="p-2 border rounded-md"
            />
            {errors.sapId && (
              <p className="text-red-500 text-sm">{errors.sapId.message}</p>
            )}
          </div>

          <div className="mb-4 flex flex-col">
            <label className="text-xl mb-1">Password</label>
            <input
              type="password"
              {...register("password")}
              placeholder="Password"
              className="p-2 border rounded-md"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          <div className="mb-4 flex flex-col">
            <label className="text-xl mb-1">Confirm Password</label>
            <input
              type="password"
              {...register("cpassword")}
              placeholder="Confirm Password"
              className="p-2 border rounded-md"
            />
            {errors.cpassword && (
              <p className="text-red-500 text-sm">{errors.cpassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full mt-2 border border-black rounded-md bg-blue-500 hover:bg-blue-600 px-3 py-2 text-white"
          >
            Register
          </button>

          <span className="mt-4 block text-center hover:text-blue-500">
            <Link to={"/"}>Already Registered ? Login now.</Link>
          </span>
        </form>
      </div>
      {message && <p className="text-green-400 text-xl ">{message}</p>}
    </div>
  );
};

export default Register;
