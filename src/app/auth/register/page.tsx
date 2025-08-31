import { RegisterForm } from "@/components/auth/register-form";
import React, { Suspense } from "react";

export default function RegisterPage() {
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
        <RegisterForm />
      </Suspense>
    </div>
  );
}
