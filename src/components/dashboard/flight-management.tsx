"use client";

import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Edit,
  Eye,
  FileSpreadsheet,
  Loader2,
  Plane,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

// Column mapping: XLS header -> field name
const XLS_COLUMNS = [
  { header: "Tanggal", field: "tanggal" },
  { header: "Operator", field: "operator" },
  { header: "Transit", field: "transit" },
  { header: "Kapasitas Kursi", field: "kapasitasKursi" },
  { header: "Datang Asal", field: "datangAsal" },
  { header: "Datang Tujuan", field: "datangTujuan" },
  { header: "Datang Flight Number", field: "datangFlightNumber" },
  { header: "Datang Dewasa", field: "datangDewasa" },
  { header: "Datang Anak", field: "datangAnak" },
  { header: "Datang Bayi", field: "datangBayi" },
  { header: "Datang Bagasi (Kg)", field: "datangBagasi" },
  { header: "Datang Cargo (Kg)", field: "datangCargo" },
  { header: "Datang Pergerakan", field: "datangPergerakan" },
  { header: "Berangkat Asal", field: "berangkatAsal" },
  { header: "Berangkat Tujuan", field: "berangkatTujuan" },
  { header: "Berangkat Flight Number", field: "berangkatFlightNumber" },
  { header: "Berangkat Dewasa", field: "berangkatDewasa" },
  { header: "Berangkat Anak", field: "berangkatAnak" },
  { header: "Berangkat Bayi", field: "berangkatBayi" },
  { header: "Berangkat Bagasi (Kg)", field: "berangkatBagasi" },
  { header: "Berangkat Cargo (Kg)", field: "berangkatCargo" },
  { header: "Berangkat Pergerakan", field: "berangkatPergerakan" },
];

type ImportRow = Record<string, unknown>;

type ImportResult = {
  success: number;
  failed: number;
  errors: { row: number; error: string }[];
};

type Flight = {
  id: string;
  tanggal: string;
  operator: string;
  transit: string | null;
  kapasitasKursi: number | null;
  datangAsal: string;
  datangTujuan: string;
  datangFlightNumber: string;
  datangDewasa: string | null;
  datangAnak: string | null;
  datangBayi: string | null;
  datangBagasi: string | null;
  datangCargo: string | null;
  datangPergerakan: string | null;
  berangkatAsal: string;
  berangkatTujuan: string;
  berangkatFlightNumber: string;
  berangkatDewasa: string | null;
  berangkatAnak: string | null;
  berangkatBayi: string | null;
  berangkatBagasi: string | null;
  berangkatCargo: string | null;
  berangkatPergerakan: string | null;
  createdAt: string;
  updatedAt: string;
};

type Maskapai = {
  id: string;
  kode: string;
  nama: string;
  kontak: string;
  email: string;
  status: "active" | "inactive";
};

export function FlightManagement({
  onMonthChange,
  onFlightsLoaded,
}: {
  onMonthChange?: (month: string) => void;
  onFlightsLoaded?: (flights: Flight[]) => void;
} = {}) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [operators, setOperators] = useState<Maskapai[]>([]);
  const [loading, setLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFlights, setTotalFlights] = useState(0);

  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [searchOperator, setSearchOperator] = useState<string>("");
  const pageSize = 15;

  // Multi-delete
  const [selectedFlightIds, setSelectedFlightIds] = useState<string[]>([]);
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);

  // Import XLS state
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importFileName, setImportFileName] = useState<string>("");
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  // Notify parent when selectedMonth or flights change
  useEffect(() => {
    onMonthChange?.(selectedMonth);
  }, [selectedMonth]);

  useEffect(() => {
    onFlightsLoaded?.(flights);
  }, [flights]);

  const getAvailableMonths = () => {
    const months = new Set<string>();
    flights.forEach((flight) => {
      const date = new Date(flight.tanggal);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      months.add(monthKey);
    });
    return Array.from(months).sort().reverse();
  };

  // Filter flights by selected month and search operator
  const filteredFlights = flights.filter((flight) => {
    if (selectedMonth !== "all") {
      const date = new Date(flight.tanggal);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (monthKey !== selectedMonth) return false;
    }

    if (searchOperator.trim() !== "") {
      if (
        !flight.operator
          .toLowerCase()
          .includes(searchOperator.trim().toLowerCase())
      ) {
        return false;
      }
    }

    return true;
  });

  const isFiltered = selectedMonth !== "all" || searchOperator.trim() !== "";

  // Client-side pagination over filteredFlights (works for both filtered and unfiltered)
  const displayList = filteredFlights;
  const displayTotalPages = Math.max(1, Math.ceil(displayList.length / pageSize));
  const paginatedFlights = displayList.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const availableMonths = getAvailableMonths();

  const [formData, setFormData] = useState({
    tanggal: "",
    operator: "",
    transit: "",
    kapasitasKursi: "",
    datangAsal: "",
    datangTujuan: "",
    datangFlightNumber: "",
    datangDewasa: "",
    datangAnak: "",
    datangBayi: "",
    datangBagasi: "",
    datangCargo: "",
    datangPergerakan: "",
    berangkatAsal: "",
    berangkatTujuan: "",
    berangkatFlightNumber: "",
    berangkatDewasa: "",
    berangkatAnak: "",
    berangkatBayi: "",
    berangkatBagasi: "",
    berangkatCargo: "",
    berangkatPergerakan: "",
  });

  // Initial fetches
  useEffect(() => {
    fetchAllFlightsForMonths();
    fetchOperators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-populate departure route based on arrival route
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth, searchOperator]);

  // Auto-populate departure route based on arrival route
  useEffect(() => {
    if (
      formData.datangAsal &&
      formData.datangTujuan &&
      !formData.berangkatAsal &&
      !formData.berangkatTujuan
    ) {
      setFormData((prev) => ({
        ...prev,
        berangkatAsal: formData.datangTujuan,
        berangkatTujuan: formData.datangAsal,
      }));
    }
  }, [formData.datangAsal, formData.datangTujuan]);

  const fetchAllFlightsForMonths = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/flights?page=1&limit=10000");
      if (!response.ok) throw new Error("Failed to fetch all flights");
      const data = await response.json();
      setFlights(data.flights || []);
      setTotalFlights(data.pagination?.total || data.flights?.length || 0);
      setTotalPages(1);
    } catch (error) {
      console.error("Error fetching all flights:", error);
      toast({
        title: "Error",
        description: "Failed to load flights",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFlights = async (page = currentPage) => {
    try {
      const response = await fetch(
        `/api/flights?page=${page}&limit=${pageSize}`,
      );
      if (!response.ok) throw new Error("Failed to fetch flights");
      const data = await response.json();
      setFlights(data.flights);
      setTotalPages(data.pagination.totalPages);
      setTotalFlights(data.pagination.total);
      setCurrentPage(data.pagination.page);
    } catch (error) {
      console.error("Error fetching flights:", error);
      toast({
        title: "Error",
        description: "Failed to load flights",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOperators = async () => {
    try {
      const response = await fetch("/api/dashboard/maskapai");
      if (!response.ok) throw new Error("Failed to fetch operators");
      const data = await response.json();
      setOperators(data);
    } catch (error) {
      console.error("Error fetching operators:", error);
      toast({
        title: "Error",
        description: "Failed to fetch operators",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url =
        isEditing && editingFlight
          ? `/api/flights/${editingFlight.id}`
          : "/api/flights";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(
          `Failed to ${isEditing ? "update" : "add"} flight: ${
            errorData.error || response.statusText
          }`,
        );
      }

      toast({
        title: "Success",
        description: `Flight ${isEditing ? "updated" : "added"} successfully`,
      });

      setIsDialogOpen(false);
      setIsEditing(false);
      setEditingFlight(null);
      setFormData({
        tanggal: "",
        operator: "",
        transit: "",
        kapasitasKursi: "",
        datangAsal: "",
        datangTujuan: "",
        datangFlightNumber: "",
        datangDewasa: "",
        datangAnak: "",
        datangBayi: "",
        datangBagasi: "",
        datangCargo: "",
        datangPergerakan: "",
        berangkatAsal: "",
        berangkatTujuan: "",
        berangkatFlightNumber: "",
        berangkatDewasa: "",
        berangkatAnak: "",
        berangkatBayi: "",
        berangkatBagasi: "",
        berangkatCargo: "",
        berangkatPergerakan: "",
      });

      fetchFlights();
    } catch (error) {
      console.error(
        `Error ${isEditing ? "updating" : "adding"} flight:`,
        error,
      );
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "add"} flight`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (flight: Flight) => {
    setIsEditing(true);
    setEditingFlight(flight);
    setFormData({
      tanggal: flight.tanggal,
      operator: flight.operator,
      transit: flight.transit || "",
      kapasitasKursi: flight.kapasitasKursi?.toString() || "",
      datangAsal: flight.datangAsal,
      datangTujuan: flight.datangTujuan,
      datangFlightNumber: flight.datangFlightNumber,
      datangDewasa: flight.datangDewasa || "",
      datangAnak: flight.datangAnak || "",
      datangBayi: flight.datangBayi || "",
      datangBagasi: flight.datangBagasi || "",
      datangCargo: flight.datangCargo || "",
      datangPergerakan: flight.datangPergerakan || "",
      berangkatAsal: flight.berangkatAsal,
      berangkatTujuan: flight.berangkatTujuan,
      berangkatFlightNumber: flight.berangkatFlightNumber,
      berangkatDewasa: flight.berangkatDewasa || "",
      berangkatAnak: flight.berangkatAnak || "",
      berangkatBayi: flight.berangkatBayi || "",
      berangkatBagasi: flight.berangkatBagasi || "",
      berangkatCargo: flight.berangkatCargo || "",
      berangkatPergerakan: flight.berangkatPergerakan || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (flight: Flight) => {
    if (
      !confirm(
        `Are you sure you want to delete flight ${flight.datangFlightNumber}?`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/flights/${flight.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete flight");

      toast({
        title: "Success",
        description: "Flight deleted successfully",
      });

      setSelectedFlightIds((prev) => prev.filter((x) => x !== flight.id));
      fetchFlights();
    } catch (error) {
      console.error("Error deleting flight:", error);
      toast({
        title: "Error",
        description: "Failed to delete flight",
        variant: "destructive",
      });
    }
  };

  const toggleSelectFlight = (id: string, checked: boolean) => {
    setSelectedFlightIds((prev) => {
      if (checked) {
        if (prev.includes(id)) return prev;
        return [...prev, id];
      }
      return prev.filter((x) => x !== id);
    });
  };

  const handleSelectAllVisible = (checked: boolean) => {
    const visibleIds = filteredFlights.map((f) => f.id);
    setSelectedFlightIds((prev) => {
      if (checked) {
        const set = new Set(prev);
        visibleIds.forEach((id) => set.add(id));
        return Array.from(set);
      }
      const visibleSet = new Set(visibleIds);
      return prev.filter((id) => !visibleSet.has(id));
    });
  };

  const selectedCount = selectedFlightIds.length;

  const handleMultiDelete = async () => {
    if (selectedCount === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${selectedCount} selected flight(s)?`,
      )
    ) {
      return;
    }

    setIsDeletingSelected(true);
    try {
      const response = await fetch("/api/flights/multi-delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedFlightIds }),
      });

      if (!response.ok) throw new Error("Failed to multi-delete flights");

      const data = (await response.json()) as { deletedCount?: number };

      toast({
        title: "Success",
        description: `Deleted ${data.deletedCount ?? selectedCount} flight(s)`,
      });

      setSelectedFlightIds([]);
      fetchFlights();
    } catch (error) {
      console.error("Error multi-deleting flights:", error);
      toast({
        title: "Error",
        description: "Failed to delete selected flights",
        variant: "destructive",
      });
    } finally {
      setIsDeletingSelected(false);
    }
  };

  // ─── Download template XLS ───────────────────────────────────────────────
  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      XLS_COLUMNS.map((c) => c.header),
      [
        "2026-01-15",
        "Garuda Indonesia",
        "0",
        "180",
        "CGK",
        "BEJ",
        "GA-123",
        "80",
        "10",
        "2",
        "500",
        "100",
        "1",
        "BEJ",
        "CGK",
        "GA-124",
        "75",
        "8",
        "1",
        "480",
        "90",
        "1",
      ],
    ]);

    ws["!cols"] = XLS_COLUMNS.map((c) =>
      c.header.length > 12 ? { wch: c.header.length + 4 } : { wch: 16 },
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Flight");
    XLSX.writeFile(wb, "template_import_flight.xlsx");
  };

  // ─── Parse uploaded XLS file ──────────────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const wb = XLSX.read(data, { type: "binary", cellDates: false });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
          header: 1,
          defval: "",
        });

        if (jsonData.length < 2) {
          toast({
            title: "Error",
            description: "File kosong atau tidak ada data selain header",
            variant: "destructive",
          });
          return;
        }

        const headers = jsonData[0] as string[];
        const rows: ImportRow[] = [];

        for (let i = 1; i < jsonData.length; i++) {
          const rowArr = jsonData[i] as unknown[];
          if (rowArr.every((v) => v === "" || v === null || v === undefined))
            continue;

          const row: ImportRow = {};
          XLS_COLUMNS.forEach((col) => {
            const headerIdx = headers.findIndex(
              (h) =>
                String(h).trim().toLowerCase() === col.header.toLowerCase(),
            );
            row[col.field] = headerIdx >= 0 ? rowArr[headerIdx] : "";
          });
          rows.push(row);
        }

        setImportRows(rows);
        toast({
          title: "File berhasil dibaca",
          description: `${rows.length} baris data ditemukan`,
        });
      } catch (err) {
        console.error("Error parsing XLS:", err);
        toast({
          title: "Error",
          description:
            "Gagal membaca file. Pastikan format file XLS/XLSX benar.",
          variant: "destructive",
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (importRows.length === 0) return;
    setIsImporting(true);
    setImportResult(null);
    try {
      const response = await fetch("/api/flights/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: importRows }),
      });
      const result: ImportResult = await response.json();
      setImportResult(result);
      if (result.success > 0) {
        toast({
          title: "Import Selesai",
          description: `${result.success} data berhasil diimport${
            result.failed > 0 ? `, ${result.failed} gagal` : ""
          }`,
        });
        fetchAllFlightsForMonths();
      } else {
        toast({
          title: "Import Gagal",
          description: `Semua ${result.failed} baris gagal diimport`,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Import error:", err);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat import data",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const resetImport = () => {
    setImportRows([]);
    setImportFileName("");
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  _setImportOpen = setIsImportDialogOpen;
  _setAddOpen = setIsDialogOpen;

  const allVisibleSelected =
    paginatedFlights.length > 0 &&
    paginatedFlights.every((f) => selectedFlightIds.includes(f.id));

  const ImportXLSDialog = (
    <Dialog
      open={isImportDialogOpen}
      onOpenChange={(open) => {
        setIsImportDialogOpen(open);
        if (!open) resetImport();
      }}
    >
            <DialogContent className="w-[95vw] max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Import Data Penerbangan dari XLS
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                        1
                      </span>
                      Download Template
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-3">
                      Download template XLS berikut, isi data penerbangan sesuai
                      kolom yang tersedia, lalu upload kembali.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadTemplate}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download template_import_flight.xlsx
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                        2
                      </span>
                      Upload File XLS / XLSX
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div
                      className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/60 hover:bg-muted/40 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      {importFileName ? (
                        <p className="text-sm font-medium">{importFileName}</p>
                      ) : (
                        <>
                          <p className="text-sm font-medium">
                            Klik untuk pilih file
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Mendukung format .xls dan .xlsx
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xls,.xlsx"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    {importFileName && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-muted-foreground"
                        onClick={resetImport}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Hapus file
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {importRows.length > 0 && !importResult && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                            3
                          </span>
                          Preview Data
                        </span>
                        <Badge variant="secondary">
                          {importRows.length} baris
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="overflow-auto max-h-60 rounded border text-xs">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="whitespace-nowrap">
                                No
                              </TableHead>
                              <TableHead className="whitespace-nowrap">
                                Tanggal
                              </TableHead>
                              <TableHead className="whitespace-nowrap">
                                Operator
                              </TableHead>
                              <TableHead className="whitespace-nowrap">
                                Dtg Flight#
                              </TableHead>
                              <TableHead className="whitespace-nowrap">
                                Dtg Asal → Tujuan
                              </TableHead>
                              <TableHead className="whitespace-nowrap">
                                Brkt Flight#
                              </TableHead>
                              <TableHead className="whitespace-nowrap">
                                Brkt Asal → Tujuan
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {importRows.slice(0, 50).map((row, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell className="whitespace-nowrap">
                                  {String(row.tanggal ?? "")}
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                  {String(row.operator ?? "")}
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                  {String(row.datangFlightNumber ?? "")}
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                  {String(row.datangAsal ?? "")} →{" "}
                                  {String(row.datangTujuan ?? "")}
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                  {String(row.berangkatFlightNumber ?? "")}
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                  {String(row.berangkatAsal ?? "")} →{" "}
                                  {String(row.berangkatTujuan ?? "")}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      {importRows.length > 50 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Menampilkan 50 dari {importRows.length} baris.
                        </p>
                      )}
                      <div className="flex justify-end mt-4">
                        <Button onClick={handleImport} disabled={isImporting}>
                          {isImporting ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          {isImporting
                            ? "Mengimport..."
                            : `Import ${importRows.length} Data`}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {importResult && (
                  <Card
                    className={
                      importResult.failed === 0
                        ? "border-green-500/50"
                        : "border-orange-500/50"
                    }
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        {importResult.failed === 0 ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                        )}
                        Hasil Import
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="flex gap-4">
                        <Badge className="bg-green-500 hover:bg-green-600">
                          {importResult.success} Berhasil
                        </Badge>
                        {importResult.failed > 0 && (
                          <Badge variant="destructive">
                            {importResult.failed} Gagal
                          </Badge>
                        )}
                      </div>
                      {importResult.errors.length > 0 && (
                        <div className="space-y-1 max-h-40 overflow-auto">
                          <p className="text-xs font-medium text-muted-foreground">
                            Detail error:
                          </p>
                          {importResult.errors.map((err, i) => (
                            <p key={i} className="text-xs text-destructive">
                              Baris {err.row}: {err.error}
                            </p>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetImport}
                        >
                          Import File Lain
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setIsImportDialogOpen(false)}
                        >
                          Selesai
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </DialogContent>
          </Dialog>
        );

  const AddFlightDialog = (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="w-[95vw] max-w-7xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? "Edit Flight" : "Add New Flight"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tanggal">Date</Label>
                      <Input
                        id="tanggal"
                        name="tanggal"
                        type="date"
                        value={formData.tanggal}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="operator">Operator</Label>
                      <Select
                        value={formData.operator}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, operator: value }))
                        }
                        required
                      >
                        <SelectTrigger id="operator">
                          <SelectValue placeholder="Pilih operator" />
                        </SelectTrigger>
                        <SelectContent>
                          {operators.map((operator) => (
                            <SelectItem key={operator.id} value={operator.nama}>
                              {operator.nama}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="transit">Transit</Label>
                      <Input
                        id="transit"
                        name="transit"
                        type="number"
                        value={formData.transit}
                        onChange={handleInputChange}
                        className="w-32"
                      />
                    </div>
                    <div>
                      <Label htmlFor="kapasitasKursi">Kapasitas Kursi</Label>
                      <Input
                        id="kapasitasKursi"
                        name="kapasitasKursi"
                        type="number"
                        value={formData.kapasitasKursi}
                        onChange={handleInputChange}
                        className="w-32"
                      />
                    </div>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Arrival Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="datangAsal">Asal</Label>
                        <Input
                          id="datangAsal"
                          name="datangAsal"
                          value={formData.datangAsal}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="datangTujuan">Tujuan</Label>
                        <Input
                          id="datangTujuan"
                          name="datangTujuan"
                          value={formData.datangTujuan}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="datangFlightNumber">
                          Flight Number
                        </Label>
                        <Input
                          id="datangFlightNumber"
                          name="datangFlightNumber"
                          value={formData.datangFlightNumber}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="datangDewasa">Dewasa</Label>
                        <Input
                          id="datangDewasa"
                          name="datangDewasa"
                          type="number"
                          value={formData.datangDewasa}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="datangAnak">Anak</Label>
                        <Input
                          id="datangAnak"
                          name="datangAnak"
                          type="number"
                          value={formData.datangAnak}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="datangBayi">Bayi</Label>
                        <Input
                          id="datangBayi"
                          name="datangBayi"
                          type="number"
                          value={formData.datangBayi}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="datangBagasi">Bagasi (Kg)</Label>
                        <Input
                          id="datangBagasi"
                          name="datangBagasi"
                          type="number"
                          value={formData.datangBagasi}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="datangCargo">Cargo (Kg)</Label>
                        <Input
                          id="datangCargo"
                          name="datangCargo"
                          type="number"
                          value={formData.datangCargo}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="datangPergerakan">
                        Pergerakan Pesawat
                      </Label>
                      <Input
                        id="datangPergerakan"
                        name="datangPergerakan"
                        type="number"
                        value={formData.datangPergerakan}
                        onChange={handleInputChange}
                        className="w-32"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Departure Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="berangkatAsal">Asal</Label>
                        <Input
                          id="berangkatAsal"
                          name="berangkatAsal"
                          value={formData.berangkatAsal}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="berangkatTujuan">Tujuan</Label>
                        <Input
                          id="berangkatTujuan"
                          name="berangkatTujuan"
                          value={formData.berangkatTujuan}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="berangkatFlightNumber">
                          Flight Number
                        </Label>
                        <Input
                          id="berangkatFlightNumber"
                          name="berangkatFlightNumber"
                          value={formData.berangkatFlightNumber}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="berangkatDewasa">Dewasa</Label>
                        <Input
                          id="berangkatDewasa"
                          name="berangkatDewasa"
                          type="number"
                          value={formData.berangkatDewasa}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="berangkatAnak">Anak</Label>
                        <Input
                          id="berangkatAnak"
                          name="berangkatAnak"
                          type="number"
                          value={formData.berangkatAnak}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="berangkatBayi">Bayi</Label>
                        <Input
                          id="berangkatBayi"
                          name="berangkatBayi"
                          type="number"
                          value={formData.berangkatBayi}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="berangkatBagasi">Bagasi (Kg)</Label>
                        <Input
                          id="berangkatBagasi"
                          name="berangkatBagasi"
                          type="number"
                          value={formData.berangkatBagasi}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="berangkatCargo">Cargo (Kg)</Label>
                        <Input
                          id="berangkatCargo"
                          name="berangkatCargo"
                          type="number"
                          value={formData.berangkatCargo}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="berangkatPergerakan">
                        Pergerakan Pesawat
                      </Label>
                      <Input
                        id="berangkatPergerakan"
                        name="berangkatPergerakan"
                        type="number"
                        value={formData.berangkatPergerakan}
                        onChange={handleInputChange}
                        className="w-32"
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {isEditing ? "Update Flight" : "Add Flight"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        );

  // ─── Detail Dialog ──────────────────────────────────────────────────────
  const DetailDialog = (
    <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Flight Details</DialogTitle>
          </DialogHeader>

          {selectedFlight && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Date</Label>
                      <p className="text-sm font-medium">
                        {selectedFlight.tanggal}
                      </p>
                    </div>
                    <div>
                      <Label>Operator</Label>
                      <p className="text-sm font-medium">
                        {selectedFlight.operator}
                      </p>
                    </div>
                    <div>
                      <Label>Transit</Label>
                      <p className="text-sm font-medium">
                        {selectedFlight.transit || "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label>Kapasitas Kursi</Label>
                      <p className="text-sm font-medium">
                        {selectedFlight.kapasitasKursi || "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Arrival Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Asal</Label>
                      <p className="text-sm font-medium">
                        {selectedFlight.datangAsal}
                      </p>
                    </div>
                    <div>
                      <Label>Tujuan</Label>
                      <p className="text-sm font-medium">
                        {selectedFlight.datangTujuan}
                      </p>
                    </div>
                    <div>
                      <Label>Flight Number</Label>
                      <p className="text-sm font-medium">
                        {selectedFlight.datangFlightNumber}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Dewasa</Label>
                      <p className="text-sm font-medium">
                        {selectedFlight.datangDewasa || "0"}
                      </p>
                    </div>
                    <div>
                      <Label>Anak</Label>
                      <p className="text-sm font-medium">
                        {selectedFlight.datangAnak || "0"}
                      </p>
                    </div>
                    <div>
                      <Label>Bayi</Label>
                      <p className="text-sm font-medium">
                        {selectedFlight.datangBayi || "0"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Bagasi (Kg)</Label>
                      <p className="text-sm font-medium">
                        {selectedFlight.datangBagasi || "0"}
                      </p>
                    </div>
                    <div>
                      <Label>Cargo (Kg)</Label>
                      <p className="text-sm font-medium">
                        {selectedFlight.datangCargo || "0"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label>Pergerakan Pesawat</Label>
                    <p className="text-sm font-medium">
                      {selectedFlight.datangPergerakan || "0"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Departure Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Asal</Label>
                      <p className="text-sm font-medium">
                        {selectedFlight.berangkatAsal}
                      </p>
                    </div>
                    <div>
                      <Label>Tujuan</Label>
                      <p className="text-sm font-medium">
                        {selectedFlight.berangkatTujuan}
                      </p>
                    </div>
                    <div>
                      <Label>Flight Number</Label>
                      <p className="text-sm font-medium">
                        {selectedFlight.berangkatFlightNumber}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Dewasa</Label>
                      <p className="text-sm font-medium">
                        {selectedFlight.berangkatDewasa || "0"}
                      </p>
                    </div>
                    <div>
                      <Label>Anak</Label>
                      <p className="text-sm font-medium">
                        {selectedFlight.berangkatAnak || "0"}
                      </p>
                    </div>
                    <div>
                      <Label>Bayi</Label>
                      <p className="text-sm font-medium">
                        {selectedFlight.berangkatBayi || "0"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Bagasi (Kg)</Label>
                      <p className="text-sm font-medium">
                        {selectedFlight.berangkatBagasi || "0"}
                      </p>
                    </div>
                    <div>
                      <Label>Cargo (Kg)</Label>
                      <p className="text-sm font-medium">
                        {selectedFlight.berangkatCargo || "0"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label>Pergerakan Pesawat</Label>
                    <p className="text-sm font-medium">
                      {selectedFlight.berangkatPergerakan || "0"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Timestamps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Created At</Label>
                      <p className="text-sm font-medium">
                        {new Date(selectedFlight.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label>Updated At</Label>
                      <p className="text-sm font-medium">
                        {new Date(selectedFlight.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );

  // ─── Operator avatar helper ─────────────────────────────────────────────
  const getInitials = (name: string) =>
    name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  // ─── Page number helper ─────────────────────────────────────────────────
  const getPageNumbers = (): (number | "...")[] => {
    if (displayTotalPages <= 5) return Array.from({ length: displayTotalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (currentPage > 3) pages.push("...");
    for (let p = Math.max(2, currentPage - 1); p <= Math.min(displayTotalPages - 1, currentPage + 1); p++) {
      pages.push(p);
    }
    if (currentPage < displayTotalPages - 2) pages.push("...");
    pages.push(displayTotalPages);
    return pages;
  };

  return (
    <>
      {ImportXLSDialog}
      {AddFlightDialog}
      {DetailDialog}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-background px-4 py-3 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search flight no, route..."
            value={searchOperator}
            onChange={(e) => setSearchOperator(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedMonth === "all" ? "all" : selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Months" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {availableMonths.map((month) => {
              const [year, monthNum] = month.split("-");
              const date = new Date(parseInt(year), parseInt(monthNum) - 1);
              return (
                <SelectItem key={month} value={month}>
                  {date.toLocaleDateString("id-ID", { year: "numeric", month: "long" })}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Flight Records Card */}
      <div className="rounded-xl border bg-background shadow-sm">
        {/* Card header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-base font-semibold">Flight Records</h2>
          <button
            onClick={handleMultiDelete}
            disabled={selectedCount === 0 || isDeletingSelected}
            className="flex items-center gap-1.5 text-sm text-destructive disabled:opacity-40 disabled:cursor-not-allowed hover:underline"
          >
            <Trash2 className="h-4 w-4" />
            {isDeletingSelected ? "Deleting..." : "Multi Delete"}
          </button>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[40px_1fr_1.5fr_1.5fr_1.5fr_auto] items-center gap-4 px-6 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b">
          <input
            type="checkbox"
            checked={allVisibleSelected}
            onChange={(e) => handleSelectAllVisible(e.target.checked)}
            className="rounded"
          />
          <span>Date</span>
          <span>Operator</span>
          <span>Arrival</span>
          <span>Departure</span>
          <span>Actions</span>
        </div>

        {/* Rows */}
        <div className="divide-y">
          {filteredFlights.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Plane className="h-10 w-10 mb-2" />
              <p className="text-sm">
                {flights.length === 0 ? "No flights found. Add your first flight." : "No flights match your filters."}
              </p>
            </div>
          ) : (
            paginatedFlights.map((flight) => {
              const checked = selectedFlightIds.includes(flight.id);
              const initials = getInitials(flight.operator);
              return (
                <div
                  key={flight.id}
                  className="grid grid-cols-[40px_1fr_1.5fr_1.5fr_1.5fr_auto] items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => toggleSelectFlight(flight.id, e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">{flight.tanggal}</span>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground border">
                      {initials}
                    </div>
                    <span className="text-sm font-medium truncate">{flight.operator}</span>
                  </div>
                  <div className="text-sm leading-snug">
                    <div className="font-medium">{flight.datangFlightNumber}</div>
                    <div className="text-muted-foreground text-xs">{flight.datangAsal} → {flight.datangTujuan}</div>
                  </div>
                  <div className="text-sm leading-snug">
                    <div className="font-medium">{flight.berangkatFlightNumber}</div>
                    <div className="text-muted-foreground text-xs">{flight.berangkatAsal} → {flight.berangkatTujuan}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8"
                      onClick={() => { setSelectedFlight(flight); setIsDetailDialogOpen(true); }}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(flight)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(flight)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination footer */}
        {!loading && filteredFlights.length > 0 && (
          <div className="flex items-center justify-between border-t px-6 py-4">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, displayList.length)} of {displayList.length} flights
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}>
                Previous
              </Button>
              {getPageNumbers().map((item, idx) =>
                item === "..." ? (
                  <span key={`e-${idx}`} className="px-2 text-muted-foreground text-sm">…</span>
                ) : (
                  <Button key={item} size="sm"
                    variant={item === currentPage ? "default" : "outline"}
                    onClick={() => setCurrentPage(item as number)}
                    className="w-9">
                    {item}
                  </Button>
                )
              )}
              <Button variant="outline" size="sm"
                onClick={() => setCurrentPage((p) => Math.min(displayTotalPages, p + 1))}
                disabled={currentPage === displayTotalPages}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// HeaderButtons subcomponent for page-level Import XLS + Add Flight buttons
let _setImportOpen: ((v: boolean) => void) | null = null;
let _setAddOpen: ((v: boolean) => void) | null = null;

function HeaderButtons() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={() => _setImportOpen?.(true)}>
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        Import XLS
      </Button>
      <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => _setAddOpen?.(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Flight
      </Button>
    </div>
  );
}

FlightManagement.HeaderButtons = HeaderButtons;
