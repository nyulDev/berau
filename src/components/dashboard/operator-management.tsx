"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plane, Plus, Pencil, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Maskapai {
  id: string;
  kode: string;
  nama: string;
  kontak: string;
  email: string;
  status: "active" | "inactive";
}

export function OperatorManagement() {
  const [maskapaiList, setMaskapaiList] = useState<Maskapai[]>([]);
  const [loading, setLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Fetch maskapai data from API
  useEffect(() => {
    fetchMaskapai();
  }, []);

  const fetchMaskapai = async () => {
    try {
      const response = await fetch("/api/dashboard/maskapai");
      if (response.ok) {
        const data = await response.json();
        setMaskapaiList(data);
      }
    } catch (error) {
      console.error("Error fetching maskapai:", error);
      toast({
        title: "Error",
        description: "Gagal mengambil data maskapai",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    kode: "",
    nama: "",
    kontak: "",
    email: "",
    status: "active" as "active" | "inactive",
  });

  const filteredMaskapai = maskapaiList.filter(
    (maskapai) =>
      maskapai.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      maskapai.kode.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        // Update existing maskapai
        const response = await fetch(`/api/dashboard/maskapai/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          await fetchMaskapai();
          toast({
            title: "Berhasil",
            description: "Maskapai berhasil diperbarui",
          });
        }
      } else {
        // Add new maskapai
        const response = await fetch("/api/dashboard/maskapai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          await fetchMaskapai();
          toast({
            title: "Berhasil",
            description: "Maskapai baru berhasil ditambahkan",
          });
        }
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (maskapai: Maskapai) => {
    setEditingId(maskapai.id);
    setFormData({
      kode: maskapai.kode,
      nama: maskapai.nama,
      kota_asal: maskapai.kota_asal,
      kontak: maskapai.kontak,
      email: maskapai.email,
      status: maskapai.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus maskapai ini?")) {
      try {
        const response = await fetch(`/api/dashboard/maskapai/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          await fetchMaskapai();
          toast({
            title: "Berhasil",
            description: "Maskapai berhasil dihapus",
          });
        } else {
          const errorData = await response.json();
          toast({
            title: "Error",
            description: errorData.error || "Gagal menghapus maskapai",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error deleting maskapai:", error);
        toast({
          title: "Error",
          description: "Terjadi kesalahan. Silakan coba lagi.",
          variant: "destructive",
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      kode: "",
      nama: "",
      kontak: "",
      email: "",
      status: "active",
    });
    setEditingId(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStatusChange = (value: string) => {
    setFormData({ ...formData, status: value as "active" | "inactive" });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Manajemen Operator / Maskapai</CardTitle>
            <CardDescription>Kelola data maskapai penerbangan</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Maskapai
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingId ? "Edit Maskapai" : "Tambah Maskapai Baru"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingId
                      ? "Perbarui data maskapai di bawah ini"
                      : "Isi data maskapai baru di bawah ini"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="kode">Kode Maskapai *</Label>
                      <Input
                        id="kode"
                        name="kode"
                        value={formData.kode}
                        onChange={handleInputChange}
                        placeholder="Contoh: GA"
                        required
                        maxLength={2}
                        className="uppercase"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status *</Label>
                      <Select
                        value={formData.status}
                        onValueChange={handleStatusChange}
                      >
                        <SelectTrigger id="status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nama">Nama Maskapai *</Label>
                    <Input
                      id="nama"
                      name="nama"
                      value={formData.nama}
                      onChange={handleInputChange}
                      placeholder="Contoh: Garuda Indonesia"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="kontak">Nomor Telepon</Label>
                      <Input
                        id="kontak"
                        name="kontak"
                        value={formData.kontak}
                        onChange={handleInputChange}
                        placeholder="+62 21 12345678"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="info@maskapai.com"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Batal
                  </Button>
                  <Button type="submit">
                    {editingId ? "Perbarui" : "Simpan"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari maskapai berdasarkan nama atau kode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama Maskapai</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-muted-foreground">Memuat data...</p>
                  </TableCell>
                </TableRow>
              ) : filteredMaskapai.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Plane className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      {searchTerm
                        ? "Tidak ada maskapai yang ditemukan"
                        : "Belum ada data maskapai"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMaskapai.map((maskapai) => (
                  <TableRow key={maskapai.id}>
                    <TableCell className="font-medium">
                      <Badge variant="outline">{maskapai.kode}</Badge>
                    </TableCell>
                    <TableCell>{maskapai.nama}</TableCell>
                    <TableCell>{maskapai.kontak || "-"}</TableCell>
                    <TableCell>{maskapai.email || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          maskapai.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                        }
                      >
                        {maskapai.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(maskapai)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(maskapai.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
