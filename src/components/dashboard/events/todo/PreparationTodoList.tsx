"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/badge";

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
  done: boolean;
  order: number;
  groupId: number;
};

export default function PreparationTodoList({
  eventId,
  onChange,
}: {
  eventId: number;
  onChange?: () => void;
}) {
  const [groups, setGroups] = useState<PreparationTodoGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [editingGroup, setEditingGroup] = useState<number | null>(null);
  const [editingTodo, setEditingTodo] = useState<number | null>(null);

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

  const fetchGroups = async () => {
    setLoading(true);
    const res = await fetch(`/api/dashboard/events/${eventId}/preparation`);
    const data = await res.json();
    setGroups(data.groups);
    setLoading(false);
  };

  useEffect(() => {
    fetchGroups();
  }, [eventId]);

  const addGroup = async () => {
    if (!newGroupName.trim()) return;
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    await fetch(`/api/dashboard/events/${eventId}/preparation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "group",
        data: { name: newGroupName, color: randomColor },
      }),
    });
    setNewGroupName("");
    fetchGroups();
    onChange && onChange();
  };

  const addTodo = async (groupId: number) => {
    if (!newTodoTitle.trim()) return;
    await fetch(`/api/dashboard/events/${eventId}/preparation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "todo",
        data: { title: newTodoTitle, groupId },
      }),
    });
    setNewTodoTitle("");
    fetchGroups();
    onChange && onChange();
  };

  const toggleTodo = async (todoId: number, done: boolean) => {
    await fetch(`/api/dashboard/events/${eventId}/preparation`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "todo",
        data: { todoId, done },
      }),
    });
    fetchGroups();
    onChange && onChange();
  };

  const deleteTodo = async (todoId: number) => {
    await fetch(`/api/dashboard/events/${eventId}/preparation`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "todo", id: todoId }),
    });
    fetchGroups();
    onChange && onChange();
  };

  const deleteGroup = async (groupId: number) => {
    await fetch(`/api/dashboard/events/${eventId}/preparation`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "group", id: groupId }),
    });
    fetchGroups();
    onChange && onChange();
  };

  const updateGroup = async (groupId: number, name: string, color: string) => {
    await fetch(`/api/dashboard/events/${eventId}/preparation`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "group",
        data: { groupId, name, color },
      }),
    });
    setEditingGroup(null);
    fetchGroups();
    onChange && onChange();
  };

  const getGroupProgress = (todos: PreparationTodo[]) => {
    if (todos.length === 0) return 0;
    const doneCount = todos.filter((todo) => todo.done).length;
    return Math.round((doneCount / todos.length) * 100);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tâches de préparation</h2>
        <div className="flex gap-2">
          <Input
            className="w-64"
            placeholder="Nom du nouveau groupe..."
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addGroup()}
          />
          <Button onClick={addGroup} disabled={!newGroupName.trim()}>
            Nouveau groupe
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Chargement...</div>
      ) : groups.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Aucun groupe de tâches pour cet événement.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Créez votre premier groupe pour commencer à organiser vos tâches.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <Card key={group.id} className="h-fit">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  {editingGroup === group.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={group.name}
                        onChange={(e) => {
                          setGroups(
                            groups.map((g) =>
                              g.id === group.id
                                ? { ...g, name: e.target.value }
                                : g
                            )
                          );
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            updateGroup(group.id, group.name, group.color);
                          } else if (e.key === "Escape") {
                            setEditingGroup(null);
                          }
                        }}
                        autoFocus
                      />
                      <div className="flex gap-1">
                        {colors.map((color) => (
                          <button
                            key={color}
                            className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: color }}
                            onClick={() => {
                              setGroups(
                                groups.map((g) =>
                                  g.id === group.id ? { ...g, color } : g
                                )
                              );
                              updateGroup(group.id, group.name, color);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <CardTitle
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => setEditingGroup(group.id)}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />
                      {group.name}
                    </CardTitle>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteGroup(group.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    ×
                  </Button>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {group.todos.length} tâche
                    {group.todos.length > 1 ? "s" : ""}
                  </span>
                  <Badge variant="secondary">
                    {getGroupProgress(group.todos)}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {group.todos.map((todo) => (
                    <div
                      key={todo.id}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 transition-colors"
                    >
                      <Checkbox
                        checked={todo.done}
                        onCheckedChange={(checked) =>
                          toggleTodo(todo.id, Boolean(checked))
                        }
                        id={`todo-${todo.id}`}
                      />
                      <label
                        htmlFor={`todo-${todo.id}`}
                        className={`flex-1 cursor-pointer ${
                          todo.done ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {todo.title}
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTodo(todo.id)}
                        className="text-destructive hover:text-destructive h-6 w-6 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <Input
                    placeholder="Nouvelle tâche..."
                    value={newTodoTitle}
                    onChange={(e) => setNewTodoTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTodo(group.id)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => addTodo(group.id)}
                    disabled={!newTodoTitle.trim()}
                    size="sm"
                  >
                    +
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
