import React from "react";
import { formatDate } from "../../utils/dateConversion.js";

const ReviewForm = ({ data, onBack, onSubmit }) => {
  console.log("Received data", data);
  const sections = [
    {
      title: "Personal Details",
      data: data.personal,
      isArray: true,
      fields: {
        title: "Title",
        firstName: "First Name",
        lastName: "Last Name",
        sapId: "SAP ID",
        email: "Email",
        gender: "Gender",
        dob: "Date of Birth",
        birthPlace: "Birth Place",
        state: "State",
        religion: "Religion",
        category: "Category",
        maritalStatus: "Marital Status",
        countChild: "No of Child/Children",
        subCategory: "Subcategory",
        adhaarId: "Aadhar Number",
        mobile: "Mobile Number",
        exServiceman: "Is Exserviceman",
        pwd: "Physically Disabled",
        motherTongue: "Mother Toungue",
        hindiKnowledge: "Working knowledge in Hindi?",
        langHindiRead: "Read Hindi",
        langHindiSpeak: "Speak Hindi",
        langHindiWrite: "Write Hindi",
        idMark1: "Identification Mark1",
        idMark2: "Identification Mark2",
      },
    },
    {
      title: "Education Details",
      data: data.education,
      isArray: true,
      fields: {
        educationType: "Education Type",
        instituteName: "Institute Name",
        certificateType: "Certificate Type",
        duration: "Duration",
        grade: "Final Grade",
        hindiSubjectLevel: "Hindi Subject Level",
        medium: "Medium",
        startDate: "Course Start Date",
        passingDate: "Passing Date",
        courseDetails: "Course Details",
        specialization: "Specialization",
      },
    },
    {
      title: "Family Details",
      data: data.family,
      isArray: true,
      fields: {
        relationship: "Family Relationship",
        title: "Title",
        firstName: "First Name",
        lastName: "Last Name",
        aadharNumber: "Aadhar Number",
        bloodGroup: "Blood Group",
        dob: "Date of Birth",
        cityOfBirth: "Birth Place",
        age: "Age",
        isWorking: "Spouse Status",
        employmentDetails: "Employment Details",
      },
    },
    {
      title: "Address Details",
      data: data.address,
      isArray: true,
      fields: {
        type: "Address Type",
        addressLine1: "Address Line 1",
        addressLine2: "Address Line 2",
        city: "City",
        district: "District",
        state: "State",
        pincode: "Pincode",
      },
    },
    {
      title: "Work Experience",
      data: data.work,
      isArray: true,
      fields: {
        companyName: "Company Name",
        city: "City",
        startDate: "Start Date",
        relievingDate: "Relieving Date",
        duration: "Duration",
        industry: "Industry",
        role: "Designation/Role",
        scaleOnLeaving: "Scale on Leaving",
        reasonForLeaving: "Reason for Leaving",
        grossSalary: "Gross Salary",
        isGreenfield: "Greenfield Project",
        responsibilities: "Responsibilities",
      },
    },
  ];

  const formatValue = (value, fieldName, sectionTitle) => {
    if (value === null || value === undefined) return "Not Provided";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (fieldName === "grossSalary") return `₹${value.toLocaleString()}`;

    if (
      ["dob", "startDate", "relievingDate", "passingDate"].includes(fieldName)
    ) {
      return formatDate(value, "dd-mm-yyyy");
    }
    if (fieldName === "duration") {
      console.log(value, value.years, sectionTitle);
      if (sectionTitle === "Work Experience") {
        return `${value.years} years ${value.months} months ${value.days} days`;
      } else {
        return `${value} years`;
      }
    }
    return value.toString();
  };

  const renderSection = (section) => {
    console.log("section", section.data.data);
    if (
      !section.data.data ||
      !Array.isArray(section.data.data) ||
      section.data.data.length === 0
    ) {
      return (
        <div className="text-gray-500 italic p-4 bg-white rounded-lg">
          No {section.title.toLowerCase()} provided
        </div>
      );
    }

    return section.data.data.map((item, index) => (
      <div
        key={index}
        className="mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100"
      >
        <h4 className="text-sm font-medium text-blue-600 mb-3">
          {section.title === "Personal Details"
            ? "Details"
            : `Entry ${index + 1}`}
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(section.fields).map(
            ([key, label]) =>
              item[key] !== undefined && (
                <div key={key} className="space-y-1">
                  <div className="text-xs font-medium text-gray-500">
                    {label}
                  </div>
                  <div className="text-sm text-gray-800">
                    {formatValue(item[key], key, section.title)}
                  </div>
                </div>
              )
          )}
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Review Your Details
        </h2>
        <p className="mt-2 text-amber-600 text-lg">
          Please review all your information before final submission. You can't
          edit after submission.
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div
            key={section.title}
            className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                {sections.indexOf(section) + 1}
              </span>
              {section.title}
            </h3>
            <div className="mt-4">{renderSection(section)}</div>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 cursor-pointer"
        >
          Back
        </button>

        <button
          onClick={onSubmit}
          className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 cursor-pointer"
        >
          Final Submit
        </button>
      </div>
    </div>
  );
};

export default ReviewForm;
