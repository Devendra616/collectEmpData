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
  { name: "Andaman and Nicobar Islands", code: "AN" },
  { name: "Andhra Pradesh", code: "AP" },
  { name: "Arunachal Pradesh", code: "AR" },
  { name: "Assam", code: "AS" },
  { name: "Bihar", code: "BH" },
  { name: "Chandigarh", code: "CH" },
  { name: "Chattisgarh", code: "CT" },
  { name: "Dadra and Nagar Haveli", code: "DN" },
  { name: "Daman and Diu", code: "DD" },
  { name: "Delhi", code: "DL" },
  { name: "Goa", code: "GA" },
  { name: "Gujarat", code: "GJ" },
  { name: "Haryana", code: "HR" },
  { name: "Himachal Pradesh", code: "HP" },
  { name: "Jammu and Kashmir", code: "JK" },
  { name: "Jharkhand", code: "JH" },
  { name: "Karnataka", code: "KA" },
  { name: "Kerala", code: "KL" },
  { name: "Lakshadweep Islands", code: "LD" },
  { name: "Madhya Pradesh", code: "MP" },
  { name: "Maharashtra", code: "MH" },
  { name: "Manipur", code: "MN" },
  { name: "Meghalaya", code: "ME" },
  { name: "Mizoram", code: "MI" },
  { name: "Nagaland", code: "NL" },
  { name: "Odisha", code: "OR" },
  { name: "Pondicherry", code: "PY" },
  { name: "Punjab", code: "PB" },
  { name: "Rajasthan", code: "RJ" },
  { name: "Sikkim", code: "SK" },
  { name: "Tamil Nadu", code: "TN" },
  { name: "Telangana", code: "TS" },
  { name: "Tripura", code: "TR" },
  { name: "Uttar Pradesh", code: "UP" },
  { name: "Uttarakhand", code: "UT" },
  { name: "West Bengal", code: "WB" },
];

const titleOptions = [
  { value: "DR", label: "Dr." },
  { value: "Shri", label: "Shri." },
  { value: "Smt", label: "Smt." },
  { value: "MS", label: "Ms." },
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

export {
  motherTongueOptions,
  states,
  titleOptions,
  genderOptions,
  maritalStatusOptions,
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
};
