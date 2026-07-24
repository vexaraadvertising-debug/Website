"use client";

import { Download, FileText, FileSpreadsheet, FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportButtonsProps {
  data: any[];
  filename: string;
  columns: { header: string; key: string }[];
}

export function ExportButtons({ data, filename, columns }: ExportButtonsProps) {
  
  const handleExportCSV = () => {
    const csvContent = [
      columns.map(c => c.header).join(","),
      ...data.map(row => 
        columns.map(c => {
          const val = row[c.key]?.toString() || "";
          return `"${val.replace(/"/g, '""')}"`;
        }).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    const worksheetData = data.map(row => {
      const obj: any = {};
      columns.forEach(c => {
        obj[c.header] = row[c.key];
      });
      return obj;
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    autoTable(doc, {
      head: [columns.map(c => c.header)],
      body: data.map(row => columns.map(c => row[c.key]?.toString() || "")),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [255, 45, 150] }, // Magenta
    });

    doc.save(`${filename}.pdf`);
  };

  return (
    <DropdownMenu>
      {/* @ts-ignore */}
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="bg-background">
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV}>
          <FileText className="mr-2 h-4 w-4" /> CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportExcel}>
          <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF}>
          <FileIcon className="mr-2 h-4 w-4" /> PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
