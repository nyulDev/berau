"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { Trash2, Eye, EyeOff, Users } from "lucide-react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ToastVariant = "success" | "error";

type User = {
  id: string;
  email: string;
  name: string | null;
  role: "admin" | "user";
  createdAt: string;
};

async function postJSON<T>(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => null)) as T | null;
  if (!res.ok) {
    const message = (data as any)?.message ?? `Request failed: ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function SettingsPage() {
  // ── Users table ──────────────────────────────────────────────
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Create User ───────────────────────────────────────────────
  const [createEmail, setCreateEmail] = useState("");
  const [createName, setCreateName] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState<"admin" | "user">("user");
  const [createLoading, setCreateLoading] = useState(false);

  // ── Change Password ───────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [changeLoading, setChangeLoading] = useState(false);

  useEffect(() => {
    document.title = "Settings | Kalimarau International";
  }, []);

  const showToast = (title: string, message: string, variant: ToastVariant) => {
    toast({
      title,
      description: message,
      variant: variant === "success" ? "default" : "destructive",
    });
  };

  // ── Fetch users ───────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await fetch("/api/dashboard/users");
      if (!res.ok) throw new Error("Gagal memuat data");
      const data: User[] = await res.json();
      setUsers(data);
    } catch {
      showToast("Gagal", "Tidak dapat memuat daftar akun", "error");
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ── Delete user ───────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTargetId || deleteLoading) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/dashboard/users/${deleteTargetId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message ?? "Gagal menghapus user");
      showToast("Berhasil", "Akun berhasil dihapus", "success");
      setUsers((prev) => prev.filter((u) => u.id !== deleteTargetId));
    } catch (err: any) {
      showToast("Gagal", err?.message ?? "Gagal menghapus akun", "error");
    } finally {
      setDeleteLoading(false);
      setDeleteTargetId(null);
    }
  };

  const handleRoleChange = async (userId: string, role: "admin" | "user") => {
    try {
      const res = await fetch(`/api/dashboard/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message ?? "Gagal mengubah role");

      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, role } : user)),
      );
      showToast("Berhasil", "Role user berhasil diubah", "success");
    } catch (err: any) {
      showToast("Gagal", err?.message ?? "Gagal mengubah role user", "error");
    }
  };

  const validateEmail = (email: string) => {
    const trimmed = email.trim().toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  };

  // ── Create user ───────────────────────────────────────────────
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createLoading) return;

    const email = createEmail.trim().toLowerCase();
    const name = createName.trim();

    if (!email) return showToast("Perhatian", "Email harus diisi", "error");
    if (!validateEmail(email))
      return showToast("Perhatian", "Format email tidak valid", "error");
    if (!createPassword || createPassword.length < 8)
      return showToast("Perhatian", "Password minimal 8 karakter", "error");

    setCreateLoading(true);
    try {
      await postJSON("/api/dashboard/users", {
        email,
        name: name || null,
        password: createPassword,
        role: createRole,
      });

      showToast("Berhasil", "User berhasil dibuat", "success");
      setCreateEmail("");
      setCreateName("");
      setCreatePassword("");
      setCreateRole("user");
      fetchUsers();
    } catch (err: any) {
      showToast("Gagal", err?.message ?? "Gagal membuat user", "error");
    } finally {
      setCreateLoading(false);
    }
  };

  // ── Change password ───────────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (changeLoading) return;

    if (!currentPassword)
      return showToast("Perhatian", "Password saat ini harus diisi", "error");

    if (!newPassword || newPassword.length < 8)
      return showToast(
        "Perhatian",
        "Password baru minimal 8 karakter",
        "error",
      );

    setChangeLoading(true);
    try {
      await postJSON("/api/dashboard/users/me/password", {
        currentPassword,
        newPassword,
      });

      showToast("Berhasil", "Password berhasil diganti", "success");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      showToast("Gagal", err?.message ?? "Gagal mengganti password", "error");
    } finally {
      setChangeLoading(false);
    }
  };

  const deleteTarget = users.find((u) => u.id === deleteTargetId);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8">

              {/* ── Page header ── */}
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">
                  Kelola akun pengguna dan keamanan.
                </p>
              </div>

              {/* ── Forms row ── */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Buat User Baru */}
                <section className="rounded-lg border p-4 md:p-6">
                  <h2 className="text-xl font-semibold">Buat User Baru</h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Untuk menambahkan user ke portal.
                  </p>

                  <form className="mt-4 space-y-4" onSubmit={handleCreateUser}>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Email</label>
                      <input
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        type="email"
                        placeholder="user@example.com"
                        value={createEmail}
                        onChange={(e) => setCreateEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium">
                        Nama <span className="text-muted-foreground">(opsional)</span>
                      </label>
                      <input
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        type="text"
                        placeholder="Nama user"
                        value={createName}
                        onChange={(e) => setCreateName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium">Password</label>
                      <input
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        type="password"
                        placeholder="Minimal 8 karakter"
                        value={createPassword}
                        onChange={(e) => setCreatePassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium">Role</label>
                      <select
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        value={createRole}
                        onChange={(e) =>
                          setCreateRole(e.target.value as "admin" | "user")
                        }
                      >
                        <option value="user">User Biasa</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={createLoading}
                      className="w-full rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
                    >
                      {createLoading ? "Membuat..." : "Buat User"}
                    </button>
                  </form>
                </section>

                {/* Ganti Password */}
                <section className="rounded-lg border p-4 md:p-6">
                  <h2 className="text-xl font-semibold">Ganti Password</h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Reset password untuk akun yang sedang login.
                  </p>

                  <form
                    className="mt-4 space-y-4"
                    onSubmit={handleChangePassword}
                  >
                    <div className="space-y-1">
                      <label className="text-sm font-medium">
                        Password Saat Ini
                      </label>
                      <div className="relative">
                        <input
                          className="w-full rounded-md border bg-background px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          type={currentPasswordVisible ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setCurrentPasswordVisible((v) => !v)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          aria-label={
                            currentPasswordVisible
                              ? "Sembunyikan password"
                              : "Tampilkan password"
                          }
                        >
                          {currentPasswordVisible ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium">
                        Password Baru
                      </label>
                      <div className="relative">
                        <input
                          className="w-full rounded-md border bg-background px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          type={newPasswordVisible ? "text" : "password"}
                          placeholder="Minimal 8 karakter"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setNewPasswordVisible((v) => !v)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          aria-label={
                            newPasswordVisible
                              ? "Sembunyikan password"
                              : "Tampilkan password"
                          }
                        >
                          {newPasswordVisible ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={changeLoading}
                      className="w-full rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
                    >
                      {changeLoading ? "Menyimpan..." : "Ganti Password"}
                    </button>
                  </form>
                </section>
              </div>

              {/* ── Tabel Daftar Akun ── */}
              <section className="rounded-xl border bg-background shadow-sm">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
                  <div>
                    <h2 className="text-lg font-semibold">Daftar Akun Terdaftar</h2>
                    <p className="text-sm text-muted-foreground">
                      Semua akun yang memiliki akses ke portal ini.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {usersLoading ? "—" : users.length} akun
                  </span>
                </div>

                {/* Column headers */}
                <div className="grid grid-cols-[1fr_1.5fr_0.7fr_1fr_auto] items-center gap-4 border-t px-6 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>Nama</span>
                  <span>Email</span>
                  <span>Role</span>
                  <span>Dibuat</span>
                  <span className="pr-1">Aksi</span>
                </div>

                {/* Rows */}
                <div className="divide-y border-t">
                  {usersLoading ? (
                    <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                      Memuat data...
                    </div>
                  ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <Users className="mb-2 h-10 w-10" />
                      <p className="text-sm">Belum ada akun terdaftar</p>
                    </div>
                  ) : (
                    users.map((user) => (
                      <div
                        key={user.id}
                        className="grid grid-cols-[1fr_1.5fr_0.7fr_1fr_auto] items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/40"
                      >
                        {/* Nama + avatar */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {(user.name ?? user.email).charAt(0).toUpperCase()}
                          </div>
                          <span className="truncate text-sm font-medium">
                            {user.name ?? (
                              <span className="text-muted-foreground italic">—</span>
                            )}
                          </span>
                        </div>

                        {/* Email */}
                        <span className="truncate text-sm text-muted-foreground">
                          {user.email}
                        </span>

                        <select
                          className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(
                              user.id,
                              e.target.value as "admin" | "user",
                            )
                          }
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>

                        {/* Tanggal */}
                        <span className="text-sm text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </span>

                        {/* Aksi */}
                        <button
                          onClick={() => setDeleteTargetId(user.id)}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Hapus akun ${user.email}`}
                          title="Hapus akun"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </main>
        </SidebarInset>
      </div>

      {/* ── Konfirmasi hapus ── */}
      <AlertDialog
        open={!!deleteTargetId}
        onOpenChange={(open) => { if (!open) setDeleteTargetId(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Akun</AlertDialogTitle>
            <AlertDialogDescription>
              Akun{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.email}
              </span>{" "}
              akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
