"use client";

import { useOrganization } from "@/hooks/useOrganization";
import { EventForm } from "@/components/dashboard/events/new/event-form-new";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function CreateEventPage() {
  const router = useRouter();
  const { organizations, loading } = useOrganization();

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (organizations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Aucune organisation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Vous devez créer une organisation avant de pouvoir créer un
              événement.
            </p>
            <Button onClick={() => router.push("/dashboard/organizations/new")}>
              Créer une organisation
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex h-16 shrink-0 items-center gap-2 px-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard">Tableau de bord</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard/events">
                Événements
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Créer un événement</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex-1">
        <EventForm orgId={organizations[0].id.toString()} />
      </div>
    </div>
  );
}
