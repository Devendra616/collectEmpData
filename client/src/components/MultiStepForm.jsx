import { useFormData } from "../context/FormContext";
import { useState, useEffect } from "react";
import PersonalDetailsForm from "./forms/PersonalDetails";
import EducationDetailsForm from "./forms/education/EducationDetailsForm";
import FamilyDetailsForm from "./forms/Family/FamilyDetailsForm";
import AddressForm from "./forms/address/AddressForm";
import WorkExperienceForm from "./forms/work/WorkExperience";
import ReviewForm from "./forms/ReviewForm";
import FormNavbar from "./FormNavbar";
import StepTabs from "./StepTabs";
import { submitForm, getSubmissionStatus } from "../services/formApi";
import { toast } from "react-toastify";
// import { generatePDF } from "../pdf/generatePDF.js";

const MultiStepForm = () => {
  const { state, dispatch } = useFormData();
  const [currentStep, setStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingStatus, setCheckingStatus] = useState(true);

  console.log("MultiStepForm - FormContext state:", state);

  // Check submission status on component mount
  useEffect(() => {
    const checkSubmissionStatus = async () => {
      try {
        const response = await getSubmissionStatus();
        if (response?.success && response?.isSubmitted) {
          setIsSubmitted(true);
          toast.info(
            "Your form has already been submitted. You can only view the data."
          );
        }
      } catch (error) {
        console.error("Error checking submission status:", error);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkSubmissionStatus();
  }, []);

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

  const handleFinalSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await submitForm();

      if (response?.success) {
        setIsSubmitted(true);
        toast.success(response?.msg || "Form submitted successfully!");
      } else {
        setError(response?.msg || "Failed to submit form");
        toast.error(response?.msg || "Failed to submit form");
      }
    } catch (err) {
      console.error("Error in final submit:", err);
      const errorMsg =
        err?.response?.data?.msg ||
        err?.message ||
        "An error occurred while submitting";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const current = stepConfig[currentStep];
  const isReview = current.name === "review";

  const CurrentForm = current.Component;

  const handleDownloadForm = (dataToDownload) => {
    if (isSubmitted && dataToDownload) {
      // generatePDF(dataToDownload);
    }
  };

  // Show loading while checking submission status
  if (checkingStatus) {
    return (
      <div className="max-w-3xl mx-auto p-6 shadow-lg rounded-xl bg-white">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-blue-600">
            Checking submission status...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 shadow-lg rounded-xl bg-white">
      <FormNavbar />
      <StepTabs currentStep={currentStep} setStep={setStep} />
      {loading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-blue-600">
            {isReview ? "Submitting..." : "Saving..."}
          </span>
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
                onSubmit: handleFinalSubmit,
                isSubmitted: isSubmitted,
              }
            : {
                onNext: (data) => handleNext(current.name, data),
                defaultValues: state[current.name] || {},
                readOnly: false,
              })}
        />
      )}

      {isSubmitted && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-600">
              🎉 Form Submitted!
            </h2>
            <p className="mt-2 text-gray-600">
              Your form has been submitted successfully. You can view your data
              below.
            </p>
          </div>

          <CurrentForm
            {...(isReview
              ? {
                  data: state,
                  onBack: () => setStep((prev) => prev - 1),
                  onSubmit: handleFinalSubmit,
                  isSubmitted: isSubmitted,
                }
              : {
                  onNext: (data) => handleNext(current.name, data),
                  defaultValues: state[current.name] || {},
                  readOnly: true,
                })}
          />

          <div className="text-center space-y-4">
            <button
              onClick={() => handleDownloadForm(state)}
              className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700"
            >
              Download Form
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default MultiStepForm;
