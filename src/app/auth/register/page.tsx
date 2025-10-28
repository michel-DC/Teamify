import { RegisterForm } from "@/components/auth/register-form";
import React, { Suspense } from "react";
import { AuthRedirect } from "@/components/auth/auth-redirect";

export const metadata = {
  title: "Je me crée un compte • Teamify",
  description: "Page d'inscription de teamify",
};

export default function RegisterPage() {
  return (
    <div>
      <AuthRedirect redirectTo="/dashboard">
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center">
              <span
                className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"
                aria-label="Chargement"
                role="status"
              />
            </div>
          }
        >
          <RegisterForm />
        </Suspense>
      </AuthRedirect>
    </div>
  );
}
