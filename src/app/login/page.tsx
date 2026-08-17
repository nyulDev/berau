"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import Script from "next/script";
import "./login.css";

declare global {
  interface Window {
    ShaderGradient: any;
  }
}

type Toast = {
  id: number;
  title: string;
  message: string;
  type: "success" | "error";
};

type FieldErrors = {
  email?: string;
  password?: string;
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    document.title = "Login | Kalimarau International";
  }, []);

  useEffect(() => {
    const initShader = () => {
      const container = document.getElementById("canvas-container");
      if (container && window.ShaderGradient) {
        const shaderConfig = {
          animate: "on",
          axesHelper: "off",
          bgColor1: "#000000",
          bgColor2: "#001a33",
          brightness: 1.2,
          cAzimuthAngle: 170,
          cDistance: 4.4,
          cPolarAngle: 70,
          cameraZoom: 1,
          color1: "#003366",
          color2: "#FFD700",
          color3: "#e6f0ff",
          destination: "onCanvas",
          embedMode: "off",
          envPreset: "city",
          format: "gif",
          fov: 45,
          frameRate: 10,
          gizmoHelper: "hide",
          grain: "off",
          lightType: "3d",
          pixelDensity: 1,
          positionX: 0,
          positionY: 0.9,
          positionZ: -0.3,
          range: "disabled",
          rangeEnd: 40,
          rangeStart: 0,
          reflection: 0.1,
          rotationX: 45,
          rotationY: 0,
          rotationZ: 0,
          shader: "defaults",
          type: "waterPlane",
          uAmplitude: 0,
          uDensity: 1.2,
          uFrequency: 0,
          uSpeed: 0.2,
          uStrength: 3.4,
          uTime: 0,
          wireframe: false,
          cContainer: container,
        };

        new window.ShaderGradient(shaderConfig);
      }
    };

    const timer = setTimeout(initShader, 100);
    return () => clearTimeout(timer);
  }, []);

  const showToast = (
    title: string,
    message: string,
    type: Toast["type"] = "success",
  ) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const validate = (nextEmail: string, nextPassword: string) => {
    const next: FieldErrors = {};

    const trimmedEmail = nextEmail.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

    if (!trimmedEmail) next.email = "Email harus diisi";
    else if (!emailOk) next.email = "Format email tidak valid";

    if (!nextPassword) next.password = "Password harus diisi";

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const nextEmail = email.trim();
    const nextPassword = password;

    if (!validate(nextEmail, nextPassword)) {
      showToast("Perhatian", "Periksa kembali input Anda", "error");
      return;
    }

    setIsLoading(true);
    try {
      await signIn("credentials", {
        email: nextEmail,
        password: nextPassword,
        callbackUrl: `${window.location.origin}/`,
        redirect: true,
      });

      // NextAuth akan redirect ke callbackUrl ("/")
      // Port ditentukan oleh env server Anda (dev biasanya 3002).
    } catch {
      showToast("Error", "Terjadi kesalahan saat login", "error");
      setIsLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
        strategy="beforeInteractive"
      />
      <Script
        src="https://unpkg.com/shadergradient@latest/dist/shadergradient.global.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://unpkg.com/@phosphor-icons/web"
        strategy="afterInteractive"
      />

      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          overflow: "hidden",
          height: "100vh",
          width: "100vw",
          position: "relative",
          backgroundColor: "#001a33",
        }}
      >
        <div id="canvas-container" />

        <div className="wrapper">
          <div className="login-card">
            <div className="logo-container">
              <img
                src="https://z-cdn-media.chatglm.cn/files/bee96718-4dd1-4a31-8db7-f24d43db576a.png?auth_key=1869746254-ad5b0c55198a471884b89dc1a9629dea-0-356d50e129fc05e567ee556f135044b4"
                alt="Logo Kemenhub"
              />
            </div>

            <div className="login-header">
              <h1>Selamat Datang</h1>
              <p>Silakan masuk ke portal internal Kalimarau Airport</p>
            </div>

            <form id="loginForm" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="email"
                    className="form-input"
                    placeholder="Masukkan email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    required
                    autoComplete="email"
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={
                      fieldErrors.email ? "email-error" : undefined
                    }
                  />
                  <i className="ph ph-user" />
                </div>

                {fieldErrors.email ? (
                  <p id="email-error" className="mt-2 text-xs text-destructive">
                    {fieldErrors.email}
                  </p>
                ) : null}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="password"
                    className="form-input"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFieldErrors((prev) => ({
                        ...prev,
                        password: undefined,
                      }));
                    }}
                    required
                    autoComplete="current-password"
                    aria-invalid={!!fieldErrors.password}
                    aria-describedby={
                      fieldErrors.password ? "password-error" : undefined
                    }
                  />
                  <i className="ph ph-lock-key" aria-hidden="true" />
                </div>

                {fieldErrors.password ? (
                  <p
                    id="password-error"
                    className="mt-2 text-xs text-destructive"
                  >
                    {fieldErrors.password}
                  </p>
                ) : null}
              </div>

              <div className="options-row">
                <label className="remember-me">
                  <input type="checkbox" id="remember" />
                  Ingat saya
                </label>
                <a
                  href="#"
                  className="forgot-link"
                  onClick={(e) => {
                    e.preventDefault();
                    showToast(
                      "Info",
                      "Hubungi Administrator IT Kemenhub untuk reset password.",
                      "error",
                    );
                  }}
                >
                  Lupa password?
                </a>
              </div>

              <button
                type="submit"
                className="btn-submit"
                id="submitBtn"
                disabled={isLoading}
                aria-busy={isLoading}
              >
                <span className="btn-text">Masuk Portal</span>
                <div
                  className="spinner"
                  style={{ display: isLoading ? "block" : "none" }}
                />
              </button>
            </form>

            <div className="footer-info">
              &copy; 2026 Kalimarau-Airport.
              <br />
            </div>
          </div>
        </div>

        <div className="toast-container" id="toastContainer">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast ${toast.type} show`}>
              <i
                className={`ph ${toast.type === "success" ? "ph-check-circle" : "ph-warning-circle"}`}
                style={{ fontSize: "1.5rem" }}
              />
              <div className="toast-content">
                <h4>{toast.title}</h4>
                <p>{toast.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
