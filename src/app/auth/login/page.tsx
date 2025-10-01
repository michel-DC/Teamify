import React, { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Je me connecte • Teamify",
  description: "Page de connexion de teamify",
};

export default function LoginPage() {
  return (
    <div>
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
        <LoginForm />
      </Suspense>
    </div>
  );
}
