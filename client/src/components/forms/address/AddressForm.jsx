import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import AddressDetails from "./Address";
import { saveSectionData } from "../../../services/formApi.js";
import { useAuth } from "../../../context/AuthContext";
import { useFormData } from "../../../context/FormContext";
import axiosInstance from "../../../services/axiosInstance.js";
import { toast } from "react-toastify";

// Define base address schema for required addresses
const requiredAddressSchema = yup.object().shape({
  addressLine1: yup.string().required("Address Line 1 is required"),
  addressLine2: yup.string(),
  city: yup.string().required("City is required"),
  state: yup.string().required("State is required"),
  pincode: yup
    .string()
    .matches(/^[0-9]{6}$/, "Pincode must be 6 digits")
    .required("Pincode is required"),
  district: yup.string().required("District is required"),
  postOffice: yup.string().required("Post Office is required"),
  policeStation: yup.string().required("Police Station is required"),
  type: yup.string(),
});

// Define optional address schema for correspondence address
const correspondenceAddressSchema = yup.object().shape({
  addressLine1: yup.string(),
  addressLine2: yup.string(),
  city: yup.string().when("addressLine1", {
    is: (val) => val && val.trim().length > 0,
    then: (schema) => schema.required("City is required"),
    otherwise: (schema) => schema,
  }),
  state: yup.string().when("addressLine1", {
    is: (val) => val && val.trim().length > 0,
    then: (schema) => schema.required("State is required"),
    otherwise: (schema) => schema,
  }),
  pincode: yup.string().when("addressLine1", {
    is: (val) => val && val.trim().length > 0,
    then: (schema) =>
      schema
        .matches(/^[0-9]{6}$/, "Pincode must be 6 digits")
        .required("Pincode is required"),
    otherwise: (schema) => schema,
  }),
  district: yup.string().when("addressLine1", {
    is: (val) => val && val.trim().length > 0,
    then: (schema) => schema.required("District is required"),
    otherwise: (schema) => schema,
  }),
  postOffice: yup.string().when("addressLine1", {
    is: (val) => val && val.trim().length > 0,
    then: (schema) => schema.required("Post Office is required"),
    otherwise: (schema) => schema,
  }),
  policeStation: yup.string().when("addressLine1", {
    is: (val) => val && val.trim().length > 0,
    then: (schema) => schema.required("Police Station is required"),
    otherwise: (schema) => schema,
  }),
  type: yup.string(),
});

// Use tuple to define different validation for each address position
const schema = yup.object().shape({
  address: yup.tuple([
    requiredAddressSchema, // address[0] - Present Address (required)
    requiredAddressSchema, // address[1] - Permanent Address (required)
    correspondenceAddressSchema, // address[2] - Correspondence Address (optional)
  ]),
});

const AddressForm = ({ onNext, readOnly = false }) => {
  const { token } = useAuth();
  const { state: formState, dispatch } = useFormData();
  const [sameAsPresent, setSameAsPresent] = useState(false);
  const [backendErrors, setBackendErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  // Helper function to check if two addresses are the same
  const areAddressesEqual = (addr1, addr2) => {
    if (!addr1 || !addr2) return false;
    const fieldsToCompare = [
      "addressLine1",
      "addressLine2",
      "city",
      "state",
      "pincode",
      "district",
      "postOffice",
      "policeStation",
    ];
    return fieldsToCompare.every((field) => addr1[field] === addr2[field]);
  };

  // Memoize initial values
  const initialValues = useMemo(() => {
    const addressData = formState?.address?.data || [];
    const presentAddress =
      addressData.find((addr) => addr.type === "present") || {};
    const permanentAddress =
      addressData.find((addr) => addr.type === "permanent") || {};
    const correspondenceAddress =
      addressData.find((addr) => addr.type === "correspondence") || {};

    return {
      address: [presentAddress, permanentAddress, correspondenceAddress],
    };
  }, [formState?.address?.data]);

  // Load data if not already in FormContext
  useEffect(() => {
    const loadData = async () => {
      if (!formState?.address?.data || formState.address.data.length === 0) {
        setLoading(true);
        try {
          const result = await axiosInstance.get("/address");

          if (result?.data?.success) {
            dispatch({
              type: "UPDATE_SECTION",
              section: "address",
              data: result.data.data?.address || [],
            });
          }
        } catch (error) {
          console.error("Error loading address details:", error);
          toast.error("Failed to load address details");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadData();
  }, [token, dispatch, formState?.address?.data]);

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    trigger,
    reset, // Add reset method
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialValues,
  });

  const formValues = watch();

  // Reset form when initial values change (when data loads)
  useEffect(() => {
    if (!loading && initialValues) {
      reset(initialValues);

      // Check if permanent address is same as present address
      const presentAddr = initialValues.address[0];
      const permanentAddr = initialValues.address[1];
      const isSame = areAddressesEqual(presentAddr, permanentAddr);
      setSameAsPresent(isSame);
    }
  }, [initialValues, loading, reset]);

  // Check for changes whenever form values change
  useEffect(() => {
    const checkForChanges = () => {
      const currentValues = getValues();
      console.log("Present val", currentValues);
      console.log("initial val", initialValues);
      const hasPresentChanges = Object.keys(currentValues.address[0]).some(
        (key) => currentValues.address[0][key] !== initialValues.address[0][key]
      );
      const hasPermanentChanges = Object.keys(currentValues.address[1]).some(
        (key) => currentValues.address[1][key] !== initialValues.address[1][key]
      );

      // Check correspondence address changes, but ignore if it's empty in both current and initial
      const currentCorrespondence = currentValues.address[2];
      const initialCorrespondence = initialValues.address[2];
      const hasCorrespondenceChanges =
        currentCorrespondence && initialCorrespondence
          ? Object.keys(currentCorrespondence).some(
              (key) => currentCorrespondence[key] !== initialCorrespondence[key]
            )
          : currentCorrespondence?.addressLine1?.trim() ||
            initialCorrespondence?.addressLine1?.trim();

      setHasChanges(
        hasPresentChanges || hasPermanentChanges || hasCorrespondenceChanges
      );
    };

    checkForChanges();
  }, [formValues, initialValues, getValues]);

  // Sync permanent with present if checkbox is selected
  useEffect(() => {
    if (sameAsPresent) {
      const presentAddress = formValues.address?.[0]; // Fix: use correct field path
      if (presentAddress) {
        setValue("address.1", { ...presentAddress });
        trigger("address.1");
      }
    } else {
      // Don't clear if we're just initializing based on loaded data
      const currentPermanent = getValues("address.1");
      const currentPresent = getValues("address.0");

      // Only clear if the permanent address is actually the same as present
      if (areAddressesEqual(currentPermanent, currentPresent)) {
        setValue("address.1", {
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "",
          pincode: "",
          type: "permanent",
          district: "",
          policeStation: "",
          postOffice: "",
        });
        trigger("address.1");
      }
    }
  }, [sameAsPresent, formValues.address?.[0], setValue, trigger, getValues]);

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setSameAsPresent(checked);
    if (!checked) {
      // Clear all fields in permanent address
      setValue("address.1", {
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        pincode: "",
        type: "permanent",
        district: "",
        policeStation: "",
        postOffice: "",
      });
      trigger("address.1");
    } else {
      const presentAddress = getValues("address.0");
      if (presentAddress) {
        setValue("address.1", { ...presentAddress });
        trigger("address.1");
      }
    }
  };

  const saveData = async (data, proceed = false) => {
    console.log("saveData called with data:", data);
    console.log("hasChanges:", hasChanges);
    if (!hasChanges) {
      if (proceed) onNext(data);
      return;
    }

    setSaving(true);
    setBackendErrors({});

    try {
      // Filter out empty correspondence address
      const addressesToSave = [];

      // Always include present and permanent addresses
      addressesToSave.push({ ...data.address[0], type: "present" });
      addressesToSave.push({ ...data.address[1], type: "permanent" });

      // Only include correspondence address if it has data
      if (data.address[2] && data.address[2].addressLine1?.trim()) {
        addressesToSave.push({ ...data.address[2], type: "correspondence" });
      }

      const res = await saveSectionData(
        "addressDetails",
        { address: addressesToSave },
        token
      );

      if (res?.status === 400 || !res?.success) {
        const transformedErrors = {};
        if (res?.errors) {
          Object.entries(res.errors).forEach(([key, value]) => {
            const match = key.match(/address\[(\d+)\]/);
            if (match) {
              const index = parseInt(match[1]);
              transformedErrors[index] = value;
            }
          });
        }
        setBackendErrors(transformedErrors);
        return;
      } else if (res?.success) {
        toast.success(res?.msg || "Address details saved");
      }

      dispatch({
        type: "UPDATE_SECTION",
        section: "addressDetails",
        data: addressesToSave,
      });

      setHasChanges(false);
      if (proceed) onNext(data);
    } catch (error) {
      console.error("Save error:", error);
      const transformedErrors = {};
      if (error?.response?.data?.errors) {
        Object.entries(error.response.data.errors).forEach(([key, value]) => {
          const match = key.match(/address\[(\d+)\]/);
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
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Address Details</h2>

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
                {parseInt(index) === 0
                  ? "Present Address"
                  : parseInt(index) === 1
                  ? "Permanent Address"
                  : "Correspondence Address"}
                :
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
      {console.log(errors.address)}
      {errors.address?.[0] || errors.address?.[1] ? (
        <div className="text-red-600 text-sm mb-4">
          Please fix the validation errors below.
        </div>
      ) : null}

      <form onSubmit={handleNext}>
        <div className="space-y-8">
          {/* Present Address Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Present Address (Kirandul)
            </h3>
            <AddressDetails
              index={0}
              register={register}
              watch={watch}
              errors={errors?.address?.[0]}
              backendErrors={backendErrors?.[0]}
            />
          </div>

          {/* Same as Present Checkbox */}
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              id="sameAsPresent"
              checked={sameAsPresent}
              onChange={handleCheckboxChange}
              className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              disabled={readOnly}
            />
            <label
              htmlFor="sameAsPresent"
              className="text-gray-700 font-medium"
            >
              Same as Present Address
            </label>
          </div>

          {/* Permanent Address Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Permanent Address
            </h3>
            <AddressDetails
              index={1}
              register={register}
              watch={watch}
              errors={errors?.address?.[1]}
              backendErrors={backendErrors?.[1]}
              disabled={sameAsPresent || readOnly}
            />
          </div>

          {/* Correspondence Address Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Correspondence Address
            </h3>
            <AddressDetails
              index={2}
              register={register}
              watch={watch}
              errors={errors?.address?.[2]}
              backendErrors={backendErrors?.[2]}
              disabled={readOnly}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-6">
            {!readOnly && (
              <>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={!hasChanges || saving}
                  className={`px-4 py-2 rounded ${
                    hasChanges
                      ? "bg-green-400 text-gray-800 hover:bg-gray-400 cursor-pointer"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  💾 Save Draft
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {saving ? "Saving..." : "Next ➡️"}
                </button>
              </>
            )}
            {readOnly && (
              <div className="w-full text-center">
                <p className="text-gray-600 italic">
                  Form is in read-only mode
                </p>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;
