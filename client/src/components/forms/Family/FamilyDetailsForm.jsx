import React, { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { saveSectionData } from "../../../services/formApi";
import { useAuth } from "../../../context/AuthContext";
import { useFormData } from "../../../context/FormContext";
import axiosInstance from "../../../services/axiosInstance.js";
import { toast } from "react-toastify";
import { formatDate } from "../../../utils/dateConversion.js";
import {
  familyRelationOptions,
  titleOptions,
  genderOptions,
  bloodGroupOptions,
  nationalityOptions,
} from "../../../constants";

const schema = yup.object().shape({
  family: yup.array().of(
    yup.object().shape({
      relationship: yup.string().required("Family relation is required"),
      title: yup.string().required("Select title"),
      firstName: yup
        .string()
        .required("First name is required")
        .matches(/^\S+$/, "First name cannot contain spaces"),
      lastName: yup.string(),
      aadharNumber: yup
        .string()
        .test(
          "conditional-aadhar",
          "Aadhaar number is required",
          function (value) {
            const { relationship } = this.parent;

            // If relationship is Child, Aadhar is optional
            if (relationship === "Child") {
              return true; // Always pass validation for Child
            }

            // For all other relationships, Aadhar is required
            if (!value) {
              return false;
            }

            // Validate format if value is provided
            return /^[2-9]{1}[0-9]{11}$/.test(value);
          }
        )
        .test(
          "aadhar-format",
          "Aadhaar must be a 12-digit number starting with 2-9",
          function (value) {
            const { relationship } = this.parent;

            // If no value provided and relationship is Child, skip format validation
            if (!value && relationship === "Child") {
              return true;
            }

            // If value is provided, validate format
            if (value) {
              return /^[2-9]{1}[0-9]{11}$/.test(value);
            }

            return true;
          }
        ),
      bloodGroup: yup.string(),
      dob: yup
        .date()
        .transform((value, originalValue) =>
          originalValue ? new Date(originalValue) : null
        )
        .required("Date of Birth is required")
        .max(new Date(), "Date of Birth cannot be future date"),
      cityOfBirth: yup.string(),
      isWorking: yup.boolean(),
      employmentDetails: yup.string(),
      gender: yup
        .string()
        .test(
          "conditional-gender",
          "Gender is required for child",
          function (value) {
            const { relationship } = this.parent;
            if (relationship === "Child") {
              return value && value.trim() !== "";
            }
            return true;
          }
        ),
      nationality: yup.string().required("Nationality is required"),
    })
  ),
});

const FamilyDetailsForm = ({
  onNext,
  defaultValues = [],
  readOnly = false,
}) => {
  const { token } = useAuth();
  const { state: formState, dispatch } = useFormData();

  const [backendErrors, setBackendErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  // Memoize initial values to prevent unnecessary re-renders
  const initialValues = useMemo(() => {
    console.log("Form State:", formState);
    const familyData = formState?.family?.data || [];

    // Format dates in each family member entry
    const formattedFamilyData = familyData.map((entry) => ({
      ...entry,
      dob: formatDate(entry.dob),
    }));

    return {
      family:
        Array.isArray(formattedFamilyData) && formattedFamilyData.length > 0
          ? formattedFamilyData
          : Array.isArray(defaultValues)
          ? defaultValues
          : [],
    };
  }, [formState?.family?.data, defaultValues]);

  // Load data if not already in FormContext
  useEffect(() => {
    const loadData = async () => {
      if (!formState?.family?.data || formState.family.data.length === 0) {
        setLoading(true);
        try {
          const result = await axiosInstance.get("/family");

          if (result?.data?.success) {
            dispatch({
              type: "UPDATE_SECTION",
              section: "family",
              data: result.data.data?.family || [],
            });
          }
        } catch (error) {
          console.error("Error loading family details:", error);
          toast.error("Failed to load family details");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadData();
  }, [token, dispatch]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "family",
  });

  // Watch all form values for changes
  const formValues = watch();

  // Check for changes whenever form values change
  useEffect(() => {
    const checkForChanges = () => {
      const currentValues = getValues();
      const hasAnyChanges = currentValues.family.some((entry, index) => {
        const initialEntry = initialValues.family[index];
        if (!initialEntry) return true;

        return Object.keys(entry).some((key) => {
          const currentValue = entry[key];
          const initialValue = initialEntry[key];

          // Handle date comparisons
          if (key === "dob") {
            return currentValue !== initialValue;
          }
          // Handle other types
          return JSON.stringify(currentValue) !== JSON.stringify(initialValue);
        });
      });

      setHasChanges(hasAnyChanges);
    };
    checkForChanges();
  }, [formValues, initialValues, getValues]);

  const saveData = async (data, proceed = false) => {
    if (!hasChanges) {
      console.log("No changes detected, skipping save");
      if (proceed) onNext(data.family);
      return;
    }

    setSaving(true);
    setBackendErrors({});
    try {
      // Remove internal fields before saving
      const dataToSave = data.family.map((entry) => {
        const { _id, __v, ...cleanEntry } = entry;
        return cleanEntry;
      });

      const res = await saveSectionData(
        "familyDetails",
        { family: dataToSave },
        token
      );

      if (res?.errors) {
        const transformedErrors = {};
        Object.entries(res.errors).forEach(([key, value]) => {
          const match = key.match(/family\[(\d+)\]/);
          if (match) {
            const index = parseInt(match[1]);
            transformedErrors[index] = value;
          }
        });
        setBackendErrors(transformedErrors);
        return;
      } else if (res?.success) {
        toast.success(res.data?.msg || "Family details saved successfully");
        dispatch({
          type: "UPDATE_SECTION",
          section: "family",
          data: dataToSave,
        });
      }

      setHasChanges(false);
      if (proceed) onNext(dataToSave);
    } catch (error) {
      console.error("Error saving data:", error);
      const transformedErrors = {};
      if (error?.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.entries(errors).forEach(([key, value]) => {
          const match = key.match(/family\[(\d+)\]/);
          if (match) {
            const index = parseInt(match[1]);
            transformedErrors[index] = value;
          }
        });
      }
      setBackendErrors(transformedErrors);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = handleSubmit((data) => {
    saveData(data, false);
  });

  const handleNext = handleSubmit((data) => {
    saveData(data, true);
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Family Details</h2>

      {saving && (
        <p className="text-blue-600 text-sm mb-4 animate-pulse">Saving...</p>
      )}

      {Object.keys(backendErrors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <h3 className="text-red-800 font-medium mb-2">
            Please fix the following errors:
          </h3>
          {Object.entries(backendErrors).map(([index, errors]) => (
            <div key={index} className="mb-2">
              <p className="text-red-700 font-medium">
                Family Member {parseInt(index) + 1}:
              </p>
              <ul className="list-disc list-inside ml-4">
                {Object.entries(errors).map(([field, message]) => (
                  <li key={field} className="text-red-600">
                    {message}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      {errors.family && console.log(errors.family)}
      {errors.family && (
        <div className="text-red-600 text-sm mb-4">
          Please fix the validation errors below.
        </div>
      )}

      <form onSubmit={handleNext}>
        <div className="mb-6">
          {!readOnly && (
            <button
              type="button"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center"
              onClick={() =>
                append({
                  relationship: "",
                  title: "",
                  firstName: "",
                  lastName: "",
                  aadharNumber: "",
                  bloodGroup: "",
                  dob: "",
                  cityOfBirth: "",
                  isWorking: false,
                  employmentDetails: "",
                  gender: "",
                })
              }
              disabled={readOnly}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Family Member
            </button>
          )}
        </div>

        {fields.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-600">
              No family members added yet.{" "}
              {!readOnly && "Click the button above to add family details."}
            </p>
          </div>
        )}

        <div className="space-y-6">
          {fields.map((item, index) => {
            const fieldErrors = errors.family?.[index];
            const backendFieldErrors = backendErrors[index];

            const relationship = watch(`family.${index}.relationship`);
            // Filter titles based on relationship (matching backend validation)
            const getTitlesForRelationship = (rel) => {
              switch (rel) {
                case "Child":
                  return titleOptions.filter((opt) =>
                    ["Mt", "MS", "Miss"].includes(opt.value)
                  );
                case "Father":
                case "Father_In_Law":
                  return titleOptions.filter((opt) =>
                    ["Shri"].includes(opt.value)
                  );
                case "Mother":
                case "Mother_In_Law":
                  return titleOptions.filter((opt) =>
                    ["Smt"].includes(opt.value)
                  );
                case "Spouse":
                  return titleOptions.filter((opt) =>
                    ["Shri", "Smt"].includes(opt.value)
                  );
                default:
                  return titleOptions;
              }
            };

            const titles = getTitlesForRelationship(relationship);

            const getErrorClass = (fieldName) => {
              const hasError =
                fieldErrors?.[fieldName] || backendFieldErrors?.[fieldName];
              return `w-full p-2 border ${
                hasError ? "border-red-500" : "border-gray-300"
              } rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                readOnly ? "bg-gray-100" : ""
              }`;
            };

            const renderError = (fieldName) => {
              const error =
                fieldErrors?.[fieldName] || backendFieldErrors?.[fieldName];
              if (!error) return null;
              return (
                <p className="mt-1 text-sm text-red-600">
                  {typeof error === "string" ? error : error.message}
                </p>
              );
            };

            return (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg shadow-sm bg-white p-6 relative"
              >
                {!readOnly && (
                  <div className="absolute top-4 right-4">
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-800 transition-colors duration-200"
                      onClick={() => remove(index)}
                      disabled={readOnly}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                )}

                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Family Member {index + 1}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Family Relationship
                    </label>
                    <select
                      {...register(`family.${index}.relationship`)}
                      className={getErrorClass("relatioship")}
                      disabled={readOnly}
                    >
                      <option value="">Select Type</option>
                      {familyRelationOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {renderError("relationship")}
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <select
                      {...register(`family.${index}.title`)}
                      className={getErrorClass("title")}
                      disabled={readOnly}
                    >
                      <option value="">Select Title</option>
                      {titles.map((title) => (
                        <option key={title.value} value={title.value}>
                          {title.label}
                        </option>
                      ))}
                    </select>
                    {renderError("title")}
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      placeholder="Enter first name"
                      {...register(`family.${index}.firstName`)}
                      className={getErrorClass("firstName")}
                      disabled={readOnly}
                    />
                    {renderError("firstName")}
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      placeholder="Enter last name"
                      {...register(`family.${index}.lastName`)}
                      className={getErrorClass("lastName")}
                      disabled={readOnly}
                    />
                    {renderError("lastName")}
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aadhar Number{" "}
                      {relationship !== "Child" && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <input
                      placeholder="Enter Aadhar number"
                      {...register(`family.${index}.aadharNumber`)}
                      className={getErrorClass("aadharNumber")}
                      disabled={readOnly}
                    />

                    {renderError("aadharNumber")}
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Blood Group <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register(`family.${index}.bloodGroup`)}
                      className={getErrorClass("bloodGroup")}
                      disabled={readOnly}
                    >
                      <option value="">Select Blood Group</option>
                      {bloodGroupOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {renderError("bloodGroup")}
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      {...register(`family.${index}.dob`)}
                      className={getErrorClass("dob")}
                      disabled={readOnly}
                    />
                    {renderError("dob")}
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City of Birth
                    </label>
                    <input
                      placeholder="Enter city of birth"
                      {...register(`family.${index}.cityOfBirth`)}
                      className={getErrorClass("cityOfBirth")}
                      disabled={readOnly}
                    />
                    {renderError("cityOfBirth")}
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nationality <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register(`family.${index}.nationality`)}
                      className={getErrorClass("nationality")}
                      disabled={readOnly}
                    >
                      <option value="">Select Nationality</option>
                      {nationalityOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {renderError("nationality")}
                  </div>

                  {/* Conditional Fields */}
                  {relationship === "Spouse" && (
                    <>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Spouse Status
                        </label>
                        <select
                          {...register(`family.${index}.isWorking`)}
                          className={getErrorClass("isWorking")}
                          disabled={readOnly}
                        >
                          <option value="">Select Status</option>
                          <option value="true">Working</option>
                          <option value="false">Not-Working</option>
                        </select>
                        {renderError("isWorking")}
                      </div>

                      {watch(`family.${index}.isWorking`) === "true" && (
                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Employment Details
                          </label>
                          <input
                            placeholder="Enter employment details"
                            {...register(`family.${index}.employmentDetails`)}
                            className={getErrorClass("employmentDetails")}
                            disabled={readOnly}
                          />
                          {renderError("employmentDetails")}
                        </div>
                      )}
                    </>
                  )}

                  {relationship === "Child" && (
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register(`family.${index}.gender`)}
                        className={getErrorClass("gender")}
                        disabled={readOnly}
                      >
                        <option value="">Select Gender</option>
                        {genderOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {renderError("gender")}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-between">
          {!readOnly && (
            <>
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={!hasChanges || saving}
                className={`px-4 py-2 rounded ${
                  hasChanges || !saving
                    ? "bg-green-400 text-gray-800 hover:bg-gray-400 cursor-pointer"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                💾 Save Draft
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
              >
                {saving ? "Saving..." : "Next ➡️"}
              </button>
            </>
          )}
          {readOnly && (
            <div className="w-full text-center">
              <p className="text-gray-600 italic">Form is in read-only mode</p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default FamilyDetailsForm;
