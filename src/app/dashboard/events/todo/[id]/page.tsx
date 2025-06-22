import PreparationTodoList from "@/components/dashboard/events/todo/PreparationTodoList";
import React from "react";

export default function TodoListProgression({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div>
      <PreparationTodoList eventId={parseInt(params.id)} />
    </div>
  );
}
