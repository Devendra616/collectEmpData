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
import ChangePassword from "./components/ChangePassword";
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminRoute from "./components/AdminRoute";

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
              <Route
                path="/change-password"
                element={
                  <PrivateRoute>
                    <ChangePassword />
                  </PrivateRoute>
                }
              />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
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
