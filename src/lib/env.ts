// Vérification des variables d'environnement requises
export function validateEnv() {
  const requiredEnvVars = ["DATABASE_URL", "NEXTAUTH_URL", "NEXTAUTH_SECRET"];

  const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingVars.length > 0) {
    throw new Error(
      `Variables d'environnement manquantes: ${missingVars.join(", ")}`
    );
  }
}

// Appel de la validation en mode production
if (process.env.NODE_ENV === "production") {
  validateEnv();
}
