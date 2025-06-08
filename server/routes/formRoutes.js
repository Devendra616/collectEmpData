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
import addressDetailsHandler from "../controller/addressDetails.js";
import WorkDetailsHandler from "../controller/workDetails.js";

// const { fetchPersonalDetails } = fetchController;

const { registrationHandler, loginHandler } = handlers;

// router.get('/welcome', (req, res) => {
//   res.status(200).json({ message: 'Welcome! Your route is working.' });
// });

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
router.get("/address", verifyToken, fetchPersonalDetails);
router.get("/work", verifyToken, fetchPersonalDetails);
router.get("/family", verifyToken, fetchFamilyDetails);

router.post(
  "/family",
  verifyToken,
  validateFamilyDetails,
  familyDetailsHandler
);

router.post("/address", verifyToken, validateAddress, addressDetailsHandler);

router.post("/work", verifyToken, validateWorkExperience, WorkDetailsHandler);

export default router;
