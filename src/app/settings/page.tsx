"use client";

import { useState } from "react";
import { toast } from "@/hooks/use-toast";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

type ToastVariant = "success" | "error";

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

export default function SettingsPage() {
  // Create User
  const [createEmail, setCreateEmail] = useState("");
  const [createName, setCreateName] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // Change Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [changeLoading, setChangeLoading] = useState(false);

  const showToast = (title: string, message: string, variant: ToastVariant) => {
    toast({
      title,
      description: message,
      variant: variant === "success" ? "default" : "destructive",
    });
  };

  const validateEmail = (email: string) => {
    const trimmed = email.trim().toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  };

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
      });

      showToast("Berhasil", "User berhasil dibuat", "success");
      setCreateEmail("");
      setCreateName("");
      setCreatePassword("");
    } catch (err: any) {
      showToast("Gagal", err?.message ?? "Gagal membuat user", "error");
    } finally {
      setCreateLoading(false);
    }
  };

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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          <DashboardHeader />

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">
                  Buat user baru dan ganti password.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <section className="rounded-lg border p-4 md:p-6">
                  <h2 className="text-xl font-semibold">Buat User Baru</h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Untuk menambahkan user ke portal.
                  </p>

                  <form className="mt-4 space-y-4" onSubmit={handleCreateUser}>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Email</label>
                      <input
                        className="w-full rounded-md border bg-background px-3 py-2"
                        type="email"
                        placeholder="user@example.com"
                        value={createEmail}
                        onChange={(e) => setCreateEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium">
                        Nama (opsional)
                      </label>
                      <input
                        className="w-full rounded-md border bg-background px-3 py-2"
                        type="text"
                        placeholder="Nama user"
                        value={createName}
                        onChange={(e) => setCreateName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium">Password</label>
                      <input
                        className="w-full rounded-md border bg-background px-3 py-2"
                        type="password"
                        placeholder="Minimal 8 karakter"
                        value={createPassword}
                        onChange={(e) => setCreatePassword(e.target.value)}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={createLoading}
                      className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-60"
                    >
                      {createLoading ? "Membuat..." : "Buat User"}
                    </button>
                  </form>
                </section>

                <section className="rounded-lg border p-4 md:p-6">
                  <h2 className="text-xl font-semibold">Ganti Password</h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Reset password untuk user yang sedang login.
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
                          className="w-full rounded-md border bg-background px-3 py-2 pr-10"
                          type={currentPasswordVisible ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setCurrentPasswordVisible((v) => !v)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                          aria-label={
                            currentPasswordVisible
                              ? "Sembunyikan password"
                              : "Tampilkan password"
                          }
                        >
                          {currentPasswordVisible ? "🙈" : "👁️"}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium">
                        Password Baru
                      </label>
                      <div className="relative">
                        <input
                          className="w-full rounded-md border bg-background px-3 py-2 pr-10"
                          type={newPasswordVisible ? "text" : "password"}
                          placeholder="Minimal 8 karakter"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setNewPasswordVisible((v) => !v)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                          aria-label={
                            newPasswordVisible
                              ? "Sembunyikan password"
                              : "Tampilkan password"
                          }
                        >
                          {newPasswordVisible ? "🙈" : "👁️"}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={changeLoading}
                      className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-60"
                    >
                      {changeLoading ? "Menyimpan..." : "Ganti Password"}
                    </button>
                  </form>
                </section>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
