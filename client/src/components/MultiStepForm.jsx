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
      const res = await saveSectionData(section, data, token);
      if (res !== true) throw new Error("Failed to save section");
      dispatch({ type: "UPDATE_SECTION", section, data });
      setStep((prev) => prev + 1);
    } catch (err) {
      setError(`Error saving ${section}: ${err.message}`);
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

      {loading && <p className="text-blue-600">Saving...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!isSubmitted && (
        <CurrentForm
          onNext={(data) =>
            isReview ? setIsSubmitted(true) : handleNext(current.name, data)
          }
          defaultValues={state[current.name] || {}}
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
