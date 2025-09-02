"use client";

export default function ErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <section
        className="w-full max-w-md rounded-lg bg-white shadow-lg p-8 text-center"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <h1 className="text-2xl font-bold text-destructive mb-4">
          Une erreur est survenue
        </h1>
        <p className="text-base text-muted-foreground">
          Désolé, une erreur s&apos;est produite lors de la création de votre
          organisation.
          <br />
          Veuillez réessayer plus tard ou contacter le support si le problème
          persiste.
        </p>
      </section>
    </main>
  );
}
