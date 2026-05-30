"use client";

import { useState, useEffect } from "react";
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
import { Plus, Loader2, Edit, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Flight {
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
}

interface Maskapai {
  id: string;
  kode: string;
  nama: string;
  kontak: string;
  email: string;
  status: "active" | "inactive";
}

export function FlightManagement() {
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
  const pageSize = 15;

  // Get unique months from flights data
  const getAvailableMonths = () => {
    const months = new Set<string>();
    flights.forEach((flight) => {
      const date = new Date(flight.tanggal);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      months.add(monthKey);
    });
    return Array.from(months).sort().reverse();
  };

  // Filter flights by selected month
  const filteredFlights =
    selectedMonth === "all"
      ? flights
      : flights.filter((flight) => {
          const date = new Date(flight.tanggal);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          return monthKey === selectedMonth;
        });

  // Client-side pagination for filtered results
  const paginatedFlights = selectedMonth === "all" ? flights : filteredFlights;

  const filteredPageSize =
    selectedMonth === "all" ? pageSize : filteredFlights.length;
  const filteredTotalPages =
    selectedMonth === "all"
      ? totalPages
      : Math.ceil(filteredFlights.length / pageSize);

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

  const { toast } = useToast();

  useEffect(() => {
    // Fetch all flights for month filter (no pagination)
    fetchAllFlightsForMonths();
    fetchOperators();
  }, []);

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

  // Fetch all flights for month filter (without pagination)
  const fetchAllFlightsForMonths = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/flights?page=1&limit=10000");
      if (!response.ok) throw new Error("Failed to fetch all flights");
      const data = await response.json();
      // Store all flights for filtering by month
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
        description: "Failed to load operators",
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(
          `Failed to ${isEditing ? "update" : "add"} flight: ${errorData.error || response.statusText}`,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filter and Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Flight Management
          </h2>
          <p className="text-muted-foreground">
            Manage flight schedules and operations
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Month Filter */}
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {availableMonths.map((month) => {
                const [year, monthNum] = month.split("-");
                const date = new Date(parseInt(year), parseInt(monthNum) - 1);
                const label = date.toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                });
                return (
                  <SelectItem key={month} value={month}>
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Flight
              </Button>
            </DialogTrigger>

            <DialogContent className="w-[95vw] max-w-7xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? "Edit Flight" : "Add New Flight"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
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

                {/* Arrival Section */}
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

                {/* Departure Section */}
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
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Flight Details</DialogTitle>
          </DialogHeader>
          {selectedFlight && (
            <div className="space-y-6">
              {/* Basic Information */}
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

              {/* Arrival Section */}
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

              {/* Departure Section */}
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

              {/* Timestamps */}
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

      {/* Flights Table */}
      <Card>
        <CardHeader>
          <CardTitle>Flight Records</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFlights.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {flights.length === 0
                ? "No flights found. Add your first flight using the button above."
                : "No flights found for the selected month."}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Operator</TableHead>
                  <TableHead>Arrival Flight</TableHead>
                  <TableHead>Arrival Route</TableHead>
                  <TableHead>Arrival Movement</TableHead>
                  <TableHead>Departure Flight</TableHead>
                  <TableHead>Departure Route</TableHead>
                  <TableHead>Departure Movement</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFlights.map((flight) => (
                  <TableRow key={flight.id}>
                    <TableCell>{flight.tanggal}</TableCell>
                    <TableCell>{flight.operator}</TableCell>
                    <TableCell>{flight.datangFlightNumber}</TableCell>
                    <TableCell>
                      {flight.datangAsal} → {flight.datangTujuan}
                    </TableCell>
                    <TableCell>{flight.datangPergerakan}</TableCell>
                    <TableCell>{flight.berangkatFlightNumber}</TableCell>
                    <TableCell>
                      {flight.berangkatAsal} → {flight.berangkatTujuan}
                    </TableCell>
                    <TableCell>{flight.berangkatPergerakan}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedFlight(flight);
                            setIsDetailDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(flight)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(flight)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination - show for both all months and filtered months */}
      {(selectedMonth === "all"
        ? totalPages > 1
        : filteredFlights.length > pageSize) && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedMonth === "all" ? (
              <>
                Showing{" "}
                {flights.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
                {Math.min(currentPage * pageSize, totalFlights)} of{" "}
                {totalFlights} flights
              </>
            ) : (
              <>
                Showing {filteredFlights.length} flights for {selectedMonth}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedMonth === "all" ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPage = currentPage - 1;
                    setCurrentPage(newPage);
                    fetchFlights(newPage);
                  }}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPage = currentPage + 1;
                    setCurrentPage(newPage);
                    fetchFlights(newPage);
                  }}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMonth("all")}
              >
                Clear Filter
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
