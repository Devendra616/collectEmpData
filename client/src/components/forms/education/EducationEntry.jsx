import React from "react";

const EducationEntry = ({ index, register, watch, errors, backendErrors }) => {
  const educationType = watch(`education[${index}].educationType`);

  const getErrorClass = (fieldName) => {
    const hasError = errors?.[fieldName] || backendErrors?.[fieldName];
    return `w-full p-2 border ${
      hasError ? "border-red-500" : "border-gray-300"
    } rounded-md focus:ring-blue-500 focus:border-blue-500`;
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
          >
            <option value="">Select</option>
            <option value="10TH">10th Class</option>
            <option value="12TH">12th Class</option>
            <option value="GRAD">Graduation / Diploma / ITI</option>
            <option value="POSTGRAD">Post-graduation / PhD</option>
            <option value="CERTIFICATE">Course Certificate / Others</option>
          </select>
          {renderError("educationType")}
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Institute Name <span className="text-red-500">*</span>
          </label>
          <input
            placeholder="Enter institute name"
            {...register(`education[${index}].instituteName`)}
            className={getErrorClass("instituteName")}
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
          >
            <option value="">Select Certificate Type</option>
            <option value="REGULAR">Regular</option>
            <option value="CORRESPONDANCE">Correspondance</option>
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
          />
          {renderError("grade")}
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Medium of Education
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="ENGLISH"
                {...register(`education[${index}].medium`)}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2">English</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="HINDI"
                {...register(`education[${index}].medium`)}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2">Hindi</span>
            </label>
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
          >
            <option value="">Select Level</option>
            <option value="FIRST">1st Language</option>
            <option value="SECOND">2nd Language</option>
            <option value="THIRD">3rd Language</option>
            <option value="NONE">None</option>
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
            className={getErrorClass("startDate")}
          />
          {renderError("passingDate")}
        </div>
      </div>
    </div>
  );
};

export default EducationEntry;
