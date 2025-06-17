import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PreparationBanner({
  percentage,
}: {
  percentage: number;
}) {
  let color = "text-red-600";
  if (percentage >= 50) color = "text-green-600";
  else if (percentage >= 15) color = "text-orange-500";

  let barColor = "bg-red-400";
  if (percentage >= 50) barColor = "bg-green-500";
  else if (percentage >= 15) barColor = "bg-orange-400";

  return (
    <Card className="mb-6">
      <CardContent className="py-6">
        <CardHeader>
          <Badge>Préparation de l'évènement</Badge>
        </CardHeader>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-base">
              Préparation de l'événement
            </span>
            <span
              className={`font-bold text-xl min-w-[60px] text-right ${color}`}
            >
              {percentage}%
            </span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all ${barColor}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
