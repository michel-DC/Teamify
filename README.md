# _Teamify._ Make. Organize. Collaborate.

![Teamify Landing page](/README.png)

---

## La plateforme événementielle nouvelle génération

**Teamify** est l’application ultime pour organiser, collaborer et gérer vos équipes et événements d’entreprise. Pensée pour l’expérience, l’efficacité et la sécurité, Teamify vous offre :

- Une gestion d’événements ultra-rapide et intuitive
- Une messagerie d’équipe en temps réel
- Des invitations et onboarding sur-mesure
- Un écosystème SaaS solide, sécurisé et prêt pour le scale

---

## Stack & Outils d’exception

| Technologie   | Rôle/Usage                                               |
|--------------|----------------------------------------------------------|
| **Next.js**  | Framework principal (Fullstack, server components)       |
| **React.js** | UI/UX fluide et composants modernes                      |
| **TypeScript**| Typage strict, robustesse, refactor facilité           |
| **Prisma**   | ORM moderne, typé, sécurisé pour la gestion des données |
| **Pusher**   | Messagerie & notifications temps réel                   |
| **Resend**   | Envoi d’emails transactionnels ultra-fiables            |
| **Cloudflare**| Gestion & CDN des images (upload et distribution)      |
| **Sonner**   | Notifications UI toast (feedback UX immédiat)           |
| **Zod**      | Validation de schémas, sécurisation des entrées         |
| **bcryptjs** | Hash des mots de passe, sécurité de l’auth              |
| **JWT**      | Authentification sécurisée (stateless, server)          |
| **Cypress**  | Tests end-to-end robustes (qualité garantie)            |
| **TailwindCSS** | Style moderne et rapidité de conception UI           |
| **Vercel**   | Déploiement cloud, performances optimales                |
| **.env**     | Configuration flexible et sécurisée                      |

**…et plus encore, pour une expérience à la hauteur de vos ambitions !**

---

## Fonctionnalités phares

- **Gestion d’événements** : création, édition, suivi, calendrier, gestion fine des statuts, capacité, budgets, uploads d’images d’illustration via Cloudflare
- **Authentification avancée** : email/mot de passe (bcrypt, JWT), Google OAuth, invitations personnalisées (token sécurisé), onboarding fluide
- **Messagerie temps réel** : discussions d’équipe, notifications live (Pusher), multi-sessions et compatibilité mobile
- **Gestion des organisations** : rôles avancés, invitations, dashboard multi-organisation, sécurité par rôle/accès
- **Emails transactionnels** : bienvenue, notifications, invitations, via Resend (délivrabilité premium)
- **Sécurité by design** : validation Zod, anti-injections, cookies HTTPOnly/SameSite, logging contrôlé, architecture API REST strictement côté serveur
- **Extensible & modulable** : architecture scalable, conventions Next.js 15+, type safety partout, dossiers bien séparés (`/app`, `/emails`, `/docs`, `/prisma`, `/cypress`…)
- **UX peaufinée** : feedback interactif, design propre (Tailwind), animations, responsive mobile-first
- **Tests robustes** : +40 scripts Cypress E2E, coverage élevé, documentation et plans de tests incorporés

---

## Philosophie et valeur ajoutée

Teamify n’est pas juste une app. C’est la référence d’un projet Next.js moderne, où chaque détail a été pensé pour :
- **La qualité** (processus de développement, convention, test, relecture)
- **La scalabilité** (anticipation de la croissance, micro-services prêts)
- **La sécurité** (meilleures pratiques dès la conception)
- **L’expérience utilisateur** (onboarding, accessibilité, navigation fluide)

**Développeurs, Product Owners, CTO : inspirez-vous, agrégez, ou forkez… Teamify incarne le meilleur de Next.js et de l’innovation frontend/backend !**

---

## Structure du projet
- `/src/app` : toutes les routes front & API, pages, logique server & client
- `/src/components` : composants UI réutilisables (formulaires, notifications…)
- `/emails` : templates et services email transactionnels (Resend-ready)
- `/prisma` : models, schémas, seeds, migrations, accès typé à la DB
- `/public` : assets statiques, images Cloudflare, icônes, illustrations
- `/cypress` : tests E2E scénarisés, fixtures, scripts vérification
- `/docs` : documentation interne (auth, sécurité, rôles, invitations...)

---

## Démarrage Dev & Déploiement

1. **Cloner le repo**
2. Installer les dépendances :
```bash
pnpm install # ou yarn, npm
```
3. Renommer `.env.example` → `.env` et remplir infos clé (voir docs/SÉCURITÉ.md)
4. Lancer la base locale, générer Prisma :
```bash
pnpm prisma migrate dev
```
5. Démarrer le serveur :
```bash
pnpm dev
```
6. Accéder sur [http://localhost:3000](http://localhost:3000)

**Déploiement :** Prêt pour Vercel, Docker ou cloud personnalisé. Configuration `.env` sécurisée recommandée !

---

## Documentation et ressources
- [docs/AUTH.md](docs/AUTH.md) : Auth & sécurité
- [docs/SECURITE.md](docs/SECURITE.md) : politiques de sécurité
- [docs/PERSISTENCE-DONNEE.md](docs/PERSISTENCE-DONNEE.md) : gestion de la data
- [docs/ROLE-ORGANISATION.md](docs/ROLE-ORGANISATION.md) : modèle organisation et droits
- [docs/MESSAGERIE.md](docs/MESSAGERIE.md) : messagerie temps réel
- [cypress/README.md](cypress/README.md) : tests et E2E

---

## Pourquoi Teamify est génial ?
- Tout est documenté, automatisé, typé, sécurisé : rien n’est laissé au hasard.
- Tu veux t’inspirer d’un projet Next.js moderne ? Démarre ici : tu as tout (mail, socket, cloud, rôles, test) sur une base saine.
- Prêt pour toutes évolutions (SSO, Stripe, scale…) sans refonte.
- **C’est LE projet dont tu seras fier en entretien ou comme starter pour ta startup !**

---

# Make. Organize. Collaborate. _with Teamify._
