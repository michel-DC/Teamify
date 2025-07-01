"use client";

import * as React from "react";
import { type DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { addDays, eachDayOfInterval, format, isToday } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, CircleIcon } from "lucide-react";
import clsx from "clsx";

interface Event {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location: string;
  category: string;
  status: string;
}

// Palette de couleurs harmonieuses pour les catégories
const categoryColors: Record<string, { bg: string; text: string }> = {
  REUNION: { bg: "#3b82f6", text: "#1e40af" },
  SEMINAIRE: { bg: "#8b5cf6", text: "#5b21b6" },
  CONFERENCE: { bg: "#10b981", text: "#047857" },
  FORMATION: { bg: "#f59e0b", text: "#b45309" },
  ATELIER: { bg: "#ec4899", text: "#be185d" },
  NETWORKING: { bg: "#14b8a6", text: "#0f766e" },
  CEREMONIE: { bg: "#f97316", text: "#c2410c" },
  EXPOSITION: { bg: "#6366f1", text: "#4338ca" },
  CONCERT: { bg: "#f43f5e", text: "#be123c" },
  SPECTACLE: { bg: "#a855f7", text: "#7c3aed" },
  AUTRE: { bg: "#6b7280", text: "#374151" },
};

export default function CalendarOverview() {
  const [events, setEvents] = React.useState<Event[]>([]);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [loading, setLoading] = React.useState(true);
  const [hoveredCategory, setHoveredCategory] = React.useState<string | null>(
    null
  );

  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/dashboard/events/data");
        const data = await response.json();
        setEvents(data.events || []);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Créer une map des événements par date
  const eventsByDate = React.useMemo(() => {
    const map: Record<string, Event[]> = {};

    events.forEach((event) => {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      const days = eachDayOfInterval({ start, end });

      days.forEach((day) => {
        const key = format(day, "yyyy-MM-dd");
        if (!map[key]) map[key] = [];
        map[key].push(event);
      });
    });

    return map;
  }, [events]);

  // Obtenir les catégories uniques avec leur nombre d'événements
  const categoriesWithCount = React.useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach((event) => {
      counts[event.category] = (counts[event.category] || 0) + 1;
    });
    return counts;
  }, [events]);

  const renderDay = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    const dayEvents = eventsByDate[dateKey] || [];
    const isCurrentDay = isToday(date);

    // Grouper par catégorie pour éviter les doublons visuels
    const uniqueCategories = [...new Set(dayEvents.map((e) => e.category))];
    const filteredCategories = hoveredCategory
      ? uniqueCategories.filter((cat) => cat === hoveredCategory)
      : uniqueCategories;

    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div
              className={clsx(
                "relative w-full h-full flex flex-col items-center justify-center p-1 cursor-pointer transition-colors rounded-md",
                "hover:bg-accent/50",
                isCurrentDay && "font-bold"
              )}
            >
              <span className={clsx("text-sm", isCurrentDay && "text-primary")}>
                {date.getDate()}
              </span>

              {filteredCategories.length > 0 && (
                <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-0.5">
                  {filteredCategories.slice(0, 3).map((category, idx) => (
                    <div
                      key={idx}
                      className="w-1.5 h-1.5 rounded-full transition-transform hover:scale-125"
                      style={{
                        backgroundColor:
                          categoryColors[category]?.bg || "#6b7280",
                      }}
                    />
                  ))}
                  {filteredCategories.length > 3 && (
                    <span className="text-[8px] text-muted-foreground">
                      +{filteredCategories.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </TooltipTrigger>

          {dayEvents.length > 0 && (
            <TooltipContent className="max-w-xs p-3">
              <div className="space-y-2">
                <p className="font-medium text-sm">
                  {format(date, "EEEE d MMMM", { locale: fr })}
                </p>
                <div className="space-y-1">
                  {dayEvents.slice(0, 5).map((event, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <CircleIcon
                        className="w-2 h-2"
                        fill={categoryColors[event.category]?.bg || "#6b7280"}
                        style={{
                          color:
                            categoryColors[event.category]?.bg || "#6b7280",
                        }}
                      />
                      <span className="truncate">{event.title}</span>
                    </div>
                  ))}
                  {dayEvents.length > 5 && (
                    <p className="text-xs text-muted-foreground">
                      +{dayEvents.length - 5} autres événements
                    </p>
                  )}
                </div>
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            <CardTitle>Calendrier des événements</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full animate-pulse bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Calendrier des événements</CardTitle>
            </div>
            <CardDescription>
              {events.length} événement{events.length > 1 ? "s" : ""} planifié
              {events.length > 1 ? "s" : ""}
            </CardDescription>
          </div>

          {/* Indicateur du jour actuel */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>Aujourd'hui</span>
          </div>
        </div>

        {/* Légende des catégories */}
        {Object.keys(categoriesWithCount).length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={clsx(
                "h-7 px-2 text-xs",
                !hoveredCategory && "bg-accent"
              )}
              onClick={() => setHoveredCategory(null)}
            >
              Toutes
            </Button>
            {Object.entries(categoriesWithCount).map(([category, count]) => {
              const color = categoryColors[category];
              const isActive = hoveredCategory === category;

              return (
                <Button
                  key={category}
                  variant="ghost"
                  size="sm"
                  className={clsx(
                    "h-7 px-2 text-xs transition-all",
                    isActive && "ring-2 ring-offset-1"
                  )}
                  style={{
                    backgroundColor: isActive ? color?.bg + "20" : undefined,
                    borderColor: isActive ? color?.bg : undefined,
                  }}
                  onClick={() => setHoveredCategory(isActive ? null : category)}
                  onMouseEnter={() => !isActive && setHoveredCategory(category)}
                  onMouseLeave={() => !isActive && setHoveredCategory(null)}
                >
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: color?.bg || "#6b7280" }}
                    />
                    <span>
                      {category.charAt(0) + category.slice(1).toLowerCase()}
                    </span>
                    <span className="text-muted-foreground">({count})</span>
                  </div>
                </Button>
              );
            })}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-6">
        <div className="w-full">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
            className="w-full"
            classNames={{
              months: "flex flex-col sm:flex-row gap-4",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium",
              nav: "space-x-1 flex items-center",
              nav_button: clsx(
                "h-7 w-7 bg-transparent p-0 hover:opacity-100 opacity-50",
                "hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
              ),
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell:
                "text-muted-foreground rounded-md w-10 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "relative h-10 w-10 text-center text-sm p-0 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: clsx(
                "h-10 w-10 p-0 font-normal",
                "hover:bg-transparent aria-selected:opacity-100"
              ),
              day_selected:
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day_today: "bg-accent text-accent-foreground",
              day_outside: "text-muted-foreground opacity-50",
              day_disabled: "text-muted-foreground opacity-50",
              day_range_middle:
                "aria-selected:bg-accent aria-selected:text-accent-foreground",
              day_hidden: "invisible",
            }}
            renderDay={renderDay}
          />
        </div>

        {/* Message si aucun événement */}
        {events.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Aucun événement programmé</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
