import Employee from "../models/employee.js";
import PersonalDetails from "../models/personalDetails.js";
import AddressDetails from "../models/address.js";
import EducationDetails from "../models/education.js";
import FamilyDetails from "../models/family.js";
import WorkExperience from "../models/workExperience.js";
import bcrypt from "bcrypt";

// Get employee statistics for dashboard overview
const getEmployeeStats = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const submittedApplications = await Employee.countDocuments({
      isSubmitted: true,
    });
    const pendingApplications = await Employee.countDocuments({
      isSubmitted: false,
    });

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        submittedApplications,
        pendingApplications,
      },
      msg: "Employee statistics retrieved successfully",
    });
  } catch (error) {
    console.error("Error in getEmployeeStats:", error);
    res.status(500).json({
      success: false,
      msg: "Internal server error",
      data: null,
    });
  }
};

// Get all employees with their basic information
const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({})
      .select("sapId email isSubmitted")
      .sort({ sapId: 1 });

    // Transform the data to match the expected format
    const transformedEmployees = employees.map((emp) => ({
      sapId: emp.sapId,
      empId: emp.sapId, // Use sapId as empId since empId field doesn't exist
      name: emp.sapId, // Use sapId as name since name field doesn't exist
      department: "Not specified", // Default department since field doesn't exist
      email: emp.email,
      isSubmitted: emp.isSubmitted,
    }));

    res.status(200).json({
      success: true,
      data: {
        employees: transformedEmployees,
      },
      msg: "All employees retrieved successfully",
    });
  } catch (error) {
    console.error("Error in getAllEmployees:", error);
    res.status(500).json({
      success: false,
      msg: "Internal server error",
      data: null,
    });
  }
};

// Reset individual employee password
const resetEmployeePassword = async (req, res) => {
  try {
    const { sapId, password } = req.body;

    if (!sapId || !password) {
      return res.status(400).json({
        success: false,
        msg: "SAP ID and password are required",
      });
    }

    const employee = await Employee.findOne({ sapId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        msg: "Employee not found",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    employee.password = hashedPassword;
    await employee.save();

    res.status(200).json({
      success: true,
      msg: `Password reset successfully for ${sapId}`,
    });
  } catch (error) {
    console.error("Error in resetEmployeePassword:", error);
    res.status(500).json({
      success: false,
      msg: "Internal server error",
    });
  }
};

// Reset all employee passwords
const resetAllPasswords = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        msg: "Password is required",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update all employees' passwords
    const result = await Employee.updateMany({}, { password: hashedPassword });

    res.status(200).json({
      success: true,
      msg: `Passwords reset successfully for ${result.modifiedCount} employees`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error in resetAllPasswords:", error);
    res.status(500).json({
      success: false,
      msg: "Internal server error",
    });
  }
};

// View individual employee details
const viewEmployee = async (req, res) => {
  try {
    const { sapId } = req.params;

    if (!sapId) {
      return res.status(400).json({
        success: false,
        msg: "SAP ID is required",
      });
    }

    const employee = await Employee.findOne({ sapId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        msg: "Employee not found",
      });
    }

    // Fetch all related data
    const [
      personalDetails,
      addressDetails,
      educationDetails,
      familyDetails,
      workDetails,
    ] = await Promise.all([
      PersonalDetails.findOne({ employeeId: employee._id }),
      AddressDetails.findOne({ employeeId: employee._id }),
      EducationDetails.findOne({ employeeId: employee._id }),
      FamilyDetails.findOne({ employeeId: employee._id }),
      WorkExperience.findOne({ employeeId: employee._id }),
    ]);

    // Transform the data to match the expected format
    const employeeData = {
      personalDetails: personalDetails ? [personalDetails] : [],
      address: addressDetails
        ? [
            { type: "present", ...addressDetails.presentAddress },
            { type: "permanent", ...addressDetails.permanentAddress },
            { type: "correspondence", ...addressDetails.correspondenceAddress },
          ]
        : [],
      education: educationDetails ? educationDetails.education : [],
      family: familyDetails ? familyDetails.familyMembers : [],
      experiences: workDetails ? workDetails.experiences : [],
    };

    res.status(200).json({
      success: true,
      data: employeeData,
      msg: "Employee data retrieved successfully",
    });
  } catch (error) {
    console.error("Error in viewEmployee:", error);
    res.status(500).json({
      success: false,
      msg: "Internal server error",
      data: null,
    });
  }
};

// Update application submission status
const updateApplicationStatus = async (req, res) => {
  try {
    const { sapId } = req.params;
    const { isSubmitted } = req.body;

    if (typeof isSubmitted !== "boolean") {
      return res.status(400).json({
        success: false,
        msg: "isSubmitted must be a boolean value",
      });
    }

    const employee = await Employee.findOneAndUpdate(
      { sapId },
      { isSubmitted },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        msg: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      msg: `Application status updated for ${sapId}`,
      data: {
        sapId: employee.sapId,
        isSubmitted: employee.isSubmitted,
      },
    });
  } catch (error) {
    console.error("Error in updateApplicationStatus:", error);
    res.status(500).json({
      success: false,
      msg: "Internal server error",
    });
  }
};

// Admin login handler
const adminLogin = async (req, res) => {
  try {
    const { sapId, password } = req.body;

    if (!sapId || !password) {
      return res.status(400).json({
        success: false,
        msg: "SAP ID and password are required",
      });
    }

    const employee = await Employee.findOne({ sapId }).select("+password");
    if (!employee) {
      return res.status(404).json({
        success: false,
        msg: "Admin not found",
      });
    }

    // Check if user is admin
    if (!employee.isAdmin) {
      return res.status(403).json({
        success: false,
        msg: "Access denied. Admin privileges required.",
      });
    }

    // Verify password
    const isMatch = await employee.checkpw(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        msg: "Invalid credentials",
      });
    }

    // Generate admin token
    const jwt = await import("jsonwebtoken");
    const token = jwt.default.sign(
      { id: employee._id, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      success: true,
      msg: "Admin login successful",
      token,
      user: {
        sapId: employee.sapId,
        email: employee.email,
        isAdmin: employee.isAdmin,
      },
    });
  } catch (error) {
    console.error("Error in adminLogin:", error);
    res.status(500).json({
      success: false,
      msg: "Internal server error",
    });
  }
};

export {
  getEmployeeStats,
  getAllEmployees,
  resetEmployeePassword,
  resetAllPasswords,
  viewEmployee,
  updateApplicationStatus,
  adminLogin,
};
