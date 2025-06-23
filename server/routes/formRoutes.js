import express from "express";

const router = express.Router();

import handlers from "../controller/empRegLogin.js";
import {
  validateReg,
  validatePersonalDetails,
  validateFamilyDetails,
  validateEducationalDetails,
  validateAddress,
  validateWorkExperience,
} from "../middleware/validateForms.js";
import {
  personalDetailsHandler,
  fetchPersonalDetails,
} from "../controller/personalDetails.js";
import {
  familyDetailsHandler,
  fetchFamilyDetails,
} from "../controller/familyDetails.js";
import { verifyToken } from "../middleware/authenticateLogin.js";
// import fetchController from "../controller/fetchDetails.js";
import {
  fetchEducationDetails,
  educationDetailsHandler,
} from "../controller/educationDetails.js";
import {
  addressDetailsHandler,
  fetchAddressDetails,
} from "../controller/addressDetails.js";
import {
  WorkDetailsHandler,
  fetchWorkDetails,
} from "../controller/workDetails.js";

// const { fetchPersonalDetails } = fetchController;

const {
  registrationHandler,
  loginHandler,
  updateSubmissionStatus,
  getSubmissionStatus,
} = handlers;

// router.get('/welcome', (req, res) => {
//   res.status(200).json({ message: 'Welcome! Your route is working.' });
// });

router.get("/validate-token", verifyToken, (req, res) => {
  // if passed middleware then valid
  res.status(200).json({
    success: true,
    msg: "Token is valid",
    statusCode: 200,
    user: req.user,
  });
});

router.post("/register", validateReg, registrationHandler);

router.post("/login", loginHandler);

router.post(
  "/personal",
  verifyToken,
  validatePersonalDetails,
  personalDetailsHandler
);

router.post(
  "/education",
  verifyToken,
  validateEducationalDetails,
  educationDetailsHandler
);

router.get("/personal", verifyToken, fetchPersonalDetails);
router.get("/education", verifyToken, fetchEducationDetails);
router.get("/address", verifyToken, fetchAddressDetails);
router.get("/work", verifyToken, fetchWorkDetails);
router.get("/family", verifyToken, fetchFamilyDetails);

router.post(
  "/family",
  verifyToken,
  validateFamilyDetails,
  familyDetailsHandler
);

router.post("/address", verifyToken, validateAddress, addressDetailsHandler);

router.post("/work", verifyToken, validateWorkExperience, WorkDetailsHandler);

// Add route for final form submission
router.post("/submit-form", verifyToken, updateSubmissionStatus);

// Add route to get submission status
router.get("/submission-status", verifyToken, getSubmissionStatus);

export default router;
