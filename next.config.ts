import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // images: {
  //   domains: ["images.unsplash.com", "img.freepik.com"],
  // },
  webpack: (config, { isServer }) => {
    // Ajouter l'insensibilité à la casse
    config.module.rules.push({
      test: /\.js$/,
      resolve: {
        fullySpecified: false,
      },
    });

    // Désactiver le contrôle de casse dans webpack
    if (config.resolve) {
      config.resolve.symlinks = false;
    }

    return config;
  },
};

export default nextConfig;
