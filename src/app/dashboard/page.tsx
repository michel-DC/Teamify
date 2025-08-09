"use client";

import { Toaster } from "sonner";

export default function Page() {
  return (
    <main>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Toaster position="top-center" richColors />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Tableau de bord</h1>
            <p className="text-muted-foreground">
              Bienvenue sur votre espace de gestion
              d&apos;&eacute;v&eacute;nements&nbsp;!
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
