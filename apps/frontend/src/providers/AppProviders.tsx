"use client";

import { ENV } from "@/config";
import { GoogleOAuthProvider } from "@react-oauth/google";
import type React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AppProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <GoogleOAuthProvider clientId={ENV.google_client_id}>
      {children}
      <ToastContainer position="top-right" autoClose={3000} />
    </GoogleOAuthProvider>
  );
};

export default AppProviders;
