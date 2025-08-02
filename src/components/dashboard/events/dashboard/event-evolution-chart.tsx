"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Event = {
  id: number;
  createdAt: string;
  status: string;
};

type ChartData = {
  date: string;
  total: number;
  published: number;
  draft: number;
};

const chartConfig = {
  total: {
    label: "Total",
    color: "var(--chart-1)",
  },
  published: {
    label: "Publiés",
    color: "var(--chart-2)",
  },
  draft: {
    label: "Brouillons",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function EventEvolutionChart() {
  const [timeRange, setTimeRange] = React.useState("7d");
  const [chartData, setChartData] = React.useState<ChartData[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/dashboard/events/data");
        const data = await response.json();

        // Transformer les données pour le graphique
        const events = data.events as Event[];
        const now = new Date();
        const daysToSubtract =
          timeRange === "30d" ? 30 : timeRange === "7d" ? 7 : 90;
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - daysToSubtract);

        // Créer un objet pour stocker les données par date
        const dataByDate: { [key: string]: ChartData } = {};

        // Initialiser toutes les dates dans la plage
        for (
          let d = new Date(startDate);
          d <= now;
          d.setDate(d.getDate() + 1)
        ) {
          const dateStr = d.toISOString().split("T")[0];
          dataByDate[dateStr] = {
            date: dateStr,
            total: 0,
            published: 0,
            draft: 0,
          };
        }

        // Compter les événements par date
        events.forEach((event) => {
          const eventDate = new Date(event.createdAt)
            .toISOString()
            .split("T")[0];
          if (dataByDate[eventDate]) {
            dataByDate[eventDate].total++;
            if (event.status === "PUBLIE") {
              dataByDate[eventDate].published++;
            } else if (event.status === "BROUILLON") {
              dataByDate[eventDate].draft++;
            }
          }
        });

        // Convertir en tableau et trier par date
        const sortedData = Object.values(dataByDate).sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        setChartData(sortedData);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchData();
  }, [timeRange]);

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Évolution des événements</CardTitle>
          <CardDescription>
            Nombre d&apos;événements créés sur la période sélectionnée
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Sélectionner une période"
          >
            <SelectValue placeholder="3 derniers mois" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              3 derniers mois
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              30 derniers jours
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              7 derniers jours
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-total)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-total)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillPublished" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-published)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-published)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillDraft" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-draft)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-draft)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("fr-FR", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("fr-FR", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="draft"
              type="monotone"
              fill="url(#fillDraft)"
              stroke="var(--color-draft)"
              stackId="a"
            />
            <Area
              dataKey="published"
              type="monotone"
              fill="url(#fillPublished)"
              stroke="var(--color-published)"
              stackId="a"
            />
            <Area
              dataKey="total"
              type="monotone"
              fill="url(#fillTotal)"
              stroke="var(--color-total)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
