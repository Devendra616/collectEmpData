import React from "react";
import { useForm, useFieldArray } from "react-hook-form";

const industryOptions = [
  "Autonomous Bodies",
  "Central govt.",
  "Indian Armed Forces",
  "NGO",
  "Private",
  "PSU central",
  "PSU state",
  "State govt",
];

const WorkExperienceForm = ({ onNext }) => {
  const { control, register, handleSubmit } = useForm({
    defaultValues: {
      employers: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "employers",
  });

  const onSubmit = (data) => {
    onNext(data.employers);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Work Experience</h2>
      <p className="text-gray-600 mb-6">
        Add your previous employer details (up to 5)
      </p>

      <div className="mb-6">
        {fields.length < 5 && (
          <button
            type="button"
            onClick={() => append({})}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Employer
          </button>
        )}
      </div>

      {fields.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600">
            No work experience added yet. Click the button above to add your
            work experience.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="border border-gray-200 rounded-lg shadow-sm bg-white p-6 relative"
          >
            <div className="absolute top-4 right-4">
              <button
                type="button"
                className="text-red-600 hover:text-red-800 transition-colors duration-200"
                onClick={() => remove(index)}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Employer {index + 1}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employer's Name
                </label>
                <input
                  {...register(`employers.${index}.employerName`, {
                    required: true,
                  })}
                  placeholder="Enter employer's name"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  {...register(`employers.${index}.city`, { required: true })}
                  placeholder="Enter city"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  {...register(`employers.${index}.startDate`, {
                    required: true,
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relieving Date
                </label>
                <input
                  type="date"
                  {...register(`employers.${index}.relievingDate`, {
                    required: true,
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <select
                  {...register(`employers.${index}.industry`, {
                    required: true,
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Industry</option>
                  {industryOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Designation
                </label>
                <input
                  {...register(`employers.${index}.designation`, {
                    required: true,
                  })}
                  placeholder="Enter designation"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scale on Leaving
                </label>
                <input
                  {...register(`employers.${index}.scaleOnLeaving`)}
                  placeholder="Enter scale on leaving"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Leaving
                </label>
                <input
                  {...register(`employers.${index}.reasonForLeaving`)}
                  placeholder="Enter reason for leaving"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gross Salary
                </label>
                <input
                  type="number"
                  {...register(`employers.${index}.grossSalary`)}
                  placeholder="Enter gross salary"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Greenfield
                </label>
                <input
                  {...register(`employers.${index}.greenfield`)}
                  placeholder="Enter greenfield"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Months
                </label>
                <input
                  type="number"
                  {...register(`employers.${index}.numberOfMonths`)}
                  placeholder="Enter number of months"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Years
                </label>
                <input
                  type="number"
                  {...register(`employers.${index}.numberOfYears`)}
                  placeholder="Enter number of years"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Save and Continue
        </button>
      </div>
    </form>
  );
};

export default WorkExperienceForm;
