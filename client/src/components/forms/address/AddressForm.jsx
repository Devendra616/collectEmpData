import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { saveSectionData } from "../../../services/formApi";
import { useAuth } from "../../../context/AuthContext";
import { useFormData } from "../../../context/FormContext";
import AddressDetails from "./Address";

const schema = yup.object().shape({
  local: yup.object().shape({
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
  }),
  permanent: yup.object().shape({
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
  }),
});

const AddressForm = ({ onNext, defaultValues = {} }) => {
  const { token } = useAuth();
  const { state: formState, dispatch } = useFormData();
  const [sameAsLocal, setSameAsLocal] = useState(false);
  const [backendErrors, setBackendErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isDirty, touchedFields },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      local: defaultValues.local || {},
      permanent: defaultValues.permanent || {},
    },
    mode: "onChange", // Enable real-time validation
  });

  const formValues = watch();

  // Track changes by comparing current values with default values
  useEffect(() => {
    if (!formValues || !defaultValues) return;

    const hasFormChanges = Object.keys(formValues).some((key) => {
      if (key.startsWith("_") || key === "__v") return false;
      return (
        JSON.stringify(formValues[key]) !== JSON.stringify(defaultValues[key])
      );
    });
    setHasChanges(hasFormChanges);
  }, [formValues, defaultValues]);

  // Sync permanent with local if checkbox is selected
  useEffect(() => {
    if (sameAsLocal) {
      setValue("permanent", formValues.local);
      // Trigger validation after setting values
      trigger("permanent");
    }
  }, [sameAsLocal, formValues.local, setValue, trigger]);

  const saveData = async (data, proceed = false) => {
    if (!hasChanges) {
      if (proceed) onNext(data);
      return;
    }

    setSaving(true);
    setBackendErrors({});
    setSaveSuccess(false);

    try {
      const dataToSave = Object.fromEntries(
        Object.entries(data).filter(
          ([key]) => !key.startsWith("_") && key !== "__v"
        )
      );

      console.log("Saving data:", dataToSave); // Debug log

      const res = await saveSectionData("addressDetails", dataToSave, token);
      console.log("Save response:", res); // Debug log

      if (res?.status === 400) {
        setBackendErrors(res.response?.data?.errors || {});
        return;
      }

      dispatch({
        type: "UPDATE_SECTION",
        section: "address",
        data: dataToSave,
      });

      setSaveSuccess(true);
      setHasChanges(false);

      if (proceed) onNext(dataToSave);
    } catch (error) {
      console.error("Save error:", error); // Debug log
      setBackendErrors(error?.response?.data?.errors || {});
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = handleSubmit((data) => {
    console.log("Save draft clicked with data:", data); // Debug log
    saveData(data, false);
  });

  const handleNext = handleSubmit((data) => {
    console.log("Next clicked with data:", data); // Debug log
    if (!hasChanges) {
      onNext(data);
      return;
    }
    saveData(data, true);
  });

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setSameAsLocal(checked);
    if (!checked) {
      setValue("permanent", {});
      // Trigger validation after clearing values
      trigger("permanent");
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleNext();
      }}
      className="max-w-4xl mx-auto p-6"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Address Details</h2>

      {saving && (
        <p className="text-blue-600 text-sm mb-4 animate-pulse">Saving...</p>
      )}
      {saveSuccess && (
        <p className="text-green-600 text-sm mb-4">
          ✓ Draft saved successfully
        </p>
      )}
      {Object.keys(backendErrors).length > 0 && (
        <div className="text-red-600 text-sm mb-4">
          {Object.values(backendErrors).join(", ")}
        </div>
      )}

      <div className="space-y-8">
        {/* Local Address Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Local Address (Kirandul)
          </h3>
          <AddressDetails
            onChange={(data) => {
              setValue("local", data);
              trigger("local"); // Trigger validation after value change
            }}
            values={formValues.local}
            errors={errors.local}
          />
        </div>

        {/* Same as Local Checkbox */}
        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <input
            type="checkbox"
            id="sameAsLocal"
            checked={sameAsLocal}
            onChange={handleCheckboxChange}
            className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="sameAsLocal" className="text-gray-700 font-medium">
            Same as Local Address
          </label>
        </div>

        {/* Permanent Address Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Permanent Address
          </h3>
          <AddressDetails
            onChange={(data) => {
              setValue("permanent", data);
              trigger("permanent"); // Trigger validation after value change
            }}
            values={formValues.permanent}
            errors={errors.permanent}
            disabled={sameAsLocal}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={!hasChanges}
            className={`px-4 py-2 rounded ${
              hasChanges
                ? "bg-green-400 text-gray-800 hover:bg-gray-400 cursor-pointer"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            💾 Save Draft
          </button>

          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
          >
            Next ➡️
          </button>
        </div>
      </div>
    </form>
  );
};

export default AddressForm;
