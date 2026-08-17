"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Pencil, Trash2, Search, Plane } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Maskapai {
  id: string;
  kode: string;
  nama: string;
  kontak: string;
  email: string;
  status: "active" | "inactive";
}

const PAGE_SIZE = 10;

// Shared dialog open state lifted so AddButton can trigger it
let _setDialogOpen: ((v: boolean) => void) | null = null;
let _resetForm: (() => void) | null = null;

function AddButton() {
  return (
    <Button
      onClick={() => {
        _resetForm?.();
        _setDialogOpen?.(true);
      }}
      className="flex items-center gap-2"
    >
      <Plus className="h-4 w-4" />
      Tambah Maskapai
    </Button>
  );
}

export function OperatorManagement() {
  const [maskapaiList, setMaskapaiList] = useState<Maskapai[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  // Register setters for AddButton
  _setDialogOpen = setIsDialogOpen;

  const [formData, setFormData] = useState({
    kode: "",
    nama: "",
    kontak: "",
    email: "",
    status: "active" as "active" | "inactive",
  });

  const resetForm = () => {
    setFormData({ kode: "", nama: "", kontak: "", email: "", status: "active" });
    setEditingId(null);
  };
  _resetForm = resetForm;

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
    } catch {
      toast({ title: "Error", description: "Gagal mengambil data maskapai", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filteredMaskapai = maskapaiList.filter(
    (m) =>
      m.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.kode.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(filteredMaskapai.length / PAGE_SIZE));
  const paginatedMaskapai = filteredMaskapai.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/dashboard/maskapai/${editingId}` : "/api/dashboard/maskapai";
      const method = editingId ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        await fetchMaskapai();
        toast({ title: "Berhasil", description: editingId ? "Maskapai berhasil diperbarui" : "Maskapai baru berhasil ditambahkan" });
        setIsDialogOpen(false);
        resetForm();
      } else {
        const err = await response.json();
        toast({ title: "Error", description: err.error || "Gagal menyimpan", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Terjadi kesalahan. Silakan coba lagi.", variant: "destructive" });
    }
  };

  const handleEdit = (maskapai: Maskapai) => {
    setEditingId(maskapai.id);
    setFormData({
      kode: maskapai.kode,
      nama: maskapai.nama,
      kontak: maskapai.kontak,
      email: maskapai.email,
      status: maskapai.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus maskapai ini?")) return;
    try {
      const response = await fetch(`/api/dashboard/maskapai/${id}`, { method: "DELETE" });
      if (response.ok) {
        await fetchMaskapai();
        toast({ title: "Berhasil", description: "Maskapai berhasil dihapus" });
      } else {
        const err = await response.json();
        toast({ title: "Error", description: err.error || "Gagal menghapus", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Terjadi kesalahan.", variant: "destructive" });
    }
  };

  const getInitials = (kode: string) => kode.toUpperCase().slice(0, 2);

  // Avatar bg color based on kode
  const avatarColors = [
    "bg-slate-700", "bg-zinc-600", "bg-stone-600",
    "bg-neutral-600", "bg-gray-700", "bg-indigo-700",
  ];
  const getAvatarColor = (kode: string) => {
    const idx = kode.charCodeAt(0) % avatarColors.length;
    return avatarColors[idx];
  };

  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (currentPage > 3) pages.push("...");
    for (let p = Math.max(2, currentPage - 1); p <= Math.min(totalPages - 1, currentPage + 1); p++) {
      pages.push(p);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const FormDialog = (
    <Dialog open={isDialogOpen} onOpenChange={(v) => { setIsDialogOpen(v); if (!v) resetForm(); }}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Maskapai" : "Tambah Maskapai Baru"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Perbarui data maskapai di bawah ini" : "Isi data maskapai baru di bawah ini"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kode">Kode Maskapai *</Label>
                <Input
                  id="kode" name="kode" value={formData.kode}
                  onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                  placeholder="Contoh: GA" required maxLength={2} className="uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as "active" | "inactive" })}>
                  <SelectTrigger id="status"><SelectValue /></SelectTrigger>
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
                id="nama" name="nama" value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                placeholder="Contoh: Garuda Indonesia" required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kontak">Nomor Telepon</Label>
                <Input
                  id="kontak" name="kontak" value={formData.kontak}
                  onChange={(e) => setFormData({ ...formData, kontak: e.target.value })}
                  placeholder="+62 21 12345678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email" name="email" type="email" value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="info@maskapai.com"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>Batal</Button>
            <Button type="submit">{editingId ? "Perbarui" : "Simpan"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      {FormDialog}

      <div className="rounded-xl border bg-background shadow-sm">
        {/* Card Header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
          <div>
            <h2 className="text-lg font-semibold">Manajemen Operator / Maskapai</h2>
            <p className="text-sm text-muted-foreground">Kelola data maskapai penerbangan</p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari maskapai..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-9"
            />
          </div>
        </div>

        {/* Column Headers */}
        <div className="grid grid-cols-[2fr_1fr_2fr_1fr_auto] items-center gap-4 px-6 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground border-t">
          <span>Maskapai</span>
          <span>Kode</span>
          <span>Kontak / Email</span>
          <span>Status</span>
          <span className="pr-2">Aksi</span>
        </div>

        {/* Rows */}
        <div className="divide-y border-t">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
              Memuat data...
            </div>
          ) : filteredMaskapai.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Plane className="h-10 w-10 mb-2" />
              <p className="text-sm">
                {searchTerm ? "Tidak ada maskapai yang ditemukan" : "Belum ada data maskapai"}
              </p>
            </div>
          ) : (
            paginatedMaskapai.map((maskapai) => (
              <div
                key={maskapai.id}
                className="grid grid-cols-[2fr_1fr_2fr_1fr_auto] items-center gap-4 px-6 py-4 hover:bg-muted/40 transition-colors"
              >
                {/* Maskapai Name + Avatar */}
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${
                      maskapai.status === "active"
                        ? "bg-slate-800 dark:bg-slate-700"
                        : getAvatarColor(maskapai.kode)
                    }`}
                  >
                    {getInitials(maskapai.kode)}
                  </div>
                  <span className="font-medium text-sm">{maskapai.nama}</span>
                </div>

                {/* Kode */}
                <div>
                  <span
                    className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${
                      maskapai.status === "active"
                        ? "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                        : "border-border bg-muted text-muted-foreground"
                    }`}
                  >
                    {maskapai.kode}
                  </span>
                </div>

                {/* Kontak / Email */}
                <div className="text-sm text-muted-foreground leading-relaxed">
                  <div>{maskapai.kontak || "-"}</div>
                  <div>{maskapai.email || "-"}</div>
                </div>

                {/* Status */}
                <div>
                  {maskapai.status === "active" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Inactive
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(maskapai)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(maskapai.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Footer */}
        {!loading && filteredMaskapai.length > 0 && (
          <div className="flex items-center justify-between border-t px-6 py-4">
            <p className="text-sm text-muted-foreground">
              Menampilkan{" "}
              <span className="font-medium">
                {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredMaskapai.length)}
              </span>{" "}
              dari <span className="font-medium">{filteredMaskapai.length}</span> maskapai
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline" size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                &lsaquo; Previous
              </Button>
              {getPageNumbers().map((item, idx) =>
                item === "..." ? (
                  <span key={`e-${idx}`} className="px-2 text-muted-foreground text-sm">…</span>
                ) : (
                  <Button
                    key={item}
                    size="sm"
                    variant={item === currentPage ? "default" : "outline"}
                    onClick={() => setCurrentPage(item as number)}
                    className="w-9"
                  >
                    {item}
                  </Button>
                ),
              )}
              <Button
                variant="outline" size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next &rsaquo;
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

OperatorManagement.AddButton = AddButton;
