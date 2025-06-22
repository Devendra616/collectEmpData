// import { useAuth } from '../context/AuthContext';
import axiosInstance from "./axiosInstance";

const sectionEndpoints = {
  personalDetails: "personal",
  educationDetails: "education",
  familyDetails: "family",
  addressDetails: "address",
  workExperience: "work",
};
const apiUrl = import.meta.env.VITE_API_URL;
// const apiUrl = "http://localhost:3000"

console.log("API URL:", apiUrl);
// const { token } =useAuth();

export const saveSectionData = async (sectionName, data) => {
  const endpoint = sectionEndpoints[sectionName];

  if (!endpoint) {
    console.warn(`No endpoint defined for ${sectionName}`);
    return;
  }

  try {
    const res = await axiosInstance.post(`/${endpoint}`, data);
    console.log("response api", res);
    return res.data;
  } catch (error) {
    console.log(
      `🚀 ~ saveSectionData ~ error saving ${sectionName}:`,
      error?.response?.data
    );
    return error?.response?.data;
  }
};

export const submitForm = async () => {
  try {
    const res = await axiosInstance.post("/submit-form");
    console.log("Form submission response:", res);
    return res.data;
  } catch (error) {
    console.log("🚀 ~ submitForm ~ error:", error?.response?.data);
    return error?.response?.data;
  }
};

export const getSubmissionStatus = async () => {
  try {
    const res = await axiosInstance.get("/submission-status");
    console.log("Submission status response:", res);
    return res.data;
  } catch (error) {
    console.log("🚀 ~ getSubmissionStatus ~ error:", error?.response?.data);
    return error?.response?.data;
  }
};
