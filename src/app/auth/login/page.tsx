import React, { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Teamify | Connexion",
  description: "Page de connexion de teamify",
};

export default function LoginPage() {
  return (
    <div>
      <Suspense fallback={<div>Chargement...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
