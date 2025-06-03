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

console.log("API URL:", apiUrl);
// const { token } =useAuth();

export const saveSectionData = async (sectionName, data, token) => {
  const endpoint = sectionEndpoints[sectionName];

  if (!endpoint) {
    console.warn(`No endpoint defined for ${sectionName}`);
    return;
  }

  try {
    // const res = await fetch(endpoint,{
    //     method: "POST",
    //     headers:{
    //         "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(data),
    // });

    // if(!res.ok){
    //     console.log(`Failed to save ${sectionName}`);

    // }
    await axios.post(`${apiUrl}/${endpoint}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return true;
  } catch (error) {
    console.log(`🚀 ~ saveSectionData ~ error saving ${sectionName}:`, error);
    return error;
  }
};
