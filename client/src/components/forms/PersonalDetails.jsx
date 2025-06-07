import React, { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { saveSectionData } from "../../services/formApi";
import { useAuth } from "../../context/AuthContext";
import { useFormData } from "../../context/FormContext";
import { getAgeFromDOB } from "../../utils/getAge";
import languageOptions from "../../constants/languageOptions";
import axios from "axios";
import { toast } from "react-toastify";
import { formatDate } from "../../utils/dateConversion.js";

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
  const [loading, setLoading] = useState(true);
  const [age, setAge] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const initialValues = useMemo(
    () => ({
      ...formState?.personal?.data,
      ...defaultValues?.data,
      dob: formatDate(
        formState.personal?.data?.dob || defaultValues?.data?.dob
      ),
      langHindiRead:
        formState.personal?.data?.langHindiRead ||
        defaultValues?.data?.langHindiRead ||
        false,
      langHindiWrite:
        formState.personal?.data?.langHindiWrite ||
        defaultValues?.data?.langHindiWrite ||
        false,
      langHindiSpeak:
        formState.personal?.data?.langHindiSpeak ||
        defaultValues?.data?.langHindiSpeak ||
        false,
    }),
    [formState?.personal?.data, defaultValues?.data]
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    clearErrors,
    setError,
  } = useForm({
    //resolver: yupResolver(schema),
    defaultValues: initialValues,
  });

  const dob = watch("dob");
  const motherTongue = watch("motherTongue");

  // Watch only the fields we need for changes
  const formValues = watch();

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

  useEffect(() => {
    if (dob) {
      const calculatedAge = getAgeFromDOB(dob);
      setAge(calculatedAge);
    }
  }, [dob]);

  // Load data if not already in FormContext
  useEffect(() => {
    const loadData = async () => {
      if (!formState.personal || Object.keys(formState.personal).length === 0) {
        setLoading(true);
        try {
          const result = await axios.get(
            `${import.meta.env.VITE_API_URL}/personal`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          dispatch({
            type: "UPDATE_SECTION",
            section: "personal",
            data: result?.data || {},
          });
        } catch (error) {
          console.error("Error loading personal details:", error);
          toast.error("Failed to load personal details");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadData();
  }, [token, dispatch, formState.personal]);

  const saveData = async (data, proceed = false) => {
    if (!hasChanges) {
      if (proceed) onNext(data);
      return;
    }

    setSaving(true);
    setBackendErrors({});
    clearErrors();
    try {
      const dataToSave = Object.fromEntries(
        Object.entries(data).filter(
          ([key]) => !key.startsWith("_") && key !== "__v"
        )
      );

      const res = await saveSectionData("personalDetails", dataToSave, token);
      if (res?.status === 400) {
        const backendErrors = res.response?.data?.errors || {};
        setBackendErrors(backendErrors);
        Object.entries(backendErrors).forEach(([field, message]) => {
          setError(field, { type: "manual", message });
        });
        return;
      }

      if (res?.data?.success) {
        toast.success(res?.msg || "Personal details updated successfully");
        dispatch({
          type: "UPDATE_SECTION",
          section: "personal",
          data: {
            ...formState.personal,
            data: dataToSave,
          },
        });
      } else {
        toast.error(res?.msg || "Something went wrong, not updated");
      }

      if (proceed) onNext(dataToSave);
    } catch (error) {
      const errorMessages = error?.response?.data?.errors || {};
      setBackendErrors(errorMessages);
      Object.entries(errorMessages).forEach(([field, message]) => {
        setError(field, { type: "manual", message });
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = handleSubmit((data) => {
    saveData(data, false);
  });

  const handleNext = handleSubmit((data) => {
    if (!hasChanges) {
      onNext(data);
      return;
    }
    saveData(data, true);
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <h3 className="text-red-800 font-medium mb-2">
            Please fix the following errors:
          </h3>
          <ul className="list-disc list-inside ml-4">
            {Object.entries(backendErrors).map(([field, message]) => (
              <li key={field} className="text-red-600">
                {message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {Object.keys(errors).length > 0 && (
        <div className="text-red-600 text-sm mb-4">
          Please fix the validation errors below.
        </div>
      )}

      {/* Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div>
          <label className="block font-medium">Title</label>
          <select
            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.title ? "border-red-500" : "border-gray-300"
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
        </div>

        <div>
          <label className="block font-medium">First Name</label>
          <input
            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.firstName ? "border-red-500" : "border-gray-300"
            }`}
            {...register("firstName")}
            placeholder="First Name"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block font-medium">Last Name</label>
          <input
            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.lastName ? "border-red-500" : "border-gray-300"
            }`}
            {...register("lastName")}
            placeholder="Last Name"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.lastName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block font-medium">SAP ID</label>
          <input
            className={`w-full border rounded-md p-2 bg-gray-100 focus:ring-blue-500 focus:border-blue-500 ${
              errors.sapId ? "border-red-500" : "border-gray-300"
            }`}
            {...register("sapId")}
            placeholder="SAP ID"
            readOnly
          />
          {errors.sapId && (
            <p className="mt-1 text-sm text-red-600">{errors.sapId.message}</p>
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
        </div>

        <div>
          <label className="block font-medium">Date of Birth</label>
          <input
            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.dob ? "border-red-500" : "border-gray-300"
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
        </div>

        <div>
          <label className="block font-medium">Birth Place</label>
          <input
            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.birthplace ? "border-red-500" : "border-gray-300"
            }`}
            {...register("birthplace")}
            placeholder="Birthplace"
          />
          {errors.birthplace && (
            <p className="mt-1 text-sm text-red-600">
              {errors.birthplace.message}
            </p>
          )}
        </div>

        <div>
          <label className="block font-medium">State</label>
          <input
            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.state ? "border-red-500" : "border-gray-300"
            }`}
            {...register("state")}
            placeholder="State"
          />
          {errors.state && (
            <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">Religion</label>
          <input
            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.religion ? "border-red-500" : "border-gray-300"
            }`}
            {...register("religion")}
            placeholder="Religion"
          />
          {errors.religion && (
            <p className="mt-1 text-sm text-red-600">
              {errors.religion.message}
            </p>
          )}
        </div>

        <div>
          <label className="block font-medium">Category</label>
          <input
            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.category ? "border-red-500" : "border-gray-300"
            }`}
            {...register("category")}
            placeholder="Category"
          />
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">
              {errors.category.message}
            </p>
          )}
        </div>

        <div>
          <label className="block font-medium">Sub-Category</label>
          <input
            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.subCategory ? "border-red-500" : "border-gray-300"
            }`}
            {...register("subCategory")}
            placeholder="Sub-Category"
          />
          {errors.subCategory && (
            <p className="mt-1 text-sm text-red-600">
              {errors.subCategory.message}
            </p>
          )}
        </div>

        <div>
          <label className="block font-medium">Identification Mark 1</label>
          <input
            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.idMark1 ? "border-red-500" : "border-gray-300"
            }`}
            {...register("idMark1")}
            placeholder="Identification Mark 1"
          />
          {errors.idMark1 && (
            <p className="mt-1 text-sm text-red-600">
              {errors.idMark1.message}
            </p>
          )}
        </div>

        <div>
          <label className="block font-medium">Identification Mark 2</label>
          <input
            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.idMark2 ? "border-red-500" : "border-gray-300"
            }`}
            {...register("idMark2")}
            placeholder="Identification Mark 2"
          />
          {errors.idMark2 && (
            <p className="mt-1 text-sm text-red-600">
              {errors.idMark2.message}
            </p>
          )}
        </div>

        <div>
          <label className="block font-medium">Ex-Serviceman</label>
          <select
            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.exServiceman ? "border-red-500" : "border-gray-300"
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
        </div>

        <div>
          <label className="block font-medium">Adhaar Number</label>
          <input
            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.adhaarId ? "border-red-500" : "border-gray-300"
            }`}
            {...register("adhaarId")}
            placeholder="Aadhar ID"
          />
          {errors.adhaarId && (
            <p className="mt-1 text-sm text-red-600">
              {errors.adhaarId.message}
            </p>
          )}
        </div>

        <div>
          <label className="block font-medium">Mobile Number</label>
          <input
            type="number"
            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.mobile ? "border-red-500" : "border-gray-300"
            }`}
            {...register("mobile")}
            placeholder="Mobile Number"
          />
          {errors.mobile && (
            <p className="mt-1 text-sm text-red-600">{errors.mobile.message}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">Email</label>
          <input
            className={`w-full border rounded-md p-2 bg-gray-100 focus:ring-blue-500 focus:border-blue-500 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            type="email"
            {...register("email")}
            placeholder="example@nmdc.co.in"
            readOnly
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">Person with Disability</label>
          <select
            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.pwd ? "border-red-500" : "border-gray-300"
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
        </div>

        <div>
          <label className="block font-medium">Mother Tongue</label>
          <select
            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.motherTongue ? "border-red-500" : "border-gray-300"
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
        </div>

        {motherTongue === "OTHER" && (
          <input
            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.otherMotherTongue ? "border-red-500" : "border-gray-300"
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
              errors.hindiKnowledge ? "border-red-500" : "border-gray-300"
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
