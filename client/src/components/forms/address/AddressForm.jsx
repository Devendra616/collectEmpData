import React, { useState, useEffect } from "react";
import AddressDetails from "./Address";

const AddressForm = ({ onNext, defaultValues = {} }) => {
  const [localAddress, setLocalAddress] = useState({});
  const [permanentAddress, setPermanentAddress] = useState({});
  const [sameAsLocal, setSameAsLocal] = useState(false);

  useEffect(() => {
    if (defaultValues.local) {
      setLocalAddress(defaultValues.local);
    }
    if (defaultValues.permanent) {
      setPermanentAddress(defaultValues.permanent);
    }
  }, [defaultValues]);

  // Sync permanent with local if checkbox is selected
  useEffect(() => {
    if (sameAsLocal) {
      setPermanentAddress(localAddress);
    }
  }, [sameAsLocal, localAddress]);

  const handleSubmit = () => {
    const combined = {
      local: localAddress,
      permanent: permanentAddress,
    };
    console.log("Address Data:", combined);
    onNext(combined);
  };

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setSameAsLocal(checked);
    if (!checked) {
      setPermanentAddress({});
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Address Details</h2>

      <div className="space-y-8">
        {/* Local Address Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Local Address (Kirandul)
          </h3>
          <AddressDetails onChange={setLocalAddress} values={localAddress} />
        </div>

        {/* Same as Local Checkbox */}
        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <input
            type="checkbox"
            id="sameAsLocal"
            checked={sameAsLocal}
            onChange={handleCheckboxChange}
            className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="sameAsLocal" className="text-gray-700 font-medium">
            Same as Local Address
          </label>
        </div>

        {/* Permanent Address Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Permanent Address
          </h3>
          <AddressDetails
            onChange={setPermanentAddress}
            values={permanentAddress}
            disabled={sameAsLocal}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Save and Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressForm;
