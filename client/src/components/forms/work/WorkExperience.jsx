import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { saveSectionData } from "../../../services/formApi";
import { useAuth } from "../../../context/AuthContext";
import { useFormData } from "../../../context/FormContext";
import { toast } from "react-toastify";
import { getDiffFromDates } from "../../../utils/getAge.js";
import axios from "axios";

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
  employers: yup.array().of(
    yup.object().shape({
      name: yup.string().required("Employer name is required"),
      designation: yup.string().required("Designation is required"),
      city: yup.string(),
      startDate: yup
        .date()
        .required("Start date is required")
        .transform((value, originalValue) => {
          if (!originalValue) return null;
          const date = new Date(originalValue);
          return isNaN(date.getTime()) ? null : date;
        })
        .nullable()
        .typeError("Please enter a valid start date"),
      relievingDate: yup
        .date()
        .required("Relieving date is required")
        .transform((value, originalValue) => {
          if (!originalValue) return null;
          const date = new Date(originalValue);
          return isNaN(date.getTime()) ? null : date;
        })
        .nullable()
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
      greenfield: yup.string().oneOf(["Yes", "No"], "Please select Yes or No"),
      numberOfMonths: yup
        .number()
        .min(0, "Number of months must be non-negative")
        .max(11, "Number of months must be less than 12")
        .integer("Number of months must be a whole number")
        .transform((value) => (isNaN(value) ? undefined : value))
        .nullable()
        .typeError("Please enter a valid number of months"),
      numberOfYears: yup
        .number()
        .min(0, "Number of years must be non-negative")
        .integer("Number of years must be a whole number")
        .transform((value) => (isNaN(value) ? undefined : value))
        .nullable()
        .typeError("Please enter a valid number of years"),
      responsibilities: yup.string(),
    })
  ),
});

const EmployerForm = ({ onNext, defaultValues = [] }) => {
  const { token } = useAuth();
  const { state: formState, dispatch } = useFormData();

  const [backendErrors, setBackendErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load data if not already in FormContext
  useEffect(() => {
    const loadData = async () => {
      if (!formState.workExperience || formState.workExperience.length === 0) {
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
  }, [token, dispatch, formState.workExperience]);

  // Memoize initial values to prevent unnecessary re-renders
  const initialValues = useMemo(
    () => ({
      employers: Array.isArray(formState.workExperience)
        ? formState.workExperience
        : Array.isArray(defaultValues)
        ? defaultValues
        : [],
    }),
    [formState.workExperience, defaultValues]
  );

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "employers",
  });

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

  // Check if field value differs from initial
  const checkFieldChange = useCallback(
    (fieldPath, currentValue) => {
      const initialValue = getFieldValue(initialValues, fieldPath);
      const hasChanged =
        JSON.stringify(currentValue) !== JSON.stringify(initialValue);

      setHasChanges(hasChanged);
    },
    [initialValues, getFieldValue]
  );

  // Create onBlur handlers for different field types
  const createTextBlurHandler = useCallback(
    (fieldPath) => (e) => {
      checkFieldChange(fieldPath, e.target.value);
    },
    [checkFieldChange]
  );

  const createSelectBlurHandler = useCallback(
    (fieldPath) => (e) => {
      checkFieldChange(fieldPath, e.target.value);
    },
    [checkFieldChange]
  );

  const createDateBlurHandler = useCallback(
    (fieldPath) => (e) => {
      checkFieldChange(fieldPath, e.target.value);
    },
    [checkFieldChange]
  );

  // Watch all start and relieving dates
  const startDates = watch("employers")?.map((emp) => emp.startDate) || [];
  const relievingDates =
    watch("employers")?.map((emp) => emp.relievingDate) || [];

  // Calculate duration whenever dates change
  useEffect(() => {
    const calculateAndSetDuration = (index) => {
      const startDate = startDates[index];
      const relievingDate = relievingDates[index];

      if (startDate && relievingDate) {
        const calculatedDuration = getDiffFromDates(startDate, relievingDate);
        if (calculatedDuration) {
          // Only update if values are different to prevent infinite loop
          const currentYears = watch(`employers.${index}.numberOfYears`);
          const currentMonths = watch(`employers.${index}.numberOfMonths`);

          if (currentYears !== calculatedDuration.years) {
            setValue(
              `employers.${index}.numberOfYears`,
              calculatedDuration.years,
              { shouldDirty: false }
            );
          }
          if (currentMonths !== calculatedDuration.months) {
            setValue(
              `employers.${index}.numberOfMonths`,
              calculatedDuration.months,
              { shouldDirty: false }
            );
          }
        }
      }
    };

    // Calculate duration for each employer
    fields.forEach((_, index) => {
      calculateAndSetDuration(index);
    });
  }, [startDates, relievingDates, fields, setValue, watch]);

  const saveData = async (data, proceed = false) => {
    if (!hasChanges) {
      if (proceed) onNext(data.employers);
      return;
    }

    setSaving(true);
    setBackendErrors({});
    try {
      const dataToSave = data.employers.map((employer) => {
        const { _id, __v, ...cleanEmployer } = employer;
        return cleanEmployer;
      });

      const res = await saveSectionData("workExperience", dataToSave, token);
      if (res?.status === 400) {
        const transformedErrors = {};
        if (res.response?.data?.errors) {
          const errors = res.response.data.errors;
          Object.entries(errors).forEach(([key, value]) => {
            const match = key.match(/work\[(\d+)\]/);
            if (match) {
              const index = parseInt(match[1]);
              transformedErrors[index] = value;
            }
          });
        }
        setBackendErrors(transformedErrors);
        return;
      }
      if (res.success) {
        console.log("Work Experience saved successfully");
        toast.success("Work Experience saved successfully");
        return;
      }

      dispatch({
        type: "UPDATE_SECTION",
        section: "employers",
        data: dataToSave,
      });

      setHasChanges(false);
      if (proceed) onNext(dataToSave);
    } catch (error) {
      console.error("Error saving data:", error);
      const transformedErrors = {};
      if (error?.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.entries(errors).forEach(([key, value]) => {
          const match = key.match(/employers\[(\d+)\]/);
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

      {errors.employers && (
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
                name: "",
                designation: "",
                city: "",
                startDate: "",
                relievingDate: "",
                industry: "",
                scaleOnLeaving: "",
                reasonForLeaving: "",
                grossSalary: "",
                greenfield: "",
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
          {fields.map((employer, index) => {
            const fieldErrors = errors.employers?.[index];
            const backendFieldErrors = backendErrors[index];

            return (
              <div
                key={employer.id}
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
                      Employer's Name
                    </label>
                    <input
                      {...register(`employers.${index}.name`)}
                      onBlur={createTextBlurHandler(`employers[${index}].name`)}
                      placeholder="Enter employer's name"
                      className={`w-full p-2 border ${
                        fieldErrors?.name || backendFieldErrors?.name
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {fieldErrors?.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {fieldErrors.name.message}
                      </p>
                    )}
                    {backendFieldErrors?.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {backendFieldErrors.name}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      {...register(`employers.${index}.city`)}
                      onBlur={createTextBlurHandler(`employers[${index}].city`)}
                      placeholder="Enter city"
                      className={`w-full p-2 border ${
                        fieldErrors?.city || backendFieldErrors?.city
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {fieldErrors?.city && (
                      <p className="mt-1 text-sm text-red-600">
                        {fieldErrors.city.message}
                      </p>
                    )}
                    {backendFieldErrors?.city && (
                      <p className="mt-1 text-sm text-red-600">
                        {backendFieldErrors.city}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      {...register(`employers.${index}.startDate`)}
                      onBlur={createDateBlurHandler(
                        `employers[${index}].startDate`
                      )}
                      className={`w-full p-2 border ${
                        fieldErrors?.startDate || backendFieldErrors?.startDate
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {fieldErrors?.startDate && (
                      <p className="mt-1 text-sm text-red-600">
                        {fieldErrors.startDate.message}
                      </p>
                    )}
                    {backendFieldErrors?.startDate && (
                      <p className="mt-1 text-sm text-red-600">
                        {backendFieldErrors.startDate}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Relieving Date
                    </label>
                    <input
                      type="date"
                      {...register(`employers.${index}.relievingDate`)}
                      onBlur={createDateBlurHandler(
                        `employers[${index}].relievingDate`
                      )}
                      className={`w-full p-2 border ${
                        fieldErrors?.relievingDate ||
                        backendFieldErrors?.relievingDate
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {startDates[index] && relievingDates[index] && (
                      <p className="text-sm text-green-600 mt-1">
                        Duration:{" "}
                        {getDiffFromDates(
                          startDates[index],
                          relievingDates[index]
                        )?.years || 0}{" "}
                        year
                        {getDiffFromDates(
                          startDates[index],
                          relievingDates[index]
                        )?.years !== 1 && "s"}{" "}
                        {getDiffFromDates(
                          startDates[index],
                          relievingDates[index]
                        )?.months || 0}{" "}
                        month
                        {getDiffFromDates(
                          startDates[index],
                          relievingDates[index]
                        )?.months !== 1 && "s"}{" "}
                        {getDiffFromDates(
                          startDates[index],
                          relievingDates[index]
                        )?.days || 0}{" "}
                        day
                        {getDiffFromDates(
                          startDates[index],
                          relievingDates[index]
                        )?.days !== 1 && "s"}
                      </p>
                    )}
                    {fieldErrors?.relievingDate && (
                      <p className="mt-1 text-sm text-red-600">
                        {fieldErrors.relievingDate.message}
                      </p>
                    )}
                    {backendFieldErrors?.relievingDate && (
                      <p className="mt-1 text-sm text-red-600">
                        {backendFieldErrors.relievingDate}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Industry
                    </label>
                    <select
                      {...register(`employers.${index}.industry`)}
                      onBlur={createSelectBlurHandler(
                        `employers[${index}].industry`
                      )}
                      className={`w-full p-2 border ${
                        fieldErrors?.industry || backendFieldErrors?.industry
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:ring-blue-500 focus:border-blue-500`}
                    >
                      <option value="">Select Industry</option>
                      {industries.map((ind, idx) => (
                        <option key={idx} value={ind}>
                          {ind}
                        </option>
                      ))}
                    </select>
                    {fieldErrors?.industry && (
                      <p className="mt-1 text-sm text-red-600">
                        {fieldErrors.industry.message}
                      </p>
                    )}
                    {backendFieldErrors?.industry && (
                      <p className="mt-1 text-sm text-red-600">
                        {backendFieldErrors.industry}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Designation
                    </label>
                    <input
                      {...register(`employers.${index}.designation`)}
                      onBlur={createTextBlurHandler(
                        `employers[${index}].designation`
                      )}
                      placeholder="Enter designation"
                      className={`w-full p-2 border ${
                        fieldErrors?.designation ||
                        backendFieldErrors?.designation
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {fieldErrors?.designation && (
                      <p className="mt-1 text-sm text-red-600">
                        {fieldErrors.designation.message}
                      </p>
                    )}
                    {backendFieldErrors?.designation && (
                      <p className="mt-1 text-sm text-red-600">
                        {backendFieldErrors.designation}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Scale on Leaving
                    </label>
                    <input
                      {...register(`employers.${index}.scaleOnLeaving`)}
                      onBlur={createTextBlurHandler(
                        `employers[${index}].scaleOnLeaving`
                      )}
                      placeholder="Enter scale on leaving"
                      className={`w-full p-2 border ${
                        fieldErrors?.scaleOnLeaving ||
                        backendFieldErrors?.scaleOnLeaving
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {fieldErrors?.scaleOnLeaving && (
                      <p className="mt-1 text-sm text-red-600">
                        {fieldErrors.scaleOnLeaving.message}
                      </p>
                    )}
                    {backendFieldErrors?.scaleOnLeaving && (
                      <p className="mt-1 text-sm text-red-600">
                        {backendFieldErrors.scaleOnLeaving}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Leaving
                    </label>
                    <input
                      {...register(`employers.${index}.reasonForLeaving`)}
                      onBlur={createTextBlurHandler(
                        `employers[${index}].reasonForLeaving`
                      )}
                      placeholder="Enter reason for leaving"
                      className={`w-full p-2 border ${
                        fieldErrors?.reasonForLeaving ||
                        backendFieldErrors?.reasonForLeaving
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {fieldErrors?.reasonForLeaving && (
                      <p className="mt-1 text-sm text-red-600">
                        {fieldErrors.reasonForLeaving.message}
                      </p>
                    )}
                    {backendFieldErrors?.reasonForLeaving && (
                      <p className="mt-1 text-sm text-red-600">
                        {backendFieldErrors.reasonForLeaving}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gross Salary
                    </label>
                    <input
                      type="number"
                      min={0}
                      {...register(`employers.${index}.grossSalary`)}
                      onBlur={createTextBlurHandler(
                        `employers[${index}].grossSalary`
                      )}
                      placeholder="Enter gross salary"
                      className={`w-full p-2 border ${
                        fieldErrors?.grossSalary ||
                        backendFieldErrors?.grossSalary
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {fieldErrors?.grossSalary && (
                      <p className="mt-1 text-sm text-red-600">
                        {fieldErrors.grossSalary.message}
                      </p>
                    )}
                    {backendFieldErrors?.grossSalary && (
                      <p className="mt-1 text-sm text-red-600">
                        {backendFieldErrors.grossSalary}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Greenfield
                    </label>
                    <input
                      {...register(`employers.${index}.greenfield`)}
                      onBlur={createTextBlurHandler(
                        `employers[${index}].greenfield`
                      )}
                      placeholder="Enter greenfield"
                      className={`w-full p-2 border ${
                        fieldErrors?.greenfield ||
                        backendFieldErrors?.greenfield
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {fieldErrors?.greenfield && (
                      <p className="mt-1 text-sm text-red-600">
                        {fieldErrors.greenfield.message}
                      </p>
                    )}
                    {backendFieldErrors?.greenfield && (
                      <p className="mt-1 text-sm text-red-600">
                        {backendFieldErrors.greenfield}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Months
                    </label>
                    <input
                      type="number"
                      {...register(`employers.${index}.numberOfMonths`)}
                      onBlur={createTextBlurHandler(
                        `employers[${index}].numberOfMonths`
                      )}
                      placeholder="Enter number of months"
                      className={`w-full p-2 border ${
                        fieldErrors?.numberOfMonths ||
                        backendFieldErrors?.numberOfMonths
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {fieldErrors?.numberOfMonths && (
                      <p className="mt-1 text-sm text-red-600">
                        {fieldErrors.numberOfMonths.message}
                      </p>
                    )}
                    {backendFieldErrors?.numberOfMonths && (
                      <p className="mt-1 text-sm text-red-600">
                        {backendFieldErrors.numberOfMonths}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Years
                    </label>
                    <input
                      type="number"
                      {...register(`employers.${index}.numberOfYears`)}
                      onBlur={createTextBlurHandler(
                        `employers[${index}].numberOfYears`
                      )}
                      placeholder="Enter number of years"
                      className={`w-full p-2 border ${
                        fieldErrors?.numberOfYears ||
                        backendFieldErrors?.numberOfYears
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {fieldErrors?.numberOfYears && (
                      <p className="mt-1 text-sm text-red-600">
                        {fieldErrors.numberOfYears.message}
                      </p>
                    )}
                    {backendFieldErrors?.numberOfYears && (
                      <p className="mt-1 text-sm text-red-600">
                        {backendFieldErrors.numberOfYears}
                      </p>
                    )}
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
            disabled={saving}
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

export default EmployerForm;
