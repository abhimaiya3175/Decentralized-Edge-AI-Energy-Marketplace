"use client";

import React from "react";
import { AuthProvider } from "../lib/AuthContext";
import { WalletProvider } from "../lib/WalletContext";

export default function ClientProviders({ children }) {
  return (
    <AuthProvider>
      <WalletProvider>{children}</WalletProvider>
    </AuthProvider>
  );
}
