import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { BrowserRouter } from "react-router-dom";
import { FormDataProvider } from "./context/FormContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <FormDataProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </FormDataProvider>
    </AuthProvider>
  </StrictMode>
);
