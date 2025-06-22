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
  const { sapId, password } = req.body;

  let empFound = await Employee.findOne({ sapId }).select("+password");

  if (!empFound) {
    return res.status(400).json({
      msg: "Employee not found....Please register!!!",
      success: false,
    });
  }

  empFound.checkpw(password, async function (err, result) {
    if (err) return next(err);
    if (!result) {
      return res.status(400).json({ msg: "Invalid Password", success: false });
    }
    req.session.employeeId = empFound._id;

    console.log("Employee Id:", req.session.employeeId);

    const token = jwt.sign({ id: empFound._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      success: true,
      msg: "Successfully Logged In",
      statusCode: 200,
      token,
      user: {
        email: empFound.email,
        sapId,
        location: empFound.location,
        isSubmitted: empFound.isSubmitted,
      },
    });
  });
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
};
