import { RegisterForm } from "@/components/auth/register-form";
import React, { Suspense } from "react";

export default function RegisterPage() {
  return (
    <div>
      <Suspense fallback={<div>Chargement...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
