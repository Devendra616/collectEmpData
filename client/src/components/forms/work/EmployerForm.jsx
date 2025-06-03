import React from "react";
import { useFormContext } from "react-hook-form";

const industries = [
  "Autonomous Bodies",
  "Central govt.",
  "Indian Armed Forces",
  "NGO",
  "Private",
  "PSU central",
  "PSU state",
  "State govt",
];

const EmployerForm = ({ index, onRemove }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm bg-white p-6 relative">
      {onRemove && (
        <div className="absolute top-4 right-4">
          <button
            type="button"
            className="text-red-600 hover:text-red-800 transition-colors duration-200"
            onClick={() => onRemove(index)}
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
      )}

      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Employer {index + 1}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employer's Name
          </label>
          <input
            {...register(`employers.${index}.name`, {
              required: "Employer name is required",
            })}
            placeholder="Enter employer's name"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.employers?.[index]?.name && (
            <p className="text-red-600 text-sm mt-1">
              {errors.employers[index].name.message}
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            {...register(`employers.${index}.city`)}
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
            {...register(`employers.${index}.startDate`)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Relieving Date
          </label>
          <input
            type="date"
            {...register(`employers.${index}.relievingDate`)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Industry
          </label>
          <select
            {...register(`employers.${index}.industry`)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Industry</option>
            {industries.map((ind, idx) => (
              <option key={idx} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Designation
          </label>
          <input
            {...register(`employers.${index}.designation`)}
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
            {...register(`employers.${index}.grossSalary`)}
            placeholder="Enter gross salary"
            type="number"
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
            {...register(`employers.${index}.numberOfMonths`)}
            placeholder="Enter number of months"
            type="number"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Years
          </label>
          <input
            {...register(`employers.${index}.numberOfYears`)}
            placeholder="Enter number of years"
            type="number"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default EmployerForm;
