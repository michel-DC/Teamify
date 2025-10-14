import { defineConfig } from "cypress";
import { config } from "dotenv";

// Charger les variables d'environnement de test
config({ path: ".env.test" });

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || "http://localhost:3000",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: process.env.CYPRESS_VIDEO === "true",
    screenshotOnRunFailure:
      process.env.CYPRESS_SCREENSHOT_ON_RUN_FAILURE === "true",
    experimentalStudio: true,
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    fixturesFolder: "cypress/fixtures",
    screenshotsFolder: "cypress/screenshots",
    videosFolder: "cypress/videos",
    downloadsFolder: "cypress/downloads",
    defaultCommandTimeout: parseInt(
      process.env.CYPRESS_DEFAULT_COMMAND_TIMEOUT || "10000"
    ),
    requestTimeout: parseInt(process.env.CYPRESS_REQUEST_TIMEOUT || "10000"),
    responseTimeout: parseInt(process.env.CYPRESS_RESPONSE_TIMEOUT || "10000"),
    retries: {
      runMode: parseInt(process.env.CYPRESS_RETRY_ATTEMPTS || "3"),
      openMode: parseInt(process.env.CYPRESS_RETRY_ATTEMPTS || "3"),
    },
    setupNodeEvents(on, config) {
      // Configuration des plugins
      // Les plugins sont chargés automatiquement
    },
  },
  env: {
    apiUrl: process.env.NEXT_PUBLIC_APP_URL + "/api",
    // Variables d'environnement pour les tests
    testUserEmail: "test@example.com",
    testUserPassword: "TestPassword123!",
    testAdminEmail: "admin@example.com",
    testAdminPassword: "AdminPassword123!",
    // Variables d'environnement du fichier .env.test
    ...process.env,
  },
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
});
