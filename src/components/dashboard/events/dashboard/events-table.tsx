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
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "location",
    header: "Lieu",
  },
  {
    accessorKey: "capacity",
    header: "Capacité",
  },
  {
    accessorKey: "startDate",
    header: "Date de début",
    cell: ({ row }) => {
      return row.original.startDate
        ? new Date(row.original.startDate).toLocaleDateString()
        : "Non définie";
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
        event.startDate ? new Date(event.startDate).toLocaleDateString() : "",
        event.endDate ? new Date(event.endDate).toLocaleDateString() : "",
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
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Tableau d&apos;évènements</CardTitle>
          <CardDescription>
            Tableau intéractif listant l&apos;ensemble de vos évènements
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
