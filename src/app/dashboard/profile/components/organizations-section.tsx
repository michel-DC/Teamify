"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building2, Settings } from "lucide-react";

import { Organization } from "../types";

interface OrganizationsSectionProps {
  organizations: Organization[];
}

export function OrganizationsSection({
  organizations,
}: OrganizationsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Mes organisations</h2>
        <Button variant="outline" size="sm">
          <Building2 className="h-4 w-4 mr-2" />
          Voir toutes
        </Button>
      </div>

      {organizations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune organisation</h3>
            <p className="text-muted-foreground mb-4">
              Vous n'êtes membre d'aucune organisation pour le moment.
            </p>
            <Button>Créer une organisation</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {organizations.map((org) => (
            <Card key={org.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={org.profileImage || ""} alt={org.name} />
                    <AvatarFallback>
                      {org.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">
                      {org.name}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {org.role}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{org.memberCount} membre(s)</span>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
