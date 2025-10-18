export interface EventFormData 
{
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  location: string;
  locationCoords?: {
    lat: number;
    lon: number;
    displayName: string;
  };
  capacity: string;
  budget: string;
  status: string;
  isPublic: boolean;
  orgId: string;
  image?: File;
  imageUrl?: string;
}

export type EventCreationStep =
  | "basic-info"
  | "dates-location"
  | "capacity-budget"
  | "configuration"
  | "summary";

export interface EventStepConfig
{
  id: EventCreationStep;
  title: string;
  description: string;
  isCompleted: boolean;
}

export const EVENT_CREATION_STEPS: EventStepConfig[] = [
  {
    id: "basic-info",
    title: "Informations de base",
    description: "Titre, description et catégorie",
    isCompleted: false,
  },
  {
    id: "dates-location",
    title: "Dates et lieu",
    description: "Dates de début/fin et emplacement",
    isCompleted: false,
  },
  {
    id: "capacity-budget",
    title: "Capacité et budget",
    description: "Nombre de places et budget",
    isCompleted: false,
  },
  {
    id: "configuration",
    title: "Configuration",
    description: "Paramètres de visibilité",
    isCompleted: false,
  },
  {
    id: "summary",
    title: "Récapitulatif",
    description: "Vérification des informations",
    isCompleted: false,
  },
];
