import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function Loader({ className, size = "md", text }: LoaderProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        className
      )}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-primary border-t-transparent",
          sizeClasses[size]
        )}
      />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

interface LoadingScreenProps {
  text?: string;
  className?: string;
}

/**
 * Écran de chargement plein écran avec logo Teamify et spinner violet
 */
export function LoadingScreen({
  text = "Chargement...",
  className,
}: LoadingScreenProps) {
  // Messages de chargement avec des blagues
  const loadingMessages = [
    "Préparation de votre espace de travail... 🚀",
    "Assemblage de votre équipe de rêve... 👥",
    "Chargement de la magie collaborative... ✨",
    "Préparation de votre café virtuel... ☕",
    "Optimisation de votre productivité... 📈",
    "Synchronisation des cerveaux créatifs... 🧠",
    "Chargement de l'innovation... 💡",
    "Préparation de votre succès... 🎯",
  ];

  const randomMessage =
    loadingMessages[Math.floor(Math.random() * loadingMessages.length)];

  return (
    <div
      className={cn(
        "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center",
        className
      )}
    >
      <div className="flex flex-col items-center justify-center gap-6">
        {/* Conteneur pour le logo et le spinner */}
        <div className="relative flex items-center justify-center">
          {/* Spinner violet autour du logo */}
          <div className="absolute w-24 h-24 border-4 border-transparent border-t-[#7C3AED] border-r-[#7C3AED] rounded-full animate-spin"></div>

          <div className="w-16 h-16 flex items-center justify-center bg-transparent">
            <svg
              width="40"
              height="40"
              viewBox="0 0 200 200"
              className="animate-pulse"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#6D5DE6"
                d="M67.588928,55.659035 C63.132870,65.142960 59.154869,74.883087 58.895756,85.834503 C57.951988,125.722717 92.498299,154.946014 132.042084,147.308197 C121.390549,164.157486 105.451347,172.642563 85.696266,173.820190 C69.133499,174.807526 54.733582,169.076370 42.153812,158.284927 C40.127590,156.546753 36.971348,155.455231 34.268719,155.305450 C26.978821,154.901474 19.651806,155.167267 11.156706,155.167267 C14.819064,148.644073 17.777267,142.774231 21.310472,137.273712 C24.093315,132.941360 24.375118,128.880127 23.552240,123.774132 C18.094101,89.906136 39.999531,62.439705 67.588928,55.659035 z"
              />
              <path
                fill="#FCA7DB"
                d="M134.462646,146.101318 C139.807281,135.419189 143.494095,124.258110 143.178696,111.896591 C142.228546,74.656525 107.088242,46.874157 70.237411,54.652622 C77.583656,41.587475 89.344643,33.831497 103.636566,30.120182 C138.611130,21.038012 172.777390,43.277321 178.647552,79.120636 C179.751312,85.860260 178.766129,93.041679 178.034241,99.943878 C177.613342,103.913467 177.676773,107.208740 180.005814,110.682312 C183.331528,115.642326 186.078247,120.992752 189.017960,126.207047 C189.478790,127.024483 189.652710,128.003677 190.319901,129.971878 C183.523132,129.971878 177.295547,130.184998 171.089935,129.907272 C165.720139,129.666962 161.748978,131.334808 157.223633,134.654434 C150.556992,139.544846 142.389099,142.388763 134.462646,146.101318 z"
              />
            </svg>
          </div>
        </div>

        {/* Texte de chargement avec blague */}
        <div className="text-center">
          <p className="text-lg font-medium text-foreground mb-2">
            {text === "Chargement..." ? randomMessage : text}
          </p>
          <div className="flex items-center justify-center gap-1">
            <div className="w-2 h-2 bg-[#7C3AED] rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-[#7C3AED] rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-[#7C3AED] rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
