import React from "react";

const EducationEntry = ({ index, register, watch, errors }) => {
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
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select</option>
            <option value="10TH">10th Class</option>
            <option value="12TH">12th Class</option>
            <option value="GRAD">Graduation / Diploma / ITI</option>
            <option value="POSTGRAD">Post-graduation / PhD</option>
            <option value="CERTIFICATE">Course Certificate / Others</option>
          </select>
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Institute Name
          </label>
          <input
            placeholder="Enter institute name"
            {...register(`education[${index}].instituteName`)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Certificate Type
          </label>
          <select
            {...register(`education[${index}].certificateType`)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Certificate Type</option>
            <option value="REGULAR">Regular</option>
            <option value="CORRESPONDANCE">Correspondance</option>
          </select>
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration (years)
          </label>
          <input
            type="number"
            placeholder="Enter duration"
            {...register(`education[${index}].duration`)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Final Grade
          </label>
          <input
            placeholder="Enter final grade"
            {...register(`education[${index}].grade`)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
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
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hindi Subject Level
          </label>
          <select
            {...register(`education[${index}].hindiSubjectLevel`)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Level</option>
            <option value="FIRST">1st Language</option>
            <option value="SECOND">2nd Language</option>
            <option value="THIRD">3rd Language</option>
            <option value="NONE">None</option>
          </select>
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
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialization
              </label>
              <input
                placeholder="Enter specialization"
                {...register(`education[${index}].specialization`)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
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
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Passing Date
          </label>
          <input
            type="date"
            {...register(`education[${index}].passingDate`)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default EducationEntry;
