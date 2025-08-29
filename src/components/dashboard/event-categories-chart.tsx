"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActiveOrganization } from "@/hooks/useActiveOrganization";
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { BarChart3, TrendingUp } from "lucide-react";

interface CategoryData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

// Palette de couleurs basée sur les variables CSS de globals.css
const COLORS = [
  "hsl(var(--chart-1))", // chart-1
  "hsl(var(--chart-2))", // chart-2
  "hsl(var(--chart-3))", // chart-3
  "hsl(var(--chart-4))", // chart-4
  "hsl(var(--chart-5))", // chart-5
  "hsl(var(--primary))", // primary
  "hsl(var(--secondary))", // secondary
  "hsl(var(--accent))", // accent
  "hsl(var(--muted))", // muted
  "hsl(var(--destructive))", // destructive
  "hsl(var(--border))", // border
];

const CATEGORY_LABELS: { [key: string]: string } = {
  REUNION: "Réunion",
  SEMINAIRE: "Séminaire",
  CONFERENCE: "Conférence",
  FORMATION: "Formation",
  ATELIER: "Atelier",
  NETWORKING: "Networking",
  CEREMONIE: "Cérémonie",
  EXPOSITION: "Exposition",
  CONCERT: "Concert",
  SPECTACLE: "Spectacle",
  AUTRE: "Autre",
};

export function EventCategoriesChart() {
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeOrganization } = useActiveOrganization();

  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!activeOrganization) return;

      try {
        const response = await fetch(
          `/api/dashboard/events/data?organizationId=${activeOrganization.publicId}`
        );
        const data = await response.json();

        if (data.events) {
          // Compter les événements par catégorie
          const categoryCounts: { [key: string]: number } = {};
          data.events.forEach((event: any) => {
            const category = event.category || "AUTRE";
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
          });

          const totalEvents = data.events.length;

          // Transformer en format pour le graphique avec pourcentages
          const chartData: CategoryData[] = Object.entries(categoryCounts)
            .map(([category, count], index) => ({
              name: CATEGORY_LABELS[category] || category,
              value: count,
              color: COLORS[index % COLORS.length],
              percentage: totalEvents > 0 ? (count / totalEvents) * 100 : 0,
            }))
            .sort((a, b) => b.value - a.value);

          setCategoryData(chartData);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des catégories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [activeOrganization]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = data.percentage || 0;
      return (
        <div className="bg-card p-4 border rounded-xl shadow-xl backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <p className="font-semibold text-card-foreground">{data.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-lg font-bold text-card-foreground">
              {data.value} événement{data.value > 1 ? "s" : ""}
            </p>
            <p className="text-sm text-muted-foreground">
              {percentage.toFixed(1)}% du total
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/50 border-b">
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <BarChart3 className="h-5 w-5 text-primary" />
            Répartition par catégorie
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (categoryData.length === 0) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/50 border-b">
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <BarChart3 className="h-5 w-5 text-primary" />
            Répartition par catégorie
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
            <BarChart3 className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">Aucune donnée disponible</p>
            <p className="text-sm">
              Créez des événements pour voir les statistiques
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalEvents = categoryData.reduce(
    (sum, category) => sum + category.value,
    0
  );
  const topCategory = categoryData[0];

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <BarChart3 className="h-5 w-5 text-primary" />
            Répartition par catégorie
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>{totalEvents} événements</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-64 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => {
                  const safePercentage = percentage || 0;
                  return safePercentage > 5
                    ? `${name} ${safePercentage.toFixed(0)}%`
                    : "";
                }}
                outerRadius={90}
                innerRadius={40}
                fill="hsl(var(--primary))"
                dataKey="value"
                paddingAngle={2}
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
