import React from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Teamify | Connexion",
  description: "Page de connexion de teamify",
};

export default function LoginPage() {
  return (
    <div>
      <LoginForm />
    </div>
  );
}
