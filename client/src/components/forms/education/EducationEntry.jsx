import React from "react";

const EducationEntry = ({ index, register, watch, errors, backendErrors }) => {
  const educationType = watch(`education[${index}].educationType`);

  return (
    <div className="education-entry space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Education Type
          </label>
          <select
            {...register(`education[${index}].educationType`)}
            className={`w-full p-2 border ${
              errors?.educationType || backendErrors?.educationType
                ? "border-red-500"
                : "border-gray-300"
            } rounded-md focus:ring-blue-500 focus:border-blue-500`}
          >
            <option value="">Select</option>
            <option value="10TH">10th Class</option>
            <option value="12TH">12th Class</option>
            <option value="GRAD">Graduation / Diploma / ITI</option>
            <option value="POSTGRAD">Post-graduation / PhD</option>
            <option value="CERTIFICATE">Course Certificate / Others</option>
          </select>
          {errors?.educationType && (
            <p className="mt-1 text-sm text-red-600">
              {errors.educationType.message}
            </p>
          )}
          {backendErrors?.educationType && (
            <p className="mt-1 text-sm text-red-600">
              {backendErrors.educationType}
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Institute Name
          </label>
          <input
            placeholder="Enter institute name"
            {...register(`education[${index}].instituteName`)}
            className={`w-full p-2 border ${
              errors?.instituteName || backendErrors?.instituteName
                ? "border-red-500"
                : "border-gray-300"
            } rounded-md focus:ring-blue-500 focus:border-blue-500`}
          />
          {errors?.instituteName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.instituteName.message}
            </p>
          )}
          {backendErrors?.instituteName && (
            <p className="mt-1 text-sm text-red-600">
              {backendErrors.instituteName}
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Certificate Type
          </label>
          <select
            {...register(`education[${index}].certificateType`)}
            className={`w-full p-2 border ${
              errors?.certificateType || backendErrors?.certificateType
                ? "border-red-500"
                : "border-gray-300"
            } rounded-md focus:ring-blue-500 focus:border-blue-500`}
          >
            <option value="">Select Certificate Type</option>
            <option value="REGULAR">Regular</option>
            <option value="CORRESPONDANCE">Correspondance</option>
          </select>
          {errors?.certificateType && (
            <p className="mt-1 text-sm text-red-600">
              {errors.certificateType.message}
            </p>
          )}
          {backendErrors?.certificateType && (
            <p className="mt-1 text-sm text-red-600">
              {backendErrors.certificateType}
            </p>
          )}
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
            className={`w-full p-2 border ${
              errors?.duration || backendErrors?.duration
                ? "border-red-500"
                : "border-gray-300"
            } rounded-md focus:ring-blue-500 focus:border-blue-500`}
          />
          {errors?.duration && (
            <p className="mt-1 text-sm text-red-600">
              {errors.duration.message}
            </p>
          )}
          {backendErrors?.duration && (
            <p className="mt-1 text-sm text-red-600">
              {backendErrors.duration}
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Final Grade
          </label>
          <input
            placeholder="Enter final grade"
            {...register(`education[${index}].grade`)}
            className={`w-full p-2 border ${
              errors?.grade || backendErrors?.grade
                ? "border-red-500"
                : "border-gray-300"
            } rounded-md focus:ring-blue-500 focus:border-blue-500`}
          />
          {errors?.grade && (
            <p className="mt-1 text-sm text-red-600">{errors.grade.message}</p>
          )}
          {backendErrors?.grade && (
            <p className="mt-1 text-sm text-red-600">{backendErrors.grade}</p>
          )}
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
          {errors?.medium && (
            <p className="mt-1 text-sm text-red-600">{errors.medium.message}</p>
          )}
          {backendErrors?.medium && (
            <p className="mt-1 text-sm text-red-600">{backendErrors.medium}</p>
          )}
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hindi Subject Level
          </label>
          <select
            {...register(`education[${index}].hindiSubjectLevel`)}
            className={`w-full p-2 border ${
              errors?.hindiSubjectLevel || backendErrors?.hindiSubjectLevel
                ? "border-red-500"
                : "border-gray-300"
            } rounded-md focus:ring-blue-500 focus:border-blue-500`}
          >
            <option value="">Select Level</option>
            <option value="FIRST">1st Language</option>
            <option value="SECOND">2nd Language</option>
            <option value="THIRD">3rd Language</option>
            <option value="NONE">None</option>
          </select>
          {errors?.hindiSubjectLevel && (
            <p className="mt-1 text-sm text-red-600">
              {errors.hindiSubjectLevel.message}
            </p>
          )}
          {backendErrors?.hindiSubjectLevel && (
            <p className="mt-1 text-sm text-red-600">
              {backendErrors.hindiSubjectLevel}
            </p>
          )}
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
                className={`w-full p-2 border ${
                  errors?.courseDetails || backendErrors?.courseDetails
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors?.courseDetails && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.courseDetails.message}
                </p>
              )}
              {backendErrors?.courseDetails && (
                <p className="mt-1 text-sm text-red-600">
                  {backendErrors.courseDetails}
                </p>
              )}
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialization
              </label>
              <input
                placeholder="Enter specialization"
                {...register(`education[${index}].specialization`)}
                className={`w-full p-2 border ${
                  errors?.specialization || backendErrors?.specialization
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors?.specialization && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.specialization.message}
                </p>
              )}
              {backendErrors?.specialization && (
                <p className="mt-1 text-sm text-red-600">
                  {backendErrors.specialization}
                </p>
              )}
            </div>
          </>
        )}

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Course Starting Date
          </label>
          <input
            type="date"
            {...register(`education[${index}].startDate`)}
            className={`w-full p-2 border ${
              errors?.startDate || backendErrors?.startDate
                ? "border-red-500"
                : "border-gray-300"
            } rounded-md focus:ring-blue-500 focus:border-blue-500`}
          />
          {errors?.startDate && (
            <p className="mt-1 text-sm text-red-600">
              {errors.startDate.message}
            </p>
          )}
          {backendErrors?.startDate && (
            <p className="mt-1 text-sm text-red-600">
              {backendErrors.startDate}
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Passing Date
          </label>
          <input
            type="date"
            {...register(`education[${index}].passingDate`)}
            className={`w-full p-2 border ${
              errors?.passingDate || backendErrors?.passingDate
                ? "border-red-500"
                : "border-gray-300"
            } rounded-md focus:ring-blue-500 focus:border-blue-500`}
          />
          {errors?.passingDate && (
            <p className="mt-1 text-sm text-red-600">
              {errors.passingDate.message}
            </p>
          )}
          {backendErrors?.passingDate && (
            <p className="mt-1 text-sm text-red-600">
              {backendErrors.passingDate}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EducationEntry;
