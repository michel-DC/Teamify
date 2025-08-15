// import CalendarOverview from "@/components/dashboard/events/dashboard/calendar-overview";
import { EventEvolutionChart } from "@/components/dashboard/events/dashboard/event-evolution-chart";
import { EventsTableWrapper } from "@/components/dashboard/events/dashboard/events-table-wrapper";
import EventsSlider from "@/components/dashboard/events/dashboard/events-slider";
import { SectionCards } from "@/components/dashboard/events/dashboard/section-card-event";
import { SiteHeader } from "@/components/dashboard/events/dashboard/site-header";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ActiveOrganizationIndicator } from "@/components/active-organization-indicator";

export default function EventOverview() {
  return (
    <div>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">
                  Tableau de bord
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Évènements</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="px-4 py-2">
        <ActiveOrganizationIndicator />
      </div>

      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />
            <Separator className="my-6" />
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
            {/* <div className="px-12">
              <CalendarOverview />
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
