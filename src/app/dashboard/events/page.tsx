import CalendarOverview from "@/components/dashboard/events/dashboard/calendar-overview";
import { EventEvolutionChart } from "@/components/dashboard/events/dashboard/event-evolution-chart";
import { EventsTableWrapper } from "@/components/dashboard/events/dashboard/events-table-wrapper";
import EventsSlider from "@/components/dashboard/events/dashboard/events-slider";
import { SectionCards } from "@/components/dashboard/events/dashboard/section-card-event";
import { SiteHeader } from "@/components/dashboard/events/dashboard/site-header";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

export default function EventOverview() {
  return (
    <main>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />
            <div className="px-12">
              <EventsSlider />
            </div>
            <Separator className="my-6" />
            <div className="px-4 lg:px-6"></div>
            <div className="px-12">
              <EventEvolutionChart />
            </div>
            <Separator className="my-6" />
            <div className="px-12">
              <EventsTableWrapper />
            </div>
            <Separator className="my-6" />
            <div className="px-12">
              <CalendarOverview />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
