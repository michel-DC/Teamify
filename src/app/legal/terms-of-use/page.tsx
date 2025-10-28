export const metadata = {
  title: "Conditions d'utilisation | Teamify",
  description: "Règles d'utilisation et obligations liées à l'accès à Teamify.",
};

export default function Page() {
  return (
    <section className="space-y-10 text-center">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Conditions d'utilisation</h1>
        <p className="text-sm text-gray-500">Dernière mise à jour: {new Date().toLocaleDateString()}</p>
      </header>

      <div className="space-y-8 text-left mx-auto max-w-prose">
        <section className="space-y-2">
          <h2 className="text-xl font-medium">Objet</h2>
          <p className="text-gray-700">Les présentes conditions définissent les modalités d'accès et d'utilisation de Teamify. En créant un compte ou en utilisant le service, vous acceptez sans réserve ces conditions.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">Comptes et sécurité</h2>
          <p className="text-gray-700">Vous êtes responsable de la confidentialité de vos identifiants et des activités réalisées depuis votre compte. Vous devez nous informer immédiatement de toute utilisation non autorisée.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">Utilisation acceptable</h2>
          <p className="text-gray-700">Il est interdit d'utiliser le service à des fins illicites, de tenter d'accéder de manière non autorisée aux systèmes, de perturber le service ou d'en extraire massivement les données.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">Contenus</h2>
          <p className="text-gray-700">Vous conservez vos droits sur les contenus que vous soumettez. Vous accordez à Teamify une licence limitée pour l'hébergement et la diffusion technique aux seules fins de fourniture du service.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">Disponibilité et maintenance</h2>
          <p className="text-gray-700">Le service est fourni en l'état. Des opérations de maintenance peuvent entraîner une indisponibilité temporaire. L'hébergement est assuré par Vercel et des fournisseurs cloud tiers.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">Résiliation</h2>
          <p className="text-gray-700">Nous pouvons suspendre ou résilier l'accès en cas de violation des présentes conditions ou pour des motifs de sécurité. Vous pouvez supprimer votre compte à tout moment.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">Limitation de responsabilité</h2>
          <p className="text-gray-700">Dans les limites autorisées par la loi, Teamify ne saurait être tenue responsable des dommages indirects, pertes de profit, perte de données ou préjudices immatériels liés à l'utilisation du service.</p>
        </section>
      </div>
    </section>
  );
}


