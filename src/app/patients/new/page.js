"use client";

import ProtectedRoute from "../../components/ProtectedRoute";
import NewPatientForm from "./NewPatientForm";

export default function NewPatientPage() {
  return (
    <ProtectedRoute>
      <main className="px-4 md:px-6 py-8 max-w-3xl mx-auto space-y-8">
        <NewPatientForm />
      </main>
    </ProtectedRoute>
  );
}
