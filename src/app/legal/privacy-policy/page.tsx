export const metadata = {
  title: "Politique de confidentialité | Teamify",
  description: "Détails sur la collecte, l'utilisation et la protection des données.",
};

export default function Page() {
  return (
    <section className="space-y-10 text-center">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Politique de confidentialité</h1>
        <p className="text-sm text-gray-500">Dernière mise à jour: {new Date().toLocaleDateString()}</p>
      </header>

      <div className="space-y-8 text-left mx-auto max-w-prose">
        <section className="space-y-2">
          <h2 className="text-xl font-medium">Responsable du traitement</h2>
          <p className="text-gray-700">Teamify agit en qualité de responsable du traitement pour les données collectées dans le cadre de l'utilisation du service.</p>
          <p className="text-gray-700">Contact: contact@onlinemichel.dev</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">Catégories de données</h2>
          <p className="text-gray-700">Données de compte (email, nom), données organisationnelles, contenus échangés (messages), journaux techniques (adresses IP tronquées, identifiants de session), fichiers importés (ex: images) et métadonnées associées.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">Finalités et bases légales</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Fourniture du service (exécution du contrat)</li>
            <li>Amélioration et sécurisation (intérêt légitime)</li>
            <li>Conformité légale et réponses aux obligations (obligation légale)</li>
            <li>Communication transactionnelle (intérêt légitime)</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">Hébergement et transferts</h2>
          <p className="text-gray-700">Le service est hébergé par Vercel (USA). Les fichiers sont stockés via des services compatibles S3. Des transferts hors UE peuvent se produire avec des garanties appropriées (par ex. clauses contractuelles types).</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">Conservation</h2>
          <p className="text-gray-700">Les données sont conservées pendant la durée d'utilisation du service, puis archivées ou supprimées selon les exigences légales et nos politiques internes.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">Vos droits</h2>
          <p className="text-gray-700">Vous disposez de droits d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité. Pour exercer vos droits: privacy@teamify.app.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">Sécurité</h2>
          <p className="text-gray-700">Mesures organisationnelles et techniques mises en place (contrôles d'accès, chiffrement en transit, journaux de sécurité, revues régulières). Les utilisateurs restent responsables de la confidentialité de leurs identifiants.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">Cookies et traceurs</h2>
          <p className="text-gray-700">Nous utilisons des cookies nécessaires (authentification, sécurité) et, le cas échéant, des cookies de mesure d'audience. Voir la Politique de cookies pour plus d'informations.</p>
        </section>
      </div>
    </section>
  );
}


