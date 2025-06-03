import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import EducationEntry from "./EducationEntry";
import { saveSectionData } from "../../../services/formApi";
import { useAuth } from "../../../context/AuthContext";
// useEffect(()=>{

// })

const EducationDetailsForm = ({ onNext, defaultValues = [] }) => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      education: [],
    },
  });

  const {token, empData} = useAuth()

  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
  });

  const onSubmit = async(data) => {
    try{
      const education = data.education;
      const hasSaved = await saveSectionData("educationDetails", {education}, token)
      
      if(hasSaved){
        onNext(data.education);
        console.log("Education Data:", data.education);
  
      }else{
        console.error("Failed to save Education details")
      }
    }catch(error){
      console.error("Error in saving Education details:", error);
      
    }

  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="text-xl font-bold mb-4">Education Details</h2>

      <button
        type="button"
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded"
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
        + Add Education
      </button>

      {fields.length === 0 && <p className="mb-4 text-gray-600">No education added yet.</p>}

      {fields.map((item, index) => (
        <div
          key={item.id}
          className="border p-4 mb-4 rounded-lg shadow bg-gray-50"
        >
          <EducationEntry
            index={index}
            register={register}
            watch={watch}
            errors={errors}
          />
          <button
            type="button"
            className="bg-red-500 text-white border rounded-md px-2 py-1 mt-2"
            onClick={() => remove(index)}
          >
            Remove
          </button>
        </div>
      ))}

      <button
        type="submit"
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Next
      </button>
    </form>
  );
};

export default EducationDetailsForm;
