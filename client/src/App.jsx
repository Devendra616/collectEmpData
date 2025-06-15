import React from "react";
import MultiStepForm from "./components/MultiStepForm";
import Register from "./components/register";
import Login from "./components/Login";
import PrivateRoute from "./components/PrivateRoute";
import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { FormDataProvider } from "./context/FormContext";
import SessionTimeoutHandler from "./components/SessionTimeoutHandler";

function App() {
  return (
    <AuthProvider>
      <FormDataProvider>
        <div className="min-h-screen bg-gray-900 py-20 justify-center items-center">
          <SessionTimeoutHandler />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/form"
              element={
                <PrivateRoute>
                  <MultiStepForm />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </FormDataProvider>
    </AuthProvider>
  );
}

export default App;
