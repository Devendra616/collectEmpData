import React, { useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";

const AddressDetails = ({ onChange, values = {}, disabled = false }) => {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address Line 1
        </label>
        <input
          {...register("addressLine1")}
          placeholder="Enter address line 1"
          className={`w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
            disabled ? "bg-gray-100" : ""
          }`}
          disabled={disabled}
        />
      </div>

      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address Line 2
        </label>
        <input
          {...register("addressLine2")}
          placeholder="Enter address line 2"
          className={`w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
            disabled ? "bg-gray-100" : ""
          }`}
          disabled={disabled}
        />
      </div>

      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          City
        </label>
        <input
          {...register("city")}
          placeholder="Enter city"
          className={`w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
            disabled ? "bg-gray-100" : ""
          }`}
          disabled={disabled}
        />
      </div>

      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          District
        </label>
        <input
          {...register("district")}
          placeholder="Enter district"
          className={`w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
            disabled ? "bg-gray-100" : ""
          }`}
          disabled={disabled}
        />
      </div>

      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          State
        </label>
        <input
          {...register("state")}
          placeholder="Enter state"
          className={`w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
            disabled ? "bg-gray-100" : ""
          }`}
          disabled={disabled}
        />
      </div>

      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Pincode
        </label>
        <input
          {...register("pincode")}
          placeholder="Enter pincode"
          className={`w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
            disabled ? "bg-gray-100" : ""
          }`}
          disabled={disabled}
        />
      </div>

      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Post Office
        </label>
        <input
          {...register("postOffice")}
          placeholder="Enter post office"
          className={`w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
            disabled ? "bg-gray-100" : ""
          }`}
          disabled={disabled}
        />
      </div>

      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Police Station
        </label>
        <input
          {...register("policeStation")}
          placeholder="Enter police station"
          className={`w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
            disabled ? "bg-gray-100" : ""
          }`}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default AddressDetails;
