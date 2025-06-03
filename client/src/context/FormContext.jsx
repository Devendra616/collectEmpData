// src/context/FormDataContext.jsx
import { createContext, useContext, useReducer } from "react";

const FormDataContext = createContext();

const initialState = {
  personalDetails: {},
  educationDetails: [],
  familyDetails: [],
  addressDetails: {},
  workExperience: [],
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_ALL":
      return { ...state, ...action.payload };
    case "UPDATE_SECTION":
      return { ...state, [action.section]: action.data };
    default:
      return state;
  }
}

export const FormDataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <FormDataContext.Provider value={{ state, dispatch }}>
      {children}
    </FormDataContext.Provider>
  );
};

export const useFormData = () => useContext(FormDataContext);
