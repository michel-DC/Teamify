"use client";
import { RegisterForm } from "@/components/auth/RegisterForm"; // for the onclick button
import Link from "next/link";
import React, { useState } from "react";
import { FaEnvelope, FaLock, FaUserPlus, FaUser } from "react-icons/fa";

export const LoginForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login/register logic here
    console.log(formData);
    if (isLogin) {
      // Handle login logic here
    } else {
      // Handle register logic here
      // ici c'est pour les backend donc pas mon problème
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="absolute pointer-events-none z-1">
        <img
          className="object-cover w-full h-full opacity-50"
          src="https://cdn.rareblocks.xyz/collection/clarity/images/hero/1/background-pattern.png"
          alt=""
        />
      </div>
      <div className="bg-[var(--card)] p-8 rounded-lg shadow-lg max-w-md w-full border border-[var(--foreground)]">
        <h2 className="text-3xl text-[var(--foreground)] font-bold text-center mb-8">
          Se connecter
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-[var(--foreground)] font-medium mb-2"
            >
              Email
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--muted-foreground)]" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 px-4 py-2 text-[var(--foreground)] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-[var(--foreground)] font-medium mb-2"
            >
              Mot de passe
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--muted-foreground)]" />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 px-4 py-2 text-[var(--foreground)] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]"
                required
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 text-[var(--foreground)] focus:ring-[var(--foreground)] border-[var(--border)] rounded"
            />
            <label
              htmlFor="rememberMe"
              className="ml-2 block text-sm text-[var(--foreground)]"
            >
              Se souvenir de moi
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-[var(--foreground)] text-[var(--background)] py-2 px-4 rounded-lg hover:bg-[var(--input-hover)] transition-colors duration-200 flex items-center justify-center cursor-pointer"
          >
            <>
              <FaLock className="mr-2" />
              Se connecter
            </>
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/RegisterForm"
            className="text-[var(--muted-foreground)] cursor-pointer hover:text-[var(--foreground)]"
          >
            Pas encore de compte ? S'inscrire
          </Link>
        </div>
      </div>
    </div>
  );
};
