import React from "react";
import {
  education,
  certficateTypeOptions,
  hindiSubjectLevels,
  licenseTypes,
  mediumOptions,
} from "../../../constants";

const EducationEntry = ({
  index,
  register,
  watch,
  errors,
  backendErrors,
  readOnly = false,
}) => {
  const educationType = watch(`education[${index}].educationType`);

  const getErrorClass = (fieldName) => {
    const hasError = errors?.[fieldName] || backendErrors?.[fieldName];
    return `w-full p-2 border ${
      hasError ? "border-red-500" : "border-gray-300"
    } rounded-md focus:ring-blue-500 focus:border-blue-500 ${
      readOnly ? "bg-gray-100" : ""
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

  return (
    <div className="education-entry space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Education Type <span className="text-red-500">*</span>
          </label>
          <select
            {...register(`education[${index}].educationType`)}
            className={getErrorClass("educationType")}
            disabled={readOnly}
          >
            <option value="">Select</option>
            {education.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {renderError("educationType")}
        </div>
        {educationType !== "LICENSE" && (
          <>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Institute Name <span className="text-red-500">*</span>
              </label>
              <input
                placeholder="Enter institute name"
                {...register(`education[${index}].instituteName`)}
                className={getErrorClass("instituteName")}
                disabled={readOnly}
              />
              {renderError("instituteName")}
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Certificate Type <span className="text-red-500">*</span>
              </label>
              <select
                {...register(`education[${index}].certificateType`)}
                className={getErrorClass("certificateType")}
                disabled={readOnly}
              >
                <option value="">Select Certificate Type</option>
                {certficateTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {renderError("certificateType")}
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (years)
              </label>
              <input
                type="number"
                step={0.1}
                min={0}
                placeholder="Enter duration"
                {...register(`education[${index}].duration`)}
                className={getErrorClass("duration")}
                disabled={readOnly}
              />
              {renderError("duration")}
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Final Grade <span className="text-red-500">*</span>
              </label>
              <input
                placeholder="Enter final grade"
                {...register(`education[${index}].grade`)}
                className={getErrorClass("grade")}
                disabled={readOnly}
              />
              {renderError("grade")}
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medium of Education
              </label>
              <div className="flex space-x-4">
                {mediumOptions.map((opt) => (
                  <label key={opt.value} className="inline-flex items-center">
                    <input
                      type="radio"
                      value={opt.value}
                      {...register(`education[${index}].medium`)}
                      className="form-radio h-4 w-4 text-blue-600"
                      disabled={readOnly}
                    />
                    <span className="ml-2">{opt.label}</span>
                  </label>
                ))}
              </div>
              {renderError("medium")}
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hindi Subject Level
              </label>
              <select
                {...register(`education[${index}].hindiSubjectLevel`)}
                className={getErrorClass("hindiSubjectLevel")}
                disabled={readOnly}
              >
                <option value="">Select Level</option>
                {hindiSubjectLevels.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {renderError("hindiSubjectLevel")}
            </div>
            {(educationType === "GRAD" ||
              educationType === "POSTGRAD" ||
              educationType === "CERTIFICATE") && (
              <>
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Details
                  </label>
                  <input
                    placeholder="Enter course details"
                    {...register(`education[${index}].courseDetails`)}
                    className={getErrorClass("courseDetails")}
                    disabled={readOnly}
                  />
                  {renderError("courseDetails")}
                </div>
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization <span className="text-red-500">*</span>
                  </label>
                  <input
                    placeholder="Enter specialization"
                    {...register(`education[${index}].specialization`)}
                    className={getErrorClass("specialization")}
                    disabled={readOnly}
                  />
                  {renderError("specialization")}
                </div>
              </>
            )}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Starting Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register(`education[${index}].startDate`)}
                className={getErrorClass("startDate")}
                disabled={readOnly}
              />
              {renderError("startDate")}
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Passing Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register(`education[${index}].passingDate`)}
                className={getErrorClass("passingDate")}
                disabled={readOnly}
              />
              {renderError("passingDate")}
            </div>
          </>
        )}

        {educationType === "LICENSE" && (
          <>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Type <span className="text-red-500">*</span>
              </label>
              <select
                {...register(`education[${index}].licenseType`)}
                className={getErrorClass("licenseType")}
                disabled={readOnly}
              >
                <option value="">Select License Type</option>
                {licenseTypes.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {renderError("licenseType")}
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Number <span className="text-red-500">*</span>
              </label>
              <input
                placeholder="Enter license number"
                {...register(`education[${index}].licenseNumber`)}
                className={getErrorClass("licenseNumber")}
                disabled={readOnly}
              />
              {renderError("licenseNumber")}
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register(`education[${index}].licenseIssueDate`)}
                className={getErrorClass("issueDate")}
                disabled={readOnly}
              />
              {renderError("licenseIssueDate")}
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Expiry (if any)
              </label>
              <input
                type="date"
                {...register(`education[${index}].licenseExpiryDate`)}
                className={getErrorClass("expiryDate")}
                disabled={readOnly}
              />
              {renderError("licenseExpiryDate")}
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issuing Authority <span className="text-red-500">*</span>
              </label>
              <input
                placeholder="Enter issuing authority"
                {...register(`education[${index}].licenseIssuingAuthority`)}
                className={getErrorClass("issuingAuthority")}
                disabled={readOnly}
              />
              {renderError("licenseIssuingAuthority")}
            </div>

            <div className="form-group md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Other License Details
              </label>
              <textarea
                placeholder="Enter other details of License"
                rows={3}
                {...register(`education[${index}].licenseOtherDetails`)}
                className={getErrorClass("otherDetails")}
                disabled={readOnly}
              />
              {renderError("licenseOtherDetails")}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EducationEntry;
