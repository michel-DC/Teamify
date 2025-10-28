export function validateEnv() {
  const requiredEnvVars = [
    "DATABASE_URL",
    "PUSHER_APP_ID",
    "PUSHER_KEY",
    "PUSHER_SECRET",
    "PUSHER_CLUSTER",
    "NEXT_PUBLIC_PUSHER_KEY",
    "NEXT_PUBLIC_PUSHER_CLUSTER",
  ];

  const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingVars.length > 0) {
    console.warn(
      `Variables d'environnement manquantes: ${missingVars.join(", ")}`
    );
  }
}

if (process.env.NODE_ENV === "production") {
  validateEnv();
}
