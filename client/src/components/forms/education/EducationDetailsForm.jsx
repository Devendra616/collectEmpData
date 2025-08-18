import React, { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import EducationEntry from "./EducationEntry";
import { saveSectionData } from "../../../services/formApi";
import { useAuth } from "../../../context/AuthContext";
import { useFormData } from "../../../context/FormContext";
import axiosInstance from "../../../services/axiosInstance.js";
import { formatDate } from "../../../utils/dateConversion.js";
import { toast } from "react-toastify";

const schema = yup.object().shape({
  education: yup.array().of(
    yup.object().shape({
      educationType: yup.string().required("Education type is required"),
      instituteName: yup.string().when("educationType", {
        is: (val) => val !== "LICENSE",
        then: (schema) => schema.required("Institute name is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
      certificateType: yup.string().when("educationType", {
        is: (val) => val !== "LICENSE",
        then: (schema) => schema.required("Certificate type is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
      duration: yup
        .number()
        .transform((value) =>
          isNaN(value) || value === "" ? 0 : Number(value)
        )
        .when("educationType", {
          is: (val) => val !== "LICENSE",
          then: (schema) =>
            schema
              .min(0, "Duration must be a positive number")
              .typeError(
                "Duration must be a number (e.g., 2.5 for 2 years and 6 months)"
              ),
          otherwise: (schema) => schema.notRequired(),
        }),
      grade: yup.string().when("educationType", {
        is: (val) => val !== "LICENSE",
        then: (schema) => schema.required("Final grade is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
      medium: yup.string(),
      hindiSubjectLevel: yup.string(),
      startDate: yup
        .date()
        .transform((value, originalValue) =>
          originalValue ? new Date(originalValue) : null
        )
        .when("educationType", {
          is: (val) => val !== "LICENSE",
          then: (schema) => schema.required("Start date is required"),
          otherwise: (schema) => schema.notRequired(),
        }),
      passingDate: yup
        .date()
        .transform((value, originalValue) =>
          originalValue ? new Date(originalValue) : null
        )
        .when("educationType", {
          is: (val) => val !== "LICENSE",
          then: (schema) =>
            schema
              .required("Passing date is required")
              .min(
                yup.ref("startDate"),
                "Passing date must be after start date"
              ),
          otherwise: (schema) => schema.notRequired(),
        }),
      courseDetails: yup.string().when("educationType", {
        is: (val) => ["GRAD", "POSTGRAD", "CERTIFICATE"].includes(val),
        then: (schema) => schema.required("Course details are required"),
        otherwise: (schema) => schema.notRequired(),
      }),
      specialization: yup.string().when("educationType", {
        is: (val) => ["GRAD", "POSTGRAD", "CERTIFICATE"].includes(val),
        then: (schema) => schema.required("Specialization is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
      // License fields
      licenseType: yup.string().when("educationType", {
        is: "LICENSE",
        then: (schema) => schema.required("License type is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
      licenseNumber: yup.string().when("educationType", {
        is: "LICENSE",
        then: (schema) => schema.required("License number is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
      licenseIssueDate: yup.date().when("educationType", {
        is: "LICENSE",
        then: (schema) => schema.required("License issue date is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
      licenseIssuingAuthority: yup.string().when("educationType", {
        is: "LICENSE",
        then: (schema) =>
          schema.required("License issuing authority is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
    })
  ),
});

const EducationDetailsForm = ({
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
    const educationData = formState?.education?.data || [];

    // Debug logging for grade fields
    if (educationData && Array.isArray(educationData)) {
      educationData.forEach((entry, index) => {
        if (entry.grade !== undefined) {
          console.log(
            `Initial education entry ${index} grade:`,
            entry.grade,
            "Type:",
            typeof entry.grade
          );
        }
      });
    }

    // Format dates in each education entry
    const formattedEducationData = educationData.map((entry) => ({
      ...entry,
      startDate: formatDate(entry.startDate),
      passingDate: formatDate(entry.passingDate),
    }));
    return {
      education:
        Array.isArray(formattedEducationData) &&
        formattedEducationData.length > 0
          ? formattedEducationData
          : Array.isArray(defaultValues)
          ? defaultValues
          : [],
    };
  }, [formState?.education?.data, defaultValues]);

  // Load data if not already in FormContext
  useEffect(() => {
    const loadData = async () => {
      if (
        !formState?.education?.data ||
        formState.education.data.length === 0
      ) {
        setLoading(true);
        try {
          const result = await axiosInstance.get("/education");

          if (result?.data?.success) {
            dispatch({
              type: "UPDATE_SECTION",
              section: "education",
              data: result.data.data?.education || [],
            });
          }
        } catch (error) {
          console.error("Error loading education details:", error);
          toast.error("Failed to load education details");
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
    name: "education",
  });

  // Watch all form values for changes
  const formValues = watch();

  // Check for changes whenever form values change
  useEffect(() => {
    const checkForChanges = () => {
      const currentValues = getValues();
      const hasAnyChanges = currentValues.education.some((entry, index) => {
        const initialEntry = initialValues.education[index];
        if (!initialEntry) return true; // New entry

        // Compare each field
        return Object.keys(entry).some((key) => {
          const currentValue = entry[key];
          const initialValue = initialEntry[key];

          // Handle date comparisons
          if (key === "startDate" || key === "passingDate") {
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
    console.log("saveData called with data:", data);
    console.log("hasChanges:", hasChanges);

    // Debug logging for grade fields
    if (data.education && Array.isArray(data.education)) {
      data.education.forEach((entry, index) => {
        if (entry.grade !== undefined) {
          console.log(
            `Education entry ${index} grade:`,
            entry.grade,
            "Type:",
            typeof entry.grade
          );
        }
      });
    }

    // If no changes, just proceed to next step without saving
    if (!hasChanges) {
      console.log("No changes detected, skipping save");
      if (proceed) onNext(data.education);
      return;
    }

    setSaving(true);
    setBackendErrors({});
    try {
      // Remove internal fields before saving
      const dataToSave = data.education.map((entry) => {
        const { _id, __v, ...cleanEntry } = entry;

        // Ensure grade is always a string
        if (cleanEntry.grade !== undefined) {
          cleanEntry.grade = String(cleanEntry.grade);
          console.log(
            `Ensuring grade is string for entry:`,
            cleanEntry.grade,
            "Type:",
            typeof cleanEntry.grade
          );
        }

        return cleanEntry;
      });

      console.log("Saving education entries:", dataToSave);

      const res = await saveSectionData(
        "educationDetails",
        { education: dataToSave },
        token
      );
      if (!res?.success && res.errors) {
        // Transform the nested error structure
        const transformedErrors = {};
        if (res.errors) {
          const errors = res.errors;
          // Handle the education[index] format
          Object.entries(errors).forEach(([key, value]) => {
            const match = key.match(/education\[(\d+)\]/);
            if (match) {
              const index = parseInt(match[1]);
              transformedErrors[index] = value;
            }
          });
        }
        setBackendErrors(transformedErrors);
        toast.error(res?.msg || "Fix the errors first");
        return;
      } else if (res?.success) {
        toast.success(res?.msg || "Education details updated successfully");
      } else {
        toast.error(res?.msg || "Something went wrong, not updated");
      }

      dispatch({
        type: "UPDATE_SECTION",
        section: "educationDetails",
        data: dataToSave,
      });

      setHasChanges(false);
      if (proceed) onNext(dataToSave);
    } catch (error) {
      console.error("Error saving data:", error);
      const errorMessages = error?.response?.data?.errors || {};
      // Transform error structure for caught errors
      const transformedErrors = {};
      if (errorMessages) {
        // Handle the education[index] format
        Object.entries(errorMessages).forEach(([key, value]) => {
          const match = key.match(/education\[(\d+)\]/);
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
    console.log("Save Draft clicked, data:", data);
    saveData(data, false);
  });

  const handleNext = handleSubmit((data) => {
    console.log("Next clicked, data:", data);
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
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Education Details
      </h2>

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
                Education Entry {parseInt(index) + 1}:
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

      {errors.education && (
        <div className="text-red-600 text-sm mb-4">
          Please fix the validation errors below.
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleNext();
        }}
      >
        <div className="mb-6">
          {!readOnly && (
            <button
              type="button"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center"
              onClick={() =>
                append({
                  educationType: "",
                  instituteName: "",
                  certificateType: "",
                  duration: "",
                  grade: "",
                  medium: "",
                  hindiSubjectLevel: "",
                  startDate: "",
                  passingDate: "",
                  courseDetails: "",
                  specialization: "",
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
              Add Education
            </button>
          )}
        </div>

        {fields.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-600">
              No education details added yet.{" "}
              {!readOnly &&
                "Click the button above to add your education details."}
            </p>
          </div>
        )}

        <div className="space-y-6">
          {fields.map((item, index) => {
            const fieldErrors = errors.education?.[index];
            const backendFieldErrors = backendErrors[index];

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
                  Education Entry {index + 1}
                </h3>
                <EducationEntry
                  index={index}
                  register={register}
                  watch={watch}
                  errors={fieldErrors}
                  backendErrors={backendFieldErrors}
                  readOnly={readOnly}
                />
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
                disabled={!hasChanges || saving || readOnly}
                className={`px-4 py-2 rounded ${
                  hasChanges && !readOnly
                    ? "bg-green-400 text-gray-800 hover:bg-gray-400 cursor-pointer"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                💾 Save Draft
              </button>

              <button
                type="submit"
                disabled={readOnly}
                className={`px-6 py-2 rounded ${
                  readOnly
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                }`}
              >
                Next ➡️
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

export default EducationDetailsForm;
