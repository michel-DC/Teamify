"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Event {
  id: number;
  title: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  eventCode: string;
  isCancelled: boolean;
}

interface Organization {
  id: number;
  name: string;
  bio: string | null;
  profileImage: string | null;
  memberCount: number;
  organizationType: string;
  mission: string;
  createdAt: string;
  events: Event[];
}

interface OrganizationsGridProps {
  organizations: Organization[];
  searchTerm: string;
}

export function OrganizationsGrid({
  organizations,
  searchTerm,
}: OrganizationsGridProps) {
  const router = useRouter();

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "ASSOCIATION":
        return "Association";
      case "PME":
        return "PME";
      case "ENTREPRISE":
        return "Entreprise";
      case "STARTUP":
        return "Startup";
      case "AUTO_ENTREPRENEUR":
        return "Auto-entrepreneur";
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "ASSOCIATION":
        return "bg-blue-100 text-blue-800";
      case "PME":
        return "bg-yellow-100 text-yellow-800";
      case "ENTREPRISE":
        return "bg-green-100 text-green-800";
      case "STARTUP":
        return "bg-purple-100 text-purple-800";
      case "AUTO_ENTREPRENEUR":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (organizations.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {searchTerm ? "Aucune organisation trouvée" : "Aucune organisation"}
        </h3>
        <p className="text-muted-foreground mb-4">
          {searchTerm
            ? "Essayez de modifier vos critères de recherche"
            : "Commencez par créer votre première organisation"}
        </p>
        {!searchTerm && (
          <Button onClick={() => router.push("/dashboard/organizations/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Créer une organisation
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {organizations.map((org) => (
        <Card
          key={org.id}
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => router.push(`/dashboard/organizations/${org.id}`)}
        >
          <CardHeader>
            <div className="flex items-center space-x-4">
              {org.profileImage ? (
                <img
                  src={org.profileImage}
                  alt={org.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg truncate">{org.name}</CardTitle>
                <Badge
                  variant="outline"
                  className={`${getTypeColor(org.organizationType)} border-0`}
                >
                  {getTypeLabel(org.organizationType)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {org.bio || "Aucune description"}
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {org.memberCount} membre{org.memberCount > 1 ? "s" : ""}
              </span>
              <span className="text-muted-foreground">
                {org.events?.length || 0} événement
                {(org.events?.length || 0) > 1 ? "s" : ""}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
