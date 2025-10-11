"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { formatEventStatus, formatDateToFrench } from "@/lib/utils";

export type Event = {
  id: number;
  title: string;
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;
  location: string;
  capacity: number;
  status: string;
  category: string;
  budget: number | null;
  isCancelled: boolean;
  eventCode: string;
};

/**
 * Extrait le nom de la ville depuis une adresse complète
 */
const extractCityName = (address: string): string => {
  if (!address) return "Non défini";

  // Divise l'adresse par les virgules
  const parts = address.split(",").map((part) => part.trim());

  // Cherche la ville (généralement après le code postal ou dans les premières parties)
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    // Ignore les codes postaux (5 chiffres en France)
    if (/^\d{5}$/.test(part)) continue;
    // Ignore les parties qui ressemblent à des codes ou des numéros
    if (/^\d+$/.test(part)) continue;
    // Retourne la première partie qui ressemble à une ville
    if (
      part.length > 2 &&
      !part.includes("Rue") &&
      !part.includes("Avenue") &&
      !part.includes("Boulevard")
    ) {
      return part;
    }
  }

  // Si aucune ville n'est trouvée, retourne la première partie non vide
  const firstValidPart = parts.find((part) => part.length > 2);
  return firstValidPart || "Ville inconnue";
};

const columns: ColumnDef<Event>[] = [
  {
    accessorKey: "eventCode",
    header: "Code",
    cell: ({ row }) => (
      <span className="font-mono font-bold text-primary">
        {row.original.eventCode}
      </span>
    ),
  },
  {
    accessorKey: "title",
    header: "Titre",
  },
  {
    accessorKey: "category",
    header: "Catégorie",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.category}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {formatEventStatus(row.original.status)}
      </Badge>
    ),
  },
  {
    accessorKey: "location",
    header: "Ville",
    cell: ({ row }) => (
      <span className="text-sm">{extractCityName(row.original.location)}</span>
    ),
  },
  {
    accessorKey: "capacity",
    header: "Capacité",
  },
  {
    accessorKey: "startDate",
    header: "Date de début",
    cell: ({ row }) => {
      return formatDateToFrench(row.original.startDate);
    },
  },
  {
    accessorKey: "isCancelled",
    header: "Activité",
    cell: ({ row }) => {
      const isActive = !row.original.isCancelled;
      return (
        <div className="flex items-center gap-2">
          <div
            className={`size-2 rounded-full ${
              isActive ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className={isActive ? "text-green-600" : "text-red-600"}>
            {isActive ? "Actif" : "Inactif"}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <a
        href={`/dashboard/events/details/${row.original.eventCode}`}
        className="btn btn-outline btn-sm"
      >
        Voir plus
      </a>
    ),
  },
];

/**
 * Convertit les données d'événements en format CSV et déclenche le téléchargement
 */
const exportToCSV = (data: Event[]) => {
  // Définition des en-têtes CSV
  const headers = [
    "Code",
    "Titre",
    "Description",
    "Catégorie",
    "Statut",
    "Lieu",
    "Capacité",
    "Date de début",
    "Date de fin",
    "Budget",
    "Activité",
  ];

  // Conversion des données en lignes CSV
  const csvRows = [
    headers.join(","),
    ...data.map((event) =>
      [
        event.eventCode,
        `"${event.title}"`,
        `"${event.description || ""}"`,
        event.category,
        event.status,
        `"${event.location}"`,
        event.capacity,
        formatDateToFrench(event.startDate),
        formatDateToFrench(event.endDate),
        event.budget || "",
        event.isCancelled ? "Inactif" : "Actif",
      ].join(",")
    ),
  ];

  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `evenements_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export function DataTable({ data }: { data: Event[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card className="pt-0" id="events-table">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Tableau d&apos;événements</CardTitle>
          <CardDescription>
            Tableau intéractif listant l&apos;ensemble de vos événements
          </CardDescription>
        </div>
        <Button
          onClick={() => exportToCSV(data)}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Exporter CSV
        </Button>
      </CardHeader>
      <CardContent className="">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Aucun événement trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
