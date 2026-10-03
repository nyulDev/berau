"use client";

import { useEffect, useState } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search, Plane } from "lucide-react";
import { toast } from "sonner";

interface Maskapai {
  id: string;
  kode: string;
  nama: string;
  kontak: string | null;
  email: string | null;
  status: string;
}

const emptyForm = { kode: "", nama: "", kontak: "", email: "", status: "active" };

export default function MaskapaiLLAUPage() {
  const [maskapaiList, setMaskapaiList] = useState<Maskapai[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    document.title = "Maskapai LLAU | Kalimarau International";
    fetchMaskapai();
  }, []);

  const fetchMaskapai = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/maskapai");
      if (!res.ok) throw new Error("Gagal memuat data");
      const data = await res.json();
      setMaskapaiList(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Gagal memuat data maskapai");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  const openEdit = (m: Maskapai) => {
    setEditingId(m.id);
    setForm({ kode: m.kode, nama: m.nama, kontak: m.kontak || "", email: m.email || "", status: m.status });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.kode || !form.nama) {
      toast.error("Kode dan nama harus diisi");
      return;
    }
    try {
      const url = editingId
        ? `/api/dashboard/maskapai/${editingId}`
        : "/api/dashboard/maskapai";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");
      toast.success(editingId ? "Maskapai diperbarui" : "Maskapai ditambahkan");
      setIsDialogOpen(false);
      fetchMaskapai();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
    }
  };

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Hapus maskapai "${nama}"?`)) return;
    try {
      const res = await fetch(`/api/dashboard/maskapai/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      toast.success("Maskapai dihapus");
      fetchMaskapai();
    } catch {
      toast.error("Gagal menghapus maskapai");
    }
  };

  const filtered = maskapaiList.filter(
    (m) =>
      m.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.kode.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          <main className="flex-1 overflow-auto bg-muted/30">
            <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">

              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Maskapai LLAU</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Kelola data maskapai untuk laporan LLAU
                  </p>
                </div>
                <Button onClick={openAdd} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Tambah Maskapai
                </Button>
              </div>

              {/* Table Card */}
              <div className="rounded-xl border bg-background shadow-sm">
                {/* Search */}
                <div className="flex items-center justify-between gap-4 px-6 pt-6 pb-4">
                  <h2 className="text-base font-semibold">Daftar Maskapai</h2>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Cari maskapai..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Column headers */}
                <div className="grid grid-cols-[1fr_1fr_2fr_1fr_auto] items-center gap-4 px-6 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground border-t">
                  <span>Kode</span>
                  <span>Nama</span>
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
                  ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <Plane className="h-10 w-10 mb-2" />
                      <p className="text-sm">
                        {searchTerm ? "Tidak ada maskapai yang ditemukan" : "Belum ada data maskapai"}
                      </p>
                    </div>
                  ) : (
                    filtered.map((m) => (
                      <div
                        key={m.id}
                        className="grid grid-cols-[1fr_1fr_2fr_1fr_auto] items-center gap-4 px-6 py-3 hover:bg-muted/30 transition-colors"
                      >
                        <span className="font-mono text-sm font-semibold">{m.kode}</span>
                        <span className="text-sm font-medium">{m.nama}</span>
                        <div className="text-sm text-muted-foreground">
                          {m.kontak && <div>{m.kontak}</div>}
                          {m.email && <div className="text-xs">{m.email}</div>}
                          {!m.kontak && !m.email && <span className="text-xs">—</span>}
                        </div>
                        <span>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              m.status === "active"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {m.status === "active" ? "Aktif" : "Nonaktif"}
                          </span>
                        </span>
                        <div className="flex items-center gap-1 pr-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(m)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(m.id, m.nama)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>

      {/* Dialog Add/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Maskapai" : "Tambah Maskapai"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Kode Maskapai <span className="text-destructive">*</span></label>
              <Input
                value={form.kode}
                onChange={(e) => setForm({ ...form, kode: e.target.value.toUpperCase() })}
                placeholder="Contoh: GA, JT, ID"
                maxLength={10}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Maskapai <span className="text-destructive">*</span></label>
              <Input
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                placeholder="Contoh: Garuda Indonesia"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Kontak</label>
              <Input
                value={form.kontak}
                onChange={(e) => setForm({ ...form, kontak: e.target.value })}
                placeholder="No. telepon"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@maskapai.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit">{editingId ? "Perbarui" : "Simpan"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
