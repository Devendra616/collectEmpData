import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { saveSectionData } from "../../../services/formApi";
import { useAuth } from "../../../context/AuthContext";
import { useFormData } from "../../../context/FormContext";

const familyTypes = [
  "Spouse",
  "Child",
  "Father",
  "Father-in-law",
  "Mother",
  "Mother-in-law",
];

const titlesByType = {
  Spouse: ["Shri", "Smt"],
  Child: ["Mt", "Ms"],
  Father: ["Shri"],
  "Father-in-law": ["Shri"],
  Mother: ["Smt"],
  "Mother-in-law": ["Smt"],
};

const schema = yup.object().shape({
  familyMembers: yup.array().of(
    yup.object().shape({
      type: yup.string().required("Select family member type"),
      title: yup.string().required("Select title"),
      name: yup.string().required("Name is required"),
      surname: yup.string().required("Surname is required"),
      aadharNumber: yup
        .string()
        .matches(
          /^[2-9]{1}[0-9]{11}$/,
          "Aadhaar must be a 12-digit number starting with 2-9"
        )
        .required("Aadhaar number is required"),
      bloodGroup: yup.string(),
      dob: yup
        .date()
        .transform((value, originalValue) =>
          originalValue ? new Date(originalValue) : null
        )
        .required("Date of Birth is required")
        .max(new Date(), "Date of Birth cannot be future date"),
      cityOfBirth: yup.string(),
      employmentStatus: yup.string(),
      employmentDetails: yup.string(),
      gender: yup.string(),
    })
  ),
});

const FamilyDetailsForm = ({ onNext, defaultValues = [] }) => {
  const { token } = useAuth();
  const { state: formState, dispatch } = useFormData();

  const [backendErrors, setBackendErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [fieldChanges, setFieldChanges] = useState({});

  // Memoize initial values to prevent unnecessary re-renders
  const initialValues = useMemo(
    () => ({
      familyMembers: Array.isArray(formState.familyDetails)
        ? formState.familyDetails
        : Array.isArray(defaultValues)
        ? defaultValues
        : [],
    }),
    [formState.familyDetails, defaultValues]
  );

  // Debug initial values only on mount
  useEffect(() => {
    console.log("Initial family members:", initialValues.familyMembers);
  }, []);

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
    name: "familyMembers",
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

      setFieldChanges((prev) => {
        const updated = { ...prev, [fieldPath]: hasChanged };
        const anyChanges = Object.values(updated).some(Boolean);
        setHasChanges(anyChanges);
        return updated;
      });
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

  const saveData = async (data, proceed = false) => {
    console.log("saveData called with data:", data);
    console.log("hasChanges:", hasChanges);

    // If no changes, just proceed to next step without saving
    if (!hasChanges) {
      console.log("No changes detected, skipping save");
      if (proceed) onNext(data.familyMembers);
      return;
    }

    setSaving(true);
    setBackendErrors({});
    try {
      // Remove internal fields before saving
      const dataToSave = data.familyMembers.map((member) => {
        const { _id, __v, ...cleanMember } = member;
        return cleanMember;
      });

      console.log("Saving family members:", dataToSave);

      const res = await saveSectionData("familyDetails", dataToSave, token);
      if (res?.status === 400) {
        // Transform the nested error structure
        const transformedErrors = {};
        if (res.response?.data?.errors) {
          const errors = res.response.data.errors;
          // Handle the familyMembers[index] format
          Object.entries(errors).forEach(([key, value]) => {
            const match = key.match(/familyMembers\[(\d+)\]/);
            if (match) {
              const index = parseInt(match[1]);
              transformedErrors[index] = value;
            }
          });
        }
        setBackendErrors(transformedErrors);
        return;
      }

      dispatch({
        type: "UPDATE_SECTION",
        section: "familyDetails",
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
        // Handle the familyMembers[index] format
        Object.entries(errors).forEach(([key, value]) => {
          const match = key.match(/familyMembers\[(\d+)\]/);
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

      {errors.familyMembers && (
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
                type: "",
                title: "",
                name: "",
                surname: "",
                aadharNumber: "",
                bloodGroup: "",
                dob: "",
                cityOfBirth: "",
                employmentStatus: "",
                employmentDetails: "",
                gender: "",
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
            Add Family Member
          </button>
        </div>

        {fields.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-600">
              No family members added yet. Click the button above to add family
              details.
            </p>
          </div>
        )}

        <div className="space-y-6">
          {fields.map((member, index) => {
            const type = watch(`familyMembers.${index}.type`);
            const titles = titlesByType[type] || [];
            const fieldErrors = errors.familyMembers?.[index];
            const backendFieldErrors = backendErrors[index];

            return (
              <div
                key={member.id}
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
                  Family Member {index + 1}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Family Member Type
                    </label>
                    <select
                      {...register(`familyMembers.${index}.type`)}
                      onBlur={createSelectBlurHandler(
                        `familyMembers[${index}].type`
                      )}
                      className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                        fieldErrors?.type ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Type</option>
                      {familyTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    {fieldErrors?.type && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldErrors.type.message}
                      </p>
                    )}
                    {backendFieldErrors?.type && (
                      <p className="text-red-500 text-xs mt-1">
                        {backendFieldErrors.type}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <select
                      {...register(`familyMembers.${index}.title`)}
                      onBlur={createSelectBlurHandler(
                        `familyMembers[${index}].title`
                      )}
                      className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                        fieldErrors?.title
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Title</option>
                      {titles.map((title) => (
                        <option key={title} value={title}>
                          {title}
                        </option>
                      ))}
                    </select>
                    {fieldErrors?.title && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldErrors.title.message}
                      </p>
                    )}
                    {backendFieldErrors?.title && (
                      <p className="text-red-500 text-xs mt-1">
                        {backendFieldErrors.title}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      placeholder="Enter name"
                      {...register(`familyMembers.${index}.name`)}
                      onBlur={createTextBlurHandler(
                        `familyMembers[${index}].name`
                      )}
                      className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                        fieldErrors?.name ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {fieldErrors?.name && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldErrors.name.message}
                      </p>
                    )}
                    {backendFieldErrors?.name && (
                      <p className="text-red-500 text-xs mt-1">
                        {backendFieldErrors.name}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Surname
                    </label>
                    <input
                      placeholder="Enter surname"
                      {...register(`familyMembers.${index}.surname`)}
                      onBlur={createTextBlurHandler(
                        `familyMembers[${index}].surname`
                      )}
                      className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                        fieldErrors?.surname
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {fieldErrors?.surname && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldErrors.surname.message}
                      </p>
                    )}
                    {backendFieldErrors?.surname && (
                      <p className="text-red-500 text-xs mt-1">
                        {backendFieldErrors.surname}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aadhar Number
                    </label>
                    <input
                      placeholder="Enter Aadhar number"
                      {...register(`familyMembers.${index}.aadharNumber`)}
                      onBlur={createTextBlurHandler(
                        `familyMembers[${index}].aadharNumber`
                      )}
                      className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                        fieldErrors?.aadharNumber
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {fieldErrors?.aadharNumber && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldErrors.aadharNumber.message}
                      </p>
                    )}
                    {backendFieldErrors?.aadharNumber && (
                      <p className="text-red-500 text-xs mt-1">
                        {backendFieldErrors.aadharNumber}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Blood Group
                    </label>
                    <input
                      placeholder="Enter blood group"
                      {...register(`familyMembers.${index}.bloodGroup`)}
                      onBlur={createTextBlurHandler(
                        `familyMembers[${index}].bloodGroup`
                      )}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      {...register(`familyMembers.${index}.dob`)}
                      onBlur={createDateBlurHandler(
                        `familyMembers[${index}].dob`
                      )}
                      className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                        fieldErrors?.dob ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {fieldErrors?.dob && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldErrors.dob.message}
                      </p>
                    )}
                    {backendFieldErrors?.dob && (
                      <p className="text-red-500 text-xs mt-1">
                        {backendFieldErrors.dob}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City of Birth
                    </label>
                    <input
                      placeholder="Enter city of birth"
                      {...register(`familyMembers.${index}.cityOfBirth`)}
                      onBlur={createTextBlurHandler(
                        `familyMembers[${index}].cityOfBirth`
                      )}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Conditional Fields */}
                  {type === "Spouse" && (
                    <>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Spouse Status
                        </label>
                        <select
                          {...register(
                            `familyMembers.${index}.employmentStatus`
                          )}
                          onBlur={createSelectBlurHandler(
                            `familyMembers[${index}].employmentStatus`
                          )}
                          className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                            backendFieldErrors?.employmentStatus
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">Select Status</option>
                          <option value="Working">Working</option>
                          <option value="Not-Working">Not-Working</option>
                        </select>
                        {backendFieldErrors?.employmentStatus && (
                          <p className="text-red-500 text-xs mt-1">
                            {backendFieldErrors.employmentStatus}
                          </p>
                        )}
                      </div>

                      {watch(`familyMembers.${index}.employmentStatus`) ===
                        "Working" && (
                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Employment Details
                          </label>
                          <input
                            placeholder="Enter employment details"
                            {...register(
                              `familyMembers.${index}.employmentDetails`
                            )}
                            onBlur={createTextBlurHandler(
                              `familyMembers[${index}].employmentDetails`
                            )}
                            className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                              backendFieldErrors?.employmentDetails
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          {backendFieldErrors?.employmentDetails && (
                            <p className="text-red-500 text-xs mt-1">
                              {backendFieldErrors.employmentDetails}
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {type === "Child" && (
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <select
                        {...register(`familyMembers.${index}.gender`)}
                        onBlur={createSelectBlurHandler(
                          `familyMembers[${index}].gender`
                        )}
                        className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                          backendFieldErrors?.gender
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                      {backendFieldErrors?.gender && (
                        <p className="text-red-500 text-xs mt-1">
                          {backendFieldErrors.gender}
                        </p>
                      )}
                    </div>
                  )}
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

export default FamilyDetailsForm;
