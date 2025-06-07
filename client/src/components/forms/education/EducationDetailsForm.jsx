import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import EducationEntry from "./EducationEntry";
import { saveSectionData } from "../../../services/formApi";
import { useAuth } from "../../../context/AuthContext";
import { useFormData } from "../../../context/FormContext";
import { toast } from "react-toastify";
import axios from "axios";
import { formatDate } from "../../../utils/dateConversion.js";

const schema = yup.object().shape({
  education: yup.array().of(
    yup.object().shape({
      educationType: yup.string().required("Education type is required"),
      instituteName: yup.string().required("Institute name is required"),
      certificateType: yup.string().required("Certificate type is required"),
      duration: yup
        .number()
        .transform((value) =>
          isNaN(value) || value === "" ? 0 : Number(value)
        )
        .required("Duration is required")
        .min(0, "Duration must be a positive number")
        .typeError(
          "Duration must be a number (e.g., 2.5 for 2 years and 6 months)"
        ),
      grade: yup.string(),
      medium: yup.string(),
      hindiSubjectLevel: yup.string(),
      startDate: yup
        .date()
        .transform((value, originalValue) =>
          originalValue ? new Date(originalValue) : null
        )
        .required("Start date is required"),
      passingDate: yup
        .date()
        .transform((value, originalValue) =>
          originalValue ? new Date(originalValue) : null
        )
        .required("Passing date is required")
        .min(yup.ref("startDate"), "Passing date must be after start date"),
      courseDetails: yup.string(),
      specialization: yup.string(),
    })
  ),
});

const EducationDetailsForm = ({ onNext, defaultValues = [] }) => {
  const { token } = useAuth();
  const { state: formState, dispatch } = useFormData();

  const [backendErrors, setBackendErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [fieldChanges, setFieldChanges] = useState({});

  // Memoize initial values to prevent unnecessary re-renders
  const initialValues = useMemo(() => {
    console.log("Form State:", formState);
    const educationData = formState?.education?.data || [];

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
          const result = await axios.get(
            `${import.meta.env.VITE_API_URL}/education`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

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
  }, [token, dispatch, formState?.education?.data]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    getValues,
    formState: { errors, dirtyFields },
  } = useForm({
    //resolver: yupResolver(schema),
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

  // Create onBlur handlers for different field types
  const createTextBlurHandler = useCallback(
    (fieldPath) => (e) => {
      const currentValue = e.target.value;
      const initialValue = getFieldValue(initialValues, fieldPath);
      const hasChanged = currentValue !== initialValue;

      setFieldChanges((prev) => {
        const updated = { ...prev, [fieldPath]: hasChanged };
        return updated;
      });
    },
    [initialValues]
  );

  const createSelectBlurHandler = useCallback(
    (fieldPath) => (e) => {
      const currentValue = e.target.value;
      const initialValue = getFieldValue(initialValues, fieldPath);
      const hasChanged = currentValue !== initialValue;

      setFieldChanges((prev) => {
        const updated = { ...prev, [fieldPath]: hasChanged };
        return updated;
      });
    },
    [initialValues]
  );

  const createDateBlurHandler = useCallback(
    (fieldPath) => (e) => {
      const currentValue = e.target.value;
      const initialValue = getFieldValue(initialValues, fieldPath);
      const hasChanged = currentValue !== initialValue;

      setFieldChanges((prev) => {
        const updated = { ...prev, [fieldPath]: hasChanged };
        return updated;
      });
    },
    [initialValues]
  );

  // Helper to get nested field value
  const getFieldValue = useCallback((obj, path) => {
    return path.split(".").reduce((curr, key) => {
      if (key.includes("[") && key.includes("]")) {
        const arrayKey = key.split("[")[0];
        const index = parseInt(key.split("[")[1].split("]")[0]);
        return curr?.[arrayKey]?.[index];
      }
      return curr?.[key];
    }, obj);
  }, []);

  const saveData = async (data, proceed = false) => {
    console.log("saveData called with data:", data);
    console.log("hasChanges:", hasChanges);

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
        return cleanEntry;
      });

      console.log("Saving education entries:", dataToSave);

      const res = await saveSectionData(
        "educationDetails",
        { education: dataToSave },
        token
      );
      if (res?.status === 400) {
        // Transform the nested error structure
        const transformedErrors = {};
        if (res.response?.data?.errors) {
          const errors = res.response.data.errors;
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
        return;
      } else if (res?.data?.success) {
        toast.success(res.data?.msg || "Education details saved");
      }

      dispatch({
        type: "UPDATE_SECTION",
        section: "educationDetails",
        data: dataToSave,
      });

      setHasChanges(false);
      setFieldChanges({});
      if (proceed) onNext(dataToSave);
    } catch (error) {
      console.error("Error saving data:", error);
      // Transform error structure for caught errors
      const transformedErrors = {};
      if (error?.response?.data?.errors) {
        const errors = error.response.data.errors;
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

      <form onSubmit={handleNext}>
        <div className="mb-6">
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
        </div>

        {fields.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-600">
              No education details added yet. Click the button above to add your
              education details.
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
                <div className="absolute top-4 right-4">
                  <button
                    type="button"
                    className="text-red-600 hover:text-red-800 transition-colors duration-200"
                    onClick={() => remove(index)}
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
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Education Entry {index + 1}
                </h3>
                <EducationEntry
                  index={index}
                  register={register}
                  watch={watch}
                  errors={fieldErrors}
                  backendErrors={backendFieldErrors}
                  onTextBlur={createTextBlurHandler}
                  onSelectBlur={createSelectBlurHandler}
                  onDateBlur={createDateBlurHandler}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={!hasChanges || saving}
            className={`px-4 py-2 rounded ${
              hasChanges && !saving
                ? "bg-green-500 text-white hover:bg-green-600 cursor-pointer"
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
            {saving ? "Saving..." : "Save and Continue ➡️"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EducationDetailsForm;
