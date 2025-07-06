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
} from "lucide-react";
import {
  formatValue,
  shouldHideField,
  formatKey,
} from "../../utils/formatters";
import { useNavigate } from "react-router-dom";
import api from "../../services/axiosInstance";
import { toast } from "react-toastify";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";

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

  function changeDisplayMain(key) {
    return personalFieldLabels[key] || formatKey(key);
  }

  useEffect(() => {
    if (activeTab === "viewAll") {
      fetchAllEmployees();
    }
    if (activeTab === "applicationStatus") {
      fetchAllEmployees();
    }
    if (activeTab === "overview") {
      fetchEmployeeStats();
    }
  }, [activeTab]);

  const fetchEmployeeStats = async () => {
    try {
      const response = await api.get("admin/get-employee-stats", {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("adminToken")}`,
        },
      });
      if (response.data) {
        setEmployeeStats(response.data.data);
        console.log("Employee statistics", employeeStats);
      }
    } catch (error) {
      console.log("🚀 ~ fetchEmployeeStats ~ error:", error);
    }
  };

  const fetchAllEmployees = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      const response = await api.get("admin/get-all-employees", {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("adminToken")}`,
        },
      });

      console.log("all emp data", response.data.data.employees);
      // console.log("type of employees", typeof response.data.data.employees);

      if (response.data && Array.isArray(response.data.data.employees)) {
        // Sort employees by sapId
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
    // e.preventDefault();
    setLoading(true);
    try {
      // Replace with actual API call
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
        // setResetPassword({ sapId: "", password: "" });
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
    // e.preventDefault();
    setBulkLoading(true);
    try {
      // Replace with actual API call
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
        // setBulkResetPassword("");
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
      // Replace with actual API call
      // const employee = mockEmployees.find(emp => emp.sapId === viewSapId);
      // if (employee) {
      //   setSelectedEmployee(employee);
      //   setMessage({ type: 'success', text: `Employee data retrieved for ${viewSapId}` });
      // } else {
      //   setMessage({ type: 'error', text: 'Employee not found' });
      //   setSelectedEmployee(null);
      // }
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
        accessorKey: "department",
        header: "Department",
        size: 120,
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
    ],
    []
  );

  const handleLogout = () => {
    // Add logout logic here
    sessionStorage.removeItem("adminToken"); // Example token removal
    sessionStorage.removeItem("adminUser"); // Example user data removal
    // Redirect to login page or home page
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
                          {formatValue(v)}
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
                  {formatValue(v)}
                </li>
              )
          )}
        </ul>
      );
    }
    return formatValue(value);
  };

  // Section component for rendering object data in ordered keys
  const Section = ({
    title,
    data,
    fieldOrder = [],
    keyFormatter = formatKey,
  }) => {
    const isSorted = fieldOrder.length > 0;
    let formattedData;
    const sortedMap = [];

    // Handle array data by extracting the first element for single records
    // For arrays (like education/work experience), we'll handle them differently
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
        // console.log("key:", key);
        const value = actualData?.[key];
        // console.log("value:", value);
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

  // ArraySection component for rendering array data (like education, work experience)
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
            // For address data, use the type field for the section title
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
                          {formatValue(value)}
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
              // { id: "viewAll", label: "All Employees", icon: Users },
              {
                id: "applicationStatus",
                label: "Application Status",
                icon: Search,
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
                      {
                        employeeStats.submittedApplications
                        // mockEmployees.filter((emp) => emp.status === "Active")
                        //   .length
                      }
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
                      {
                        employeeStats.pendingApplications
                        // new Set(mockEmployees.map((emp) => emp.department)).size
                      }
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      // value={resetPassword.sapId}
                      min={10000000}
                      // onChange={(e) =>
                      //   setResetPassword({ ...resetPassword, sapId: e.target.value })
                      // }
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
                      // value={resetPassword.password}
                      // onChange={(e) =>
                      //   setResetPassword({ ...resetPassword, password: e.target.value })
                      // }
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
                      // value={bulkResetPassword}
                      // onChange={(e) => setBulkResetPassword(e.target.value)}
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
                    {/* <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-600">SAP ID:</span>
                        <p className="text-gray-900">{selectedEmployee.sapId}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Employee ID:</span>
                        <p className="text-gray-900">{selectedEmployee.empId}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Name:</span>
                        <p className="text-gray-900">{selectedEmployee.name}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Department:</span>
                        <p className="text-gray-900">{selectedEmployee.department}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Email:</span>
                        <p className="text-gray-900">{selectedEmployee.email}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Status:</span>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          selectedEmployee.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedEmployee.status}
                        </span>
                      </div>
                    </div> */}

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
                </div>
              )}
            </div>
          </div>
        )}

        {/* View All Employees Tab */}
        {/* {activeTab === "viewAll" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">All Employees</h2>

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
        )} */}

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
      </main>
    </div>
  );
};

export default AdminDashboard;
