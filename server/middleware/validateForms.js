import { getAgeFromDOB } from "../utils/getAge.js";

const validateReg = (req, res, next) => {
  const { email, sapId, password, cpassword } = req.body;

  if (
    [email, sapId, password, cpassword].some((field) => field?.trim() === "")
  ) {
    return res.status(400).json("All fields are required...");
  }

  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%!?*&])[a-zA-Z\d@#$%!?*&]{8,}$/;
  if (!passwordRegex.test(password))
    return res
      .status(400)
      .json(
        "Password must be of minimum 8 charcter and contain digits, lowercase, uppercase and special characters"
      );

  const emailRegex = /^[a-zA-Z0-9._%+-]+@nmdc\.co\.in$/;
  if (!emailRegex.test(email))
    return res.status(400).json("Email ID must be a valid NMDC email Id");

  const sapRegex = /^[0-9]{8}$/;
  if (!sapRegex.test(sapId)) {
    return res.status(400).json("Provide a valid SAP ID");
  }

  next();
};

const validatePersonalDetails = (req, res, next) => {
  const {
    title,
    firstName,
    lastName,
    sapId,
    gender,
    dob,
    birthplace,
    state,
    religion,
    category,
    subCategory,
    idMark1,
    idMark2,
    exServiceman,
    adhaarId,
    mobile,
    email,
    pwd,
    motherTongue,
    hindiKnowledge,
  } = req.body;

  // Check required fields
  const requiredFields = [
    title,
    firstName,
    lastName,
    sapId,
    gender,
    dob,
    birthplace,
    state,
    religion,
    category,
    subCategory,
    idMark1,
    idMark2,
    exServiceman,
    adhaarId,
    mobile,
    email,
    pwd,
    motherTongue,
    hindiKnowledge,
  ];

  if (requiredFields.some((field) => !field?.trim())) {
    return res.status(400).json("All fields are required");
  }

  // Validate SAP ID
  const sapRegex = /^[0-9]{8}$/;
  if (!sapRegex.test(sapId)) {
    return res.status(400).json("Provide a valid SAP ID");
  }

  // Validate Aadhaar ID
  const aadhaarRegex = /^[2-9]{1}[0-9]{11}$/;
  if (!aadhaarRegex.test(adhaarId)) {
    return res
      .status(400)
      .json("Aadhaar must be a 12-digit number starting with 2-9");
  }

  // Validate Mobile Number
  const mobileRegex = /^[0-9]{10}$/;
  if (!mobileRegex.test(mobile)) {
    return res.status(400).json("Mobile number must be exactly 10 digits");
  }

  // Validate Email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@nmdc\.co\.in$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json("Email must be a valid NMDC email");
  }

  // Validate Date of Birth
  const birthDate = new Date(dob);
  const today = new Date();

  if (birthDate > today) {
    return res.status(400).json("Date of Birth cannot be in the future");
  }

  // Calculate age
  const age = getAgeFromDOB(dob);
  if (!age || age.years < 18) {
    return res.status(400).json("Age must be at least 18 years");
  }

  // Validate title
  const validTitles = ["Shri", "Smt", "Ms"];
  if (!validTitles.includes(title)) {
    return res.status(400).json("Invalid title selected");
  }

  // Validate gender
  const validGenders = ["Male", "Female"];
  if (!validGenders.includes(gender)) {
    return res.status(400).json("Invalid gender selected");
  }

  // Validate exServiceman
  const validExServiceman = ["Yes", "No"];
  if (!validExServiceman.includes(exServiceman)) {
    return res.status(400).json("Invalid ex-serviceman selection");
  }

  // Validate PWD
  const validPWD = ["Yes", "No"];
  if (!validPWD.includes(pwd)) {
    return res.status(400).json("Invalid PWD selection");
  }

  // Validate hindiKnowledge
  const validHindiKnowledge = ["Yes", "No"];
  if (!validHindiKnowledge.includes(hindiKnowledge)) {
    return res.status(400).json("Invalid Hindi knowledge selection");
  }

  next();
};

export { validateReg, validatePersonalDetails };
