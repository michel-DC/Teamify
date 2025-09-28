"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit3, Settings, ArrowLeft } from "lucide-react";

interface EditMenuProps {
  eventSlug: string;
  eventTitle: string;
}

export function EditMenu({ eventSlug, eventTitle }: EditMenuProps) {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);

    if (option === "edit-event") {
      router.push(`/dashboard/events/edit/${eventSlug}/form`);
    } else if (option === "edit-status") {
      router.push(`/dashboard/events/edit/${eventSlug}/status`);
    }
  };

  const handleBack = () => {
    router.push(`/dashboard/events/details/${eventSlug}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="w-full max-w-2xl space-y-6">
        {/* En-tête */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Modifier l'événement</h1>
          <p className="text-lg text-muted-foreground">{eventTitle}</p>
          <p className="text-sm text-muted-foreground">
            Choisissez ce que vous souhaitez modifier
          </p>
        </div>

        {/* Options de modification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Modifier l'événement */}
          <Card
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedOption === "edit-event"
                ? "ring-2 ring-primary bg-primary/5"
                : "hover:bg-accent/50"
            }`}
            onClick={() => handleOptionSelect("edit-event")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-[#c6c1e9] dark:bg-[#c6c1e9] rounded-full w-fit">
                <Edit3 className="h-8 w-8 text-[#6D5DE6] dark:text-[#6D5DE6]" />
              </div>
              <CardTitle className="text-xl">Modifier l'événement</CardTitle>
              <CardDescription>
                Modifier les informations générales de l'événement (titre,
                description, dates, lieu, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                variant={
                  selectedOption === "edit-event" ? "default" : "outline"
                }
                className="w-full bg-[#7C3AED] text-white hover:bg-[#7C3AED]/80 border border-[#7C3AED] shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOptionSelect("edit-event");
                }}
              >
                Modifier les détails
              </Button>
            </CardContent>
          </Card>

          {/* Modifier le statut */}
          <Card
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedOption === "edit-status"
                ? "ring-2 ring-primary bg-primary/5"
                : "hover:bg-accent/50"
            }`}
            onClick={() => handleOptionSelect("edit-status")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-[#f7d2e9] dark:bg-[#f7d2e9] rounded-full w-fit">
                <Settings className="h-8 w-8 text-[#FCA7DB] dark:text-[#FCA7DB]" />
              </div>
              <CardTitle className="text-xl">Modifier le statut</CardTitle>
              <CardDescription>
                Changer uniquement le statut de l'événement (À venir, En cours,
                Terminé, Annulé)
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                variant={
                  selectedOption === "edit-status" ? "default" : "outline"
                }
                className="w-full bg-[#7C3AED] text-white hover:bg-[#7C3AED]/80 border border-[#7C3AED] shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOptionSelect("edit-status");
                }}
              >
                Modifier le statut
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Bouton retour */}
        <div className="text-center pt-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux détails de l'événement
          </Button>
        </div>
      </div>
    </div>
  );
}
