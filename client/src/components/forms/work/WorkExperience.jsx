import React, { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { saveSectionData } from "../../../services/formApi";
import { useAuth } from "../../../context/AuthContext";
import { useFormData } from "../../../context/FormContext";
import { toast } from "react-toastify";
import { formatDuration } from "../../../utils/getAge.js";
import axios from "axios";
import { formatDate } from "../../../utils/dateConversion.js";

const industries = [
  "Autonomous Bodies",
  "Central govt.",
  "Indian Armed Forces",
  "NGO",
  "Private",
  "PSU central",
  "PSU state",
  "State govt",
];

const schema = yup.object().shape({
  work: yup.array().of(
    yup.object().shape({
      companyName: yup.string().required("Company name is required"),
      role: yup.string().required("Designation/role is required"),
      city: yup.string().required("Worked city is required"),
      startDate: yup
        .date()
        .required("Start date is required")
        .transform((value, originalValue) =>
          originalValue ? new Date(originalValue) : null
        )
        .typeError("Please enter a valid start date"),
      relievingDate: yup
        .date()
        .required("Relieving date is required")
        .transform((value, originalValue) =>
          originalValue ? new Date(originalValue) : null
        )
        .typeError("Please enter a valid relieving date")
        .test(
          "is-after-start",
          "Relieving date must be after start date",
          function (value) {
            const startDate = this.parent.startDate;
            if (!startDate || !value) return true;
            return new Date(value) > new Date(startDate);
          }
        ),
      industry: yup
        .string()
        .oneOf(industries, "Please select a valid industry"),
      scaleOnLeaving: yup.string(),
      reasonForLeaving: yup.string(),
      grossSalary: yup
        .number()
        .required("Gross salary is required")
        .positive("Gross salary must be positive")
        .transform((value) => (isNaN(value) ? undefined : value))
        .nullable()
        .typeError("Please enter a valid salary amount"),
      isGreenfield: yup
        .boolean()
        .required("Specify if its greenfield job(mines work)"),
      responsibilities: yup.string(),
    })
  ),
});

const WorkExperienceForm = ({ onNext, defaultValues = [] }) => {
  const { token } = useAuth();
  const { state: formState, dispatch } = useFormData();

  const [backendErrors, setBackendErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [fieldChanges, setFieldChanges] = useState({});

  // Memoize initial values to prevent unnecessary re-renders
  const initialValues = useMemo(() => {
    console.log("Form State:", formState);
    const workData = formState?.work?.data || [];

    // Format dates in each work entry
    const formattedWorkData = workData.map((entry) => ({
      ...entry,
      startDate: formatDate(entry.startDate),
      relievingDate: formatDate(entry.relievingDate),
    }));
    console.log("formatted", formattedWorkData);
    return {
      work:
        Array.isArray(formattedWorkData) && formattedWorkData.length > 0
          ? formattedWorkData
          : Array.isArray(defaultValues)
          ? defaultValues
          : [],
    };
  }, [formState?.work?.data, defaultValues]);

  // Load data if not already in FormContext
  useEffect(() => {
    const loadData = async () => {
      if (!formState.work || formState.work.length === 0) {
        setLoading(true);
        try {
          const result = await axios.get(
            `${import.meta.env.VITE_API_URL}/work`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          dispatch({
            type: "UPDATE_SECTION",
            section: "workExperience",
            data: result?.data || [],
          });
        } catch (error) {
          console.error("Error loading work experience:", error);
          toast.error("Failed to load work experience data");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadData();
  }, [token, dispatch, formState?.work?.data]);

  const {
    register,
    control,
    handleSubmit,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "work",
  });

  // Watch all form values for changes
  const formValues = watch();

  // Check for changes whenever form values change
  useEffect(() => {
    const checkForChanges = () => {
      const currentValues = getValues();
      const hasAnyChanges = currentValues.work.some((entry, index) => {
        const initialEntry = initialValues.work[index];
        if (!initialEntry) return true;

        return Object.keys(entry).some((key) => {
          const currentValue = entry[key];
          const initialValue = initialEntry[key];

          // Handle date comparisons
          if (key === "startDate") {
            return currentValue !== initialValue;
          }
          if (key === "relievingDate") {
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

  const startDates = watch("work")?.map((emp) => emp.startDate) || [];
  const relievingDates = watch("work")?.map((emp) => emp.relievingDate) || [];

  const saveData = async (data, proceed = false) => {
    if (!hasChanges) {
      if (proceed) onNext(data.work);
      return;
    }

    setSaving(true);
    setBackendErrors({});
    try {
      const dataToSave = data.work.map((employer) => {
        const { _id, __v, ...cleanEmployer } = employer;
        return cleanEmployer;
      });

      const res = await saveSectionData(
        "workExperience",
        { work: dataToSave },
        token
      );
      if (res?.errors) {
        const transformedErrors = {};

        Object.entries(res.errors).forEach(([key, value]) => {
          const match = key.match(/work\[(\d+)\]/);
          if (match) {
            const index = parseInt(match[1]);
            transformedErrors[index] = value;
          }
        });

        setBackendErrors(transformedErrors);
        return;
      } else if (res?.success) {
        console.log("Work Experience saved successfully");
        toast.success(res.data?.msg || "Work Experience saved successfully");
        dispatch({
          type: "UPDATE_SECTION",
          section: "work",
          data: dataToSave,
        });
      }

      dispatch({
        type: "UPDATE_SECTION",
        section: "work",
        data: dataToSave,
      });

      setHasChanges(false);
      setFieldChanges({});

      if (proceed) onNext(dataToSave);
    } catch (error) {
      console.error("Error saving data:", error);
      const transformedErrors = {};
      if (error?.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.entries(errors).forEach(([key, value]) => {
          const match = key.match(/work\[(\d+)\]/);
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
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Employment History
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
                Employer {parseInt(index) + 1}:
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

      {errors.work && (
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
                companyName: "",
                role: "",
                city: "",
                startDate: "",
                relievingDate: "",
                industry: "",
                scaleOnLeaving: "",
                reasonForLeaving: "",
                grossSalary: "",
                isGreenfield: false,
                numberOfMonths: "",
                numberOfYears: "",
                responsibilities: "",
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
            Add Employer
          </button>
        </div>

        {fields.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-600">
              No employers added yet. Click the button above to add employment
              details.
            </p>
          </div>
        )}

        <div className="space-y-6">
          {fields.map((item, index) => {
            const fieldErrors = errors.work?.[index];
            const backendFieldErrors = backendErrors[index];

            const getErrorClass = (fieldName) => {
              const hasError =
                fieldErrors?.[fieldName] || backendFieldErrors?.[fieldName];
              return `w-full p-2 border ${
                hasError ? "border-red-500" : "border-gray-300"
              } rounded-md focus:ring-blue-500 focus:border-blue-500`;
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
                  Employer {index + 1}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company's Name
                    </label>
                    <input
                      {...register(`work.${index}.companyName`)}
                      placeholder="Enter company's name"
                      className={getErrorClass("companyName")}
                    />
                    {renderError("companyName")}
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      {...register(`work.${index}.city`)}
                      placeholder="Enter city"
                      className={getErrorClass("city")}
                    />
                    {renderError("city")}
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      {...register(`work.${index}.startDate`)}
                      className={getErrorClass("startDate")}
                    />
                    {renderError("startDate")}
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Relieving Date
                    </label>
                    <input
                      type="date"
                      {...register(`work.${index}.relievingDate`)}
                      className={getErrorClass("relievingDate")}
                      min={
                        startDates[index]
                          ? new Date(
                              new Date(startDates[index]).setDate(
                                new Date(startDates[index]).getDate() + 1
                              )
                            )
                              .toISOString()
                              .split("T")[0]
                          : undefined
                      }
                      max={new Date().toISOString().split("T")[0]}
                    />
                    {startDates[index] && relievingDates[index] && (
                      <p className="text-sm text-green-600 mt-1">
                        Duration:{" "}
                        {formatDuration(
                          startDates[index],
                          relievingDates[index]
                        )}
                      </p>
                    )}
                    {renderError("relievingDate")}
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Industry
                    </label>
                    <select
                      {...register(`work.${index}.industry`)}
                      className={getErrorClass("industry")}
                    >
                      <option value="">Select Industry</option>
                      {industries.map((ind, idx) => (
                        <option key={idx} value={ind}>
                          {ind}
                        </option>
                      ))}
                    </select>
                    {renderError("industry")}
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Designation/Role
                    </label>
                    <input
                      {...register(`work.${index}.role`)}
                      className={getErrorClass("role")}
                      placeholder="Enter designation/role"
                    />
                    {renderError("role")}
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Scale on Leaving
                    </label>
                    <input
                      {...register(`work.${index}.scaleOnLeaving`)}
                      placeholder="Enter scale on leaving"
                      className={getErrorClass("scaleOnLeaving")}
                    />
                    {renderError("scaleOnLeaving")}
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Leaving
                    </label>
                    <input
                      {...register(`work.${index}.reasonForLeaving`)}
                      className={getErrorClass("reasonForLeaving")}
                      placeholder="Enter reason for leaving"
                    />
                    {renderError("reasonForLeaving")}
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gross Salary
                    </label>
                    <input
                      type="number"
                      min={0}
                      {...register(`work.${index}.grossSalary`)}
                      placeholder="Enter gross salary"
                      className={getErrorClass("grossSalary")}
                    />
                    {renderError("grossSalary")}
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Greenfield
                    </label>
                    <select
                      {...register(`work.${index}.isGreenfield`, {
                        setValueAs: (value) => {
                          if (value === "") return undefined;
                          return value === "true";
                        },
                      })}
                      className={getErrorClass("isGreenfield")}
                    >
                      <option value="">Select</option>
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                    {renderError("isGreenfield")}
                  </div>

                  <div className="form-group col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Responsibilities
                    </label>
                    <textarea
                      {...register(`work.${index}.responsibilities`, {
                        maxLength: 500,
                      })}
                      placeholder="Enter your job responsibilities (max 500 characters)"
                      className={`${getErrorClass(
                        "responsibilities"
                      )} min-h-[100px] resize-y w-full`}
                      rows={4}
                    />
                    <div className="flex justify-between mt-1">
                      <p className="text-sm text-gray-500">
                        {watch(`work.${index}.responsibilities`)?.length || 0}
                        /500 characters
                      </p>
                      <p className="text-sm text-gray-500">
                        {watch(`work.${index}.responsibilities`)
                          ?.trim()
                          .split(/\s+/)
                          .filter(Boolean).length || 0}{" "}
                        words
                      </p>
                    </div>
                    {renderError("responsibilities")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={!hasChanges || saving}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
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
        </div>
      </form>
    </div>
  );
};

export default WorkExperienceForm;
