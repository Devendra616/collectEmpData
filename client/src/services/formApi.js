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

export const saveSectionData = async (sectionName, data, token) => {
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
