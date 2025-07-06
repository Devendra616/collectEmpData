import Employee from "../models/employee.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const registrationHandler = async (req, res) => {
  try {
    const { email, sapId, password, location } = req.body;

    const existingEmployee = await Employee.findOne({ sapId });
    if (existingEmployee) {
      return res.status(200).json({
        success: false,
        msg: "User already registered. Please login...",
        statusCode: 409,
      });
    }

    const newEmployee = await Employee.create({
      email,
      sapId,
      password,
      location,
    });

    console.log("New employee Details Added:", newEmployee);

    res.status(201).json({
      success: true,
      msg: "Registration Successful",
      statusCode: 201,
    });
  } catch (error) {
    console.log("🚀 ~ registrationHandler ~ error:", error);
    res.status(500).json({
      success: false,
      msg: "Internal server error",
      statusCode: 500,
    });
  }
};

const loginHandler = async (req, res) => {
  try {
    const { sapId, password } = req.body;
    if (!sapId || !password) {
      return res
        .status(400)
        .json({ success: false, msg: "SAP ID and Password are required." });
    }
    let empFound = await Employee.findOne({ sapId }).select("+password");
    if (!empFound) {
      return res.status(404).json({
        msg: "Employee not found....Please register!!!",
        success: false,
      });
    }
    const isMatch = await empFound.checkpw(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, msg: "Invalid credentials." });
    }
    const token = jwt.sign({ id: empFound._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    req.session.employeeId = empFound._id;

    return res.status(200).json({
      success: true,
      msg: "Successfully Logged In",
      token,
      user: {
        email: empFound.email,
        sapId: empFound.sapId,
        location: empFound.location,
        isSubmitted: empFound.isSubmitted,
        isAdmin: empFound.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Internal server error",
      statusCode: 500,
    });
  }
};

const changePasswordHandler = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { id } = req.user; // Get employee ID from JWT token

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, msg: "Old and new passwords are required." });
    }

    const emp = await Employee.findById(id).select("+password");

    if (!emp) {
      return res
        .status(404)
        .json({ success: false, msg: "Employee not found." });
    }

    const isMatch = await emp.checkpw(currentPassword);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, msg: "Current password is incorrect." });
    }

    emp.password = newPassword;
    await emp.save();

    return res
      .status(200)
      .json({ success: true, msg: "Password changed successfully." });
  } catch (error) {
    console.error("Error in changePasswordHandler:", error);
    return res
      .status(500)
      .json({ success: false, msg: "Internal server error" });
  }
};

const updateSubmissionStatus = async (req, res) => {
  try {
    const { id } = req.user; // Get employee ID from JWT token

    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { isSubmitted: true },
      { new: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({
        success: false,
        msg: "Employee not found",
        statusCode: 404,
      });
    }

    res.status(200).json({
      success: true,
      msg: "Form submitted successfully",
      statusCode: 200,
      isSubmitted: updatedEmployee.isSubmitted,
    });
  } catch (error) {
    console.log("🚀 ~ updateSubmissionStatus ~ error:", error);
    res.status(500).json({
      success: false,
      msg: "Internal server error",
      statusCode: 500,
    });
  }
};

const getSubmissionStatus = async (req, res) => {
  try {
    const { id } = req.user; // Get employee ID from JWT token

    const employee = await Employee.findById(id).select("isSubmitted");

    if (!employee) {
      return res.status(404).json({
        success: false,
        msg: "Employee not found",
        statusCode: 404,
      });
    }

    res.status(200).json({
      success: true,
      msg: "Submission status retrieved successfully",
      statusCode: 200,
      isSubmitted: employee.isSubmitted,
    });
  } catch (error) {
    console.log("🚀 ~ getSubmissionStatus ~ error:", error);
    res.status(500).json({
      success: false,
      msg: "Internal server error",
      statusCode: 500,
    });
  }
};

export default {
  registrationHandler,
  loginHandler,
  updateSubmissionStatus,
  getSubmissionStatus,
  changePasswordHandler,
};
