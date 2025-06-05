import React, { useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";

const AddressDetails = ({
  onChange,
  values = {},
  disabled = false,
  errors = {},
}) => {
  const { register, watch, setValue } = useForm();
  const timeoutRef = useRef(null);
  const prevDataRef = useRef({});

  // ✅ Sync external values into form inputs
  useEffect(() => {
    if (values && Object.keys(values).length > 0) {
      Object.entries(values).forEach(([key, val]) => {
        setValue(key, val);
      });
    }
  }, [values, setValue]);

  // Debounced change handler
  const debouncedOnChange = useCallback(
    (data) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        const prevData = prevDataRef.current;
        const hasChanged = Object.keys(data).some(
          (key) => data[key] !== prevData[key]
        );

        if (hasChanged) {
          prevDataRef.current = data;
          onChange(data);
        }
      }, 300); // 300ms debounce
    },
    [onChange]
  );

  // Watch all fields but debounce the changes
  useEffect(() => {
    const subscription = watch((data) => {
      debouncedOnChange(data);
    });

    return () => {
      subscription.unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [watch, debouncedOnChange]);

  const renderField = (name, label, placeholder) => (
    <div className="form-group">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        {...register(name)}
        placeholder={placeholder}
        className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
          errors[name] ? "border-red-500" : "border-gray-300"
        } ${disabled ? "bg-gray-100" : ""}`}
        disabled={disabled}
      />
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600">{errors[name].message}</p>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {renderField("addressLine1", "Address Line 1", "Enter address line 1")}
      {renderField("addressLine2", "Address Line 2", "Enter address line 2")}
      {renderField("city", "City", "Enter city")}
      {renderField("district", "District", "Enter district")}
      {renderField("state", "State", "Enter state")}
      {renderField("pincode", "Pincode", "Enter pincode")}
      {renderField("postOffice", "Post Office", "Enter post office")}
      {renderField("policeStation", "Police Station", "Enter police station")}
    </div>
  );
};

export default AddressDetails;
