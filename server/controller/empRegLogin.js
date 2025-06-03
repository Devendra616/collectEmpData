import Employee from "../models/employee.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const registrationHandler = async (req, res) => {
  try {
    const { email, sapId, password } = req.body;

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
    return res.json({ msg: "Employee not found....Please register!!!" });
  }

  empFound.checkpw(password, async function (err, result) {
    if (err) return next(err);
    if (!result) {
      return res.status(400).json({ msg: "Invalid Password" });
    }
    req.session.employeeId = empFound._id;

    console.log("Employee Id:", req.session.employeeId);

    const token = jwt.sign({ id: empFound._id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    res.status(200).json({
      success: true,
      msg: "Successfully Logged In",
      statusCode: 200,
      token,
      user: {
        email: empFound.email,
      },
    });
  });
};

export default {
  registrationHandler,
  loginHandler,
};
