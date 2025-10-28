export const metadata = {
  title: "Politique de cookies | Teamify",
  description: "Informations sur l'utilisation des cookies et technologies similaires.",
};

export default function Page() {
  return (
    <section className="space-y-10 text-center">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Politique de cookies</h1>
        <p className="text-sm text-gray-500">Dernière mise à jour: {new Date().toLocaleDateString()}</p>
      </header>

      <div className="space-y-8 text-left mx-auto max-w-prose">
        <section className="space-y-2">
          <h2 className="text-xl font-medium">Qu'est-ce qu'un cookie ?</h2>
          <p className="text-gray-700">Un cookie est un petit fichier texte déposé sur votre appareil lors de la consultation d'un site. Il permet au site de fonctionner, d'améliorer l'expérience utilisateur ou de mesurer l'audience.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">Cookies utilisés</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Cookies strictement nécessaires: authentification, sécurité, préférences techniques.</li>
            <li>Cookies de performance: mesure d'audience et diagnostic (agrégés et anonymisés lorsque possible).</li>
            <li>Cookies fonctionnels: confort d'utilisation et personnalisation.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">Hébergement et tiers</h2>
          <p className="text-gray-700">Le service est hébergé par Vercel. Certaines ressources peuvent être fournies par des services tiers conformes aux standards de sécurité. Des transferts hors UE peuvent se produire avec des garanties appropriées.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">Gestion du consentement</h2>
          <p className="text-gray-700">À l'exception des cookies strictement nécessaires, vous pouvez refuser les cookies non essentiels via les paramètres de votre navigateur. Si une bannière de consentement est affichée, vous pouvez la paramétrer pour accepter ou refuser par catégorie.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">Paramétrage du navigateur</h2>
          <p className="text-gray-700">Vous pouvez configurer votre navigateur pour bloquer ou supprimer les cookies. Le blocage de certains cookies peut altérer le fonctionnement du service.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">Contact</h2>
          <p className="text-gray-700">Pour toute question, contactez-nous: contact@onlinemichel.dev</p>
        </section>
      </div>
    </section>
  );
}


