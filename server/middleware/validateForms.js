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

  // validate idMark1
  const alphanumericWithSpaceRegex = /^[a-zA-Z0-9\s]+$/;
  if (
    idMark1 &&
    idMark1.trim().length > 0 &&
    !alphanumericWithSpaceRegex.test(idMark1.trim())
  ) {
    errors.idMark1 = "Id mark must not contain any special characters.";
  }

  if (
    idMark2 &&
    idMark2.trim().length > 0 &&
    !alphanumericWithSpaceRegex.test(idMark2.trim())
  ) {
    errors.idMark2 = "Id mark must not contain any special characters.";
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

const validateFamilyDetails = (req, res, next) => {
  const familyMembers = req.body;
  console.log("familyMembers->", familyMembers);
  const errors = {};

  if (!Array.isArray(familyMembers)) {
    return res
      .status(400)
      .json({ errors: { familyMembers: "Family members must be an array" } });
  }

  const familyTypes = [
    "Spouse",
    "Child",
    "Father",
    "Father-in-law",
    "Mother",
    "Mother-in-law",
  ];
  const validTitles = {
    Spouse: ["Shri", "Smt"],
    Child: ["Mt", "Ms"],
    Father: ["Shri"],
    "Father-in-law": ["Shri"],
    Mother: ["Smt"],
    "Mother-in-law": ["Smt"],
  };

  familyMembers.forEach((member, index) => {
    const memberErrors = {};

    // Required fields validation
    if (!member.type?.trim()) {
      memberErrors.type = "Family member type is required";
    } else if (!familyTypes.includes(member.type)) {
      memberErrors.type = "Invalid family member type";
    }

    if (!member.title?.trim()) {
      memberErrors.title = "Title is required";
    } else if (
      member.type &&
      validTitles[member.type] &&
      !validTitles[member.type].includes(member.title)
    ) {
      memberErrors.title = "Invalid title for selected family member type";
    }

    if (!member.name?.trim()) {
      memberErrors.name = "First name is required";
    }

    if (!member.surname?.trim()) {
      memberErrors.surname = "Last name is required";
    }

    // Aadhaar validation
    if (!member.aadharNumber?.trim()) {
      memberErrors.aadharNumber = "Member Aadhaar number is required";
    } else {
      const aadhaarRegex = /^[2-9]{1}[0-9]{11}$/;
      if (!aadhaarRegex.test(member.aadharNumber)) {
        memberErrors.aadharNumber =
          "Aadhaar must be a 12-digit number starting with 2-9";
      }
    }

    // Date of Birth validation
    if (!member.dob) {
      memberErrors.dob = "Date of Birth is required";
    } else {
      const birthDate = new Date(member.dob);
      const today = new Date();

      if (birthDate > today) {
        memberErrors.dob = "Date of Birth cannot be in the future";
      }
    }

    // Spouse specific validations
    if (member.type === "Spouse") {
      if (!member.employmentStatus?.trim()) {
        memberErrors.employmentStatus =
          "Employment status is required for spouse";
      } else if (
        !["Working", "Not-Working"].includes(member.employmentStatus)
      ) {
        memberErrors.employmentStatus = "Invalid employment status";
      }

      if (
        member.employmentStatus === "Working" &&
        !member.employmentDetails?.trim()
      ) {
        memberErrors.employmentDetails =
          "Employment details are required when status is Working";
      }
    }

    // Child specific validations
    if (member.type === "Child") {
      if (!member.gender?.trim()) {
        memberErrors.gender = "Gender is required for child";
      } else if (!["Male", "Female"].includes(member.gender)) {
        memberErrors.gender = "Invalid gender selection";
      }
    }

    // If there are errors for this member, add them to the main errors object
    if (Object.keys(memberErrors).length > 0) {
      errors[`familyMembers[${index}]`] = memberErrors;
    }
  });

  // If there are any errors, return them all
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

const validateEducationalDetails = (req, res, next) => {
  const { education } = req.body;
  const errors = {};

  if (!Array.isArray(education)) {
    return res
      .status(400)
      .json({ errors: { education: "Education details must be an array" } });
  }

  const validEducationTypes = [
    "10TH",
    "12TH",
    "GRAD",
    "POSTGRAD",
    "CERTIFICATE",
  ];
  const validCertificateTypes = ["REGULAR", "CORRESPONDANCE"];
  const validMediums = ["ENGLISH", "HINDI"];
  const validHindiSubjectLevels = ["FIRST", "SECOND", "THIRD", "NONE"];

  education.forEach((entry, index) => {
    const entryErrors = {};

    // Required fields validation
    if (!entry.educationType?.trim()) {
      entryErrors.educationType = "Education type is required";
    } else if (!validEducationTypes.includes(entry.educationType)) {
      entryErrors.educationType = "Invalid education type";
    }

    if (!entry.instituteName?.trim()) {
      entryErrors.instituteName = "Institute name is required";
    }

    if (!entry.certificateType?.trim()) {
      entryErrors.certificateType = "Certificate type is required";
    } else if (!validCertificateTypes.includes(entry.certificateType)) {
      entryErrors.certificateType = "Invalid certificate type";
    }

    // Duration validation
    if (entry.duration !== undefined && entry.duration !== null) {
      const duration = Number(entry.duration);
      if (isNaN(duration)) {
        entryErrors.duration = "Duration must be a number";
      } else if (duration < 0) {
        entryErrors.duration = "Duration must be a positive number";
      }
    }

    // Medium validation
    if (entry.medium && !validMediums.includes(entry.medium)) {
      entryErrors.medium = "Invalid medium of education";
    }

    // Hindi subject level validation
    if (
      entry.hindiSubjectLevel &&
      !validHindiSubjectLevels.includes(entry.hindiSubjectLevel)
    ) {
      entryErrors.hindiSubjectLevel = "Invalid Hindi subject level";
    }

    // Date validations
    if (!entry.startDate) {
      entryErrors.startDate = "Start date is required";
    } else {
      const startDate = new Date(entry.startDate);
      startDate.setHours(0, 0, 0, 0); // Set time to midnight
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set time to midnight

      if (isNaN(startDate.getTime())) {
        entryErrors.startDate = "Invalid start date";
      } else if (startDate >= today) {
        entryErrors.startDate = "Start date must be past date";
      }
    }

    if (!entry.passingDate) {
      entryErrors.passingDate = "Passing date is required";
    } else {
      const passingDate = new Date(entry.passingDate);
      passingDate.setHours(0, 0, 0, 0); // Set time to midnight
      if (isNaN(passingDate.getTime())) {
        entryErrors.passingDate = "Invalid passing date";
      } else if (entry.startDate) {
        const startDate = new Date(entry.startDate);
        startDate.setHours(0, 0, 0, 0); // Set time to midnight
        if (passingDate < startDate) {
          entryErrors.passingDate = "Passing date must be after start date";
        }
      }
    }

    // Course details and specialization validation for higher education
    if (["GRAD", "POSTGRAD", "CERTIFICATE"].includes(entry.educationType)) {
      if (!entry.courseDetails?.trim()) {
        entryErrors.courseDetails =
          "Course details are required for higher education";
      }
      if (!entry.specialization?.trim()) {
        entryErrors.specialization =
          "Specialization is required for higher education";
      }
    }

    // If there are errors for this entry, add them to the main errors object
    if (Object.keys(entryErrors).length > 0) {
      errors[`education[${index}]`] = entryErrors;
    }
  });

  // If there are any errors, return them all
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

const validateAddress = (req, res, next) => {
  const { local, permanent } = req.body;
  const errors = {};

  // Validate both addresses are present
  if (!local || !permanent) {
    return res.status(400).json({
      errors: {
        local: !local ? "Local address is required" : null,
        permanent: !permanent ? "Permanent address is required" : null,
      },
    });
  }

  // Helper function to validate address fields
  const validateAddressFields = (address, prefix) => {
    const addressErrors = {};
    const requiredFields = [
      "addressLine1",
      "city",
      "state",
      "pincode",
      "district",
      "postOffice",
      "policeStation",
    ];

    // Check required fields
    requiredFields.forEach((field) => {
      if (!address[field]?.trim()) {
        addressErrors[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required`;
      }
    });

    // Validate pincode format
    if (address.pincode && !/^[0-9]{6}$/.test(address.pincode)) {
      addressErrors.pincode = "Pincode must be 6 digits";
    }

    return addressErrors;
  };

  // Validate local address (will be saved as currentAddress)
  const localErrors = validateAddressFields(local, "local");
  if (Object.keys(localErrors).length > 0) {
    errors.local = localErrors;
  }

  // Validate permanent address
  const permanentErrors = validateAddressFields(permanent, "permanent");
  if (Object.keys(permanentErrors).length > 0) {
    errors.permanent = permanentErrors;
  }

  // If there are any errors, return them
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  // Transform the data to match the model schema before passing to controller
  req.body = {
    currentAddress: {
      addressLine1: local.addressLine1,
      addressLine2: local.addressLine2,
      city: local.city,
      district: local.district,
      state: local.state,
      pincode: local.pincode,
      postOffice: local.postOffice,
      policeStation: local.policeStation,
    },
    permanentAddress: {
      addressLine1: permanent.addressLine1,
      addressLine2: permanent.addressLine2,
      city: permanent.city,
      district: permanent.district,
      state: permanent.state,
      pincode: permanent.pincode,
      postOffice: permanent.postOffice,
      policeStation: permanent.policeStation,
    },
  };

  next();
};

const validateWorkExperience = (req, res, next) => {
  const workExp = req.body;
  const errors = {};

  if (!Array.isArray(workExp)) {
    return res.status(400).json({
      errors: { workExperience: "Work Experience details must be an array" },
    });
  }

  const validIndustryTypes = [
    "Autonomous Bodies",
    "Central govt.",
    "Indian Armed Forces",
    "NGO",
    "Private",
    "PSU central",
    "PSU state",
    "State govt",
  ];

  workExp.forEach((entry, index) => {
    const entryErrors = {};

    // Required fields validation
    if (!entry.name?.trim()) {
      entryErrors.name = "Company name is required";
    }

    if (!entry.designation?.trim()) {
      entryErrors.designation = "Designation is required";
    }

    if (!entry.grossSalary || entry.grossSalary <= 0) {
      entryErrors.grossSalary = "Gross salary is required and must be positive";
    }

    // Industry validation
    if (entry.industry && !validIndustryTypes.includes(entry.industry)) {
      entryErrors.industry = "Invalid industry selected";
    }

    // Greenfield validation
    if (entry.greenfield && !["Yes", "No"].includes(entry.greenfield)) {
      entryErrors.greenfield = "Greenfield must be either 'Yes' or 'No'";
    }

    // Start Date validations
    if (!entry.startDate) {
      entryErrors.startDate = "Start date is required";
    } else {
      const startDate = new Date(entry.startDate);
      startDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(startDate.getTime())) {
        entryErrors.startDate = "Invalid start date";
      } else if (startDate >= today) {
        entryErrors.startDate = "Start date must be past date";
      }
    }

    // Relieving Date validations
    if (!entry.relievingDate) {
      entryErrors.relievingDate = "Relieving date is required";
    } else {
      const relievingDate = new Date(entry.relievingDate);
      relievingDate.setHours(0, 0, 0, 0);
      if (isNaN(relievingDate.getTime())) {
        entryErrors.relievingDate = "Invalid relieving date";
      } else if (entry.startDate) {
        const startDate = new Date(entry.startDate);
        startDate.setHours(0, 0, 0, 0);
        if (relievingDate < startDate) {
          entryErrors.relievingDate = "Relieving date must be after start date";
        }
      }
    }

    // Duration validations
    if (
      entry.numberOfYears !== undefined &&
      (entry.numberOfYears < 0 || !Number.isInteger(entry.numberOfYears))
    ) {
      entryErrors.numberOfYears =
        "Number of years must be a non-negative integer";
    }

    if (
      entry.numberOfMonths !== undefined &&
      (entry.numberOfMonths < 0 ||
        entry.numberOfMonths > 11 ||
        !Number.isInteger(entry.numberOfMonths))
    ) {
      entryErrors.numberOfMonths = "Number of months must be between 0 and 11";
    }

    // If there are errors for this entry, add them to the main errors object
    if (Object.keys(entryErrors).length > 0) {
      errors[`work[${index}]`] = entryErrors;
    }
  });

  // If there are any errors, return them all
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }
  next();
};

export {
  validateReg,
  validatePersonalDetails,
  validateFamilyDetails,
  validateEducationalDetails,
  validateAddress,
  validateWorkExperience,
};
