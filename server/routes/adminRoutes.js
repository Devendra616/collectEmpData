import express from "express";
import jwt from "jsonwebtoken";
import { verifyToken } from "../middleware/authenticateLogin.js";
import {
  getEmployeeStats,
  getAllEmployees,
  resetEmployeePassword,
  resetAllPasswords,
  viewEmployee,
  updateApplicationStatus,
  adminLogin,
} from "../controller/adminController.js";

const router = express.Router();

// Admin authentication middleware
const verifyAdminToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      msg: "No token, access denied",
      statusCode: 401,
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user is admin
    if (!decoded.isAdmin) {
      return res.status(403).json({
        success: false,
        msg: "Admin access required",
        statusCode: 403,
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.log("🚀 ~ verifyAdminToken ~ error:", error);
    res.status(403).json({
      success: false,
      msg: "Token is not valid",
      statusCode: 403,
    });
  }
};

// Admin login (no token required)
router.post("/login", adminLogin);

// Token validation endpoint
router.get("/validate-token", verifyAdminToken, (req, res) => {
  res.status(200).json({
    success: true,
    msg: "Admin token is valid",
    user: req.user,
  });
});

// All other admin routes require admin token
router.get("/get-employee-stats", verifyAdminToken, getEmployeeStats);
router.get("/get-all-employees", verifyAdminToken, getAllEmployees);
router.post(
  "/reset-employee-password",
  verifyAdminToken,
  resetEmployeePassword
);
router.post("/reset-all-passwords", verifyAdminToken, resetAllPasswords);
router.get("/view-employee/:sapId", verifyAdminToken, viewEmployee);
router.patch(
  "/update-application-status/:sapId",
  verifyAdminToken,
  updateApplicationStatus
);

export default router;
