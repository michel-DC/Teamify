"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

/**
 * @param Script d'initialisation du thème
 *
 * Évite le flash de contenu en définissant le thème avant le rendu
 */
const ThemeScript = ({
  defaultTheme = "light",
  storageKey = "theme",
}: {
  defaultTheme: Theme;
  storageKey: string;
}) => {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              var theme = localStorage.getItem('${storageKey}') || '${defaultTheme}';
              document.documentElement.classList.toggle('dark', theme === 'dark');
            } catch (e) {
              document.documentElement.classList.toggle('dark', '${defaultTheme}' === 'dark');
            }
          })();
        `,
      }}
    />
  );
};

/**
 * @param Provider de thème global
 *
 * Gère le thème de l'application avec persistance dans localStorage
 * et définit le thème clair par défaut
 */
export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "theme",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    // Récupérer le thème sauvegardé ou utiliser le thème par défaut
    const savedTheme = localStorage.getItem(storageKey) as Theme | null;
    const currentTheme = savedTheme || defaultTheme;

    setTheme(currentTheme);
    document.documentElement.classList.toggle("dark", currentTheme === "dark");
  }, [defaultTheme, storageKey]);

  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem(storageKey, newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <>
      <ThemeScript defaultTheme={defaultTheme} storageKey={storageKey} />
      <ThemeContext.Provider value={{ theme, setTheme: updateTheme }}>
        {children}
      </ThemeContext.Provider>
    </>
  );
}

/**
 * @param Hook pour utiliser le thème
 *
 * Permet d'accéder au thème actuel et de le modifier depuis n'importe quel composant
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error(
      "useTheme doit être utilisé à l'intérieur d'un ThemeProvider"
    );
  }
  return context;
}
