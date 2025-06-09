import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import AddressDetails from "./Address";
import { saveSectionData } from "../../../services/formApi.js";
import { useAuth } from "../../../context/AuthContext";
import { useFormData } from "../../../context/FormContext";
import axios from "axios";
import { toast } from "react-toastify";

const schema = yup.object().shape({
  address: yup.array().of(
    yup.object().shape({
      addressLine1: yup.string().required("Address Line 1 is required"),
      city: yup.string().required("City is required"),
      state: yup.string().required("State is required"),
      pincode: yup
        .string()
        .matches(/^[0-9]{6}$/, "Pincode must be 6 digits")
        .required("Pincode is required"),
      district: yup.string().required("District is required"),
      postOffice: yup.string().required("Post Office is required"),
      policeStation: yup.string().required("Police Station is required"),
    })
  ),
});

const AddressForm = ({ onNext }) => {
  const { token } = useAuth();
  const { state: formState, dispatch } = useFormData();
  const [sameAsPresent, setSameAsPresent] = useState(false);
  const [backendErrors, setBackendErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  // Memoize initial values
  const initialValues = useMemo(() => {
    const addressData = formState?.address?.data || [];
    const presentAddress =
      addressData.find((addr) => addr.type === "present") || {};
    const permanentAddress =
      addressData.find((addr) => addr.type === "permanent") || {};

    return {
      address: [presentAddress, permanentAddress],
    };
  }, [formState?.address?.data]);

  // Load data if not already in FormContext
  useEffect(() => {
    const loadData = async () => {
      if (!formState?.address?.data || formState.address.data.length === 0) {
        setLoading(true);
        try {
          const result = await axios.get(
            `${import.meta.env.VITE_API_URL}/address`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

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
    control,
    watch,
    getValues,
    setValue,
    trigger,
    formState: { errors },
  } = useForm({
    //resolver: yupResolver(schema),
    defaultValues: initialValues,
  });

  const formValues = watch();

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

      setHasChanges(hasPresentChanges || hasPermanentChanges);
    };

    checkForChanges();
  }, [formValues, initialValues, getValues]);

  // Sync permanent with present if checkbox is selected
  useEffect(() => {
    if (sameAsPresent) {
      const presentAddress = formValues.present;
      if (presentAddress) {
        setValue("address.1", { ...presentAddress });
        trigger("address.1");
      }
    } else {
      setValue("address.1", {});
      trigger("address.1");
    }
  }, [sameAsPresent, getValues, setValue, trigger]);

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
      const dataToSave = [
        { ...data.address[0], type: "present" },
        { ...data.address[1], type: "permanent" },
      ];

      const res = await saveSectionData(
        "addressDetails",
        { address: dataToSave },
        token
      );

      if (res?.status === 400 || !res?.success) {
        const transformedErrors = {};
        if (res?.errors) {
          Object.entries(res.errors).forEach(([key, value]) => {
            const match = key.match(/address[\[\.](\d+)[\]\.]/);
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
        data: dataToSave,
      });

      setHasChanges(false);
      if (proceed) onNext(data);
    } catch (error) {
      console.error("Save error:", error);
      const transformedErrors = {};
      if (error?.response?.data?.errors) {
        Object.entries(error.response.data.errors).forEach(([key, value]) => {
          const match = key.match(/address[\[\.](\d+)[\]\.]/);
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
                  : "Permanent Address"}
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
              disabled={sameAsPresent}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-6">
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
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;
