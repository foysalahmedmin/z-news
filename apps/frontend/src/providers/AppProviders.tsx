"use client";

import { ENV } from "@/config";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type React from "react";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AppProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // One QueryClient per browser session (useState lazy init, not module
  // scope) so it isn't shared across users on the server and isn't
  // recreated on every render. Admin pages should use this shared client
  // rather than creating their own local QueryClientProvider.
  const [queryClient] = useState(() => new QueryClient());

  return (
    <GoogleOAuthProvider clientId={ENV.google_client_id}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ToastContainer position="top-right" autoClose={3000} />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
};

export default AppProviders;
