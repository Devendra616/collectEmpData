import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import languageOptions from "../../constants/languageOptions";
import { saveSectionData } from "../../services/formApi";
import { useAuth } from "../../context/AuthContext";

const schema = yup.object().shape({
  title: yup.string().required("Title is required"),
  firstName: yup.string().required("Name is required"),
  lastName: yup.string().required("Surname is required"),
  sapId: yup
    .string()
    .min(8, "Minimum 8 characters")
    .required("SAP ID is required"),
  gender: yup.string().required("Gender is required"),
  dob: yup.string().required("Date of Birth is required"),
  birthplace: yup.string().required("Birthplace is required"),
  state: yup.string().required("State is required"),
  religion: yup.string().required("Religion is required"),
  category: yup.string().required("Category is required"),
  subCategory: yup.string().required("Sub-category is required"),
  idMark1: yup.string().required("Identification Mark 1 is required"),
  idMark2: yup.string().required("Identification Mark 2 is required"),
  exServiceman: yup.string().required("This field is required"),
  adhaarId: yup
    .string()
    .matches(
      /^[2-9]{1}[0-9]{11}$/,
      "Aadhaar must be a 12-digit number starting with 2-9"
    )
    .required("Aadhaar ID is required"),
  mobile: yup
    .string()
    .matches(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits")
    .required("Mobile number is required"),
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required"),
  pwd: yup.string().required("This field is required"),
  motherTongue: yup.string().required("Mother Tongue is required"),
  hindiKnowledge: yup.string().required("This field is required"),
  langHindiRead: yup.boolean(),
  langHindiWrite: yup.boolean(),
  langHindiSpeak: yup.boolean(),
});

const PersonalDetailsForm = ({ onNext }) => {
  const [age, setAge] = useState(null);

  const { token, empData } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const dob = watch("dob");
  const motherTongue = watch("motherTongue");

  // useEffect(()=>{
  //   if (empData && empData.data) {
  //     const formValues = getInitialFormValues(empData);
  //     reset(formValues);
  //   }
  // },[])

  useEffect(() => {
    if (!dob) {
      if (age !== null) setAge(null);
      return;
    }

    const birthDate = new Date(dob);
    const ageDiff = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDiff);
    const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);

    if (calculatedAge !== age) {
      setAge(calculatedAge);
    }
  }, [dob, age]);

  useEffect(() => {
    if (empData && empData.pData) {
      const formValues = getInitialFormValues(empData);
      reset(formValues);
    }
  }, [empData, reset]);

  const getInitialFormValues = (empData) => {
    if (!empData || !empData.pData) return {};

    return {
      title: empData.pData.title || "",
      firstName: empData.pData.firstName || "",
      lastName: empData.pData.lastName || "",
      sapId: empData.emp?.sapId || "",
      adhaarId: empData.pData.adhaarId || "",
      birthplace: empData.pData.birthplace || "",
      category: empData.pData.category || "",
      dob: empData.pData.dob || "",
      email: empData.emp?.email || "",
      exServiceman: empData.pData.exServiceman || "",
      gender: empData.pData.gender || "",
      hindiKnowledge: empData.pData.hindiKnowledge || "",
      idMark1: empData.pData.idMark1 || "",
      idMark2: empData.pData.idMark2 || "",
      langHindiRead: empData.pData.langHindiRead || false,
      langHindiSpeak: empData.pData.langHindiSpeak || false,
      langHindiWrite: empData.pData.langHindiWrite || false,
      mobile: empData.pData.mobile || "",
      motherTongue: empData.pData.motherTongue || "",
      pwd: empData.pData.pwd || "",
      religion: empData.pData.religion || "",
      state: empData.pData.state || "",
      subCategory: empData.pData.subCategory || "",
    };
  };

  const onSubmit = async (data) => {
    try {
      const hasSaved = await saveSectionData("personalDetails", data, token);

      if (hasSaved) {
        onNext(data);
        console.log("Section 1 Data", data);
      } else {
        console.error("Failed to save Personal Details");
      }
    } catch (error) {
      console.error("Error in saving personal details:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-4xl mx-auto p-6 bg-white shadow rounded space-y-6"
    >
      <h2 className="text-2xl font-semibold mb-4">Personal Details</h2>

      {/* Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div>
          <label className="block font-medium">Title</label>
          <select className="w-full border rounded p-2" {...register("title")}>
            <option value="">Select</option>
            <option value="Shri">Shri</option>
            <option value="Smt">Smt</option>
            <option value="Ms">Ms</option>
          </select>
          <p className="text-red-500 text-sm">{errors.title?.message}</p>
        </div>

        <div>
          <label className="block font-medium">FirstName</label>
          <input
            className="w-full border rounded p-2"
            {...register("firstName")}
            placeholder="First Name"
          />
          <p className="text-red-500 text-sm">{errors.name?.message}</p>
        </div>

        <div>
          <label className="block font-medium">LastName</label>
          <input
            className="w-full border rounded p-2"
            {...register("lastName")}
            placeholder="Last Name"
          />
          <p className="text-red-500 text-sm">{errors.surname?.message}</p>
        </div>

        <div>
          <label className="block font-medium">SAP ID</label>
          <input
            className="w-full border rounded p-2"
            {...register("sapId")}
            placeholder="SAP ID"
          />
          <p className="text-red-500 text-sm">{errors.sapId?.message}</p>
        </div>

        <div className="flex flex-col">
          <label className="block font-medium mb-1">Gender</label>
          <div className="space-x-4">
            <label>
              <input type="radio" value="Male" {...register("gender")} /> Male
            </label>
            <label>
              <input type="radio" value="Female" {...register("gender")} />{" "}
              Female
            </label>
          </div>
          <p className="text-red-500 text-sm">{errors.gender?.message}</p>
        </div>

        <div>
          <label className="block font-medium">Date of Birth</label>
          <input
            className="w-full border rounded p-2"
            type="date"
            {...register("dob")}
          />
          {age !== null && (
            <p className="text-green-600 text-sm">Age: {age} years</p>
          )}
          <p className="text-red-500 text-sm">{errors.dob?.message}</p>
        </div>

        <div>
          <label className="block font-medium">Birth Place</label>
          <input
            className="w-full border rounded p-2"
            {...register("birthplace")}
            placeholder="Birthplace"
          />
          <p className="text-red-500 text-sm">{errors.birthplace?.message}</p>
        </div>

        <div>
          <label className="block font-medium">State</label>
          <input
            className="w-full border rounded p-2"
            {...register("state")}
            placeholder="State"
          />
          <p className="text-red-500 text-sm">{errors.state?.message}</p>
        </div>

        <div>
          <label className="block font-medium">Religion</label>
          <input
            className="w-full border rounded p-2"
            {...register("religion")}
            placeholder="Religion"
          />
          <p className="text-red-500 text-sm">{errors.religion?.message}</p>
        </div>

        <div>
          <label className="block font-medium">Category</label>
          <input
            className="w-full border rounded p-2"
            {...register("category")}
            placeholder="Category"
          />
          <p className="text-red-500 text-sm">{errors.category?.message}</p>
        </div>

        <div>
          <label className="block font-medium">Sub-Category</label>
          <input
            className="w-full border rounded p-2"
            {...register("subCategory")}
            placeholder="Sub-Category"
          />
          <p className="text-red-500 text-sm">{errors.subCategory?.message}</p>
        </div>

        <div>
          <label className="block font-medium">Identification Mark 1</label>
          <input
            className="w-full border rounded p-2"
            {...register("idMark1")}
            placeholder="Identification Mark 1"
          />
          <p className="text-red-500 text-sm">{errors.idMark1?.message}</p>
        </div>

        <div>
          <label className="block font-medium">Identification Mark 2</label>
          <input
            className="w-full border rounded p-2"
            {...register("idMark2")}
            placeholder="Identification Mark 2"
          />
          <p className="text-red-500 text-sm">{errors.idMark2?.message}</p>
        </div>

        <div>
          <label className="block font-medium">Ex-Serviceman</label>
          <select
            className="w-full border rounded p-2"
            {...register("exServiceman")}
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
          <p className="text-red-500 text-sm">{errors.exServiceman?.message}</p>
        </div>

        <div>
          <label className="block font-medium">Adhaar Number</label>
          <input
            className="w-full border rounded p-2"
            {...register("adhaarId")}
            placeholder="Aadhar ID"
          />
          <p className="text-red-500 text-sm">{errors.adhaarId?.message}</p>
        </div>

        <div>
          <label className="block font-medium">Mobile Number</label>
          <input
            type="number"
            className="w-full border rounded p-2"
            {...register("mobile")}
            placeholder="Mobile Number"
          />
          <p className="text-red-500 text-sm">{errors.mobile?.message}</p>
        </div>

        <div>
          <label className="block font-medium">Email</label>
          <input
            className="w-full border rounded p-2"
            type="email"
            {...register("email")}
            placeholder="example@domain.com"
          />
          <p className="text-red-500 text-sm">{errors.email?.message}</p>
        </div>

        <div>
          <label className="block font-medium">Person with Disability</label>
          <select className="w-full border rounded p-2" {...register("pwd")}>
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
          <p className="text-red-500 text-sm">{errors.pwd?.message}</p>
        </div>

        <div>
          <label className="block font-medium">Mother Tongue</label>
          <select
            className="w-full border rounded p-2"
            {...register("motherTongue")}
          >
            <option value="">Select</option>
            {languageOptions.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          <p className="text-red-500 text-sm">{errors.motherTongue?.message}</p>
        </div>

        {motherTongue === "OTHER" && (
          <input
            className="w-full border rounded p-2"
            {...register("otherMotherTongue")}
            placeholder="Please specify"
          />
        )}

        <div>
          <label className="block font-medium">
            Working knowledge in Hindi?
          </label>
          <select
            className="w-full border rounded p-2"
            {...register("hindiKnowledge")}
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
          <p className="text-red-500 text-sm">
            {errors.hindiKnowledge?.message}
          </p>
        </div>

        <div className="col-span-2">
          <label className="block font-medium mb-1">
            Hindi Language Skills
          </label>
          <div className="space-x-4">
            <label>
              <input type="checkbox" {...register("langHindiRead")} /> Read
            </label>
            <label>
              <input type="checkbox" {...register("langHindiWrite")} /> Write
            </label>
            <label>
              <input type="checkbox" {...register("langHindiSpeak")} /> Speak
            </label>
          </div>
        </div>
      </div>

      <div className="text-right">
        <button
          type="submit"
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default PersonalDetailsForm;
