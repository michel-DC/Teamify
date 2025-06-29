"use client";

import { useEffect, useState } from "react";

type Organization = {
  id: number;
  name: string;
  bio?: string;
  profileImage: string;
  memberCount: number;
  size: "PETITE" | "MOYENNE" | "GRANDE";
  mission: string;
  createdAt: string;
};

export function useOrganization() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/user/organizations", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Erreur inconnue");
        }

        const data = await res.json();
        setOrganizations(data.organizations || []);
      } catch (err: any) {
        console.error("Erreur lors de la récupération des organisations:", err);
        setError(err.message || "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  return {
    organizations,
    loading,
    error,
  };
}
