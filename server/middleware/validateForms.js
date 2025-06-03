import { getAgeFromDOB } from "../utils/getAge.js";

const fieldNameMapping = {
  title: "Title",
  firstName: "First Name",
  lastName: "Last Name",
  sapId: "SAP ID",
  gender: "Gender",
  dob: "Date of Birth",
  birthplace: "Birth Place",
  state: "State",
  religion: "Religion",
  category: "Category",
  subCategory: "Sub-Category",
  idMark1: "Identification Mark 1",
  idMark2: "Identification Mark 2",
  exServiceman: "Ex-Serviceman",
  adhaarId: "Aadhaar Number",
  mobile: "Mobile Number",
  email: "Email",
  pwd: "Person with Disability",
  motherTongue: "Mother Tongue",
  hindiKnowledge: "Working Knowledge in Hindi",
};

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

  const errors = {};

  // Check required fields
  const requiredFields = {
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
    exServiceman,
    adhaarId,
    mobile,
    email,
    pwd,
    motherTongue,
    hindiKnowledge,
  };

  // Check for empty required fields
  Object.entries(requiredFields).forEach(([field, value]) => {
    if (!value?.trim()) {
      errors[field] = `${fieldNameMapping[field] || field} is required`;
    }
  });

  // Validate SAP ID
  const sapRegex = /^[0-9]{8}$/;
  if (sapId && !sapRegex.test(sapId)) {
    errors.sapId = "Provide a valid SAP ID";
  }

  // Validate Aadhaar ID
  const aadhaarRegex = /^[2-9]{1}[0-9]{11}$/;
  if (adhaarId && !aadhaarRegex.test(adhaarId)) {
    errors.adhaarId =
      "Aadhaar Number must be a 12-digit number starting with 2-9";
  }

  // Validate Mobile Number
  const mobileRegex = /^[0-9]{10}$/;
  if (mobile && !mobileRegex.test(mobile)) {
    errors.mobile = "Mobile Number must be exactly 10 digits";
  }

  // Validate Email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@nmdc\.co\.in$/;
  if (email && !emailRegex.test(email)) {
    errors.email = "Email must be a valid NMDC email";
  }

  // Validate Date of Birth
  if (dob) {
    const birthDate = new Date(dob);
    const today = new Date();

    if (birthDate > today) {
      errors.dob = "Date of Birth cannot be in the future";
    }

    // Calculate age
    const age = getAgeFromDOB(dob);
    if (!age || age.years < 18) {
      errors.dob = "Age must be at least 18 years";
    }
  }

  // Validate title
  const validTitles = ["Shri", "Smt", "Ms"];
  if (title && !validTitles.includes(title)) {
    errors.title = "Invalid Title selected";
  }

  // Validate gender
  const validGenders = ["Male", "Female"];
  if (gender && !validGenders.includes(gender)) {
    errors.gender = "Invalid Gender selected";
  }

  // Validate exServiceman
  const validExServiceman = ["Yes", "No"];
  if (exServiceman && !validExServiceman.includes(exServiceman)) {
    errors.exServiceman = "Invalid Ex-Serviceman selection";
  }

  // Validate PWD
  const validPWD = ["Yes", "No"];
  if (pwd && !validPWD.includes(pwd)) {
    errors.pwd = "Invalid Person with Disability selection";
  }

  // Validate hindiKnowledge
  const validHindiKnowledge = ["Yes", "No"];
  if (hindiKnowledge && !validHindiKnowledge.includes(hindiKnowledge)) {
    errors.hindiKnowledge = "Invalid Working Knowledge in Hindi selection";
  }

  // If there are any errors, return them all
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

export { validateReg, validatePersonalDetails };
