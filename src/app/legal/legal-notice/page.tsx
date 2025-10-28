export const metadata = {
  title: "Mentions légales | Teamify",
  description: "Informations légales et coordonnées de l'éditeur de Teamify.",
};

export default function Page() {
  return (
    <section className="space-y-10 text-center">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Mentions légales</h1>
        <p className="text-sm text-gray-500">Dernière mise à jour: {new Date().toLocaleDateString()}</p>
      </header>

      <div className="space-y-8 text-left mx-auto max-w-prose">
        <section className="space-y-2">
          <h2 className="text-xl font-medium">Éditeur du site</h2>
          <p className="text-gray-700">Teamify, plateforme de gestion d'organisations et d'événements.</p>
          <p className="text-gray-700">Adresse: fournie sur demande légitime.</p>
          <p className="text-gray-700">Email: contact@onlinemichel.dev</p>
          <p className="text-gray-700">Directeur de la publication: Responsable légal Teamify.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">Hébergeur</h2>
          <p className="text-gray-700">Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA.</p>
          <p className="text-gray-700">Site: vercel.com</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">Propriété intellectuelle</h2>
          <p className="text-gray-700">L'ensemble des éléments constitutifs du site et des applications Teamify (textes, images, graphismes, logos, codes sources, bases de données) sont protégés par les lois en vigueur. Toute reproduction, représentation, adaptation ou exploitation, totale ou partielle, sans autorisation est interdite.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">Responsabilité</h2>
          <p className="text-gray-700">Teamify met en œuvre les moyens raisonnables pour assurer l'exactitude et la mise à jour des informations. Néanmoins, aucune garantie n'est donnée quant à l'exhaustivité. Teamify ne saurait être tenu responsable des dommages directs ou indirects résultant de l'utilisation du service.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">Données personnelles</h2>
          <p className="text-gray-700">Le traitement des données personnelles est décrit dans la Politique de confidentialité. Les utilisateurs disposent de droits d'accès, de rectification, d'effacement, d'opposition, de limitation et de portabilité selon la réglementation applicable.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">Cookies</h2>
          <p className="text-gray-700">Le site peut recourir à des cookies nécessaires au fonctionnement, à la sécurité et à la mesure d'audience. Les modalités sont détaillées dans la Politique de cookies.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">Droit applicable</h2>
          <p className="text-gray-700">En cas de litige, le droit applicable et la juridiction compétente sont déterminés selon la localisation légale du service et de l'utilisateur, sous réserve des règles d'ordre public.</p>
        </section>
      </div>
    </section>
  );
}


