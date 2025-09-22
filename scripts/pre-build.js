#!/usr/bin/env node

/**
 * Script de pré-build pour Railway
 * S'assure que Prisma Client est correctement généré avant le build Next.js
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Obtenir __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🔧 Préparation du build Railway...");

try {
  // Vérifier que Prisma est installé
  console.log("📦 Vérification de Prisma...");
  execSync("npx prisma --version", { stdio: "inherit" });

  // Générer le client Prisma
  console.log("🔨 Génération du client Prisma...");
  execSync("npx prisma generate", { stdio: "inherit" });

  // Vérifier que le client a été généré
  const prismaClientPath = path.join(
    process.cwd(),
    "node_modules/.prisma/client"
  );
  if (!fs.existsSync(prismaClientPath)) {
    throw new Error("Prisma Client n'a pas été généré correctement");
  }

  console.log("✅ Prisma Client généré avec succès");
  console.log("🚀 Prêt pour le build Next.js");
} catch (error) {
  console.error("❌ Erreur lors de la préparation du build:", error.message);
  process.exit(1);
}
