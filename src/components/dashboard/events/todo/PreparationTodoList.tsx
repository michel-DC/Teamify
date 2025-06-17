import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/Input";

export type PreparationTodo = {
  id: number;
  title: string;
  done: boolean;
};

export default function PreparationTodoList({
  eventId,
  onChange,
}: {
  eventId: number;
  onChange?: () => void;
}) {
  const [todos, setTodos] = useState<PreparationTodo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchTodos = async () => {
    setLoading(true);
    const res = await fetch(`/api/dashboard/events/${eventId}/preparation`);
    const data = await res.json();
    setTodos(data.todos);
    setLoading(false);
  };

  useEffect(() => {
    fetchTodos();
  }, [eventId]);

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    await fetch(`/api/dashboard/events/${eventId}/preparation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTodo }),
    });
    setNewTodo("");
    fetchTodos();
    onChange && onChange();
  };

  const toggleTodo = async (todoId: number, done: boolean) => {
    await fetch(`/api/dashboard/events/${eventId}/preparation`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ todoId, done }),
    });
    fetchTodos();
    onChange && onChange();
  };

  const deleteTodo = async (todoId: number) => {
    await fetch(`/api/dashboard/events/${eventId}/preparation`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ todoId }),
    });
    fetchTodos();
    onChange && onChange();
  };

  return (
    <Card className="w-full max-w-xl mx-auto mt-4">
      <CardHeader>
        <CardTitle>Tâches de préparation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            className="flex-1"
            placeholder="Ajouter une tâche..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
          />
          <Button onClick={addTodo} disabled={!newTodo.trim()}>
            Ajouter
          </Button>
        </div>
        <ul className="space-y-2">
          {loading ? (
            <li>Chargement...</li>
          ) : todos.length === 0 ? (
            <li>Aucune tâche pour cet événement.</li>
          ) : (
            todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center gap-2 bg-white rounded px-3 py-2 border"
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
                  className={
                    todo.done
                      ? "line-through text-muted-foreground"
                      : "cursor-pointer"
                  }
                >
                  {todo.title}
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTodo(todo.id)}
                >
                  Supprimer
                </Button>
              </li>
            ))
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
