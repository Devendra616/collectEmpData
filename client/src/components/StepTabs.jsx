import React from "react";

const steps = [
  "Personal",
  "Education",
  "Family",
  "Address",
  "Work",
  "Review Application",
];

const StepTabs = ({ currentStep, setStep }) => {
  return (
    <div className="flex justify-around mb-6">
      {steps.map((label, index) => (
        <button
          key={label}
          onClick={() => setStep(index)}
          className={`px-4 py-2 border-b-4 ${
            currentStep === index
              ? "border-blue-500 font-bold text-blue-700"
              : "border-transparent text-gray-500"
          }`}
        >
          {index + 1}. {label}
        </button>
      ))}
    </div>
  );
};

export default StepTabs;
