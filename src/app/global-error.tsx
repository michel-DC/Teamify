"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Erreur critique</h2>
            <p className="text-gray-600 mb-4">
              Une erreur critique s'est produite. Veuillez recharger la page.
            </p>
            <button
              onClick={reset}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Recharger
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
