// src/context/FormDataContext.jsx
import { createContext, useContext, useReducer, useEffect } from "react";

const FormDataContext = createContext();

const initialState = {
  personal: { data: [] },
  education: { data: [] },
  family: { data: [] },
  address: { data: [] },
  work: { data: [] },
};

function reducer(state, action) {
  let newState;
  console.log("FormContext - Action:", action.type, action);
  console.log("FormContext - Current State:", state);

  switch (action.type) {
    case "SET_ALL":
      // Ensure each section maintains the { data: [] } structure
      newState = {
        ...state,
        ...Object.entries(action.payload).reduce((acc, [key, value]) => {
          // Skip non-form sections like 'emp'
          if (key === "emp") return acc;
          // Handle nested data structure
          const sectionData = value?.data || [];
          return {
            ...acc,
            [key]: {
              data: Array.isArray(sectionData) ? sectionData : [sectionData],
            },
          };
        }, {}),
      };
      break;

    case "UPDATE_SECTION": {
      // Handle nested data structure
      const sectionData = action.data?.data || action.data;
      newState = {
        ...state,
        [action.section]: {
          data: Array.isArray(sectionData) ? sectionData : [sectionData],
        },
      };

      break;
    }

    case "INITIAL_LOAD":
      // Handle initial data load from API
      newState = {
        ...state,
        ...Object.entries(action.payload).reduce((acc, [key, value]) => {
          // Skip non-form sections like 'emp'
          if (key === "emp") return acc;
          // Handle nested data structure
          const sectionData = value?.data || [];
          return {
            ...acc,
            [key]: {
              data: Array.isArray(sectionData) ? sectionData : [sectionData],
            },
          };
        }, {}),
      };
      break;

    case "CLEAR_FORM_DATA":
      newState = initialState;
      sessionStorage.removeItem("formData");
      return newState;

    default:
      return state;
  }

  console.log("FormContext - New State:", newState);
  // Save to sessionStorage whenever state changes
  sessionStorage.setItem("formData", JSON.stringify(newState));
  return newState;
}

export const FormDataProvider = ({ children }) => {
  // Get initial state from sessionStorage
  const getInitialState = () => {
    const savedState = sessionStorage.getItem("formData");
    console.log(
      "FormContext - Loading from sessionStorage:",
      sessionStorage,
      savedState
    );
    if (!savedState) return initialState;

    // Parse and restructure the saved state
    const parsedState = JSON.parse(savedState);
    return {
      ...initialState,
      ...Object.entries(parsedState).reduce((acc, [key, value]) => {
        if (key === "emp") return acc;
        return {
          ...acc,
          [key]: {
            data: Array.isArray(value?.data) ? value.data : [value?.data],
          },
        };
      }, {}),
    };
  };

  // Initialize state
  const [state, dispatch] = useReducer(reducer, getInitialState());
  // Log state changes
  useEffect(() => {
    console.log("FormContext - Current State:", state);
  }, [state]);

  return (
    <FormDataContext.Provider value={{ state, dispatch }}>
      {children}
    </FormDataContext.Provider>
  );
};

export const useFormData = () => useContext(FormDataContext);
