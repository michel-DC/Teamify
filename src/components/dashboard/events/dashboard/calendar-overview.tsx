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
import { addDays, eachDayOfInterval } from "date-fns";
import clsx from "clsx";

export default function CalendarOverview() {
  const [events, setEvents] = React.useState<any[]>([]);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/dashboard/events/data");
        const data = await response.json();
        setEvents(data.events || []);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  const eventColors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-orange-500",
    "bg-red-500",
  ];

  // Génère une map { dateString: ["colorClass1", "colorClass2", ...] }
  const dateToColorsMap: Record<string, string[]> = {};

  events.forEach((event, index) => {
    const color = eventColors[index % eventColors.length];
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    const daysInRange = eachDayOfInterval({ start, end });
    daysInRange.forEach((day) => {
      const key = day.toDateString();
      if (!dateToColorsMap[key]) {
        dateToColorsMap[key] = [];
      }
      dateToColorsMap[key].push(color);
    });
  });

  const renderDay = (day: Date) => {
    const key = day.toDateString();
    const colors = dateToColorsMap[key] || [];

    return (
      <div className="w-full h-full relative">
        <div className="text-sm z-10 relative">{day.getDate()}</div>
        <div className="absolute bottom-0 left-0 right-0 flex gap-0.5 justify-center h-1.5">
          {colors.map((colorClass, idx) => (
            <div
              key={idx}
              className={clsx("w-1.5 h-1.5 rounded-full", colorClass)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Calendrier des événements</CardTitle>
          <CardDescription>
            Calendrier intéractif des évènements futur
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="w-full flex justify-center">
          <div className="w-full max-w-2xl">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              className="bg-transparent p-0 w-full"
              buttonVariant="outline"
              hideNavigation
              classNames={{
                months:
                  "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center h-10",
                caption_label: "text-sm font-medium",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell:
                  "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                day_range_end: "day-range-end",
                day_selected:
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside:
                  "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle:
                  "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
              }}
              renderDay={(date) => {
                const dayEvents = events.filter((event) => {
                  const start = new Date(event.startDate);
                  const end = new Date(event.endDate);
                  return date >= start && date <= end;
                });

                return (
                  <div className="relative flex items-center justify-center w-full h-full">
                    <span>{date.getDate()}</span>
                    {dayEvents.map((event, index) => (
                      <span
                        key={index}
                        className={`absolute bottom-1 h-1 w-2.5 rounded-full ${
                          eventColors[index % eventColors.length]
                        }`}
                      />
                    ))}
                  </div>
                );
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
