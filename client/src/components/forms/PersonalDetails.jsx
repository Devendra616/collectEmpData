import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { saveSectionData } from "../../services/formApi";
import { useAuth } from "../../context/AuthContext";
import { useFormData } from "../../context/FormContext";
import { getAgeFromDOB } from "../../utils/getAge";
import languageOptions from "../../constants/languageOptions";

const schema = yup.object().shape({
  title: yup.string().required("Select your title"),
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  sapId: yup
    .string()
    .matches(/^[0-9]{8}$/, "Provide a valid SAP ID")
    .required("SAP ID is required"),
  gender: yup.string().required("Gender is required"),
  dob: yup
    .date()
    .transform((value, originalValue) =>
      originalValue ? new Date(originalValue) : null
    )
    .required("Date of Birth is required")
    .max(new Date(), "Date of Birth cannot be in the future")
    .test("min-age", "Age must be at least 18 years", function (dob) {
      if (!dob) return true;
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      const hasHadBirthday =
        today.getMonth() > dob.getMonth() ||
        (today.getMonth() === dob.getMonth() &&
          today.getDate() >= dob.getDate());

      return (hasHadBirthday ? age : age - 1) >= 18;
    }),
  birthplace: yup.string().required("Birthplace is required"),
  state: yup.string().required("State is required"),
  religion: yup.string().required("Religion is required"),
  category: yup.string().required("Category is required"),
  subCategory: yup.string().required("Sub-category is required"),
  // idMark1: yup.string().required("Identification Mark 1 is required"),
  // idMark2: yup.string().required("Identification Mark 2 is required"),
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
    .matches(
      /^[a-zA-Z0-9._%+-]+@nmdc\.co\.in$/,
      "Email must be a valid NMDC email"
    )
    .required("Email is required"),
  pwd: yup.string().required("Select Yes or No"),
  motherTongue: yup.string().required("Select your monther tongue"),
  hindiKnowledge: yup.string().required("Select Yes or No"),
  langHindiRead: yup.boolean(),
  langHindiWrite: yup.boolean(),
  langHindiSpeak: yup.boolean(),
});

const PersonalDetailsForm = ({ onNext, defaultValues }) => {
  const { token, empData } = useAuth();
  const { state: formState, dispatch } = useFormData();

  const [backendErrors, setBackendErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [age, setAge] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  console.log("FormContext state:", formState);
  console.log("AuthContext empData:", empData);
  console.log("Props defaultValues:", defaultValues);

  // Format date from ISO to YYYY-MM-DD
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // Get initial values from either FormContext or defaultValues
  const initialValues = {
    ...defaultValues,
    ...formState.personalDetails,
    sapId: empData?.emp?.sapId || defaultValues?.sapId || "",
    email: empData?.emp?.email || defaultValues?.email || "",
    dob: formatDate(formState.personalDetails?.dob || defaultValues?.dob),
  };

  console.log("Initial values for form:", initialValues);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialValues,
  });

  const dob = watch("dob");
  const motherTongue = watch("motherTongue");

  // Watch all form fields for changes
  const formValues = watch();

  useEffect(() => {
    console.log("Current form values:", formValues);
  }, [formValues]);

  useEffect(() => {
    if (dob) {
      const calculatedAge = getAgeFromDOB(dob);
      setAge(calculatedAge);
    }
  }, [dob]);

  // Track changes by comparing current values with default values
  useEffect(() => {
    if (!formValues || !initialValues) return;

    const hasFormChanges = Object.keys(formValues).some((key) => {
      // Skip comparing internal fields like _id, __v, etc.
      if (key.startsWith("_") || key === "__v") return false;
      return formValues[key] !== initialValues[key];
    });
    setHasChanges(hasFormChanges);
  }, [formValues, initialValues]);

  const saveData = async (data, proceed = false) => {
    console.log("saveData called with changes:", hasChanges);

    // If no changes, just proceed to next step without saving
    if (!hasChanges) {
      console.log("No changes detected, skipping save");
      if (proceed) onNext(data);
      return;
    }

    setSaving(true);
    setBackendErrors({});
    try {
      // Remove internal fields before saving
      const dataToSave = Object.fromEntries(
        Object.entries(data).filter(
          ([key]) => !key.startsWith("_") && key !== "__v"
        )
      );

      const res = await saveSectionData("personalDetails", dataToSave, token);
      if (res?.status === 400) {
        setBackendErrors(res.response?.data?.errors || {});
        return;
      }

      dispatch({
        type: "UPDATE_SECTION",
        section: "personalDetails",
        data: dataToSave,
      });

      if (proceed) onNext(dataToSave);
    } catch (error) {
      setBackendErrors(error?.response?.data?.errors || {});
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = handleSubmit((data) => {
    console.log("Save Draft clicked, hasChanges:", hasChanges);
    saveData(data, false);
  });

  const handleNext = handleSubmit((data) => {
    console.log("Next clicked, hasChanges:", hasChanges);
    if (!hasChanges) {
      console.log("No changes, proceeding to next step");
      onNext(data);
      return;
    }
    console.log("Changes detected, saving before proceeding");
    saveData(data, true);
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleNext();
      }}
      className="max-w-4xl mx-auto p-6 bg-white shadow rounded space-y-6"
    >
      <h2 className="text-2xl font-semibold mb-4">Personal Details</h2>

      {saving && (
        <p className="text-blue-600 text-sm mb-4 animate-pulse">Saving...</p>
      )}
      {Object.keys(backendErrors).length > 0 && (
        <div className="text-red-600 text-sm mb-4">
          {Object.values(backendErrors).join(", ")}
        </div>
      )}

      {/* Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div>
          <label className="block font-medium">Title</label>
          <select
            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.title || backendErrors.title
                ? "border-red-500"
                : "border-gray-300"
            }`}
            {...register("title")}
          >
            <option value="">Select</option>
            <option value="Shri">Shri</option>
            <option value="Smt">Smt</option>
            <option value="Ms">Ms</option>
          </select>
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
          {backendErrors.title && (
            <p className="mt-1 text-sm text-red-600">{backendErrors.title}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">First Name</label>
          <input
            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.firstName || backendErrors.firstName
                ? "border-red-500"
                : "border-gray-300"
            }`}
            {...register("firstName")}
            placeholder="First Name"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.firstName.message}
            </p>
          )}
          {backendErrors.firstName && (
            <p className="mt-1 text-sm text-red-600">
              {backendErrors.firstName}
            </p>
          )}
        </div>

        <div>
          <label className="block font-medium">Last Name</label>
          <input
            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.lastName || backendErrors.lastName
                ? "border-red-500"
                : "border-gray-300"
            }`}
            {...register("lastName")}
            placeholder="Last Name"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.lastName.message}
            </p>
          )}
          {backendErrors.lastName && (
            <p className="mt-1 text-sm text-red-600">
              {backendErrors.lastName}
            </p>
          )}
        </div>

        <div>
          <label className="block font-medium">SAP ID</label>
          <input
            className={`w-full border rounded-md p-2 bg-gray-100 focus:ring-blue-500 focus:border-blue-500 ${
              errors.sapId || backendErrors.sapId
                ? "border-red-500"
                : "border-gray-300"
            }`}
            {...register("sapId")}
            placeholder="SAP ID"
            readOnly
          />
          {errors.sapId && (
            <p className="mt-1 text-sm text-red-600">{errors.sapId.message}</p>
          )}
          {backendErrors.sapId && (
            <p className="mt-1 text-sm text-red-600">{backendErrors.sapId}</p>
          )}
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
          {errors.gender && (
            <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
          )}
          {backendErrors.gender && (
            <p className="mt-1 text-sm text-red-600">{backendErrors.gender}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">Date of Birth</label>
          <input
            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.dob || backendErrors.dob
                ? "border-red-500"
                : "border-gray-300"
            }`}
            type="date"
            max={new Date().toISOString().split("T")[0]}
            min="1960-01-01"
            {...register("dob")}
          />
          {age && (
            <p
              className={`text-sm ${
                age.years >= 18 ? "text-green-600" : "text-yellow-600"
              }`}
            >
              Age: {age.years} year{age.years !== 1 && "s"} {age.months} month
              {age.months !== 1 && "s"} {age.days} day{age.days !== 1 && "s"}
              {age.years < 18 && " (must be at least 18)"}
            </p>
          )}
          {errors.dob && (
            <p className="mt-1 text-sm text-red-600">{errors.dob.message}</p>
          )}
          {backendErrors.dob && (
            <p className="mt-1 text-sm text-red-600">{backendErrors.dob}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">Birth Place</label>
          <input
            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.birthplace || backendErrors.birthplace
                ? "border-red-500"
                : "border-gray-300"
            }`}
            {...register("birthplace")}
            placeholder="Birthplace"
          />
          {errors.birthplace && (
            <p className="mt-1 text-sm text-red-600">
              {errors.birthplace.message}
            </p>
          )}
          {backendErrors.birthplace && (
            <p className="mt-1 text-sm text-red-600">
              {backendErrors.birthplace}
            </p>
          )}
        </div>

        <div>
          <label className="block font-medium">State</label>
          <input
            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.state || backendErrors.state
                ? "border-red-500"
                : "border-gray-300"
            }`}
            {...register("state")}
            placeholder="State"
          />
          {errors.state && (
            <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
          )}
          {backendErrors.state && (
            <p className="mt-1 text-sm text-red-600">{backendErrors.state}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">Religion</label>
          <input
            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.religion || backendErrors.religion
                ? "border-red-500"
                : "border-gray-300"
            }`}
            {...register("religion")}
            placeholder="Religion"
          />
          {errors.religion && (
            <p className="mt-1 text-sm text-red-600">
              {errors.religion.message}
            </p>
          )}
          {backendErrors.religion && (
            <p className="mt-1 text-sm text-red-600">
              {backendErrors.religion}
            </p>
          )}
        </div>

        <div>
          <label className="block font-medium">Category</label>
          <input
            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.category || backendErrors.category
                ? "border-red-500"
                : "border-gray-300"
            }`}
            {...register("category")}
            placeholder="Category"
          />
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">
              {errors.category.message}
            </p>
          )}
          {backendErrors.category && (
            <p className="mt-1 text-sm text-red-600">
              {backendErrors.category}
            </p>
          )}
        </div>

        <div>
          <label className="block font-medium">Sub-Category</label>
          <input
            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.subCategory || backendErrors.subCategory
                ? "border-red-500"
                : "border-gray-300"
            }`}
            {...register("subCategory")}
            placeholder="Sub-Category"
          />
          {errors.subCategory && (
            <p className="mt-1 text-sm text-red-600">
              {errors.subCategory.message}
            </p>
          )}
          {backendErrors.subCategory && (
            <p className="mt-1 text-sm text-red-600">
              {backendErrors.subCategory}
            </p>
          )}
        </div>

        <div>
          <label className="block font-medium">Identification Mark 1</label>
          <input
            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.idMark1 || backendErrors.idMark1
                ? "border-red-500"
                : "border-gray-300"
            }`}
            {...register("idMark1")}
            placeholder="Identification Mark 1"
          />
          {errors.idMark1 && (
            <p className="mt-1 text-sm text-red-600">
              {errors.idMark1.message}
            </p>
          )}
          {backendErrors.idMark1 && (
            <p className="mt-1 text-sm text-red-600">{backendErrors.idMark1}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">Identification Mark 2</label>
          <input
            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.idMark2 || backendErrors.idMark2
                ? "border-red-500"
                : "border-gray-300"
            }`}
            {...register("idMark2")}
            placeholder="Identification Mark 2"
          />
          {errors.idMark2 && (
            <p className="mt-1 text-sm text-red-600">
              {errors.idMark2.message}
            </p>
          )}
          {backendErrors.idMark2 && (
            <p className="mt-1 text-sm text-red-600">{backendErrors.idMark2}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">Ex-Serviceman</label>
          <select
            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.exServiceman || backendErrors.exServiceman
                ? "border-red-500"
                : "border-gray-300"
            }`}
            {...register("exServiceman")}
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
          {errors.exServiceman && (
            <p className="mt-1 text-sm text-red-600">
              {errors.exServiceman.message}
            </p>
          )}
          {backendErrors.exServiceman && (
            <p className="mt-1 text-sm text-red-600">
              {backendErrors.exServiceman}
            </p>
          )}
        </div>

        <div>
          <label className="block font-medium">Adhaar Number</label>
          <input
            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.adhaarId || backendErrors.adhaarId
                ? "border-red-500"
                : "border-gray-300"
            }`}
            {...register("adhaarId")}
            placeholder="Aadhar ID"
          />
          {errors.adhaarId && (
            <p className="mt-1 text-sm text-red-600">
              {errors.adhaarId.message}
            </p>
          )}
          {backendErrors.adhaarId && (
            <p className="mt-1 text-sm text-red-600">
              {backendErrors.adhaarId}
            </p>
          )}
        </div>

        <div>
          <label className="block font-medium">Mobile Number</label>
          <input
            type="number"
            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.mobile || backendErrors.mobile
                ? "border-red-500"
                : "border-gray-300"
            }`}
            {...register("mobile")}
            placeholder="Mobile Number"
          />
          {errors.mobile && (
            <p className="mt-1 text-sm text-red-600">{errors.mobile.message}</p>
          )}
          {backendErrors.mobile && (
            <p className="mt-1 text-sm text-red-600">{backendErrors.mobile}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">Email</label>
          <input
            className={`w-full border rounded-md p-2 bg-gray-100 focus:ring-blue-500 focus:border-blue-500 ${
              errors.email || backendErrors.email
                ? "border-red-500"
                : "border-gray-300"
            }`}
            type="email"
            {...register("email")}
            placeholder="example@nmdc.co.in"
            readOnly
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
          {backendErrors.email && (
            <p className="mt-1 text-sm text-red-600">{backendErrors.email}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">Person with Disability</label>
          <select
            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.pwd || backendErrors.pwd
                ? "border-red-500"
                : "border-gray-300"
            }`}
            {...register("pwd")}
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
          {errors.pwd && (
            <p className="mt-1 text-sm text-red-600">{errors.pwd.message}</p>
          )}
          {backendErrors.pwd && (
            <p className="mt-1 text-sm text-red-600">{backendErrors.pwd}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">Mother Tongue</label>
          <select
            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.motherTongue || backendErrors.motherTongue
                ? "border-red-500"
                : "border-gray-300"
            }`}
            {...register("motherTongue")}
          >
            <option value="">Select</option>
            {languageOptions.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          {errors.motherTongue && (
            <p className="mt-1 text-sm text-red-600">
              {errors.motherTongue.message}
            </p>
          )}
          {backendErrors.motherTongue && (
            <p className="mt-1 text-sm text-red-600">
              {backendErrors.motherTongue}
            </p>
          )}
        </div>

        {motherTongue === "OTHER" && (
          <input
            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.otherMotherTongue || backendErrors.otherMotherTongue
                ? "border-red-500"
                : "border-gray-300"
            }`}
            {...register("otherMotherTongue")}
            placeholder="Please specify"
          />
        )}

        <div>
          <label className="block font-medium">
            Working knowledge in Hindi?
          </label>
          <select
            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.hindiKnowledge || backendErrors.hindiKnowledge
                ? "border-red-500"
                : "border-gray-300"
            }`}
            {...register("hindiKnowledge")}
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
          {errors.hindiKnowledge && (
            <p className="mt-1 text-sm text-red-600">
              {errors.hindiKnowledge.message}
            </p>
          )}
          {backendErrors.hindiKnowledge && (
            <p className="mt-1 text-sm text-red-600">
              {backendErrors.hindiKnowledge}
            </p>
          )}
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

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={!hasChanges}
          className={`px-4 py-2 rounded ${
            hasChanges
              ? "bg-green-400 text-gray-800 hover:bg-gray-400 cursor-pointer"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          💾 Save Draft
        </button>

        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
        >
          Next ➡️
        </button>
      </div>
    </form>
  );
};

export default PersonalDetailsForm;
