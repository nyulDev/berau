"use client";

import { useEffect, useState, useMemo } from "react";
import { Settings2, ChevronDown, ChevronUp, Download, FileText } from "lucide-react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";

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

const BULAN_OPTIONS = [
  { value: "JANUARI",   label: "Januari" },
  { value: "FEBRUARI",  label: "Februari" },
  { value: "MARET",     label: "Maret" },
  { value: "APRIL",     label: "April" },
  { value: "MEI",       label: "Mei" },
  { value: "JUNI",      label: "Juni" },
  { value: "JULI",      label: "Juli" },
  { value: "AGUSTUS",   label: "Agustus" },
  { value: "SEPTEMBER", label: "September" },
  { value: "OKTOBER",   label: "Oktober" },
  { value: "NOVEMBER",  label: "November" },
  { value: "DESEMBER",  label: "Desember" },
];

export default function LLAUPage({ showDataFilters = false }: { showDataFilters?: boolean }) {
  const [noSurat, setNoSurat] = useState("AU.301/1/4/BPU-BEJ-2026");
  const [bulan, setBulan] = useState("MARET");
  const [tahun, setTahun] = useState("2026");
  const [tanggalSurat, setTanggalSurat] = useState("2026-03-02");
  const [namaKepala, setNamaKepala] = useState("PATAH ATABRI, S.Si.T, M.M");
  const [nipKepala, setNipKepala] = useState("19770716 200212 1 002");
  const [namaKasi, setNamaKasi] = useState("M. IDHAMZULFIKAR AMIEN");
  const [nipKasi, setNipKasi] = useState("19871214 200912 1003");
  const [ttdKepala, setTtdKepala] = useState<string | null>(null);
  const [ttdKasi, setTtdKasi] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleTtdUpload = (setter: (v: string | null) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setter(reader.result as string);
    reader.readAsDataURL(file);
  };
  const [flights, setFlights] = useState<Flight[]>([]);
  const [maskapais, setMaskapais] = useState<any[]>([]);
  const availableYears = useMemo(
    () =>
      Array.from(
        new Set([
          "2026",
          ...flights
            .map((flight) => {
              if (!flight.tanggal) return null;
              const date = new Date(flight.tanggal);
              return Number.isNaN(date.getTime()) ? null : date.getFullYear().toString();
            })
            .filter((year): year is string => year !== null),
        ]),
      ).sort((a, b) => Number(b) - Number(a)),
    [flights],
  );

  useEffect(() => {
    document.title = "LLAU | Kalimarau International";
    fetchFlights();
    fetchMaskapai();
  }, []);

  const fetchFlights = async () => {
    try {
      const response = await fetch("/api/flights?page=1&limit=10000");
      if (!response.ok) throw new Error("Failed to fetch flights");
      const data = await response.json();
      setFlights(data.flights || []);
    } catch (error) {
      console.error("Error fetching flights:", error);
    }
  };

  const fetchMaskapai = async () => {
    try {
      const response = await fetch("/api/dashboard/maskapai");
      if (!response.ok) throw new Error("Failed to fetch maskapais");
      const data = await response.json();
      setMaskapais(data);
    } catch (error) {
      console.error("Error fetching maskapais:", error);
    }
  };

  const exportToWord = async () => {
    const content = document.getElementById("report-content");
    if (!content) return;
    
    // Copy the HTML to avoid mutating the DOM
    let htmlContent = content.innerHTML;

    try {
      const response = await fetch("/dinas-perhub.png");
      const blob = await response.blob();
      const base64Logo = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      // Replace the absolute or relative path with base64 data
      htmlContent = htmlContent.replace(/src="[^"]*dinas-perhub\.png"/g, `src="${base64Logo}"`);
    } catch (error) {
      console.error("Gagal memuat logo untuk export", error);
    }
    
    // Split the content at page breaks
    const pageBreakRegex = /<div class="page-break"[^>]*>.*?<\/div>/gi;
    const parts = htmlContent.split(pageBreakRegex);
    
    let processedHtml = "";
    if (parts.length > 1) {
      // First part is Section1 (Portrait)
      const section1 = parts[0];
      
      // Re-join the rest of the parts with a temporary page break
      const rest = parts.slice(1).join('<div class="page-break"></div>');
      // Replace the temporary page breaks with MS Word specific page breaks
      const section2 = rest.replace(/<div class="page-break"[^>]*>.*?<\/div>/gi, "<br clear=all style='mso-special-character:line-break;page-break-before:always'>");
      
      processedHtml = `
        <div class="WordSection1">
          ${section1}
        </div>
        <br clear=all style='page-break-before:always;mso-break-type:section-break'>
        <div class="WordSection2">
          ${section2}
        </div>
      `;
    } else {
      processedHtml = `
        <div class="WordSection1">
          ${htmlContent}
        </div>
      `;
    }
    
    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Laporan LLAU</title>
        <style>
          @page WordSection1 {
            size: 595.3pt 841.9pt; /* A4 Portrait */
            mso-page-orientation: portrait;
            margin: 2.0cm 2.0cm 2.0cm 2.0cm;
          }
          div.WordSection1 { page: WordSection1; }
          
          @page WordSection2 {
            size: 1190.5pt 841.9pt; /* A3 Landscape */
            mso-page-orientation: landscape;
            margin: 0.5cm; 
          }
          div.WordSection2 { page: WordSection2; }
          
          body { font-family: "Times New Roman", Times, serif; line-height: 1 !important; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 5px !important; }
          table, th, td { border: 1px solid black; padding: 1px !important; font-size: 7pt !important; word-wrap: break-word; line-height: 1 !important; height: auto !important; }
          th { text-align: center; font-weight: bold; }
          h2, p { margin: 1px 0 !important; }
          .signature-table { margin-top: 20px !important; border: none !important; }
          .signature-table td { border: none !important; font-size: 10pt !important; padding: 0 !important; }
        </style>
      </head>
      <body>
        ${processedHtml}
      </body>
      </html>
    `;
    
    const blob = new Blob(['\ufeff', html], {
      type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_LLAU_${bulan}_${tahun}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToPDF = async () => {
    const content = document.getElementById("report-content");
    if (!content) return;

    // Dynamically import so it only loads client-side
    const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
      import("jspdf"),
      import("html2canvas"),
    ]);

    // Split content into sections at each page-break
    const children = Array.from(content.childNodes);
    const breakIndices: number[] = [];
    children.forEach((node, idx) => {
      if (node instanceof HTMLElement && node.classList.contains("page-break")) {
        breakIndices.push(idx);
      }
    });

    const sections: { nodes: ChildNode[]; isLandscape: boolean }[] = [];
    let start = 0;
    breakIndices.forEach((brk, i) => {
      sections.push({ nodes: children.slice(start, brk), isLandscape: i > 0 });
      start = brk + 1; // skip the page-break element itself
    });
    sections.push({ nodes: children.slice(start), isLandscape: breakIndices.length > 0 });

    const renderSection = async (nodes: ChildNode[], isLandscape: boolean): Promise<HTMLCanvasElement> => {
      const wrapper = document.createElement("div");
      wrapper.style.position = "fixed";
      wrapper.style.left = "-9999px";
      wrapper.style.top = "0";
      wrapper.style.background = "#fff";
      wrapper.style.fontFamily = "'Times New Roman', Times, serif";
      wrapper.style.color = "#000";
      
      // A4 portrait width ~794px, A3 landscape width ~1587px
      wrapper.style.width = isLandscape ? "1587px" : "794px";
      // Add padding to simulate page margins so tables don't touch the absolute edge
      wrapper.style.padding = "40px"; 
      wrapper.style.boxSizing = "border-box";

      nodes.forEach((node) => {
        const clone = node.cloneNode(true);
        if (node instanceof HTMLElement && clone instanceof HTMLElement) {
          const sourceControls = node.querySelectorAll("input, textarea, select");
          const clonedControls = clone.querySelectorAll("input, textarea, select");

          sourceControls.forEach((source, index) => {
            const target = clonedControls[index];
            if (!target) return;

            if (source instanceof HTMLInputElement && target instanceof HTMLInputElement) {
              target.value = source.value;
              target.setAttribute("value", source.value);
            } else if (source instanceof HTMLTextAreaElement && target instanceof HTMLTextAreaElement) {
              target.value = source.value;
              target.textContent = source.value;
            } else if (source instanceof HTMLSelectElement && target instanceof HTMLSelectElement) {
              target.value = source.value;
              Array.from(target.options).forEach((option, optionIndex) => {
                if (optionIndex === source.selectedIndex) {
                  option.setAttribute("selected", "");
                } else {
                  option.removeAttribute("selected");
                }
              });
            }
          });
        }
        wrapper.appendChild(clone);
      });
      document.body.appendChild(wrapper);

      const canvas = await html2canvas(wrapper, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: wrapper.offsetWidth,
        onclone: (_doc: Document, el: HTMLElement) => {
          const cloneDoc = el.ownerDocument;
          cloneDoc.querySelectorAll('link[rel="stylesheet"], style').forEach((s) => s.remove());

          const style = cloneDoc.createElement("style");
          style.textContent = `
            *, *::before, *::after { box-sizing: border-box; }
            body {
              margin: 0; padding: 0;
              font-family: 'Times New Roman', Times, serif;
              font-size: 10pt;
              color: #000;
              background: #fff;
              line-height: 1.4;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              border-spacing: 0;
              margin-bottom: 12px;
              table-layout: fixed;
            }
            th, td {
              border: 1px solid #000;
              padding: 4px 6px;
              font-size: 7.5pt;
              line-height: 1.35;
              text-align: center;
              vertical-align: middle;
              overflow-wrap: anywhere;
              word-break: normal;
            }
            th { font-weight: bold; background-color: #f2f2f2; }
            tr { background-color: #fff; }
            .signature-table { border: none !important; width: 100%; margin-top: 30px; }
            .signature-table td {
              border: none !important;
              font-size: 10pt;
              padding: 4px;
              text-align: center;
              vertical-align: top;
            }
            p  { margin: 2px 0; line-height: 1.4; }
            h2 { margin: 4px 0; }
            img { max-width: 100%; display: inline-block; }
            u  { text-decoration: underline; }
            strong { font-weight: bold; }
          `;
          cloneDoc.head.appendChild(style);
        },
      });

      document.body.removeChild(wrapper);
      return canvas;
    };

    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    let isFirstPage = true;

    for (const section of sections) {
      if (section.nodes.length === 0) continue;

      const canvas = await renderSection(section.nodes, section.isLandscape);
      const pageWidth = section.isLandscape ? 420 : 210;
      const pageHeight = 297;
      const sourcePageHeight = Math.floor((canvas.width * pageHeight) / pageWidth);

      for (let sourceY = 0; sourceY < canvas.height; sourceY += sourcePageHeight) {
        if (!isFirstPage) {
          pdf.addPage(
            [pageWidth, pageHeight],
            section.isLandscape ? "landscape" : "portrait",
          );
        }
        isFirstPage = false;

        const sliceHeight = Math.min(sourcePageHeight, canvas.height - sourceY);
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeight;
        const context = pageCanvas.getContext("2d");
        if (!context) {
          throw new Error("Unable to prepare a page for the PDF export");
        }
        context.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight,
        );

        const imageHeight = (sliceHeight * pageWidth) / canvas.width;
        pdf.addImage(
          pageCanvas.toDataURL("image/jpeg", 0.95),
          "JPEG",
          0,
          0,
          pageWidth,
          imageHeight,
        );
      }
    }

    pdf.save(`Laporan_LLAU_${bulan}_${tahun}.pdf`);
  };


  const bulanLabel = BULAN_OPTIONS.find((b) => b.value === bulan)?.label ?? bulan;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          <main className="flex-1 overflow-auto">
            <div className="p-4 md:p-6 lg:p-8">

              {/* ── Toggle + Form inputan ── */}
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForm((v) => !v)}
                    className="flex items-center gap-2 rounded-md border bg-muted/60 px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
                  >
                    <Settings2 className="h-4 w-4" />
                    Pengaturan Dokumen
                    {showForm ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                  </button>
                  <button
                    type="button"
                    onClick={exportToWord}
                    className="flex items-center gap-2 rounded-md border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Export to Word
                  </button>
                  <button
                    type="button"
                    onClick={exportToPDF}
                    className="flex items-center gap-2 rounded-md border bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    Export to PDF
                  </button>
                </div>

                {showDataFilters && (
                  <div className="mt-4 flex flex-wrap items-end gap-4 rounded-lg border bg-muted/40 p-4">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="report-month" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Bulan Data
                      </label>
                      <select
                        id="report-month"
                        value={bulan}
                        onChange={(e) => setBulan(e.target.value)}
                        className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {BULAN_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="report-year" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Tahun Data
                      </label>
                      <select
                        id="report-year"
                        value={tahun}
                        onChange={(e) => setTahun(e.target.value)}
                        className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {availableYears.map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="report-letter-date" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Tanggal Surat
                      </label>
                      <input
                        id="report-letter-date"
                        type="date"
                        value={tanggalSurat}
                        onChange={(e) => setTanggalSurat(e.target.value)}
                        className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                )}

                {showForm && (
                  <div className="mt-2 rounded-lg border bg-muted/40 p-4 space-y-4">
                    {/* Baris 1: No. Surat + Bulan */}
                    <div className="flex flex-wrap items-end gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          No. Surat
                        </label>
                        <input
                          type="text"
                          value={noSurat}
                          onChange={(e) => setNoSurat(e.target.value)}
                          className="w-72 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="Contoh: AU.301/1/4/BPU-BEJ-2026"
                        />
                      </div>

                      {!showDataFilters && (
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Bulan
                          </label>
                          <select
                            value={bulan}
                            onChange={(e) => setBulan(e.target.value)}
                            className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            {BULAN_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Baris 2: Kepala Kantor + NIP */}
                    <div className="flex flex-wrap items-end gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Nama Kepala Kantor
                        </label>
                        <input
                          type="text"
                          value={namaKepala}
                          onChange={(e) => setNamaKepala(e.target.value)}
                          className="w-72 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="Nama Kepala Kantor"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          NIP Kepala Kantor
                        </label>
                        <input
                          type="text"
                          value={nipKepala}
                          onChange={(e) => setNipKepala(e.target.value)}
                          className="w-56 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="NIP Kepala Kantor"
                        />
                      </div>
                    </div>

                    {/* Baris 3: Kasi Pelayanan + NIP */}
                    <div className="flex flex-wrap items-end gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Nama Kasi Pelayanan &amp; Kerjasama
                        </label>
                        <input
                          type="text"
                          value={namaKasi}
                          onChange={(e) => setNamaKasi(e.target.value)}
                          className="w-72 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="Nama Kasi Pelayanan"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          NIP Kasi Pelayanan
                        </label>
                        <input
                          type="text"
                          value={nipKasi}
                          onChange={(e) => setNipKasi(e.target.value)}
                          className="w-56 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="NIP Kasi Pelayanan"
                        />
                      </div>
                    </div>

                    {/* Baris 4: Upload Tanda Tangan */}
                    <div className="border-t pt-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Upload Tanda Tangan</p>
                      <div className="flex flex-wrap items-start gap-6">
                        {/* TTD Kepala Kantor */}
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            TTD Kepala Kantor
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer rounded-md border border-dashed bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            {ttdKepala ? "Ganti Gambar" : "Pilih Gambar"}
                            <input type="file" accept="image/*" className="hidden" onChange={handleTtdUpload(setTtdKepala)} />
                          </label>
                          {ttdKepala && (
                            <div className="relative mt-1">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={ttdKepala} alt="TTD Kepala" className="h-16 object-contain border rounded bg-white" />
                              <button
                                type="button"
                                onClick={() => setTtdKepala(null)}
                                className="absolute top-0 right-0 rounded-full bg-destructive text-destructive-foreground text-xs px-1 leading-4"
                              >✕</button>
                            </div>
                          )}
                        </div>

                        {/* TTD Kasi Pelayanan */}
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            TTD Kasi Pelayanan
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer rounded-md border border-dashed bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            {ttdKasi ? "Ganti Gambar" : "Pilih Gambar"}
                            <input type="file" accept="image/*" className="hidden" onChange={handleTtdUpload(setTtdKasi)} />
                          </label>
                          {ttdKasi && (
                            <div className="relative mt-1">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={ttdKasi} alt="TTD Kasi" className="h-16 object-contain border rounded bg-white" />
                              <button
                                type="button"
                                onClick={() => setTtdKasi(null)}
                                className="absolute top-0 right-0 rounded-full bg-destructive text-destructive-foreground text-xs px-1 leading-4"
                              >✕</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <LLAUContent noSurat={noSurat} bulan={bulan} bulanLabel={bulanLabel} tahun={tahun} tanggalSurat={tanggalSurat} namaKepala={namaKepala} nipKepala={nipKepala} namaKasi={namaKasi} nipKasi={nipKasi} ttdKepala={ttdKepala} ttdKasi={ttdKasi} flights={flights} maskapais={maskapais} />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function LLAUContent({ noSurat, bulan, bulanLabel, tahun, tanggalSurat, namaKepala, nipKepala, namaKasi, nipKasi, ttdKepala, ttdKasi, flights, maskapais }: {
  noSurat: string; bulan: string; bulanLabel: string;
  tahun: string; tanggalSurat: string;
  namaKepala: string; nipKepala: string;
  namaKasi: string; nipKasi: string;
  ttdKepala: string | null; ttdKasi: string | null;
  flights: Flight[];
  maskapais: any[];
}) {
  const bulanTitle = bulanLabel.toUpperCase();
  const tanggalSuratLabel = tanggalSurat
    ? new Date(`${tanggalSurat}T00:00:00`).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

  // Map bulan name (JANUARI, FEBRUARI, ...) ke angka bulan (1-12)
  const BULAN_MAP: Record<string, number> = {
    JANUARI: 1, FEBRUARI: 2, MARET: 3, APRIL: 4, MEI: 5, JUNI: 6,
    JULI: 7, AGUSTUS: 8, SEPTEMBER: 9, OKTOBER: 10, NOVEMBER: 11, DESEMBER: 12,
  };
  const bulanAngka = BULAN_MAP[bulan];

  // Filter flights berdasarkan bulan yang dipilih
  const filteredFlights = useMemo(() => {
    if (!bulanAngka) return flights;
    return flights.filter((flight) => {
      if (!flight.tanggal) return false;
      const d = new Date(flight.tanggal);
      return d.getMonth() + 1 === bulanAngka && d.getFullYear().toString() === tahun;
    });
  }, [flights, bulanAngka, tahun]);

  // Map status maskapai
  const maskapaiStatusMap = useMemo(() => {
    const map = new Map<string, string>();
    maskapais.forEach((m: any) => {
      const display = m.status?.toLowerCase() === "active" ? "BERJADWAL" : "TIDAK BERJADWAL";
      if (m.kode) map.set(m.kode.toUpperCase(), display);
      if (m.nama) map.set(m.nama.toUpperCase(), display);
    });
    return map;
  }, [maskapais]);

  // Grouping flights untuk DAU-01 (sama dengan logika di reports/table1)
  const dau01Groups = useMemo(() => {
    const groupedFlights = new Map<string, any>();
    filteredFlights.forEach((flight) => {
      const route = `${flight.datangAsal}-${flight.datangTujuan}`;
      const aircraftType = `${flight.datangFlightNumber} - ${flight.berangkatFlightNumber}`;
      const key = `${route}|${flight.operator}|${aircraftType}`;
      if (!groupedFlights.has(key)) {
        groupedFlights.set(key, {
          route,
          operator: flight.operator,
          aircraftType,
          kapasitasKursi: flight.kapasitasKursi || 0,
          datangDewasa: 0, datangAnak: 0, datangBayi: 0,
          berangkatDewasa: 0, berangkatAnak: 0, berangkatBayi: 0,
          transitDewasa: 0, transitAnak: 0, transitBayi: 0,
          datangBagasi: 0, berangkatBagasi: 0, transitBagasi: 0,
          datangCargo: 0, berangkatCargo: 0, transitCargo: 0,
          datangPesawat: 0, berangkatPesawat: 0, transitPesawat: 0, lokalPesawat: 0,
          jadwal: maskapaiStatusMap.get(flight.operator?.toUpperCase() || "") || "BERJADWAL",
        });
      }
      const g = groupedFlights.get(key);
      g.datangDewasa    += parseFloat(flight.datangDewasa    || "0");
      g.datangAnak      += parseFloat(flight.datangAnak      || "0");
      g.datangBayi      += parseFloat(flight.datangBayi      || "0");
      g.berangkatDewasa += parseFloat(flight.berangkatDewasa || "0");
      g.berangkatAnak   += parseFloat(flight.berangkatAnak   || "0");
      g.berangkatBayi   += parseFloat(flight.berangkatBayi   || "0");
      g.transitDewasa   += parseFloat(flight.transit         || "0");
      g.datangBagasi    += parseFloat(flight.datangBagasi    || "0");
      g.berangkatBagasi += parseFloat(flight.berangkatBagasi || "0");
      g.datangCargo     += parseFloat(flight.datangCargo     || "0");
      g.berangkatCargo  += parseFloat(flight.berangkatCargo  || "0");
      if (parseFloat(flight.datangPergerakan    || "0") > 0) g.datangPesawat    += 1;
      if (parseFloat(flight.berangkatPergerakan || "0") > 0) g.berangkatPesawat += 1;
    });
    return Array.from(groupedFlights.values());
  }, [filteredFlights, maskapaiStatusMap]);

  // Hitung totals DAU-01
  const dau01Totals = useMemo(() => {
    const t = {
      kap: 0, dtg: 0, brk: 0, trt: 0, tbj: 0,
      dDew: 0, dAnak: 0, dBayi: 0,
      bDew: 0, bAnak: 0, bBayi: 0,
      tDew: 0, tAnak: 0, tBayi: 0,
      bagDtg: 0, bagBrk: 0, bagTrt: 0,
      kgDtg: 0, kgBrk: 0, kgTrt: 0,
    };
    dau01Groups.forEach((g) => {
      t.kap    += g.kapasitasKursi;
      t.dtg    += g.datangPesawat;
      t.brk    += g.berangkatPesawat;
      t.trt    += g.transitPesawat;
      t.tbj    += g.lokalPesawat;
      t.dDew   += g.datangDewasa;    t.dAnak  += g.datangAnak;    t.dBayi  += g.datangBayi;
      t.bDew   += g.berangkatDewasa; t.bAnak  += g.berangkatAnak; t.bBayi  += g.berangkatBayi;
      t.tDew   += g.transitDewasa;   t.tAnak  += g.transitAnak;   t.tBayi  += g.transitBayi;
      t.bagDtg += g.datangBagasi;    t.bagBrk += g.berangkatBagasi; t.bagTrt += g.transitBagasi;
      t.kgDtg  += g.datangCargo;     t.kgBrk  += g.berangkatCargo;  t.kgTrt  += g.transitCargo;
    });
    return t;
  }, [dau01Groups]);

  // ── DAU-02: Angkutan Udara Secara Total (logika dari table2) ────────────────
  const dau02 = useMemo(() => {
    let dtgPesawat = 0, brkPesawat = 0, lokal = 0;
    let dtgPenumpang = 0, brkPenumpang = 0, transitPenumpang = 0;
    let dtgBagasi = 0, brkBagasi = 0;
    let dtgCargo = 0, brkCargo = 0;
    filteredFlights.forEach((f) => {
      dtgPesawat     += 1;
      brkPesawat     += 1;
      dtgPenumpang   += parseFloat(f.datangDewasa || "0") + parseFloat(f.datangAnak || "0") + parseFloat(f.datangBayi || "0");
      brkPenumpang   += parseFloat(f.berangkatDewasa || "0") + parseFloat(f.berangkatAnak || "0") + parseFloat(f.berangkatBayi || "0");
      transitPenumpang += parseFloat(f.transit || "0");
      dtgBagasi      += parseFloat(f.datangBagasi || "0");
      brkBagasi      += parseFloat(f.berangkatBagasi || "0");
      dtgCargo       += parseFloat(f.datangCargo || "0");
      brkCargo       += parseFloat(f.berangkatCargo || "0");
    });
    const pesawatJumlah  = dtgPesawat + brkPesawat + lokal;
    const penumpangJumlah = dtgPenumpang + brkPenumpang + transitPenumpang;
    const bagasiJumlah   = dtgBagasi + brkBagasi;
    const kargoJumlah    = dtgCargo + brkCargo;
    return { dtgPesawat, brkPesawat, lokal, pesawatJumlah, dtgPenumpang, brkPenumpang, transitPenumpang, penumpangJumlah, dtgBagasi, brkBagasi, bagasiJumlah, dtgCargo, brkCargo, kargoJumlah };
  }, [filteredFlights]);

  // ── DAU-03: Angkutan Udara Menurut Asal/Tujuan (logika dari table3) ─────────
  const dau03Groups = useMemo(() => {
    const map: Record<string, any> = {};
    filteredFlights.forEach((f) => {
      const route = `${f.datangAsal} - ${f.datangTujuan}`;
      if (!map[route]) map[route] = { dtgPergerakan: 0, brkPergerakan: 0, dtgPenumpang: 0, brkPenumpang: 0, dtgBagasi: 0, brkBagasi: 0, dtgCargo: 0, brkCargo: 0 };
      map[route].dtgPergerakan  += parseInt(f.datangPergerakan    || "0");
      map[route].brkPergerakan  += parseInt(f.berangkatPergerakan || "0");
      map[route].dtgPenumpang   += parseInt(f.datangDewasa || "0") + parseInt(f.datangAnak || "0") + parseInt(f.datangBayi || "0");
      map[route].brkPenumpang   += parseInt(f.berangkatDewasa || "0") + parseInt(f.berangkatAnak || "0") + parseInt(f.berangkatBayi || "0");
      map[route].dtgBagasi      += parseInt(f.datangBagasi    || "0");
      map[route].brkBagasi      += parseInt(f.berangkatBagasi || "0");
      map[route].dtgCargo       += parseInt(f.datangCargo     || "0");
      map[route].brkCargo       += parseInt(f.berangkatCargo  || "0");
    });
    return Object.entries(map).map(([route, d], i) => ({
      no: i + 1, route,
      dtgPergerakan: d.dtgPergerakan, brkPergerakan: d.brkPergerakan, jmlPergerakan: d.dtgPergerakan + d.brkPergerakan,
      dtgPenumpang: d.dtgPenumpang,   brkPenumpang: d.brkPenumpang,   jmlPenumpang: d.dtgPenumpang + d.brkPenumpang,
      dtgBagasi: d.dtgBagasi,         brkBagasi: d.brkBagasi,         jmlBagasi: d.dtgBagasi + d.brkBagasi,
      dtgCargo: d.dtgCargo,           brkCargo: d.brkCargo,           jmlCargo: d.dtgCargo + d.brkCargo,
    }));
  }, [filteredFlights]);

  const dau03Totals = useMemo(() => dau03Groups.reduce((t, g) => ({
    dtgPergerakan: t.dtgPergerakan + g.dtgPergerakan, brkPergerakan: t.brkPergerakan + g.brkPergerakan, jmlPergerakan: t.jmlPergerakan + g.jmlPergerakan,
    dtgPenumpang:  t.dtgPenumpang  + g.dtgPenumpang,  brkPenumpang:  t.brkPenumpang  + g.brkPenumpang,  jmlPenumpang:  t.jmlPenumpang  + g.jmlPenumpang,
    dtgBagasi:     t.dtgBagasi     + g.dtgBagasi,     brkBagasi:     t.brkBagasi     + g.brkBagasi,     jmlBagasi:     t.jmlBagasi     + g.jmlBagasi,
    dtgCargo:      t.dtgCargo      + g.dtgCargo,      brkCargo:      t.brkCargo      + g.brkCargo,      jmlCargo:      t.jmlCargo      + g.jmlCargo,
  }), { dtgPergerakan:0,brkPergerakan:0,jmlPergerakan:0,dtgPenumpang:0,brkPenumpang:0,jmlPenumpang:0,dtgBagasi:0,brkBagasi:0,jmlBagasi:0,dtgCargo:0,brkCargo:0,jmlCargo:0 }), [dau03Groups]);

  // ── DAU-04: Angkutan Udara Menurut Airline/Operator (logika dari table4) ────
  const dau04Groups = useMemo(() => {
    const map: Record<string, any> = {};
    filteredFlights.forEach((f) => {
      const op = f.operator;
      if (!map[op]) map[op] = { dtgPergerakan: 0, brkPergerakan: 0, dtgPenumpang: 0, brkPenumpang: 0, transitPenumpang: 0, dtgBagasi: 0, brkBagasi: 0, dtgCargo: 0, brkCargo: 0 };
      map[op].dtgPergerakan  += parseInt(f.datangPergerakan    || "0");
      map[op].brkPergerakan  += parseInt(f.berangkatPergerakan || "0");
      map[op].dtgPenumpang   += parseInt(f.datangDewasa || "0") + parseInt(f.datangAnak || "0") + parseInt(f.datangBayi || "0");
      map[op].brkPenumpang   += parseInt(f.berangkatDewasa || "0") + parseInt(f.berangkatAnak || "0") + parseInt(f.berangkatBayi || "0");
      map[op].transitPenumpang += parseInt(f.transit || "0");
      map[op].dtgBagasi      += parseInt(f.datangBagasi    || "0");
      map[op].brkBagasi      += parseInt(f.berangkatBagasi || "0");
      map[op].dtgCargo       += parseInt(f.datangCargo     || "0");
      map[op].brkCargo       += parseInt(f.berangkatCargo  || "0");
    });
    return Object.entries(map).map(([op, d], i) => ({
      no: i + 1, op,
      dtgPergerakan: d.dtgPergerakan, brkPergerakan: d.brkPergerakan, jmlPergerakan: d.dtgPergerakan + d.brkPergerakan,
      dtgPenumpang: d.dtgPenumpang,   brkPenumpang: d.brkPenumpang,   transitPenumpang: d.transitPenumpang, jmlPenumpang: d.dtgPenumpang + d.brkPenumpang + d.transitPenumpang,
      dtgBagasi: d.dtgBagasi,         brkBagasi: d.brkBagasi,         jmlBagasi: d.dtgBagasi + d.brkBagasi,
      dtgCargo: d.dtgCargo,           brkCargo: d.brkCargo,           jmlCargo: d.dtgCargo + d.brkCargo,
    }));
  }, [filteredFlights]);

  const dau04Totals = useMemo(() => dau04Groups.reduce((t, g) => ({
    dtgPergerakan: t.dtgPergerakan + g.dtgPergerakan, brkPergerakan: t.brkPergerakan + g.brkPergerakan, jmlPergerakan: t.jmlPergerakan + g.jmlPergerakan,
    dtgPenumpang:  t.dtgPenumpang  + g.dtgPenumpang,  brkPenumpang:  t.brkPenumpang  + g.brkPenumpang,  transitPenumpang: t.transitPenumpang + g.transitPenumpang, jmlPenumpang: t.jmlPenumpang + g.jmlPenumpang,
    dtgBagasi:     t.dtgBagasi     + g.dtgBagasi,     brkBagasi:     t.brkBagasi     + g.brkBagasi,     jmlBagasi: t.jmlBagasi + g.jmlBagasi,
    dtgCargo:      t.dtgCargo      + g.dtgCargo,      brkCargo:      t.brkCargo      + g.brkCargo,      jmlCargo:  t.jmlCargo  + g.jmlCargo,
  }), { dtgPergerakan:0,brkPergerakan:0,jmlPergerakan:0,dtgPenumpang:0,brkPenumpang:0,transitPenumpang:0,jmlPenumpang:0,dtgBagasi:0,brkBagasi:0,jmlBagasi:0,dtgCargo:0,brkCargo:0,jmlCargo:0 }), [dau04Groups]);

  // ── DAU-05: Jam Puncak (logika dari table5, tanggal/jam bisa diinput) ────────
  const dau05 = useMemo(() => ({
    totalBerangkat: filteredFlights.reduce((s, f) => s + (parseFloat(f.berangkatPergerakan || "0") > 0 ? 1 : 0), 0),
    totalDatang:    filteredFlights.reduce((s, f) => s + (parseFloat(f.datangPergerakan    || "0") > 0 ? 1 : 0), 0),
  }), [filteredFlights]);

  // ── DAU-06: Lalu Lintas Kargo (logika dari table6) ───────────────────────────
  const dau06Groups = useMemo(() => {
    const map: Record<string, { dtgCargo: number; brkCargo: number }> = {};
    filteredFlights.forEach((f) => {
      const op = f.operator;
      if (!map[op]) map[op] = { dtgCargo: 0, brkCargo: 0 };
      map[op].dtgCargo += parseInt(f.datangCargo  || "0");
      map[op].brkCargo += parseInt(f.berangkatCargo || "0");
    });
    return Object.entries(map).map(([op, d], i) => ({ no: i + 1, op, dtgCargo: d.dtgCargo, brkCargo: d.brkCargo }));
  }, [filteredFlights]);

  const dau06Totals = useMemo(() => dau06Groups.reduce((t, g) => ({ dtgCargo: t.dtgCargo + g.dtgCargo, brkCargo: t.brkCargo + g.brkCargo }), { dtgCargo: 0, brkCargo: 0 }), [dau06Groups]);

  // state untuk tanggal & jam DAU-05 (bisa diinput manual)
  const [dau05Tanggal, setDau05Tanggal] = useState("");
  const [dau05Jam, setDau05Jam]         = useState("06.30 s/d 17:00");

  return (
    <div id="report-content" style={{ fontFamily: "'Times New Roman', Times, serif", color: "#000", lineHeight: 1.4 }}>

      {/* KOP SURAT */}
      <div style={{ borderBottom: "3px solid #000", paddingBottom: 6, marginBottom: 20 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              {/* Logo */}
              <td style={{ width: 110, textAlign: "center", verticalAlign: "middle", paddingRight: 8 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/dinas-perhub.png"
                  alt="Logo Dinas Perhubungan"
                  width="100"
                  height="100"
                  style={{ width: 100, height: 100, objectFit: "contain" }}
                />
              </td>

              {/* Teks kop + kontak — satu kolom */}
              <td style={{ verticalAlign: "middle" }}>
                {/* Judul */}
                <div style={{ textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: "bold" }}>KEMENTERIAN PERHUBUNGAN</p>
                  <p style={{ margin: 0, fontSize: 17, fontWeight: "bold" }}>DIREKTORAT JENDERAL PERHUBUNGAN UDARA</p>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: "bold" }}>BADAN LAYANAN UMUM</p>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: "bold", textTransform: "uppercase" }}>
                    KANTOR UNIT PENYELENGGARA BANDAR UDARA KELAS I KALIMARAU
                  </p>
                </div>

                {/* Kontak — di bawah judul, 3 kolom, di-center */}
                <div style={{ display: "flex", justifyContent: "center", marginTop: 6 }}>
                  <table style={{ borderCollapse: "collapse", fontSize: 11 }}>
                    <tbody>
                      <tr>
                        <td style={{ verticalAlign: "top", paddingRight: 16, whiteSpace: "nowrap" }}>
                          Jalan&nbsp;Kalimarau<br />
                          Teluk Bayur - Berau
                        </td>
                        <td style={{ borderLeft: "1px solid #000", verticalAlign: "top", paddingLeft: 16, paddingRight: 16, whiteSpace: "nowrap" }}>
                          Telepon&nbsp;(0554)&nbsp;2741966<br />
                          Fax&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(0554)&nbsp;2741966
                        </td>
                        <td style={{ borderLeft: "1px solid #000", verticalAlign: "top", paddingLeft: 16, whiteSpace: "nowrap" }}>
                          Email: bandara_kalimarau@yahoo.co.id<br />
                          : <u style={{ color: "#00f" }}>upbu_berau@dephub.go.id</u><br />
                          Microsite: dephub.go.id/org/upbukalimarau
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* SURAT PENGANTAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <p style={{ margin: 0 }}>Yth. <strong>Direktur Angkutan Udara</strong></p>
          <p style={{ margin: 0 }}>Ditjen. Perhubungan Udara</p>
        </div>
        <p style={{ margin: 0 }}>Berau, {tanggalSuratLabel}</p>
      </div>

      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h2 style={{ margin: "5px 0", fontSize: "1.1em", textTransform: "uppercase", textDecoration: "underline" }}>SURAT PENGANTAR</h2>
        <p style={{ margin: "2px 0", fontWeight: "bold" }}>Nomor : {noSurat}</p>
      </div>

      <DataTable>
        <thead>
          <tr>
            <Th>No.</Th>
            <Th>Isi Surat</Th>
            <Th>Banyaknya</Th>
            <Th>Keterangan</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td>1.</Td>
            <Td>
              Terlampir bersama ini dengan hormat disampaikan Laporan Data Lalu Lintas Angkutan Udara Kantor Unit Penyelenggara Bandar Udara Kelas I Kalimarau, Tanjung Redeb - Berau untuk bulan {bulanTitle} {tahun}.
            </Td>
            <Td>1 Bundel</Td>
            <Td>Disampaikan dengan hormat, perkenan menjadi diperiksa.</Td>
          </tr>
        </tbody>
      </DataTable>

      <SignatureArea
        left={null}
        right={<>
          <p style={{ margin: 0 }}>Mengetahui:<br />Kepala Kantor Unit Penyelenggara<br />Bandar Udara Kelas I Kalimarau,</p>
          {ttdKepala
            ? <img src={ttdKepala} alt="TTD Kepala" style={{ height: 64, objectFit: "contain", margin: "4px auto", display: "block" }} />
            : <><br /><br /><br /></>}
          <p style={{ margin: 0 }}><strong><u>{namaKepala}</u></strong><br />NIP. {nipKepala}</p>
        </>}
      />

      <div style={{ marginTop: 30, fontSize: "0.9em" }}>
        <p style={{ margin: 0 }}><strong>Tembusan :</strong></p>
        <ol style={{ margin: "4px 0 0 0", paddingLeft: 20 }}>
          <li>Direktur Jenderal Perhubungan Udara</li>
          <li>Sekretaris Direktorat Jenderal Perhubungan Udara</li>
          <li>Kepala Kantor Otoritas Wilayah VII Balikpapan</li>
          <li>Kepala Dinas Perhubungan Provinsi Kalimantan Timur</li>
          <li>Kepala Dinas Perhubungan Kabupaten Berau</li>
          <li>Kepala Badan Pusat Statistik Kabupaten Berau</li>
        </ol>
      </div>

      <PageBreak />

      {/* DAU-01 */}
      <ReportHeader
        title="KEMENTERIAN PERHUBUNGAN"
        lines={["DOMESTIK", "ARUS LALU LINTAS ANGKUTAN UDARA", `BANDARA : KALIMARAU | BULAN : ${bulanTitle} ${tahun} | Lembar : DAU - 01`]}
      />

      <DataTable style={{ fontSize: "0.75em" }}>
        <thead>
          {/* Baris 1: grup kolom */}
          <tr>
            <Th rowSpan={3}>NO</Th>
            <Th rowSpan={3}>RUTE</Th>
            <Th rowSpan={3}>OPERATOR</Th>
            <Th rowSpan={3}>BERJADWAL/<br />TIDAK BERJADWAL</Th>
            <Th rowSpan={3}>TIPE PESAWAT</Th>
            <Th rowSpan={3}>KAPASITAS<br />KURSI</Th>
            <Th colSpan={4}>PESAWAT</Th>
            <Th colSpan={9}>PENUMPANG</Th>
            <Th colSpan={3}>BAGASI (Kg)</Th>
            <Th colSpan={3}>KARGO (Kg)</Th>
          </tr>
          {/* Baris 2: sub-grup pesawat + penumpang + bagasi + kargo */}
          <tr>
            {/* PESAWAT — 4 kolom, semuanya rowSpan=2 */}
            <Th rowSpan={2}>Datang</Th>
            <Th rowSpan={2}>Berangkat</Th>
            <Th rowSpan={2}>Transit</Th>
            <Th rowSpan={2}>Tidak<br />Berjadwal</Th>
            {/* PENUMPANG — 3 grup x 3 */}
            <Th colSpan={3}>Datang</Th>
            <Th colSpan={3}>Berangkat</Th>
            <Th colSpan={3}>Transit</Th>
            {/* BAGASI — 3 kolom rowSpan=2 */}
            <Th rowSpan={2}>Datang</Th>
            <Th rowSpan={2}>Berangkat</Th>
            <Th rowSpan={2}>Transit</Th>
            {/* KARGO — 3 kolom rowSpan=2 */}
            <Th rowSpan={2}>Datang</Th>
            <Th rowSpan={2}>Berangkat</Th>
            <Th rowSpan={2}>Transit</Th>
          </tr>
          {/* Baris 3: detail penumpang */}
          <tr>
            <Th>Dewasa</Th><Th>Anak</Th><Th>Bayi</Th>
            <Th>Dewasa</Th><Th>Anak</Th><Th>Bayi</Th>
            <Th>Dewasa</Th><Th>Anak</Th><Th>Bayi</Th>
          </tr>
        </thead>
        <tbody>
          {dau01Groups.length === 0 ? (
            <tr><Td colSpan={25} style={{ textAlign: "center", padding: 20, color: "#888" }}>Tidak ada data untuk bulan {bulanTitle}</Td></tr>
          ) : (
            dau01Groups.map((g, index) => (
              <DAU01Row
                key={index}
                no={index + 1}
                rute={g.route}
                op={g.operator}
                jadwal={g.jadwal}
                tipe={g.aircraftType}
                kap={g.kapasitasKursi}
                dtg={g.datangPesawat}
                brk={g.berangkatPesawat}
                trt={g.transitPesawat}
                tbj={g.lokalPesawat}
                dDew={g.datangDewasa}    dAnak={g.datangAnak}    dBayi={g.datangBayi}
                bDew={g.berangkatDewasa} bAnak={g.berangkatAnak} bBayi={g.berangkatBayi}
                tDew={g.transitDewasa}   tAnak={g.transitAnak}   tBayi={g.transitBayi}
                bagDtg={g.datangBagasi}    bagBrk={g.berangkatBagasi} bagTrt={g.transitBagasi}
                kgDtg={g.datangCargo}      kgBrk={g.berangkatCargo}   kgTrt={g.transitCargo}
              />
            ))
          )}
          <tr style={{ fontWeight: "bold", backgroundColor: "#e6e6e6" }}>
            <Td colSpan={5}>TOTAL</Td>
            <Td>{dau01Totals.kap}</Td>
            <Td>{dau01Totals.dtg}</Td><Td>{dau01Totals.brk}</Td><Td>{dau01Totals.trt}</Td><Td>{dau01Totals.tbj}</Td>
            <Td>{dau01Totals.dDew}</Td><Td>{dau01Totals.dAnak}</Td><Td>{dau01Totals.dBayi}</Td>
            <Td>{dau01Totals.bDew}</Td><Td>{dau01Totals.bAnak}</Td><Td>{dau01Totals.bBayi}</Td>
            <Td>{dau01Totals.tDew}</Td><Td>{dau01Totals.tAnak}</Td><Td>{dau01Totals.tBayi}</Td>
            <Td>{dau01Totals.bagDtg}</Td><Td>{dau01Totals.bagBrk}</Td><Td>{dau01Totals.bagTrt}</Td>
            <Td>{dau01Totals.kgDtg}</Td><Td>{dau01Totals.kgBrk}</Td><Td>{dau01Totals.kgTrt}</Td>
          </tr>
        </tbody>
      </DataTable>

      <SignatureArea
        left={<>
          <p style={{ margin: 0 }}>Mengetahui :<br />Kepala Kantor Unit Penyelenggara<br />Bandar Udara Kelas I Kalimarau,</p>
          {ttdKepala
            ? <img src={ttdKepala} alt="TTD Kepala" style={{ height: 64, objectFit: "contain", margin: "4px auto", display: "block" }} />
            : <><br /><br /><br /></>}
          <p style={{ margin: 0 }}><strong><u>{namaKepala}</u></strong><br />NIP. {nipKepala}</p>
        </>}
        right={<>
          <p style={{ margin: 0 }}>Berau, {tanggalSuratLabel}<br />Kasi Pelayanan dan Kerjasama,</p>
          {ttdKasi
            ? <img src={ttdKasi} alt="TTD Kasi" style={{ height: 64, objectFit: "contain", margin: "4px auto", display: "block" }} />
            : <><br /><br /><br /></>}
          <p style={{ margin: 0 }}><strong><u>{namaKasi}</u></strong><br />NIP. {nipKasi}</p>
        </>}
      />

      <PageBreak />

      {/* DAU-02 */}
      <ReportHeader
        title="KEMENTERIAN PERHUBUNGAN"
        lines={["ANGKUTAN UDARA SECARA TOTAL", `Lembar: DAU- 02 | BANDARA : KALIMARAU | BULAN : ${bulanTitle} ${tahun}`]}
      />

      <DataTable>
        <thead>
          <tr>
            <Th rowSpan={2}>NO</Th>
            <Th rowSpan={2}>JENIS PENERBANGAN</Th>
            <Th colSpan={4}>PESAWAT</Th>
            <Th colSpan={4}>PENUMPANG</Th>
            <Th colSpan={3}>BAGASI (Kg)</Th>
            <Th colSpan={3}>KARGO (Kg)</Th>
            <Th colSpan={2}>POS (Kg)</Th>
          </tr>
          <tr>
            <Th>DATANG</Th><Th>BERANGKAT</Th><Th>LOKAL</Th><Th>JUMLAH</Th>
            <Th>DATANG</Th><Th>BERANGKAT</Th><Th>LOKAL</Th><Th>JUMLAH</Th>
            <Th>DATANG</Th><Th>BERANGKAT</Th><Th>JUMLAH</Th>
            <Th>DATANG</Th><Th>BERANGKAT</Th><Th>JUMLAH</Th>
            <Th>DATANG</Th><Th>BERANGKAT</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td>1</Td><Td style={{ textAlign: "left" }}>DOMESTIK</Td>
            <Td>{dau02.dtgPesawat}</Td><Td>{dau02.brkPesawat}</Td><Td>{dau02.lokal}</Td><Td>{dau02.pesawatJumlah}</Td>
            <Td>{dau02.dtgPenumpang}</Td><Td>{dau02.brkPenumpang}</Td><Td>{dau02.transitPenumpang}</Td><Td>{dau02.penumpangJumlah}</Td>
            <Td>{dau02.dtgBagasi}</Td><Td>{dau02.brkBagasi}</Td><Td>{dau02.bagasiJumlah}</Td>
            <Td>{dau02.dtgCargo}</Td><Td>{dau02.brkCargo}</Td><Td>{dau02.kargoJumlah}</Td>
            <Td>0</Td><Td>0</Td>
          </tr>
          <tr>
            <Td>2</Td><Td style={{ textAlign: "left" }}>INTERNASIONAL</Td>
            <Td>0</Td><Td>0</Td><Td>0</Td><Td>0</Td>
            <Td>0</Td><Td>0</Td><Td>0</Td><Td>0</Td>
            <Td>0</Td><Td>0</Td><Td>0</Td>
            <Td>0</Td><Td>0</Td><Td>0</Td>
            <Td>0</Td><Td>0</Td>
          </tr>
        </tbody>
      </DataTable>

      <SignatureArea
        left={<>
          <p style={{ margin: 0 }}>Mengetahui :<br />Kepala Kantor Unit Penyelenggara<br />Bandar Udara Kelas I Kalimarau,</p>
          {ttdKepala
            ? <img src={ttdKepala} alt="TTD Kepala" style={{ height: 64, objectFit: "contain", margin: "4px auto", display: "block" }} />
            : <><br /><br /><br /></>}
          <p style={{ margin: 0 }}><strong><u>{namaKepala}</u></strong><br />NIP. {nipKepala}</p>
        </>}
        right={<>
          <p style={{ margin: 0 }}>Berau, {tanggalSuratLabel}<br />Kasi Pelayanan dan Kerjasama,</p>
          {ttdKasi
            ? <img src={ttdKasi} alt="TTD Kasi" style={{ height: 64, objectFit: "contain", margin: "4px auto", display: "block" }} />
            : <><br /><br /><br /></>}
          <p style={{ margin: 0 }}><strong><u>{namaKasi}</u></strong><br />NIP. {nipKasi}</p>
        </>}
      />

      <PageBreak />

      {/* DAU-03 */}
      <ReportHeader
        title="KEMENTERIAN PERHUBUNGAN"
        lines={["ANGKUTAN UDARA MENURUT ASAL/TUJUAN", `DOMESTIK | Lembar: DAU- 03 | BANDARA : KALIMARAU | BULAN : ${bulanTitle} ${tahun}`]}
      />

      <DataTable>
        <thead>
          <tr>
            <Th rowSpan={2}>NO</Th>
            <Th rowSpan={2}>BANDARA ASAL / TUJUAN</Th>
            <Th colSpan={3}>PESAWAT</Th>
            <Th colSpan={3}>PENUMPANG</Th>
            <Th colSpan={3}>BAGASI (Kg)</Th>
            <Th colSpan={3}>KARGO (Kg)</Th>
          </tr>
          <tr>
            <Th>DATANG</Th><Th>BERANGKAT</Th><Th>JUMLAH</Th>
            <Th>DATANG</Th><Th>BERANGKAT</Th><Th>JUMLAH</Th>
            <Th>DATANG</Th><Th>BERANGKAT</Th><Th>JUMLAH</Th>
            <Th>DATANG</Th><Th>BERANGKAT</Th><Th>JUMLAH</Th>
          </tr>
        </thead>
        <tbody>
          {dau03Groups.length === 0 ? (
            <tr><Td colSpan={14} style={{ textAlign: "center", padding: 16, color: "#888" }}>Tidak ada data untuk bulan {bulanTitle}</Td></tr>
          ) : dau03Groups.map((g) => (
            <tr key={g.no}>
              <Td>{g.no}</Td>
              <Td style={{ textAlign: "left" }}>{g.route}</Td>
              <Td>{g.dtgPergerakan}</Td><Td>{g.brkPergerakan}</Td><Td>{g.jmlPergerakan}</Td>
              <Td>{g.dtgPenumpang}</Td><Td>{g.brkPenumpang}</Td><Td>{g.jmlPenumpang}</Td>
              <Td>{g.dtgBagasi}</Td><Td>{g.brkBagasi}</Td><Td>{g.jmlBagasi}</Td>
              <Td>{g.dtgCargo}</Td><Td>{g.brkCargo}</Td><Td>{g.jmlCargo}</Td>
            </tr>
          ))}
          <tr style={{ fontWeight: "bold", backgroundColor: "#e6e6e6" }}>
            <Td colSpan={2}>TOTAL</Td>
            <Td>{dau03Totals.dtgPergerakan}</Td><Td>{dau03Totals.brkPergerakan}</Td><Td>{dau03Totals.jmlPergerakan}</Td>
            <Td>{dau03Totals.dtgPenumpang}</Td><Td>{dau03Totals.brkPenumpang}</Td><Td>{dau03Totals.jmlPenumpang}</Td>
            <Td>{dau03Totals.dtgBagasi}</Td><Td>{dau03Totals.brkBagasi}</Td><Td>{dau03Totals.jmlBagasi}</Td>
            <Td>{dau03Totals.dtgCargo}</Td><Td>{dau03Totals.brkCargo}</Td><Td>{dau03Totals.jmlCargo}</Td>
          </tr>
        </tbody>
      </DataTable>

      <SignatureArea
        left={<>
          <p style={{ margin: 0 }}>Mengetahui :<br />Kepala Kantor Unit Penyelenggara<br />Bandar Udara Kelas I Kalimarau,</p>
          {ttdKepala
            ? <img src={ttdKepala} alt="TTD Kepala" style={{ height: 64, objectFit: "contain", margin: "4px auto", display: "block" }} />
            : <><br /><br /><br /></>}
          <p style={{ margin: 0 }}><strong><u>{namaKepala}</u></strong><br />NIP. {nipKepala}</p>
        </>}
        right={<>
          <p style={{ margin: 0 }}>Berau, {tanggalSuratLabel}<br />Kasi Pelayanan dan Kerjasama,</p>
          {ttdKasi
            ? <img src={ttdKasi} alt="TTD Kasi" style={{ height: 64, objectFit: "contain", margin: "4px auto", display: "block" }} />
            : <><br /><br /><br /></>}
          <p style={{ margin: 0 }}><strong><u>{namaKasi}</u></strong><br />NIP. {nipKasi}</p>
        </>}
      />

      <PageBreak />

      {/* DAU-04 */}
      <ReportHeader
        title="KEMENTERIAN PERHUBUNGAN"
        lines={["DATA ANGKUTAN UDARA MENURUT AIRLINE/OPERATOR", `DOMESTIK | Lembar: DAU- 04 | BANDARA : KALIMARAU | BULAN : ${bulanTitle} ${tahun}`]}
      />

      <DataTable>
        <thead>
          <tr>
            <Th rowSpan={2}>NO</Th>
            <Th rowSpan={2}>AIRLINE/OPERATOR</Th>
            <Th colSpan={3}>PESAWAT</Th>
            <Th colSpan={4}>PENUMPANG</Th>
            <Th colSpan={4}>BAGASI (Kg)</Th>
            <Th colSpan={4}>KARGO (Kg)</Th>
          </tr>
          <tr>
            <Th>DATANG</Th><Th>BERANGKAT</Th><Th>JUMLAH</Th>
            <Th>DATANG</Th><Th>BERANGKAT</Th><Th>TRANSIT</Th><Th>JUMLAH</Th>
            <Th>DATANG</Th><Th>BERANGKAT</Th><Th>TRANSIT</Th><Th>JUMLAH</Th>
            <Th>DATANG</Th><Th>BERANGKAT</Th><Th>TRANSIT</Th><Th>JUMLAH</Th>
          </tr>
        </thead>
        <tbody>
          {dau04Groups.length === 0 ? (
            <tr><Td colSpan={16} style={{ textAlign: "center", padding: 16, color: "#888" }}>Tidak ada data untuk bulan {bulanTitle}</Td></tr>
          ) : dau04Groups.map((g) => (
            <tr key={g.no}>
              <Td>{g.no}</Td>
              <Td style={{ textAlign: "left" }}>{g.op}</Td>
              <Td>{g.dtgPergerakan}</Td><Td>{g.brkPergerakan}</Td><Td>{g.jmlPergerakan}</Td>
              <Td>{g.dtgPenumpang}</Td><Td>{g.brkPenumpang}</Td><Td>{g.transitPenumpang}</Td><Td>{g.jmlPenumpang}</Td>
              <Td>{g.dtgBagasi}</Td><Td>{g.brkBagasi}</Td><Td>0</Td><Td>{g.jmlBagasi}</Td>
              <Td>{g.dtgCargo}</Td><Td>{g.brkCargo}</Td><Td>0</Td><Td>{g.jmlCargo}</Td>
            </tr>
          ))}
          <tr style={{ fontWeight: "bold", backgroundColor: "#e6e6e6" }}>
            <Td colSpan={2}>TOTAL</Td>
            <Td>{dau04Totals.dtgPergerakan}</Td><Td>{dau04Totals.brkPergerakan}</Td><Td>{dau04Totals.jmlPergerakan}</Td>
            <Td>{dau04Totals.dtgPenumpang}</Td><Td>{dau04Totals.brkPenumpang}</Td><Td>{dau04Totals.transitPenumpang}</Td><Td>{dau04Totals.jmlPenumpang}</Td>
            <Td>{dau04Totals.dtgBagasi}</Td><Td>{dau04Totals.brkBagasi}</Td><Td>0</Td><Td>{dau04Totals.jmlBagasi}</Td>
            <Td>{dau04Totals.dtgCargo}</Td><Td>{dau04Totals.brkCargo}</Td><Td>0</Td><Td>{dau04Totals.jmlCargo}</Td>
          </tr>
        </tbody>
      </DataTable>

      <SignatureArea
        left={<>
          <p style={{ margin: 0 }}>Mengetahui :<br />Kepala Kantor Unit Penyelenggara<br />Bandar Udara Kelas I Kalimarau,</p>
          {ttdKepala
            ? <img src={ttdKepala} alt="TTD Kepala" style={{ height: 64, objectFit: "contain", margin: "4px auto", display: "block" }} />
            : <><br /><br /><br /></>}
          <p style={{ margin: 0 }}><strong><u>{namaKepala}</u></strong><br />NIP. {nipKepala}</p>
        </>}
        right={<>
          <p style={{ margin: 0 }}>Berau, {tanggalSuratLabel}<br />Kasi Pelayanan dan Kerjasama,</p>
          {ttdKasi
            ? <img src={ttdKasi} alt="TTD Kasi" style={{ height: 64, objectFit: "contain", margin: "4px auto", display: "block" }} />
            : <><br /><br /><br /></>}
          <p style={{ margin: 0 }}><strong><u>{namaKasi}</u></strong><br />NIP. {nipKasi}</p>
        </>}
      />

      <PageBreak />

      {/* DAU-05 */}
      <ReportHeader
        title="KEMENTERIAN PERHUBUNGAN"
        lines={[
          "DOMESTIK",
          `DATA ANGKUTAN UDARA MENURUT AIRLINE/OPERATOR | Lembar: DAU - 05 | BANDARA : KALIMARAU | BULAN : ${bulanTitle} ${tahun}`,
          "KETERANGAN JAM PUNCAK BULANAN",
        ]}
      />

      <DataTable>
        <thead>
          <tr>
            <Th colSpan={3}>KEBERANGKATAN</Th>
            <Th colSpan={3}>KEDATANGAN</Th>
          </tr>
          <tr>
            <Th>TANGGAL</Th><Th>JAM</Th><Th>JUMLAH</Th>
            <Th>TANGGAL</Th><Th>JAM</Th><Th>JUMLAH</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td>
              <input
                type="text"
                value={dau05Tanggal || bulanLabel + " " + tahun}
                onChange={(e) => setDau05Tanggal(e.target.value)}
                style={{ border: "none", textAlign: "center", width: "100%", fontSize: "inherit", background: "transparent" }}
              />
            </Td>
            <Td>
              <input
                type="text"
                value={dau05Jam}
                onChange={(e) => setDau05Jam(e.target.value)}
                style={{ border: "none", textAlign: "center", width: "100%", fontSize: "inherit", background: "transparent" }}
              />
            </Td>
            <Td>{dau05.totalBerangkat}</Td>
            <Td>
              <input
                type="text"
                value={dau05Tanggal || bulanLabel + " " + tahun}
                onChange={(e) => setDau05Tanggal(e.target.value)}
                style={{ border: "none", textAlign: "center", width: "100%", fontSize: "inherit", background: "transparent" }}
              />
            </Td>
            <Td>
              <input
                type="text"
                value={dau05Jam}
                onChange={(e) => setDau05Jam(e.target.value)}
                style={{ border: "none", textAlign: "center", width: "100%", fontSize: "inherit", background: "transparent" }}
              />
            </Td>
            <Td>{dau05.totalDatang}</Td>
          </tr>
        </tbody>
      </DataTable>

      <SignatureArea
        left={<>
          <p style={{ margin: 0 }}>Mengetahui :<br />Kepala Kantor Unit Penyelenggara<br />Bandar Udara Kelas I Kalimarau,</p>
          {ttdKepala
            ? <img src={ttdKepala} alt="TTD Kepala" style={{ height: 64, objectFit: "contain", margin: "4px auto", display: "block" }} />
            : <><br /><br /><br /></>}
          <p style={{ margin: 0 }}><strong><u>{namaKepala}</u></strong><br />NIP. {nipKepala}</p>
        </>}
        right={<>
          <p style={{ margin: 0 }}>Berau, {tanggalSuratLabel}<br />Kasi Pelayanan dan Kerjasama,</p>
          {ttdKasi
            ? <img src={ttdKasi} alt="TTD Kasi" style={{ height: 64, objectFit: "contain", margin: "4px auto", display: "block" }} />
            : <><br /><br /><br /></>}
          <p style={{ margin: 0 }}><strong><u>{namaKasi}</u></strong><br />NIP. {nipKasi}</p>
        </>}
      />

      <PageBreak />

      {/* DAU-06 */}
      <ReportHeader
        title="KEMENTERIAN PERHUBUNGAN"
        lines={["LALU LINTAS ANGKUTAN KARGO", `DOMESTIK | Lembar: DAU- 06 | BANDARA : KALIMARAU | BULAN : ${bulanTitle} ${tahun}`]}
      />

      <DataTable>
        <thead>
          <tr>
            <Th rowSpan={2}>NO</Th>
            <Th rowSpan={2}>OPERATOR</Th>
            <Th rowSpan={2}>JENIS KOMODITI</Th>
            <Th rowSpan={2}>PERUSAHAAN EKSPEDISI</Th>
            <Th rowSpan={2}>ASAL/ TUJUAN</Th>
            <Th colSpan={2}>DATANG</Th>
            <Th colSpan={2}>BERANGKAT</Th>
          </tr>
          <tr>
            <Th>Kg</Th><Th>US$</Th>
            <Th>Kg</Th><Th>US$</Th>
          </tr>
        </thead>
        <tbody>
          {dau06Groups.length === 0 ? (
            <tr><Td colSpan={9} style={{ textAlign: "center", padding: 16, color: "#888" }}>Tidak ada data untuk bulan {bulanTitle}</Td></tr>
          ) : dau06Groups.map((g) => (
            <tr key={g.no}>
              <Td>{g.no}</Td>
              <Td style={{ textAlign: "left" }}>{g.op.toUpperCase()}</Td>
              <Td style={{ textAlign: "left" }}>SPAREPART / DOKUMEN</Td>
              <Td style={{ textAlign: "left" }}>SN Cargo, CDA</Td>
              <Td>-</Td>
              <Td>{g.dtgCargo}</Td><Td>0</Td>
              <Td>{g.brkCargo}</Td><Td>0</Td>
            </tr>
          ))}
          <tr style={{ fontWeight: "bold", backgroundColor: "#e6e6e6" }}>
            <Td colSpan={5}>TOTAL</Td>
            <Td>{dau06Totals.dtgCargo}</Td><Td>0</Td>
            <Td>{dau06Totals.brkCargo}</Td><Td>0</Td>
          </tr>
        </tbody>
      </DataTable>

      <SignatureArea
        left={<>
          <p style={{ margin: 0 }}>Mengetahui :<br />Kepala Kantor Unit Penyelenggara<br />Bandar Udara Kelas I Kalimarau,</p>
          {ttdKepala
            ? <img src={ttdKepala} alt="TTD Kepala" style={{ height: 64, objectFit: "contain", margin: "4px auto", display: "block" }} />
            : <><br /><br /><br /></>}
          <p style={{ margin: 0 }}><strong><u>{namaKepala}</u></strong><br />NIP. {nipKepala}</p>
        </>}
        right={<>
          <p style={{ margin: 0 }}>Berau, {tanggalSuratLabel}<br />Kasi Pelayanan dan Kerjasama,</p>
          {ttdKasi
            ? <img src={ttdKasi} alt="TTD Kasi" style={{ height: 64, objectFit: "contain", margin: "4px auto", display: "block" }} />
            : <><br /><br /><br /></>}
          <p style={{ margin: 0 }}><strong><u>{namaKasi}</u></strong><br />NIP. {nipKasi}</p>
        </>}
      />

    </div>
  );
}

// ─── Shared helper components ────────────────────────────────────────────────

const cellBase: React.CSSProperties = {
  border: "1px solid #000",
  padding: 4,
  textAlign: "center",
  verticalAlign: "middle",
};

function Th({ children, style, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th style={{ ...cellBase, backgroundColor: "#f2f2f2", ...style }} {...props}>
      {children}
    </th>
  );
}

function Td({ children, style, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td style={{ ...cellBase, ...style }} {...props}>
      {children}
    </td>
  );
}

function DataTable({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        marginBottom: 30,
        fontSize: "0.85em",
        ...style,
      }}
    >
      {children}
    </table>
  );
}

function ReportHeader({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 15 }}>
      <h2 style={{ margin: "5px 0", fontSize: "1.1em", textTransform: "uppercase", textDecoration: "underline" }}>
        {title}
      </h2>
      {lines.map((l, i) => (
        <p key={i} style={{ margin: "2px 0", fontWeight: "bold" }}>{l}</p>
      ))}
    </div>
  );
}

function SignatureArea({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <table className="signature-table" style={{ width: "100%", marginTop: 40, border: "none", borderCollapse: "collapse" }}>
      <tbody>
        <tr>
          <td style={{ width: "50%", textAlign: "center", verticalAlign: "top", border: "none", padding: 0 }}>
            {left}
          </td>
          <td style={{ width: "50%", textAlign: "center", verticalAlign: "top", border: "none", padding: 0 }}>
            {right}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function PageBreak() {
  return <div className="page-break" style={{ pageBreakBefore: "always", marginTop: 40 }} />;
}

type DAU01RowProps = {
  no: number; rute: string; op: string; jadwal: string; tipe: string; kap: number;
  dtg: number; brk: number; trt: number; tbj: number;
  dDew: number; dAnak: number; dBayi: number;
  bDew: number; bAnak: number; bBayi: number;
  tDew: number; tAnak: number; tBayi: number;
  bagDtg: number; bagBrk: number; bagTrt: number;
  kgDtg: number; kgBrk: number; kgTrt: number;
};

function DAU01Row({ no, rute, op, jadwal, tipe, kap, dtg, brk, trt, tbj, dDew, dAnak, dBayi, bDew, bAnak, bBayi, tDew, tAnak, tBayi, bagDtg, bagBrk, bagTrt, kgDtg, kgBrk, kgTrt }: DAU01RowProps) {
  return (
    <tr>
      <Td>{no}</Td>
      <Td>{rute}</Td>
      <Td style={{ textAlign: "left" }}>{op}</Td>
      <Td>{jadwal}</Td>
      <Td>{tipe}</Td>
      <Td>{kap}</Td>
      <Td>{dtg}</Td><Td>{brk}</Td><Td>{trt}</Td><Td>{tbj}</Td>
      <Td>{dDew}</Td><Td>{dAnak}</Td><Td>{dBayi}</Td>
      <Td>{bDew}</Td><Td>{bAnak}</Td><Td>{bBayi}</Td>
      <Td>{tDew}</Td><Td>{tAnak}</Td><Td>{tBayi}</Td>
      <Td>{bagDtg}</Td><Td>{bagBrk}</Td><Td>{bagTrt}</Td>
      <Td>{kgDtg}</Td><Td>{kgBrk}</Td><Td>{kgTrt}</Td>
    </tr>
  );
}
