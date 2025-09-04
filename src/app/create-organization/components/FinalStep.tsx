"use client";

import { useRouter } from "next/navigation";
import { StepProps } from "@/types/steps";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function FinalStep({ formData }: StepProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  /**
   * @param Soumission du formulaire de création d'organisation
   *
   * Gère l'envoi des données au backend, affiche les erreurs éventuelles et redirige en cas de succès.
   */
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("bio", formData.bio);
      formDataToSend.append("organizationType", formData.organizationType);
      formDataToSend.append("mission", formData.mission);
      formDataToSend.append("memberCount", "1"); // Valeur par défaut
      if (formData.location) {
        formDataToSend.append("location", JSON.stringify(formData.location));
      }

      if (formData.imageUrl) {
        formDataToSend.append("imageUrl", formData.imageUrl);
      }

      const res = await fetch("/api/organizations/create", {
        method: "POST",
        credentials: "include",
        body: formDataToSend,
      });

      if (res.ok) {
        toast.success(
          "Votre première organisation a été créée avec succès 🥳​",
          {
            duration: 3000,
            onAutoClose: () => {
              router.push("/dashboard");
            },
          }
        );
      } else {
        const errorData = await res.json();
        toast.error(`Erreur: ${errorData.error || res.statusText}`);
      }
    } catch (err) {
      console.error("Erreur:", err);
      toast.error("Erreur lors de la création de l'organisation 😭​");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">
        Félicitations, votre organisation est prête !
      </h1>
      <ul className="list-disc pl-5 space-y-1 text-foreground">
        <li>
          <strong className="font-medium">Nom :</strong> {formData.name}
        </li>
        <li>
          <strong className="font-medium">Description :</strong> {formData.bio}
        </li>
        <li>
          <strong className="font-medium">Type :</strong>{" "}
          {formData.organizationType}
        </li>
        <li>
          <strong className="font-medium">Ville :</strong>{" "}
          {formData.location?.displayName}
        </li>
        <li>
          <strong className="font-medium">Mission :</strong> {formData.mission}
        </li>
        {formData.profileImage && (
          <Image
            src={formData.profileImage}
            className="w-32 h-32 rounded-lg object-cover border border-border"
            alt="organisation-profile-picture"
            width={128}
            height={128}
          />
        )}
      </ul>
      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
        aria-busy={loading}
      >
        {loading ? "Création en cours..." : "Créer l'organisation"}
      </Button>
    </div>
  );
}
