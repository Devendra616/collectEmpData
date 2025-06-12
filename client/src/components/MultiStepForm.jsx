import { useFormData } from "../context/FormContext";
import { useAuth } from "../context/AuthContext";
import { saveSectionData } from "../services/formApi";
import { useState } from "react";
import PersonalDetailsForm from "./forms/PersonalDetails";
import EducationDetailsForm from "./forms/education/EducationDetailsForm";
import FamilyDetailsForm from "./forms/Family/FamilyDetailsForm";
import AddressForm from "./forms/address/AddressForm";
import WorkExperienceForm from "./forms/work/WorkExperience";
import ReviewForm from "./forms/ReviewForm";
import Navbar from "./Navbar";
import StepTabs from "./StepTabs";

const MultiStepForm = () => {
  const { token } = useAuth();
  const { state, dispatch } = useFormData();
  const [currentStep, setStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  console.log("MultiStepForm - FormContext state:", state);

  const stepConfig = [
    { name: "personalDetails", Component: PersonalDetailsForm },
    { name: "educationDetails", Component: EducationDetailsForm },
    { name: "familyDetails", Component: FamilyDetailsForm },
    { name: "addressDetails", Component: AddressForm },
    { name: "workExperience", Component: WorkExperienceForm },
    { name: "review", Component: ReviewForm },
  ];

  const handleNext = async (section, data) => {
    setLoading(true);
    setError("");

    try {
      /* const res = await saveSectionData(section, data, token);
      console.log("Response from saveSectionData:", res);

      // Check if response contains validation errors
      if (res?.errors) {
        // Format validation errors into a readable message
        const errorMessages = Object.entries(res.errors)
          .map(([field, message]) => `${field}: ${message}`)
          .join(", ");
        setError(`Validation errors: ${errorMessages}`);
        return res.errors;
      }
      if (!res?.success) {
        const errorMsg = res?.msg || "Failed to save section";
        setError(errorMsg);
        return;
      } */

      dispatch({ type: "UPDATE_SECTION", section, data });
      setStep((prev) => prev + 1);
    } catch (err) {
      console.error("Error in handleNext:", err);
      const errorMsg =
        err?.response?.data?.msg ||
        err?.message ||
        "An error occurred while saving";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const current = stepConfig[currentStep];
  const isReview = current.name === "review";

  const CurrentForm = current.Component;

  return (
    <div className="max-w-3xl mx-auto p-6 shadow-lg rounded-xl bg-white">
      <Navbar />
      <StepTabs currentStep={currentStep} setStep={setStep} />
      {loading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-blue-600">Saving...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 font-medium">Error</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!isSubmitted && (
        <CurrentForm
          {...(isReview
            ? {
                data: state,
                onBack: () => setStep((prev) => prev - 1),
                onSubmit: () => setIsSubmitted(true),
              }
            : {
                onNext: (data) => handleNext(current.name, data),
                defaultValues: state[current.name] || {},
              })}
        />
      )}

      {isSubmitted && (
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-green-600">🎉 Thank you!</h2>
          <p>Your form has been submitted successfully.</p>
        </div>
      )}
    </div>
  );
};
export default MultiStepForm;
