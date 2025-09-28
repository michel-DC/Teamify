"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import NotFound from "../not-found";

export default function CatchAllPage() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers la page not-found du dashboard
    router.replace("/dashboard/not-found");
  }, [router]);

  return (
    <div>
      <NotFound />
    </div>
  );
}
