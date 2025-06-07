import axios from "axios";
// import { useAuth } from '../context/AuthContext';

const sectionEndpoints = {
  personalDetails: "personal",
  educationDetails: "education",
  familyDetails: "family",
  addressDetails: "address",
  workExperience: "work",
};
const apiUrl = import.meta.env.VITE_API_URL;
// const apiUrl = "http://localhost:3000"

// const { token } =useAuth();

export const saveSectionData = async (sectionName, data, token) => {
  const endpoint = sectionEndpoints[sectionName];
  console.log("endpoint:", endpoint);
  console.log("Data sent:", data);

  if (!endpoint) {
    console.warn(`No endpoint defined for ${sectionName}`);
    return;
  }

  try {
    const res = await axios.post(`${apiUrl}/${endpoint}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.log(
      `🚀 ~ saveSectionData ~ error saving ${sectionName}:`,
      error?.response?.data
    );
    return error?.response?.data;
  }
};
