import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <h1 className="text-base font-medium">Tableau de bord</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:flex mb-3">
            <a
              href="/dashboard/events/new"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-background"
            >
              Créer un nouvel évènement
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
