import React from "react";
import { useForm, useFieldArray } from "react-hook-form";

const familyTypes = [
  "Spouse",
  "Child",
  "Father",
  "Father-in-law",
  "Mother",
  "Mother-in-law",
];

const titlesByType = {
  Spouse: ["Shri", "Smt."],
  Child: ["Mt.", "Ms."],
  Father: ["Shri"],
  "Father-in-law": ["Shri"],
  Mother: ["Smt."],
  "Mother-in-law": ["Smt."],
};

const FamilyDetailsForm = ({ onNext, defaultValues = [] }) => {
  const { register, control, handleSubmit, watch } = useForm({
    defaultValues: {
      familyMembers: defaultValues.length ? defaultValues : [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "familyMembers",
  });

  const onSubmit = (data) => {
    onNext(data.familyMembers);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Family Details</h2>

      <div className="mb-6">
        <button
          type="button"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center"
          onClick={() =>
            append({
              type: "",
              title: "",
              name: "",
              surname: "",
              aadhar: "",
              bloodGroup: "",
              dob: "",
              cityOfBirth: "",
              status: "",
              employmentDetails: "",
              gender: "",
            })
          }
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
          Add Family Member
        </button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600">
            No family members added yet. Click the button above to add family
            details.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {fields.map((member, index) => {
          const type = watch(`familyMembers[${index}].type`);
          const titles = titlesByType[type] || [];

          return (
            <div
              key={member.id}
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
                Family Member {index + 1}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Family Member Type
                  </label>
                  <select
                    {...register(`familyMembers[${index}].type`)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Type</option>
                    {familyTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <select
                    {...register(`familyMembers[${index}].title`)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Title</option>
                    {titles.map((title) => (
                      <option key={title} value={title}>
                        {title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    placeholder="Enter name"
                    {...register(`familyMembers[${index}].name`)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Surname
                  </label>
                  <input
                    placeholder="Enter surname"
                    {...register(`familyMembers[${index}].surname`)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aadhar Number
                  </label>
                  <input
                    placeholder="Enter Aadhar number"
                    {...register(`familyMembers[${index}].aadharNumber`)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Group
                  </label>
                  <input
                    placeholder="Enter blood group"
                    {...register(`familyMembers[${index}].bloodGroup`)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    {...register(`familyMembers[${index}].dob`)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City of Birth
                  </label>
                  <input
                    placeholder="Enter city of birth"
                    {...register(`familyMembers[${index}].cityOfBirth`)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Conditional Fields */}
                {type === "Spouse" && (
                  <>
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Spouse Status
                      </label>
                      <select
                        {...register(
                          `familyMembers[${index}].employmentStatus`
                        )}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Status</option>
                        <option value="Working">Working</option>
                        <option value="Not-Working">Not-Working</option>
                      </select>
                    </div>

                    {watch(`familyMembers[${index}].employmentStatus`) ===
                      "Working" && (
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Employment Details
                        </label>
                        <input
                          placeholder="Enter employment details"
                          {...register(
                            `familyMembers[${index}].employmentDetails`
                          )}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}
                  </>
                )}

                {type === "Child" && (
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      {...register(`familyMembers[${index}].gender`)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          );
        })}
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

export default FamilyDetailsForm;
