"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { toast, Toaster } from "sonner";
import { CheckCircle, Circle, Plus } from "lucide-react";

interface Event {
  id: number;
  publicId: string;
  title: string;
  preparationPercentage: number;
  organization: {
    id: number;
    name: string;
  };
}

interface Todo {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  dueDate: string;
  priority: string;
}

export default function EventTodoPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventAndTodos = async () => {
      try {
        const [eventResponse, todosResponse] = await Promise.all([
          fetch(`/api/dashboard/events/${params.slug}`),
          fetch(`/api/dashboard/events/${params.slug}/preparation`),
        ]);

        const eventData = await eventResponse.json();
        const todosData = await todosResponse.json();

        if (eventResponse.ok) {
          setEvent(eventData.event);
        } else {
          toast.error(eventData.error || "Événement non trouvé");
          router.push("/dashboard/events");
          return;
        }

        if (todosResponse.ok) {
          setTodos(todosData.todos || []);
        } else {
          setTodos([]);
        }
      } catch (error) {
        toast.error("Erreur lors du chargement des données");
        router.push("/dashboard/events");
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchEventAndTodos();
    }
  }, [params.slug, router]);

  const toggleTodo = async (todoId: number) => {
    try {
      const response = await fetch(
        `/api/dashboard/events/${params.slug}/preparation/${todoId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isCompleted: !todos.find((t) => t.id === todoId)?.isCompleted,
          }),
        }
      );

      if (response.ok) {
        setTodos((prev) =>
          prev.map((todo) =>
            todo.id === todoId
              ? { ...todo, isCompleted: !todo.isCompleted }
              : todo
          )
        );

        const completedCount = todos.filter((t) =>
          t.id === todoId ? !t.isCompleted : t.isCompleted
        ).length;
        const percentage =
          todos.length > 0
            ? Math.round((completedCount / todos.length) * 100)
            : 0;

        if (event) {
          setEvent((prev) =>
            prev ? { ...prev, preparationPercentage: percentage } : null
          );
        }

        toast.success("Tâche mise à jour");
      } else {
        toast.error("Erreur lors de la mise à jour");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "haute":
        return "text-red-600 bg-red-50 border-red-200";
      case "moyenne":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "basse":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center min-h-screen">
            <div>Chargement...</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!event) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center min-h-screen">
            <Card className="w-96">
              <CardHeader>
                <CardTitle>Événement non trouvé</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  L'événement demandé n'existe pas ou vous n'avez pas les droits
                  pour le voir.
                </p>
                <Button onClick={() => router.push("/dashboard/events")}>
                  Retour aux événements
                </Button>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const completedTodos = todos.filter((todo) => todo.isCompleted).length;
  const totalTodos = todos.length;
  const progressPercentage =
    totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Tableau de bord
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard/events">
                    Événements
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink
                    href={`/dashboard/events/details/${event.publicId}`}
                  >
                    {event.title}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Préparation</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Toaster position="top-center" richColors />

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">Préparation de l'événement</h1>
              <p className="text-muted-foreground mt-2">{event.title}</p>
            </div>
            <Button
              onClick={() =>
                router.push(`/dashboard/events/details/${event.publicId}`)
              }
            >
              Retour aux détails
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Progression générale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tâches complétées</span>
                  <span>
                    {completedTodos} / {totalTodos}
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {progressPercentage}% de préparation terminée
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Liste des tâches</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une tâche
            </Button>
          </div>

          {todos.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Aucune tâche de préparation n'a été créée pour cet événement.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer la première tâche
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {todos.map((todo) => (
                <Card
                  key={todo.id}
                  className={`transition-all ${
                    todo.isCompleted ? "opacity-70" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTodo(todo.id)}
                        className="mt-1 flex-shrink-0"
                      >
                        {todo.isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <h3
                            className={`font-medium ${
                              todo.isCompleted
                                ? "line-through text-muted-foreground"
                                : ""
                            }`}
                          >
                            {todo.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 text-xs rounded-md border ${getPriorityColor(
                                todo.priority
                              )}`}
                            >
                              {todo.priority}
                            </span>
                            {todo.dueDate && (
                              <span className="text-xs text-muted-foreground">
                                Échéance: {formatDate(todo.dueDate)}
                              </span>
                            )}
                          </div>
                        </div>

                        {todo.description && (
                          <p
                            className={`text-sm ${
                              todo.isCompleted
                                ? "line-through text-muted-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {todo.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
