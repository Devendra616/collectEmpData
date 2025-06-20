import React from "react";
import MultiStepForm from "./components/MultiStepForm";
import Register from "./components/Register";
import Login from "./components/Login";
import PrivateRoute from "./components/PrivateRoute";
import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { FormDataProvider } from "./context/FormContext";
import SessionTimeoutHandler from "./components/SessionTimeoutHandler";
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  return (
    <AuthProvider>
      <FormDataProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <SessionTimeoutHandler />
          <main className="flex-1 py-8">
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
          </main>
          <Footer />
        </div>
      </FormDataProvider>
    </AuthProvider>
  );
}

export default App;
