import React from "react";

const AddressDetails = ({
  disabled = false,
  errors = {},
  backendErrors = {},
  index,
  register,
  watch,
}) => {
  const getErrorClass = (fieldName) => {
    const hasError = errors?.[fieldName] || backendErrors?.[fieldName];
    return `w-full p-2 border ${
      hasError ? "border-red-500" : "border-gray-300"
    } rounded-md focus:ring-blue-500 focus:border-blue-500 ${
      disabled ? "bg-gray-100" : ""
    }`;
  };

  const renderError = (fieldName) => {
    const error = errors?.[fieldName] || backendErrors?.[fieldName];
    if (!error) return null;
    return (
      <p className="mt-1 text-sm text-red-600">
        {typeof error === "string" ? error : error.message}
      </p>
    );
  };

  const renderField = (name, label, placeholder) => (
    <div className="form-group">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        {...register(`address.${index}.${name}`)}
        placeholder={placeholder}
        className={getErrorClass(name)}
        disabled={disabled}
      />
      {renderError(name)}
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
