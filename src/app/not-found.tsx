import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-4">404</h2>
        <p className="text-xl mb-4">Page non trouvée</p>
        <p className="text-gray-600 mb-8">
          Désolé, la page que vous recherchez n'existe pas.
        </p>
        <Link
          href="/"
          className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
