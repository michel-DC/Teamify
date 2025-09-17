import { useRouter } from "next/navigation";
import { StepProps } from "@/types/steps";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function Welcome({ next }: Pick<StepProps, "next">) {
  const router = useRouter();

  const handleNext = () => {
    if (next) next();
  };

  const handleExit = () => {
    toast.error("Création d'organisation annulée", {
      duration: 1500,
      onAutoClose: () => {
        router.push("/auth/login");
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Image
          src="/images/illustration/team-welcome-page.png"
          alt="illustration welcome page"
          width={128}
          height={96}
          className="w-24 h-24 mb-4"
        />
      </div>
      <h1 className="text-3xl font-bold text-foreground">
        Bienvenue sur notre plateforme&nbsp;!
      </h1>
      <p className="text-muted-foreground">
        Nous sommes ravis de vous accueillir. Vous êtes sur le point de créer
        votre organisation et de rejoindre notre communauté.
      </p>
      <p className="text-muted-foreground">
        Cliquez sur le bouton ci-dessous pour commencer le processus de
        création.
      </p>
      <div className="flex flex-col sm:flex-row justify-center items-start gap-4 mt-6">
        <Button onClick={handleNext}>Créer mon organisation</Button>
        <Button onClick={handleExit} variant="outline">
          Annuler
        </Button>
      </div>
    </div>
  );
}
