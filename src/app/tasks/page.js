"use client";

import { Suspense } from "react";
import TasksContent from "./TasksContent";

export default function TasksPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading tasks...</div>}>
      <TasksContent />
    </Suspense>
  );
}
