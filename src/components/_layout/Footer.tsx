import React from "react";
import { cn } from "@/lib/utils";

export const Footer = () => {
  return (
    <footer className="relative w-full bg-black/[0.96] text-white py-12 flex justify-center">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 [background-size:40px_40px] select-none",
          "[background-image:linear-gradient(to_right,#171717_1px,transparent_1px),linear-gradient(to_bottom,#171717_1px,transparent_1px)]"
        )}
      />
      <div className="px-4 w-full max-w-7xl z-99">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 text-xl font-bold">Teamify</h3>
            <p className="text-gray-400">
              Simplifiez l&apos;organisation de vos événements avec Teamify.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-xl font-bold">Liens utiles</h3>
            <ul className="text-gray-400">
              <li className="mb-2">
                <a href="/about" className="hover:text-indigo-500">
                  À propos
                </a>
              </li>
              <li className="mb-2">
                <a href="/contact" className="hover:text-indigo-500">
                  Contact
                </a>
              </li>
              <li className="mb-2">
                <a href="/privacy" className="hover:text-indigo-500">
                  Politique de confidentialité
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-xl font-bold">Ressources</h3>
            <ul className="text-gray-400">
              <li className="mb-2">
                <a href="/blog" className="hover:text-indigo-500">
                  Blog
                </a>
              </li>
              <li className="mb-2">
                <a href="/docs" className="hover:text-indigo-500">
                  Documentation
                </a>
              </li>
              <li className="mb-2">
                <a href="/support" className="hover:text-indigo-500">
                  Support
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-xl font-bold">Suivez-nous</h3>
            <ul className="text-gray-400">
              <li className="mb-2">
                <a
                  href="https://twitter.com/teamify"
                  className="hover:text-indigo-500"
                >
                  Twitter
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="https://facebook.com/teamify"
                  className="hover:text-indigo-500"
                >
                  Facebook
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="https://linkedin.com/company/teamify"
                  className="hover:text-indigo-500"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} Teamify. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};
