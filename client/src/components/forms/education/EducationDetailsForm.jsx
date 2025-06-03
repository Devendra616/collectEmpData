import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import EducationEntry from "./EducationEntry";
import { saveSectionData } from "../../../services/formApi";
import { useAuth } from "../../../context/AuthContext";

const EducationDetailsForm = ({ onNext }) => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      education: [],
    },
  });

  const { token } = useAuth();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
  });

  const onSubmit = async (data) => {
    try {
      const education = data.education;
      const hasSaved = await saveSectionData(
        "educationDetails",
        { education },
        token
      );

      if (hasSaved) {
        onNext(data.education);
        console.log("Education Data:", data.education);
      } else {
        console.error("Failed to save Education details");
      }
    } catch (error) {
      console.error("Error in saving Education details:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Education Details
      </h2>

      <div className="mb-6">
        <button
          type="button"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center"
          onClick={() =>
            append({
              educationType: "",
              instituteName: "",
              certificateType: "",
              duration: "",
              grade: "",
              medium: "",
              hindiSubjectLevel: "",
              startDate: "",
              passingDate: "",
              courseDetails: "",
              specialization: "",
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
          Add Education
        </button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600">
            No education details added yet. Click the button above to add your
            education details.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {fields.map((item, index) => (
          <div
            key={item.id}
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
              Education Entry {index + 1}
            </h3>
            <EducationEntry
              index={index}
              register={register}
              watch={watch}
              errors={errors}
            />
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

export default EducationDetailsForm;
