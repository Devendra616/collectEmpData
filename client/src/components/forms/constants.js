const motherTongueOptions = [
  "ASSAMESE",
  "BENGALI",
  "BODO",
  "DOGRI",
  "ENGLISH",
  "GUJARATI",
  "HINDI",
  "KANNADA",
  "KASHMIRI",
  "KONKANI",
  "MAITHILI",
  "MALAYALAM",
  "MARATHI",
  "NEPALI",
  "ODIYA",
  "PUNJABI",
  "SANSKRIT",
  "SANTALI",
  "SINDHI",
  "TAMIL",
  "TELUGU",
  "URDU",
  "OTHER",
];

const states = [
  { name: "Andaman and Nicobar Islands", code: "Andaman and Nicobar Islands" },
  { name: "Andhra Pradesh", code: "Andhra Pradesh" },
  { name: "Arunachal Pradesh", code: "Arunachal Pradesh" },
  { name: "Assam", code: "Assam" },
  { name: "Bihar", code: "Bihar" },
  { name: "Chandigarh", code: "Chandigarh" },
  { name: "Chattisgarh", code: "Chattisgarh" },
  { name: "Dadra and Nagar Haveli", code: "Dadra and Nagar Haveli" },
  { name: "Daman and Diu", code: "Daman and Diu" },
  { name: "Delhi", code: "Delhi" },
  { name: "Goa", code: "Goa" },
  { name: "Gujarat", code: "Gujarat" },
  { name: "Haryana", code: "Haryana" },
  { name: "Himachal Pradesh", code: "Himachal Pradesh" },
  { name: "Jammu and Kashmir", code: "Jammu and Kashmir" },
  { name: "Jharkhand", code: "Jharkhand" },
  { name: "Karnataka", code: "Karnataka" },
  { name: "Kerala", code: "Kerala" },
  { name: "Lakshadweep Islands", code: "Lakshadweep Islands" },
  { name: "Madhya Pradesh", code: "Madhya Pradesh" },
  { name: "Maharashtra", code: "Maharashtra" },
  { name: "Manipur", code: "Manipur" },
  { name: "Meghalaya", code: "Meghalaya" },
  { name: "Mizoram", code: "Mizoram" },
  { name: "Nagaland", code: "Nagaland" },
  { name: "Odisha", code: "Odisha" },
  { name: "Pondicherry", code: "Pondicherry" },
  { name: "Punjab", code: "Punjab" },
  { name: "Rajasthan", code: "Rajasthan" },
  { name: "Sikkim", code: "Sikkim" },
  { name: "Tamil Nadu", code: "Tamil Nadu" },
  { name: "Telangana", code: "Telangana" },
  { name: "Tripura", code: "Tripura" },
  { name: "Uttar Pradesh", code: "Uttar Pradesh" },
  { name: "Uttarakhand", code: "Uttarakhand" },
  { name: "West Bengal", code: "West Bengal" },
];

const titleOptions = [
  { value: "Dr", label: "Dr." },
  { value: "Shri", label: "Shri." },
  { value: "Smt", label: "Smt." },
  { value: "Ms", label: "Ms." },
  { value: "Miss", label: "Miss." },
  { value: "Mt", label: "Mt." },
];

const genderOptions = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

const maritalStatusOptions = [
  { value: "SINGLE", label: "Single" },
  { value: "MARRIED", label: "Married" },
  { value: "DIVORCED", label: "Divorced" },
  { value: "WIDOWED", label: "Widowed" },
  { value: "SEPARATED", label: "Separated" },
  { value: "OTHER", label: "Other" },
];

const religionOptions = [
  { value: "HINDU", label: "Hindu" },
  { value: "MUSLIM", label: "Muslim" },
  { value: "CHRISTIAN", label: "Christian" },
  { value: "BUDDHIST", label: "Buddhist" },
  { value: "SIKH", label: "Sikh" },
  { value: "JAIN", label: "Jain" },
  { value: "PARSI", label: "Parsi" },
  { value: "OTHER", label: "Other" },
];

const categoryOptions = [
  { value: "GENERAL", label: "General" },
  { value: "OBC", label: "OBC" },
  { value: "SC", label: "SC" },
  { value: "ST", label: "ST" },
  { value: "OTHER", label: "Other" },
];

const education = [
  { value: "10TH", label: "10th Class" },
  { value: "12TH", label: "12th Class" },
  { value: "GRAD", label: "Graduation / Diploma / ITI" },
  { value: "POSTGRAD", label: "Post-graduation / PhD" },
  { value: "CERTIFICATE", label: "Course Certificate / Others" },
  { value: "LICENSE", label: "License / Skills" },
];

const certficateTypeOptions = [
  { value: "REGULAR", label: "Regular" },
  { value: "CORRESPONDANCE", label: "Correspondance" },
];

const familyRelationOptions = [
  { value: "Child", label: "Child" },
  { value: "Father", label: "Father" },
  { value: "Father_In_Law", label: "Father-in-Law" },
  { value: "Mother", label: "Mother" },
  { value: "Mother_In_Law", label: "Mother-in-Law" },
  { value: "Sister", label: "Sister" },
  { value: "Spouse", label: "Spouse" },
];

const bloodGroupOptions = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
];

const nationalityOptions = [
  { value: "INDIAN", label: "Indian" },
  { value: "OTHER", label: "Other" },
];

const employmentIndustryOptions = [
  { value: "AUTONOMOUS", label: "Autonomous Body" },
  { value: "CENTRAL_GOVT", label: "Central Govt." },
  { value: "DEFENCE", label: "Defence" },
  { value: "NGO", label: "NGO" },
  { value: "PSU_CENTRAL", label: "PSU Central" },
  { value: "PSU_STATE", label: "PSU State" },
  { value: "PRIVATE", label: "Private" },
  { value: "STATE_GOVT", label: "State Govt." },
  { value: "OTHER", label: "Other" },
];

const hindiSubjectLevels = [
  { value: "FIRST", label: "1st Language" },
  { value: "SECOND", label: "2nd Language" },
  { value: "THIRD", label: "3rd Language" },
  { value: "NONE", label: "None" },
];

const licenseTypes = [
  { value: "ELECTRICAL_SUPERVISORY", label: "Electrical Supervisory" },
  { value: "HVD", label: "HVD (Heavy Vehicle Driver)" },
  { value: "LVD", label: "LVD (Light Vehicle Driver)" },
];

const yesNoOptions = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

// Add missing constants that are used in server-side validation
const exServicemanOptions = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

const pwdOptions = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

const hindiKnowledgeOptions = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

const mediumOptions = [
  { value: "HINDI", label: "Hindi" },
  { value: "ENGLISH", label: "English" },
];

// Add address type constants
const addressTypeOptions = [
  { value: "present", label: "Present Address" },
  { value: "permanent", label: "Permanent Address" },
  { value: "correspondence", label: "Correspondence Address" },
];

export {
  motherTongueOptions,
  states,
  titleOptions,
  genderOptions,
  maritalStatusOptions,
  religionOptions,
  education,
  categoryOptions,
  certficateTypeOptions,
  familyRelationOptions,
  bloodGroupOptions,
  nationalityOptions,
  employmentIndustryOptions,
  hindiSubjectLevels,
  licenseTypes,
  yesNoOptions,
  exServicemanOptions,
  pwdOptions,
  hindiKnowledgeOptions,
  mediumOptions,
  addressTypeOptions,
};
