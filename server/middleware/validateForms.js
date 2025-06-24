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
  const { email, sapId, password, cpassword, location } = req.body;

  if (
    [email, sapId, password, cpassword, location].some(
      (field) => field?.trim() === ""
    )
  ) {
    return res
      .status(400)
      .json({ success: false, msg: "All fields are required..." });
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
  if (!passwordRegex.test(password))
    return res
      .status(400)
      .json(
        "Password must be of minimum length 6 and contain at least 1 lowercase letter, 1 uppercase letter, and can include numbers"
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
    maritalStatus,
    countChild,
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

  // validate count of children
  if (countChild && countChild < 0) {
    errors.countChild = "No.Of Children can me min 0.";
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
  // Validate marital status
  const validMaritalStatus = [
    "single",
    "married",
    "divorced",
    "widowed",
    "separated",
  ];
  if (maritalStatus && !validMaritalStatus.includes(maritalStatus)) {
    errors.maritalStatus = "Invalid Marital Status selected";
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
    return res.status(400).json({ errors, success: false, data: null });
  }

  next();
};

const validateFamilyDetails = (req, res, next) => {
  const { family: familyMembers } = req.body;
  const errors = {};

  if (!Array.isArray(familyMembers)) {
    return res.status(400).json({
      errors: { familyMembers: "Family members must be an array" },
      success: false,
      data: null,
    });
  }

  const validRelations = [
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
    let isChild = false;
    // Required fields validation
    if (!member.relationship?.trim()) {
      memberErrors.relationship = "Family relation is required";
    } else if (!validRelations.includes(member.relationship)) {
      memberErrors.relationship = "Invalid family relation selected";
    }

    if (!member.title?.trim()) {
      memberErrors.title = "Title is required";
    } else if (
      member.type &&
      validTitles[member.relationship] &&
      !validTitles[member.relationship].includes(member.title)
    ) {
      memberErrors.title = "Invalid title for selected family member type";
    }
    if (member.relationship === "Child") {
      isChild = true;
    }

    if (!member.firstName?.trim()) {
      memberErrors.firstName = "First name is required";
    }

    // Aadhaar validation
    if (!isChild) {
      if (!member.aadharNumber?.trim()) {
        memberErrors.aadharNumber = "Member Aadhaar number is required";
      } else {
        const aadhaarRegex = /^[2-9]{1}[0-9]{11}$/;
        if (!aadhaarRegex.test(member.aadharNumber)) {
          memberErrors.aadharNumber =
            "Aadhaar must be a 12-digit number starting with 2-9";
        }
      }
    }

    // Date of Birth validation
    if (!member.dob) {
      memberErrors.dob = "Date of Birth is required";
    } else {
      const birthDate = new Date(member.dob);
      birthDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set time to midnight

      if (birthDate > today) {
        memberErrors.dob = "Date of Birth cannot be in the future";
      }
    }

    // nationality validation
    if (!member.nationality) {
      memberErrors.nationality = "Nationality is required";
    }

    if (member.relationship === "Spouse") {
      // Spouse specific validations
      if (member.isWorking === "") {
        memberErrors.isWorking = "Employment status is required for spouse";
      } else if (
        typeof member.isWorking !== "boolean" &&
        !["true", "false"].includes(String(member.isWorking).toLowerCase())
      ) {
        memberErrors.isWorking = "Invalid employment status";
      }

      if (member.isWorking && !member.employmentDetails?.trim()) {
        memberErrors.employmentDetails =
          "Employment details are required when status is Working";
      }
    }

    // Child specific validations
    if (isChild) {
      if (!member.gender?.trim()) {
        memberErrors.gender = "Gender is required for child";
      } else if (!["Male", "Female"].includes(member.gender)) {
        memberErrors.gender = "Invalid gender selection";
      }
    }

    // If there are errors for this member, add them to the main errors object
    if (Object.keys(memberErrors).length > 0) {
      errors[`family[${index}]`] = memberErrors;
    }
  });

  // If there are any errors, return them all
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors, success: false, data: null });
  }

  next();
};

const validateEducationalDetails = (req, res, next) => {
  const { education } = req.body;
  const errors = {};

  if (!Array.isArray(education)) {
    return res.status(400).json({
      errors: { education: "Education details must be an array" },
      success: false,
      data: null,
    });
  }

  const validEducationTypes = [
    "10TH",
    "12TH",
    "GRAD",
    "POSTGRAD",
    "CERTIFICATE",
    "LICENSE",
  ];
  const validCertificateTypes = ["REGULAR", "CORRESPONDANCE"];
  const validMediums = ["ENGLISH", "HINDI"];
  const validHindiSubjectLevels = ["FIRST", "SECOND", "THIRD", "NONE"];
  const validLicenseTypes = ["HVD", "LVD", "ELECTRICAL_SUPERVISORY"];

  education.forEach((entry, index) => {
    const entryErrors = {};

    // Required fields validation
    if (!entry.educationType?.trim()) {
      entryErrors.educationType = "Education type is required";
    } else if (!validEducationTypes.includes(entry.educationType)) {
      entryErrors.educationType = "Invalid education type";
    }

    let isLicense = false;
    if (entry.educationType === "LICENSE") {
      isLicense = true;
    }

    if (!isLicense) {
      // type is not LICENSE
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
    } else {
      // for licenses
      if (!validLicenseTypes.includes(entry.licenseType)) {
        entryErrors.entryErrors = "Invalid License Type Selected";
      }
      if (!entry.licenseNumber?.trim()) {
        entryErrors.licenseNumber = "License Number is required";
      }
      if (!entry.licenseIssueDate?.trim()) {
        entryErrors.licenseIssueDate = "License Issue Date is required";
      }
      if (!entry.licenseIssuingAuthority?.trim()) {
        entryErrors.licenseIssuingAuthority =
          "License Issuing Authority is required";
      }
    }

    // If there are errors for this entry, add them to the main errors object
    if (Object.keys(entryErrors).length > 0) {
      errors[`education[${index}]`] = entryErrors;
    }
  });

  // If there are any errors, return them all
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors, success: false, data: null });
  }

  next();
};

const validateAddress = (req, res, next) => {
  const { address } = req.body;
  const errors = {};
  console.log("validate address called");
  if (!Array.isArray(address)) {
    return res.status(400).json({
      errors: { address: "Address details must be an array" },
      success: false,
      data: null,
    });
  }

  // Check if required addresses are present (present and permanent are required, correspondence is optional)
  const presentAddress = address.find((addr) => addr.type === "present");
  const permanentAddress = address.find((addr) => addr.type === "permanent");
  const correspondenceAddress = address.find(
    (addr) => addr.type === "correspondence"
  );

  if (!presentAddress || !permanentAddress) {
    return res.status(400).json({
      errors: {
        address: {
          present: !presentAddress ? "Present address is required" : null,
          permanent: !permanentAddress ? "Permanent address is required" : null,
        },
      },
      success: false,
      data: null,
    });
  }

  const requiredFields = [
    "addressLine1",
    "city",
    "state",
    "pincode",
    "district",
    "postOffice",
    "policeStation",
  ];

  address.forEach((addr, index) => {
    const addressErrors = {};

    // Validate address type
    if (!addr.type?.trim()) {
      addressErrors.type = "Address type is required";
    } else if (
      !["present", "permanent", "correspondence"].includes(addr.type)
    ) {
      addressErrors.type =
        "Address type must be either 'present', 'permanent', or 'correspondence'";
    }

    // Check required fields only for present and permanent addresses
    // Correspondence address is optional, so skip validation if it's empty
    if (addr.type === "correspondence" && !addr.addressLine1?.trim()) {
      // Skip validation for empty correspondence address
    } else {
      requiredFields.forEach((field) => {
        if (!addr[field]?.trim()) {
          addressErrors[field] = `${
            field.charAt(0).toUpperCase() + field.slice(1)
          } is required`;
        }
      });
    }

    // Validate pincode format only if address is not empty
    if (addr.pincode && !/^[0-9]{6}$/.test(addr.pincode)) {
      addressErrors.pincode = "Pincode must be 6 digits";
    }

    // If there are errors for this address, add them to the main errors object
    if (Object.keys(addressErrors).length > 0) {
      errors[`address[${index}]`] = addressErrors;
    }
  });

  // If there are any errors, return them all
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors, success: false, data: null });
  }

  next();
};

const validateWorkExperience = (req, res, next) => {
  const { work: workExperience } = req.body;
  const errors = {};

  if (!Array.isArray(workExperience)) {
    return res.status(400).json({
      errors: { work: "Work experiences must be an array" },
      success: false,
      data: null,
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

  workExperience.forEach((entry, index) => {
    const entryErrors = {};

    // Required fields validation
    if (!entry.companyName?.trim()) {
      entryErrors.companyName = "Company name is required";
    }
    if (!entry.city?.trim()) {
      entryErrors.city = "Company city is required";
    }

    if (!entry.role?.trim()) {
      entryErrors.role = "Designation/role is required";
    }

    if (!entry.grossSalary || entry.grossSalary <= 0) {
      entryErrors.grossSalary = "Gross salary is required and must be positive";
    }

    // Industry validation
    if (entry.industry && !validIndustryTypes.includes(entry.industry)) {
      entryErrors.industry = "Invalid industry selected";
    }

    // Greenfield validation
    if (entry.isGreenfield === "") {
      entryErrors.isGreenfield = "Is work Greenfield ?";
    } else if (
      typeof entry.isGreenfield !== "boolean" &&
      !["true", "false"].includes(String(entry.isGreenfield).toLowerCase())
    ) {
      entryErrors.isGreenfield = "Invalid greenfield status";
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

    /* // Duration validations
    if (
      entry.numberOfYears !== undefined &&
      (entry.numberOfYears < 0 || !Number.isInteger(entry.numberOfYears))
    ) {
      console.log("numberOfYears", entry.numberOfYears);
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
    } */

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
