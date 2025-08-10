import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
  CardAction,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconTrendingUp } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function PreparationBanner({
  percentage,
  eventCode,
}: {
  percentage: number;
  eventCode: string;
}) {
  const [remainingDays, setRemainingDays] = useState<number | null>(null);
  const [daysColor, setDaysColor] = useState("text-red-600");

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await fetch(`/api/dashboard/events/${eventCode}`);
        const data = await response.json();

        if (data.event?.endDate) {
          const endDate = new Date(data.event.endDate);
          const today = new Date();
          const diffTime = endDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setRemainingDays(diffDays);

          if (diffDays <= 7) {
            setDaysColor("text-red-600");
          } else if (diffDays <= 30) {
            setDaysColor("text-orange-500");
          } else {
            setDaysColor("text-green-600");
          }
        }
      } catch (error) {
        console.error("Error fetching event data:", error);
      }
    };

    fetchEventData();
  }, [eventCode]);

  let barColor = "bg-red-400";
  if (percentage >= 50) barColor = "bg-green-500";
  else if (percentage >= 15) barColor = "bg-orange-400";

  return (
    <Card className="@container/card mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardDescription>Progression de la préparation</CardDescription>
          {remainingDays !== null && (
            <Badge variant="outline" className={daysColor}>
              {remainingDays > 0
                ? `${remainingDays} jours restants`
                : "Événement terminé"}
            </Badge>
          )}
        </div>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {percentage}%
        </CardTitle>
        <CardAction>
          <Badge variant="outline">
            <IconTrendingUp />
            {percentage <= 100 ? "En cours" : "Terminé"}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all ${barColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          Préparation de l&apos;événement <IconTrendingUp className="size-4" />
        </div>
        <div className="text-muted-foreground">
          Progression globale de la préparation de votre événement
        </div>
        <div className="mt-4">
          <Link href={`/dashboard/events/todo/${eventCode}`}>
            <Button>
              {percentage <= 0
                ? "Commencer la progression"
                : "Continuer la progression"}
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
