import React, { useState, useEffect, useMemo } from "react";
import { MaterialReactTable } from "material-react-table";
import {
  User,
  Key,
  Eye,
  RefreshCw,
  Users,
  Search,
  LogOut,
  Shield,
  Database,
  Download,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import {
  formatValue,
  shouldHideField,
  formatKey,
} from "../../utils/formatters";
import { formatDate } from "../../utils/dateConversion";
import { getAgeFromDOB } from "../../utils/getAge";
import { useNavigate } from "react-router-dom";
import api from "../../services/axiosInstance";
import { toast } from "react-toastify";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as XLSX from "xlsx";

// Utility function to check for the existence of an object
const isNotEmpty = (obj) =>
  typeof obj === "object" && obj !== null && Object.keys(obj).length > 0;

const passwordRegex =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%!?*&])[a-zA-Z\d@#$%!?*&]{8,}$/;
const schema = yup.object().shape({
  sapId: yup
    .string()
    .required("SAP ID is required")
    .matches(/^[0-9]{8}$/, "Provide a valid SAP ID"),
  password: yup
    .string()
    .required("Password is required")
    .matches(
      passwordRegex,
      "Password must be of minimum length 8 and contain digits, lowercase, uppercase and special characters"
    ),
  confirmPassword: yup
    .string()
    .required("Confirm password is required")
    .oneOf([yup.ref("password"), null], "Passwords must match"),
});

const bulkSchema = yup.object().shape({
  password: yup
    .string()
    .required("Password is required")
    .matches(
      passwordRegex,
      "Password must be of minimum length 8 and contain digits, lowercase, uppercase and special characters"
    ),
  confirmPassword: yup
    .string()
    .required("Confirm password is required")
    .oneOf([yup.ref("password"), null], "Passwords must match"),
});

// Define personalFields array for ordered display
const personalFields = [
  "sapId",
  "empId",
  "name",
  "email",
  "phone",
  "dateOfBirth",
  "gender",
  "bloodGroup",
  "maritalStatus",
  "nationality",
  "religion",
  "emergencyContact",
];

// Define personalFieldLabels for better display
const personalFieldLabels = {
  sapId: "SAP ID",
  empId: "Employee ID",
  name: "Full Name",
  email: "Email Address",
  phone: "Phone Number",
  dateOfBirth: "Date of Birth",
  gender: "Gender",
  bloodGroup: "Blood Group",
  maritalStatus: "Marital Status",
  nationality: "Nationality",
  religion: "Religion",
  emergencyContact: "Emergency Contact",
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [employeeData, setEmployeeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [bulkDownloadProgress, setBulkDownloadProgress] = useState({
    current: 0,
    total: 0,
  });
  const [viewSapId, setviewSapId] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [employeeStats, setEmployeeStats] = useState({
    totalEmployees: 0,
    submittedApplications: 0,
    pendingApplications: 0,
  });

  const navigate = useNavigate();

  const {
    register: registerIndividual,
    handleSubmit: handleSubmitIndividual,
    reset: resetIndividual,
    formState: { errors: errorsIndividual },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const {
    register: registerBulk,
    handleSubmit: handleSubmitBulk,
    reset: resetBulk,
    formState: { errors: errorsBulk },
  } = useForm({
    resolver: yupResolver(bulkSchema),
  });

  const [downloadCancelled, setDownloadCancelled] = useState(false);
  const [bulkExcelLoading, setBulkExcelLoading] = useState(false);
  const [batchProgress, setBatchProgress] = useState({
    current: 0,
    total: 0,
    status: "",
  });

  const calculateAge = (dobString) => {
    if (!dobString) return "";
    const age = getAgeFromDOB(dobString);
    return age?.years.toString();
  };

  const formatDuration = (durationObj) => {
    if (!durationObj) return "";
    const { years = 0, months = 0, days = 0 } = durationObj;
    const parts = [];
    if (years > 0) parts.push(`${years} year${years !== 1 ? "s" : ""}`);
    if (months > 0) parts.push(`${months} month${months !== 1 ? "s" : ""}`);
    if (days > 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
    return parts.join(", ");
  };

  const formatFullName = (firstName = "", lastName = "") => {
    return [firstName, lastName].filter(Boolean).join(" ").trim();
  };

  /*   const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  }; */

  function changeDisplayMain(key) {
    return personalFieldLabels[key] || formatKey(key);
  }

  useEffect(() => {
    if (activeTab === "viewAll") {
      fetchAllEmployees();
    }
    if (activeTab === "overview") {
      fetchEmployeeStats();
    }
    if (activeTab === "applicationStatus") {
      fetchAllEmployees();
    }
  }, [activeTab]);

  useEffect(() => {
    console.log("Employee stats updated:", employeeStats);
  }, [employeeStats]);

  const fetchEmployeeStats = async () => {
    try {
      console.log("Fetching employee statistics...");
      const response = await api.get("admin/get-employee-stats", {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("adminToken")}`,
        },
      });

      console.log("Full API response:", response);
      console.log("Response data:", response.data);
      console.log("Response data.data:", response.data?.data);

      if (response.data && response.data.data) {
        console.log("Setting employee stats:", response.data.data);
        setEmployeeStats(response.data.data);
      } else if (response.data) {
        console.log(
          "Setting employee stats from response.data:",
          response.data
        );
        setEmployeeStats(response.data);
      } else {
        console.log("No valid data found in response");
        console.log("Response structure:", JSON.stringify(response, null, 2));
      }
    } catch (error) {
      console.error("Error fetching employee stats:", error);
      console.log("🚀 ~ fetchEmployeeStats ~ error:", error);
    }
  };

  const fetchAllEmployees = async () => {
    setLoading(true);
    try {
      const response = await api.get("admin/get-all-employees", {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("adminToken")}`,
        },
      });

      console.log("all emp data", response.data.data.employees);

      if (response.data && Array.isArray(response.data.data.employees)) {
        const sortedEmployees = response.data.data.employees.sort((a, b) =>
          a.sapId.localeCompare(b.sapId)
        );
        console.log(sortedEmployees);

        setTimeout(() => {
          setEmployeeData(sortedEmployees);
          setLoading(false);
        }, 1000);
      } else {
        console.log("Unable to pass condition");
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setLoading(false);
    }
  };

  const handleResetPassword = async (resetData) => {
    setLoading(true);
    try {
      const response = await api.post(
        "admin/reset-employee-password",
        {
          sapId: resetData.sapId,
          password: resetData.password,
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("adminToken")}`,
          },
        }
      );
      console.log("🚀 ~ handleResetPassword ~ response:", response.data);

      if (response.data.success) {
        setMessage({
          type: "success",
          text: `Password reset successfully for ${resetData.sapId}`,
        });
        resetIndividual();
      } else {
        setMessage({ type: "error", text: "Failed to reset password" });
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setMessage({ type: "error", text: "Error resetting password" });
    }
    setLoading(false);
  };

  const handleBulkResetPassword = async ({ password }) => {
    setBulkLoading(true);
    try {
      const response = await api.post(
        "admin/reset-all-passwords",
        { password },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("adminToken")}`,
          },
        }
      );

      if (response.data) {
        setMessage({
          type: "success",
          text: response.data?.msg || "All passwords reset successfully",
        });
        resetBulk();
      } else {
        setMessage({ type: "error", text: "Failed to reset all passwords" });
      }
    } catch (error) {
      console.log("🚀 ~ handleBulkResetPassword ~ error:", error);
      setMessage({ type: "error", text: "Error resetting all passwords" });
    }
    setBulkLoading(false);
  };

  const handleViewEmployee = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.get(`admin/view-employee/${viewSapId}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("adminToken")}`,
        },
      });

      console.log("api response", response.data);
      if (response.data) {
        setSelectedEmployee(response.data);
        console.log(selectedEmployee);
        setMessage({
          type: "success",
          text: `Employee data retrieved for ${viewSapId}`,
        });
      } else {
        setMessage({ type: "error", text: "Employee not found" });
        setSelectedEmployee(null);
      }
    } catch (error) {
      console.error("Error fetching employee data:", error);
      setMessage({ type: "error", text: "Error fetching employee data" });
    }
    setLoading(false);
  };

  const handleChangeApplicationStatus = async (sapId, newStatus) => {
    console.log("🚀 ~ handleChangeApplicationStatus ~ newStatus:", newStatus);

    try {
      setLoading(true);
      const response = await api.patch(
        `admin/update-application-status/${sapId}`,
        { isSubmitted: newStatus },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("adminToken")}`,
          },
        }
      );
      if (response.data.success) {
        setEmployeeData((prev) =>
          prev.map((emp) =>
            emp.sapId === sapId ? { ...emp, isSubmitted: newStatus } : emp
          )
        );
      }
      setMessage({
        type: "success",
        text: `Application status updated for ${sapId}`,
      });
    } catch (error) {
      console.error("Error updating application status:", error);
      setMessage({ type: "error", text: "Error updating application status" });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadEmployeePDF = async (employee) => {
    try {
      setPdfLoading(true);
      const response = await api.get(`admin/view-employee/${employee.sapId}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("adminToken")}`,
        },
      });

      if (response.data && response.data.data) {
        generateEmployeePDF(response.data.data, employee.sapId);

        setMessage({
          type: "success",
          text: `PDF download initiated for ${employee.sapId}`,
        });
      } else {
        setMessage({
          type: "error",
          text: "Failed to fetch employee data for PDF",
        });
      }
    } catch (error) {
      console.error("Error downloading employee PDF:", error);
      setMessage({ type: "error", text: "Error downloading employee PDF" });
    } finally {
      setPdfLoading(false);
    }
  };

  const generateEmployeePDF = (formData, sapId) => {
    try {
      setPdfLoading(true);
      console.log(
        "Generating PDF for employee:",
        sapId,
        "with data:",
        formData
      );

      import("pdfmake/build/pdfmake")
        .then((pdfMakeModule) => {
          const pdfMake = pdfMakeModule.default;
          import("pdfmake/build/vfs_fonts")
            .then(() => {
              const docDefinition = {
                content: [
                  {
                    text: `Employee Application Form - ${sapId}`,
                    style: "header",
                    alignment: "center",
                    margin: [0, 0, 0, 30],
                  },
                  ...generatePDFSections(formData),
                ],
                styles: {
                  header: {
                    fontSize: 20,
                    bold: true,
                    color: "#2E86AB",
                  },
                  sectionHeader: {
                    fontSize: 14,
                    bold: true,
                    margin: [0, 15, 0, 8],
                    color: "#2E86AB",
                  },
                  tableCell: {
                    fontSize: 9,
                    margin: [5, 3, 5, 3],
                  },
                  entryHeader: {
                    fontSize: 11,
                    bold: true,
                    color: "#2E86AB",
                    margin: [5, 8, 5, 5],
                  },
                },
                defaultStyle: {
                  fontSize: 10,
                  color: "#333333",
                },
                pageMargins: [40, 40, 40, 40],
              };

              const pdfDoc = pdfMake.createPdf(docDefinition);
              pdfDoc.download(`employee_${sapId}_application.pdf`);
              setPdfLoading(false);
              toast.success(`PDF generated successfully for ${sapId}`);
            })
            .catch(() => {
              setPdfLoading(false);
              toast.error("Failed to load PDF fonts. Please try again.");
            });
        })
        .catch(() => {
          setPdfLoading(false);
          toast.error("Failed to load PDF library. Please try again.");
        });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
      setPdfLoading(false);
    }
  };

  const generatePDFSections = (formData) => {
    const sections = [];
    console.log("Generating PDF sections for formData:", formData);

    const sectionConfigs = [
      { key: "personalDetails", title: "Personal Details" },
      { key: "education", title: "Education Details" },
      { key: "family", title: "Family Details" },
      { key: "address", title: "Address Details" },
      { key: "experiences", title: "Work Experience" },
    ];

    sectionConfigs.forEach(({ key, title }) => {
      let sectionData = formData[key];
      console.log(`Processing section ${key}:`, sectionData);

      if (sectionData && sectionData.data) {
        sectionData = sectionData.data;
        console.log(`Extracted nested data for ${key}:`, sectionData);
      }

      if (
        sectionData &&
        (Array.isArray(sectionData)
          ? sectionData.length > 0
          : Object.keys(sectionData || {}).length > 0)
      ) {
        console.log(`Adding section ${title} with data:`, sectionData);
        sections.push({
          text: title,
          style: "sectionHeader",
        });
        sections.push(generatePDFTableFromData(sectionData, title));
      } else {
        console.log(`Skipping section ${title} - no data available`);
      }
    });

    console.log("Final sections:", sections);
    return sections;
  };
  const generatePDFTableFromData = (data, sectionTitle) => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return {
        text: `No ${sectionTitle.toLowerCase()} available`,
        italics: true,
        color: "#666666",
        margin: [0, 5, 0, 15],
      };
    }

    const tableBody = [];

    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        if (item && typeof item === "object") {
          if (data.length > 1) {
            tableBody.push([
              {
                text: `${sectionTitle} - Entry ${index + 1}`,
                colSpan: 2,
                style: "entryHeader",
                fillColor: "#f5f5f5",
              },
              {},
            ]);
          }

          Object.entries(item)
            .filter(([key]) => !shouldHideField(key))
            .forEach(([key, value]) => {
              tableBody.push([
                { text: formatKey(key), style: "tableCell", bold: true },
                { text: formatValue(value, key), style: "tableCell" },
              ]);
            });

          if (index < data.length - 1) {
            tableBody.push([
              { text: "", colSpan: 2, margin: [0, 8, 0, 0] },
              {},
            ]);
          }
        }
      });
    } else if (typeof data === "object") {
      Object.entries(data)
        .filter(([key]) => !shouldHideField(key))
        .forEach(([key, value]) => {
          tableBody.push([
            { text: formatKey(key), style: "tableCell", bold: true },
            { text: formatValue(value, key), style: "tableCell" },
          ]);
        });
    }

    if (tableBody.length === 0) {
      return {
        text: `No data available for ${sectionTitle.toLowerCase()}`,
        italics: true,
        color: "#666666",
        margin: [0, 5, 0, 15],
      };
    }

    return {
      table: {
        headerRows: 0,
        widths: ["35%", "65%"],
        body: tableBody,
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => "#dddddd",
        vLineColor: () => "#dddddd",
        paddingLeft: () => 8,
        paddingRight: () => 8,
        paddingTop: () => 6,
        paddingBottom: () => 6,
        fillColor: (rowIndex) => {
          return rowIndex % 2 === 0 ? "#fafafa" : "white";
        },
      },
      margin: [0, 0, 0, 20],
    };
  };

  const handleCancelDownload = () => {
    setDownloadCancelled(true);
    setBulkExcelLoading(false);
    setBatchProgress({ current: 0, total: 0, status: "" });
    setMessage({ type: "info", text: "Download cancelled" });
  };

  const handleBulkDownloadExcel = async () => {
    try {
      setBulkExcelLoading(true);
      setDownloadCancelled(false);
      setBatchProgress({
        current: 0,
        total: 0,
        status: "Initializing Excel download...",
      });

      if (employeeData.length === 0) {
        setBatchProgress({
          current: 0,
          total: 0,
          status: "Fetching employee list...",
        });
        await fetchAllEmployees();
      }

      if (employeeData.length === 0) {
        setMessage({
          type: "error",
          text: "No employee data available for download",
        });
        return;
      }

      const BATCH_SIZE = 15;
      const REQUEST_TIMEOUT = 10000;
      const MAX_RETRIES = 2; //0,1,2 (3 times)

      const totalEmployees = employeeData.length;
      const totalBatches = Math.ceil(totalEmployees / BATCH_SIZE);

      setBatchProgress({
        current: 0,
        total: totalBatches,
        status: `Processing ${totalEmployees} employees in ${totalBatches} batches...`,
      });

      const allEmployeeData = [];
      const errors = [];

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        if (downloadCancelled) {
          setMessage({ type: "error", text: "Download cancelled by user" });
          return;
        }

        const startIndex = batchIndex * BATCH_SIZE;
        const endIndex = Math.min(startIndex + BATCH_SIZE, totalEmployees);
        const batchEmployees = employeeData.slice(startIndex, endIndex);

        setBatchProgress({
          current: batchIndex + 1,
          total: totalBatches,
          status: `Processing batch ${batchIndex + 1}/${totalBatches}...`,
        });

        const batchPromises = batchEmployees.map(async (employee) => {
          for (let retry = 0; retry <= MAX_RETRIES; retry++) {
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(
                () => controller.abort(),
                REQUEST_TIMEOUT
              );

              const response = await api.get(
                `admin/view-employee/${employee.sapId}`,
                {
                  headers: {
                    Authorization: `Bearer ${sessionStorage.getItem(
                      "adminToken"
                    )}`,
                  },
                  signal: controller.signal,
                }
              );
              clearTimeout(timeoutId);

              if (response.data && response.data.data) {
                return { success: true, employee, data: response.data.data };
              } else {
                throw new Error("No data received");
              }
            } catch (error) {
              if (retry === MAX_RETRIES) {
                console.error(
                  `Failed to fetch data for ${employee.sapId}:`,
                  error
                );
                errors.push(`${employee.sapId}: ${error.message}`);
                return { success: false, employee, error: error.message };
              }
              await new Promise((resolve) =>
                setTimeout(resolve, Math.pow(2, retry) * 1000)
              );
            }
          }
        });

        const batchResults = await Promise.allSettled(batchPromises);
        batchResults.forEach((result) => {
          if (result.status === "fulfilled" && result.value.success) {
            allEmployeeData.push(result.value);
          }
        });

        setBulkDownloadProgress((prev) => ({
          ...prev,
          current: allEmployeeData.length,
          total: totalEmployees,
        }));

        if (batchIndex < totalBatches - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      if (allEmployeeData.length === 0) {
        setMessage({
          type: "error",
          text: "No employee data fetched for Excel generation.",
        });
        return;
      }

      const personalDetailsData = [];
      const addressData = [];
      const educationData = [];
      const familyData = [];
      const experiencesData = [];

      allEmployeeData.forEach(({ employee, data }) => {
        const { personalDetails, address, education, family, experiences } =
          data;

        if (isNotEmpty(personalDetails)) {
          personalDetailsData.push({
            "SAP ID": employee.sapId,
            Project: employee.location,
            "Submission Status": employee.isSubmitted
              ? "Submitted"
              : "Not Submitted",
            Title: personalDetails[0]?.title || "",
            "First Name": personalDetails[0]?.firstName || "",
            "Last Name": personalDetails[0]?.lastName || "",
            Gender: personalDetails[0]?.gender || "",
            Religion: personalDetails[0]?.religion || "",
            "Marital Status": personalDetails[0]?.maritalStatus || "",
            "Count of Child": personalDetails[0]?.countChild || "",
            "Aadhaar ID": personalDetails[0]?.adhaarId || "",
            Mobile: personalDetails[0]?.mobile || "",
            "Date of Birth":
              formatDate(personalDetails[0]?.dob, "dd-mm-yyyy") || "",
            "Place of Birth": personalDetails[0]?.birthplace || "",
            "State (Personal)": personalDetails[0]?.state || "",
            Category: personalDetails[0]?.category || "",
            "Sub Category": personalDetails[0]?.subCategory || "",
            "ID Mark 1": personalDetails[0]?.idMark1 || "",
            "ID Mark 2": personalDetails[0]?.idMark2 || "",
            "Ex Serviceman": personalDetails[0]?.exServiceman || "",
            "Person With Disability": personalDetails[0]?.pwd || "",
            "Mother Tongue": personalDetails[0]?.motherTongue || "",
            "Hindi Knowledge": personalDetails[0]?.hindiKnowledge || "",
            "Language Hindi Read": personalDetails[0]?.langHindiRead
              ? "Yes"
              : "No",
            "Language Hindi Write": personalDetails[0]?.langHindiWrite
              ? "Yes"
              : "No",
            "Language Hindi Speak": personalDetails[0]?.langHindiSpeak
              ? "Yes"
              : "No",
          });
        }

        if (Array.isArray(address) && address.length > 0) {
          address.forEach((addr) => {
            addressData.push({
              "SAP ID": employee.sapId,
              "Address Type": addr.type || "",
              "Address Line 1": addr.addressLine1 || "",
              "Address Line 2": addr.addressLine2 || "",
              City: addr.city || "",
              District: addr.district || "",
              State: addr.state || "",
              Pincode: addr.pincode || "",
              "Post Office": addr.postOffice || "",
              "Police Station": addr.policeStation || "",
            });
          });
        }

        if (Array.isArray(education) && education.length > 0) {
          education.forEach((edu) => {
            educationData.push({
              "SAP ID": employee.sapId,
              "Education Type": edu.educationType || "",
              "Institution Name": edu.instituteName || "",
              "Certificate Type": edu.certificateType || "",
              Grade: edu.grade || "",
              Medium: edu.medium || "",
              "Start Date": formatDate(edu.startDate, "dd-mm-yyyy") || "",
              "Passing Date": formatDate(edu.passingDate, "dd-mm-yyyy") || "",
              Duration: formatDuration(edu.duration),
              "Course Details": edu.courseDetails || "",
              Specialization: edu.specialization || "",
              "Hindi Subject Level": edu.hindiSubjectLevel || "",
              "License Type": edu.licenseType || "",
              "License Number": edu.licenseNumber || "",
              "License Issue Date":
                formatDate(edu.licenseIssueDate, "dd-mm-yyyy") || "",
              "License Expiry Date":
                formatDate(edu.licenseExpiryDate, "dd-mm-yyyy") || "",
              "License Issue Authority": edu.licenseIssuingAuthority || "",
              "License Other Details": edu.licenseOtherDetails || "",
            });
          });
        }

        if (Array.isArray(family) && family.length > 0) {
          family.forEach((fam) => {
            familyData.push({
              "SAP ID": employee.sapId,
              Relationship: fam.relationship || "",
              Gender: fam.gender || "",
              "Family Member Name": formatFullName(fam.firstName, fam.lastName),
              "Date of Birth": formatDate(fam.dob, "dd-mm-yyyy") || "",
              Age: calculateAge(fam.dob),
              "City of Birth": fam.cityOfBirth || "",
              "Blood Group": fam.bloodGroup || "",
              Nationality: fam.nationality || "",
              "Is Working": fam.isWorking || "",
              "Employment Details": fam.employmentDetails || "",
            });
          });
        }

        if (Array.isArray(experiences) && experiences.length > 0) {
          experiences.forEach((exp) => {
            experiencesData.push({
              "SAP ID": employee.sapId,
              "Company Name": exp.companyName || "",
              Role: exp.role || "",
              "Start Date": formatDate(exp.startDate, "dd-mm-yyyy") || "",
              "End Date": formatDate(exp.relievingDate, "dd-mm-yyyy") || "",
              "Work Duration": formatDuration(exp.duration),
              "Gross Salary": exp.grossSalary || "",
              "Work City": exp.city || "",
              Industry: exp.industry || "",
              Greenfield: exp.isGreenfield ? "Yes" : "No",
              Responsibilities: exp.responsibilities || "",
              "Scale on Leaving": exp.scaleOnLeaving || "",
              "Reasons for Leaving": exp.reasonForLeaving || "",
            });
          });
        }
      });

      const wb = XLSX.utils.book_new();

      if (personalDetailsData.length > 0) {
        const wsPersonal = XLSX.utils.json_to_sheet(personalDetailsData);
        XLSX.utils.book_append_sheet(wb, wsPersonal, "Personal Details");
      }
      if (addressData.length > 0) {
        const wsAddress = XLSX.utils.json_to_sheet(addressData);
        XLSX.utils.book_append_sheet(wb, wsAddress, "Address");
      }
      if (educationData.length > 0) {
        const wsEducation = XLSX.utils.json_to_sheet(educationData);
        XLSX.utils.book_append_sheet(wb, wsEducation, "Education");
      }
      if (familyData.length > 0) {
        const wsFamily = XLSX.utils.json_to_sheet(familyData);
        XLSX.utils.book_append_sheet(wb, wsFamily, "Family");
      }
      if (experiencesData.length > 0) {
        const wsExperiences = XLSX.utils.json_to_sheet(experiencesData);
        XLSX.utils.book_append_sheet(wb, wsExperiences, "Experiences");
      }

      XLSX.writeFile(
        wb,
        `all_employee_data_${new Date().toISOString().split("T")[0]}.xlsx`
      );

      let message = `Excel download completed! Exported data for ${allEmployeeData.length} employees.`;
      if (errors.length > 0) {
        message += ` Note: Failed to fetch detailed data for ${errors.length} employees.`;
      }
      setMessage({
        type: errors.length > 0 ? "warning" : "success",
        text: message,
      });
    } catch (error) {
      console.error("Error in bulk Excel download:", error);
      setMessage({ type: "error", text: "Error downloading Excel file." });
    } finally {
      setBulkExcelLoading(false);
      setBatchProgress({ current: 0, total: 0, status: "" });
      setDownloadCancelled(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "sapId",
        header: "SAP ID",
        size: 100,
      },
      {
        accessorKey: "empId",
        header: "Employee ID",
        size: 120,
      },
      {
        accessorKey: "name",
        header: "Name",
        size: 150,
      },
      {
        accessorKey: "email",
        header: "Email",
        size: 200,
      },
      {
        accessorKey: "isSubmitted",
        header: "Status",
        size: 100,
        Cell: ({ cell, row }) => {
          const value = cell.getValue();
          const employeeId = row.original.sapId;
          return (
            <select
              value={value ? "true" : "false"}
              onChange={(e) =>
                handleChangeApplicationStatus(
                  employeeId,
                  e.target.value === "true"
                )
              }
              className={`px-2 py-1 rounded-full text-xs ${
                value === true || value === "true"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
              disabled={loading}
            >
              <option value="true">Submitted</option>
              <option value="false">Not Submitted</option>
            </select>
          );
        },
      },
      {
        accessorKey: "actions",
        header: "Actions",
        size: 120,
        Cell: ({ row }) => {
          const employee = row.original;
          return (
            <button
              onClick={() => handleDownloadEmployeePDF(employee)}
              disabled={pdfLoading}
              className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 cursor-pointer  disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pdfLoading ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <Download className="h-3 w-3" />
              )}
              <span>{pdfLoading ? "..." : "PDF"}</span>
            </button>
          );
        },
      },
    ],
    []
  );

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminUser");
    navigate("/admin/login");

    toast.success("Admin logout successful!");

    console.log("Admin Logged out...");
  };

  const renderValue = (value) => {
    if (Array.isArray(value)) {
      return (
        <div className="space-y-2">
          {value.map((item, idx) => (
            <div
              key={idx}
              className="p-2 border rounded bg-gray-50 dark:bg-gray-800"
            >
              {typeof item === "object" && item !== null ? (
                <ul className="list-none ml-2 space-y-1">
                  {Object.entries(item).map(
                    ([k, v]) =>
                      !shouldHideField(k) && (
                        <li key={k}>
                          <span className="font-medium capitalize">
                            {changeDisplayMain(k)}:
                          </span>{" "}
                          {formatValue(v, k)}
                        </li>
                      )
                  )}
                </ul>
              ) : (
                formatValue(item)
              )}
            </div>
          ))}
        </div>
      );
    }
    if (typeof value === "object" && value !== null) {
      return (
        <ul className="list-none space-y-1">
          {Object.entries(value).map(
            ([k, v]) =>
              !shouldHideField(k) && (
                <li key={k}>
                  <span className="font-medium capitalize">
                    {k.replace(/([A-Z])/g, " $1")}:
                  </span>{" "}
                  {formatValue(v, k)}
                </li>
              )
          )}
        </ul>
      );
    }
    return formatValue(value);
  };

  const Section = ({
    title,
    data,
    fieldOrder = [],
    keyFormatter = formatKey,
  }) => {
    const isSorted = fieldOrder.length > 0;
    let formattedData;
    const sortedMap = [];

    const actualData = Array.isArray(data) ? data[0] || {} : data;

    if (isSorted) {
      personalFields.forEach((field) => {
        if (
          actualData &&
          actualData["personalDetails"] &&
          actualData["personalDetails"][0] &&
          actualData["personalDetails"][0][field] !== undefined
        ) {
          sortedMap.push([field, actualData["personalDetails"][0][field]]);
        }
      });
      console.log("🚀 ~ formattedData ~ sortedMap:", sortedMap);

      formattedData = sortedMap.map(([key, value]) => {
        if (value === undefined || shouldHideField(key)) return null;
        return (
          <div
            key={key}
            className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 border-b pb-2"
          >
            <div className="sm:w-48 font-medium text-gray-700 capitalize">
              {keyFormatter(key)}
            </div>
            <div className="text-gray-900 flex-1">{renderValue(value)}</div>
          </div>
        );
      });
    } else {
      formattedData = Object.keys(actualData || {}).map((key) => {
        const value = actualData?.[key];
        if (value === undefined || shouldHideField(key)) return null;
        return (
          <div
            key={key}
            className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 border-b pb-2"
          >
            <div className="sm:w-48 font-medium text-gray-700 capitalize">
              {keyFormatter(key)}
            </div>
            <div className="text-gray-900 flex-1">{renderValue(value)}</div>
          </div>
        );
      });
    }

    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h3 className="text-xl font-semibold text-blue-700 border-b pb-2">
          {title}
        </h3>
        <div className="space-y-3">{formattedData}</div>
      </div>
    );
  };

  const ArraySection = ({ title, data, keyFormatter = formatKey }) => {
    if (!Array.isArray(data) || data.length === 0) {
      return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h3 className="text-xl font-semibold text-blue-700 border-b pb-2">
            {title}
          </h3>
          <p className="text-gray-500">No data available</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h3 className="text-xl font-semibold text-blue-700 border-b pb-2">
          {title}
        </h3>
        <div className="space-y-4">
          {data.map((item, index) => {
            const sectionTitle = item.type
              ? `${
                  item.type.charAt(0).toUpperCase() + item.type.slice(1)
                } Address`
              : `${title} #${index + 1}`;

            return (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <h4 className="font-medium text-gray-800 mb-3">
                  {sectionTitle}
                </h4>
                <div className="space-y-2">
                  {Object.entries(item).map(([key, value]) => {
                    if (
                      value === undefined ||
                      shouldHideField(key) ||
                      key === "type"
                    )
                      return null;
                    return (
                      <div
                        key={key}
                        className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4"
                      >
                        <div className="sm:w-48 font-medium text-gray-700 capitalize">
                          {keyFormatter(key)}:
                        </div>
                        <div className="text-gray-900 flex-1">
                          {formatValue(value, key)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="px-6">
          <div className="flex space-x-8">
            {[
              { id: "overview", label: "Overview", icon: Database },
              { id: "resetPassword", label: "Reset Password", icon: Key },
              { id: "viewEmployee", label: "View Employee", icon: Eye },
              {
                id: "applicationStatus",
                label: "Application Status",
                icon: Search,
              },
              {
                id: "bulkDownload",
                label: "Bulk Download",
                icon: FileText,
              },
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-4 border-b-2 transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-6 py-8">
        {/* Message Display */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Dashboard Overview
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Employees
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {employeeStats.totalEmployees}
                    </p>
                  </div>
                  <Users className="h-12 w-12 text-blue-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Submitted Applications
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {employeeStats.submittedApplications}
                    </p>
                  </div>
                  <User className="h-12 w-12 text-green-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Pending Applications
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {employeeStats.pendingApplications}
                    </p>
                  </div>
                  <Database className="h-12 w-12 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab("resetPassword")}
                  className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <Key className="h-5 w-5 text-blue-600" />
                  <span>Reset Password</span>
                </button>
                <button
                  onClick={() => setActiveTab("viewEmployee")}
                  className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <Eye className="h-5 w-5 text-green-600" />
                  <span>View Employee</span>
                </button>
                <button
                  onClick={() => setActiveTab("applicationStatus")}
                  className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <Users className="h-5 w-5 text-purple-600" />
                  <span>Applications</span>
                </button>
                <button
                  onClick={handleBulkDownloadExcel}
                  disabled={bulkExcelLoading}
                  className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bulkExcelLoading ? (
                    <RefreshCw className="h-5 w-5 text-green-600 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                  )}
                  <span>{bulkExcelLoading ? "..." : "Download Excel"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reset Password Tab */}
        {activeTab === "resetPassword" && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Password Management
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Individual Reset */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Key className="h-5 w-5 mr-2 text-blue-600" />
                  Reset Individual Password
                </h3>
                <form
                  onSubmit={handleSubmitIndividual(handleResetPassword)}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee's SAP ID
                    </label>
                    <input
                      type="number"
                      min={10000000}
                      {...registerIndividual("sapId")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter employee ID"
                    />
                    <p className="text-red-500 text-sm">
                      {errorsIndividual.sapId?.message}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      {...registerIndividual("password")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter new password"
                    />
                    <p className="text-red-500 text-sm">
                      {errorsIndividual.password?.message}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      {...registerIndividual("confirmPassword")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirm new password"
                    />
                    <p className="text-red-500 text-sm">
                      {errorsIndividual.confirmPassword?.message}
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Reset Password
                  </button>
                </form>
              </div>

              {/* Bulk Reset */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <RefreshCw className="h-5 w-5 mr-2 text-red-600" />
                  Reset All Passwords
                </h3>
                <form
                  onSubmit={handleSubmitBulk(handleBulkResetPassword)}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password for All Users
                    </label>
                    <input
                      type="password"
                      {...registerBulk("password")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter new password for all users"
                      required
                    />
                    <p className="text-red-500 text-sm">
                      {errorsBulk.password?.message}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      {...registerBulk("confirmPassword")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Confirm new password for all users"
                      required
                    />
                    <p className="text-red-500 text-sm">
                      {errorsBulk.confirmPassword?.message}
                    </p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800">
                      ⚠️ Warning: This action will reset passwords for ALL
                      employees. This cannot be undone.
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={bulkLoading}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                  >
                    {bulkLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Reset All Passwords
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Employee Tab */}
        {activeTab === "viewEmployee" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">
              View Employee Data
            </h2>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <form onSubmit={handleViewEmployee} className="mb-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SAP ID
                    </label>
                    <input
                      type="text"
                      value={viewSapId}
                      onChange={(e) => setviewSapId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter employee ID to search"
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {loading ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Search className="h-4 w-4 mr-2" />
                      )}
                      Search
                    </button>
                  </div>
                </div>
              </form>

              {selectedEmployee && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Employee Details
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ArraySection
                      title="Personal Details"
                      data={selectedEmployee.data.personalDetails}
                    />
                    <ArraySection
                      title="Address Details"
                      data={selectedEmployee.data.address}
                    />
                    <ArraySection
                      title="Education Details"
                      data={selectedEmployee.data.education}
                    />
                    <ArraySection
                      title="Family Details"
                      data={selectedEmployee.data.family}
                    />
                    <ArraySection
                      title="Work Experience"
                      data={selectedEmployee.data.experiences}
                    />
                  </div>

                  {/* PDF Download Section */}
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Download className="h-5 w-5 mr-2 text-green-600" />
                      Download Employee Data
                    </h3>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-800 mb-3">
                        Download the complete employee application form as a PDF
                        document.
                      </p>
                      <button
                        onClick={() =>
                          generateEmployeePDF(selectedEmployee.data, viewSapId)
                        }
                        disabled={pdfLoading}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {pdfLoading ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        <span>
                          {pdfLoading ? "Generating..." : "Download PDF"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Veiw Application Status */}
        {activeTab === "applicationStatus" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Application Status
            </h2>
            <div className="bg-white rounded-lg shadow-sm border">
              <MaterialReactTable
                columns={columns}
                data={employeeData}
                enableSorting
                defaultSortStateOrder={[{ id: "sapId", desc: false }]}
                enableGlobalFilter
                enableColumnFilters
                enablePagination
                initialState={{
                  pagination: { pageSize: 10 },
                  sorting: [{ id: "sapId", desc: false }],
                }}
                muiTableContainerProps={{
                  sx: { maxHeight: "600px" },
                }}
                muiTableProps={{
                  sx: {
                    "& .MuiTableHead-root": {
                      backgroundColor: "#f8fafc",
                    },
                  },
                }}
                state={{
                  isLoading: loading,
                }}
              />
            </div>
          </div>
        )}

        {/* Bulk Download Tab */}
        {activeTab === "bulkDownload" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Bulk Data Download
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Excel Download */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <FileSpreadsheet className="h-5 w-5 mr-2 text-green-600" />
                  Download All Employee Data (Excel)
                </h3>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Download a single Excel file containing separate sheets for
                    each data section, including personal details, addresses,
                    education, family members, and work experiences.
                  </p>
                  <button
                    onClick={handleBulkDownloadExcel}
                    disabled={bulkExcelLoading}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                  >
                    {bulkExcelLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        {batchProgress.status || "Processing..."}
                      </>
                    ) : (
                      <>
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Download Excel File
                      </>
                    )}
                  </button>

                  {/* Progress section for Excel - show when processing */}
                  {bulkExcelLoading && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-yellow-800">
                          Processing...
                        </h4>
                        <button
                          onClick={handleCancelDownload}
                          className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                      {batchProgress.status && (
                        <p className="text-sm text-yellow-700 mb-3">
                          {batchProgress.status}
                        </p>
                      )}
                      {bulkDownloadProgress.total > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-yellow-700">
                            <span>Employee Progress:</span>
                            <span>
                              {bulkDownloadProgress.current}/
                              {bulkDownloadProgress.total}
                            </span>
                          </div>
                          <div className="w-full bg-yellow-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${
                                  (bulkDownloadProgress.current /
                                    bulkDownloadProgress.total) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Individual PDF Downloads */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Download className="h-5 w-5 mr-2 text-green-600" />
                  Individual PDF Downloads
                </h3>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Access the Application Status tab to download individual
                    employee PDFs or use the table below to manage application
                    statuses.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">
                      Features:
                    </h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• View all employee application statuses</li>
                      <li>• Download individual employee PDFs</li>
                      <li>• Update submission statuses</li>
                      <li>• Sort and filter employee data</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => setActiveTab("applicationStatus")}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center cursor-pointer"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Go to Application Status
                  </button>
                </div>
              </div>
            </div>

            {/* Performance notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-medium text-amber-800 mb-2">
                Performance Notice:
              </h4>
              <p className="text-sm text-amber-700">
                For large datasets (300-500+ employees), the process is
                optimized with batch processing and concurrent requests. The
                download may take several minutes depending on your data size
                and network connection.
              </p>
            </div>

            {/* Data Preview */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Data Preview
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-3">
                  The Excel file will contain {employeeData.length} employee
                  records with multiple sheets.
                  {employeeData.length === 0 &&
                    " Click the download button to fetch employee data first."}
                </p>
                {employeeData.length > 0 && (
                  <div className="text-sm text-gray-700">
                    <p>
                      <strong>Total Employees:</strong> {employeeData.length}
                    </p>
                    <p>
                      <strong>Submitted Applications:</strong>{" "}
                      {employeeData.filter((emp) => emp.isSubmitted).length}
                    </p>
                    <p>
                      <strong>Pending Applications:</strong>{" "}
                      {employeeData.filter((emp) => !emp.isSubmitted).length}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
