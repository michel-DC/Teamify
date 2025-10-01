"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  User,
  Calendar,
  Tag,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AutoSignedImage } from "@/components/ui/auto-signed-image";
import Image from "next/image";

export type PreparationTodoGroup = {
  id: number;
  name: string;
  color: string;
  order: number;
  todos: PreparationTodo[];
};

export type PreparationTodo = {
  id: number;
  title: string;
  description?: string;
  done: boolean;
  order: number;
  groupId: number;
  assignedTo?: string;
};

interface KanbanBoardProps {
  eventCode: string;
  onChange?: () => void;
}

export default function KanbanBoard({ eventCode, onChange }: KanbanBoardProps) {
  const [groups, setGroups] = useState<PreparationTodoGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newTodoTitles, setNewTodoTitles] = useState<{
    [groupId: number]: string;
  }>({});
  const [editingGroup, setEditingGroup] = useState<number | null>(null);
  const [editingTodo, setEditingTodo] = useState<number | null>(null);

  // États pour le modal d'édition de tâche (style Trello)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTodoData, setEditingTodoData] =
    useState<PreparationTodo | null>(null);
  const [editTodoTitle, setEditTodoTitle] = useState("");
  const [editTodoDescription, setEditTodoDescription] = useState("");
  const [editTodoAssignedTo, setEditTodoAssignedTo] = useState("");
  const [organizationMembers, setOrganizationMembers] = useState<
    Array<{
      id: string;
      userUid: string;
      user: {
        uid: string;
        email: string;
        firstname: string;
        lastname: string;
        profileImage?: string;
      };
    }>
  >([]);
  const [profileImages, setProfileImages] = useState<{
    [userUid: string]: string;
  }>({});
  const [organizationId, setOrganizationId] = useState<number | null>(null);

  const colors = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#84cc16",
  ];

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/events/${eventCode}/preparation`);
      const data = await res.json();
      setGroups(data.groups || []);
    } catch (error) {
      console.error("Erreur lors du chargement des groupes:", error);
    } finally {
      setLoading(false);
    }
  }, [eventCode]);

  useEffect(() => {
    fetchGroups();
    fetchOrganizationMembers();
  }, [fetchGroups]);

  const fetchOrganizationMembers = useCallback(async () => {
    try {
      const response = await fetch(`/api/dashboard/events/${eventCode}`);
      const data = await response.json();
      if (data.event?.organization?.id) {
        setOrganizationId(data.event.organization.id);
        const membersResponse = await fetch(
          `/api/organizations/by-public-id/${data.event.organization.publicId}/members`
        );
        const membersData = await membersResponse.json();
        if (membersData.members) {
          setOrganizationMembers(membersData.members);
          // Récupération des photos de profil des membres
          await fetchProfileImages(membersData.members);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des membres:", error);
    }
  }, [eventCode]);

  // Récupération des photos de profil des utilisateurs
  const fetchProfileImages = useCallback(async (members: any[]) => {
    try {
      const userUids = members.map((member) => member.userUid).join(",");
      const response = await fetch(
        `/api/user/get-all-profiles-images?userUids=${userUids}`
      );
      const data = await response.json();

      if (data.profileImages) {
        const imagesMap: { [userUid: string]: string } = {};
        data.profileImages.forEach((user: any) => {
          if (user.profileImage) {
            imagesMap[user.uid] = user.profileImage;
          }
        });
        setProfileImages(imagesMap);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des photos de profil:", error);
    }
  }, []);

  const openEditModal = (todo: PreparationTodo) => {
    setEditingTodoData(todo);
    setEditTodoTitle(todo.title);
    setEditTodoDescription(todo.description || "");
    setEditTodoAssignedTo(todo.assignedTo || "");
    setIsEditModalOpen(true);
  };

  const saveTodoEdit = async () => {
    if (!editingTodoData) return;

    try {
      await fetch(`/api/dashboard/events/${eventCode}/preparation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "todo_edit",
          data: {
            todoId: editingTodoData.id,
            title: editTodoTitle,
            description: editTodoDescription,
            assignedTo: editTodoAssignedTo,
          },
        }),
      });

      setIsEditModalOpen(false);
      setEditingTodoData(null);
      fetchGroups();
      onChange?.();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    }
  };

  const addGroup = async () => {
    if (!newGroupName.trim()) return;
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    try {
      await fetch(`/api/dashboard/events/${eventCode}/preparation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "group",
          data: { name: newGroupName, color: randomColor },
        }),
      });
      setNewGroupName("");
      fetchGroups();
      onChange?.();
    } catch (error) {
      console.error("Erreur lors de l'ajout du groupe:", error);
    }
  };

  const addTodo = async (groupId: number) => {
    const todoTitle = newTodoTitles[groupId] || "";
    if (!todoTitle.trim()) return;
    try {
      await fetch(`/api/dashboard/events/${eventCode}/preparation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "todo",
          data: { title: todoTitle, groupId },
        }),
      });
      // Vider l'input pour ce groupe spécifique
      setNewTodoTitles((prev) => ({ ...prev, [groupId]: "" }));
      fetchGroups();
      onChange?.();
    } catch (error) {
      console.error("Erreur lors de l'ajout de la tâche:", error);
    }
  };

  const toggleTodo = async (todoId: number, done: boolean) => {
    try {
      await fetch(`/api/dashboard/events/${eventCode}/preparation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "todo",
          data: { todoId, done },
        }),
      });
      fetchGroups();
      onChange?.();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la tâche:", error);
    }
  };

  const deleteTodo = async (todoId: number) => {
    try {
      await fetch(`/api/dashboard/events/${eventCode}/preparation`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "todo", id: todoId }),
      });
      fetchGroups();
      onChange?.();
    } catch (error) {
      console.error("Erreur lors de la suppression de la tâche:", error);
    }
  };

  const deleteGroup = async (groupId: number) => {
    try {
      await fetch(`/api/dashboard/events/${eventCode}/preparation`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "group", id: groupId }),
      });
      fetchGroups();
      onChange?.();
    } catch (error) {
      console.error("Erreur lors de la suppression du groupe:", error);
    }
  };

  const updateGroup = async (groupId: number, name: string, color: string) => {
    try {
      await fetch(`/api/dashboard/events/${eventCode}/preparation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "group",
          data: { groupId, name, color },
        }),
      });
      setEditingGroup(null);
      fetchGroups();
      onChange?.();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du groupe:", error);
    }
  };

  const getGroupProgress = (todos: PreparationTodo[]) => {
    if (todos.length === 0) return 0;
    const doneCount = todos.filter((todo) => todo.done).length;
    return Math.round((doneCount / todos.length) * 100);
  };

  const getTotalProgress = () => {
    const allTodos = groups.flatMap((group) => group.todos);
    if (allTodos.length === 0) return 0;
    const doneCount = allTodos.filter((todo) => todo.done).length;
    return Math.round((doneCount / allTodos.length) * 100);
  };

  const getAssignedMemberName = (assignedTo: string) => {
    // Recherche d'abord par userUid (nouveau format)
    let member = organizationMembers.find((m) => m.userUid === assignedTo);

    // Si pas trouvé, recherche par id (ancien format pour compatibilité)
    if (!member) {
      member = organizationMembers.find((m) => m.id === assignedTo);
    }

    if (member && member.user) {
      return `${member.user.firstname} ${member.user.lastname}`.trim();
    }
    return assignedTo;
  };

  const getAssignedMemberInitials = (assignedTo: string) => {
    // Recherche d'abord par userUid (nouveau format)
    let member = organizationMembers.find((m) => m.userUid === assignedTo);

    // Si pas trouvé, recherche par id (ancien format pour compatibilité)
    if (!member) {
      member = organizationMembers.find((m) => m.id === assignedTo);
    }

    if (
      member &&
      member.user &&
      member.user.firstname &&
      member.user.lastname
    ) {
      return `${member.user.firstname[0]}${member.user.lastname[0]}`.toUpperCase();
    }
    if (assignedTo && assignedTo.length >= 2) {
      return assignedTo.substring(0, 2).toUpperCase();
    }
    return "??";
  };

  // Récupération de la photo de profil d'un utilisateur
  const getUserProfileImage = (assignedTo: string) => {
    // Recherche d'abord par userUid (nouveau format)
    let member = organizationMembers.find((m) => m.userUid === assignedTo);

    // Si pas trouvé, recherche par id (ancien format pour compatibilité)
    if (!member) {
      member = organizationMembers.find((m) => m.id === assignedTo);
    }

    if (member && member.userUid && profileImages[member.userUid]) {
      return profileImages[member.userUid];
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-64">
        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* En-tête avec progression globale */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Tableau Kanban</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Progression globale: {getTotalProgress()}%
          </p>
        </div>
      </div>

      {/* Input pour nouveau groupe */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <Input
          placeholder="Nom du nouveau groupe..."
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addGroup()}
          className="w-full sm:max-w-md sm:w-80 bg-white"
        />
        <Button
          onClick={addGroup}
          disabled={!newGroupName.trim()}
          className="flex items-center justify-center bg-[#7C3AED] text-white hover:bg-[#7C3AED]/80 border border-[#7C3AED] shadow-lg min-h-[40px] sm:min-h-auto"
        >
          <Plus className="mr-2" />
          <span className="hidden sm:inline">Nouveau groupe</span>
          <span className="sm:hidden">Ajouter</span>
        </Button>
      </div>

      {/* Grille Kanban */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {groups.map((group) => (
          <Card key={group.id} className="flex flex-col h-fit w-full">
            <CardHeader className="pb-3 px-3 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: group.color }}
                  />
                  {editingGroup === group.id ? (
                    <Input
                      value={group.name}
                      onChange={(e) => {
                        const newGroups = groups.map((g) =>
                          g.id === group.id ? { ...g, name: e.target.value } : g
                        );
                        setGroups(newGroups);
                      }}
                      onBlur={() =>
                        updateGroup(group.id, group.name, group.color)
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        updateGroup(group.id, group.name, group.color)
                      }
                      className="h-6 text-sm min-w-0"
                      autoFocus
                    />
                  ) : (
                    <CardTitle
                      className="text-sm font-medium cursor-pointer truncate"
                      onClick={() => setEditingGroup(group.id)}
                    >
                      {group.name}
                    </CardTitle>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 flex-shrink-0"
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingGroup(group.id)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => deleteGroup(group.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                <span>
                  {group.todos.length} tâche{group.todos.length > 1 ? "s" : ""}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {getGroupProgress(group.todos)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-2 px-3 sm:px-6">
              {/* Tâches du groupe */}
              {group.todos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-start gap-2 p-2 sm:p-3 rounded-md border border-border hover:bg-accent/50 transition-colors cursor-pointer group"
                  onClick={() => openEditModal(todo)}
                >
                  <Checkbox
                    checked={todo.done}
                    onCheckedChange={(checked) => {
                      toggleTodo(todo.id, Boolean(checked));
                    }}
                    className="mt-0.5 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium break-words ${
                        todo.done ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {todo.title}
                    </p>
                    {todo.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 break-words">
                        {todo.description}
                      </p>
                    )}
                    {todo.assignedTo && (
                      <div className="flex items-center gap-2 mt-2">
                        <Avatar className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0">
                          <AutoSignedImage
                            src={getUserProfileImage(todo.assignedTo)}
                            alt={getAssignedMemberName(todo.assignedTo)}
                            className="h-5 w-5 sm:h-6 sm:w-6 rounded-full object-cover"
                            fallbackSrc={undefined}
                            loadingComponent={
                              <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-muted animate-pulse" />
                            }
                            errorComponent={
                              <AvatarFallback className="text-xs bg-primary text-primary-foreground h-5 w-5 sm:h-6 sm:w-6">
                                {getAssignedMemberInitials(todo.assignedTo)}
                              </AvatarFallback>
                            }
                          />
                        </Avatar>
                        <span className="text-xs text-muted-foreground truncate">
                          {getAssignedMemberName(todo.assignedTo)}
                        </span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTodo(todo.id);
                    }}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}

              {/* Input pour nouvelle tâche */}
              <div className="flex gap-1 pt-2">
                <textarea
                  placeholder="Titre de la tâche"
                  value={newTodoTitles[group.id] || ""}
                  onChange={(e) =>
                    setNewTodoTitles((prev) => ({
                      ...prev,
                      [group.id]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      addTodo(group.id);
                    }
                  }}
                  className="text-sm min-h-[50px] sm:min-h-[60px] resize-none flex-1 rounded-md border border-input bg-background px-2 sm:px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Button
                  onClick={() => addTodo(group.id)}
                  disabled={!(newTodoTitles[group.id] || "").trim()}
                  size="sm"
                  className="h-8 w-8 p-0 flex items-center justify-center bg-[#7C3AED] text-white hover:bg-[#7C3AED]/80 border border-[#7C3AED] shadow-lg mt-1 sm:mt-3 flex-shrink-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Message si aucun groupe */}
      {groups.length === 0 && (
        <div className="text-center py-8 sm:py-12 px-4">
          <Image
            src="/images/illustration/empty-kanban.svg"
            alt="Kanban"
            width={150}
            height={150}
            className="mx-auto sm:w-[200px] sm:h-[200px]"
            priority
          />
          <p className="text-muted-foreground mb-4 text-sm sm:text-base px-2">
            Aucun groupe de tâches créé. Commencez par créer votre premier
            groupe.
          </p>
        </div>
      )}

      {/* Modal d'édition de tâche (style Trello) */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] sm:max-h-[80vh] overflow-y-auto mx-2 sm:mx-0">
          <DialogHeader className="px-1 sm:px-0">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Modifier la tâche
            </DialogTitle>
            <DialogDescription className="text-sm">
              Modifiez les détails de cette tâche de préparation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6 py-2 sm:py-4 px-1 sm:px-0">
            {/* Titre de la tâche */}
            <div className="space-y-2">
              <Label htmlFor="todo-title" className="text-sm font-medium">
                Titre de la tâche
              </Label>
              <Input
                id="todo-title"
                value={editTodoTitle}
                onChange={(e) => setEditTodoTitle(e.target.value)}
                placeholder="Titre de la tâche"
                className="text-base sm:text-lg font-medium"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label
                htmlFor="todo-description"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Description
              </Label>
              <Textarea
                id="todo-description"
                value={editTodoDescription}
                onChange={(e) => setEditTodoDescription(e.target.value)}
                placeholder="Décrivez cette tâche en détail..."
                rows={3}
                className="resize-none text-sm"
              />
            </div>

            {/* Assignation */}
            <div className="space-y-2">
              <Label
                htmlFor="todo-assignee"
                className="text-sm font-medium flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Assigner à
              </Label>
              <Select
                value={editTodoAssignedTo || "none"}
                onValueChange={(value) =>
                  setEditTodoAssignedTo(value === "none" ? "" : value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner un membre" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  <SelectItem value="none">Aucune assignation</SelectItem>
                  {organizationMembers.map((member) => (
                    <SelectItem key={member.userUid} value={member.userUid}>
                      <div className="flex items-center gap-2 w-full">
                        <Avatar className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0">
                          <AutoSignedImage
                            src={profileImages[member.userUid] || null}
                            alt={
                              member.user
                                ? `${member.user.firstname} ${member.user.lastname}`.trim()
                                : member.userUid
                            }
                            className="h-5 w-5 sm:h-6 sm:w-6 rounded-full object-cover"
                            fallbackSrc={undefined}
                            loadingComponent={
                              <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-muted animate-pulse" />
                            }
                            errorComponent={
                              <AvatarFallback className="text-xs bg-primary text-primary-foreground h-5 w-5 sm:h-6 sm:w-6">
                                {member.user &&
                                member.user.firstname &&
                                member.user.lastname
                                  ? `${member.user.firstname[0]}${member.user.lastname[0]}`.toUpperCase()
                                  : member.user && member.user.email
                                  ? member.user.email
                                      .substring(0, 2)
                                      .toUpperCase()
                                  : "??"}
                              </AvatarFallback>
                            }
                          />
                        </Avatar>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="truncate text-sm">
                            {member.user
                              ? `${member.user.firstname} ${member.user.lastname}`.trim()
                              : member.userUid}
                          </span>
                          {member.user && member.user.email && (
                            <span className="text-muted-foreground text-xs truncate">
                              {member.user.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Informations supplémentaires */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Créée récemment</span>
              </div>
              {editTodoAssignedTo && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span className="truncate">
                    Assignée à {getAssignedMemberName(editTodoAssignedTo)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 px-1 sm:px-0">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Annuler
            </Button>
            <Button
              onClick={saveTodoEdit}
              disabled={!editTodoTitle.trim()}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
