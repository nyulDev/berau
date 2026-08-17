"use client";

import { useEffect, useState } from "react";
import { Settings2, ChevronDown, ChevronUp } from "lucide-react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";

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

export default function LLAUPage() {
  const [noSurat, setNoSurat] = useState("AU.301/1/4/BPU-BEJ-2026");
  const [bulan, setBulan] = useState("MARET");
  const [namaKepala, setNamaKepala] = useState("PATAH ATABRI, S.Si.T, M.M");
  const [nipKepala, setNipKepala] = useState("19770716 200212 1 002");
  const [namaKasi, setNamaKasi] = useState("M. IDHAMZULFIKAR AMIEN");
  const [nipKasi, setNipKasi] = useState("19871214 200912 1003");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    document.title = "LLAU | Kalimarau International";
  }, []);

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
                <button
                  type="button"
                  onClick={() => setShowForm((v) => !v)}
                  className="flex items-center gap-2 rounded-md border bg-muted/60 px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
                >
                  <Settings2 className="h-4 w-4" />
                  Pengaturan Dokumen
                  {showForm ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                </button>

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
                  </div>
                )}
              </div>

              <LLAUContent noSurat={noSurat} bulan={bulan} bulanLabel={bulanLabel} namaKepala={namaKepala} nipKepala={nipKepala} namaKasi={namaKasi} nipKasi={nipKasi} />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function LLAUContent({ noSurat, bulan, bulanLabel, namaKepala, nipKepala, namaKasi, nipKasi }: {
  noSurat: string; bulan: string; bulanLabel: string;
  namaKepala: string; nipKepala: string;
  namaKasi: string; nipKasi: string;
}) {
  const bulanTitle = bulanLabel.toUpperCase();
  return (
    <div style={{ fontFamily: "'Times New Roman', Times, serif", color: "#000", lineHeight: 1.4 }}>

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
        <p style={{ margin: 0 }}>Berau, 02 {bulanLabel} 2026</p>
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
              Terlampir bersama ini dengan hormat disampaikan Laporan Data Lalu Lintas Angkutan Udara Kantor Unit Penyelenggara Bandar Udara Kelas I Kalimarau, Tanjung Redeb - Berau untuk bulan {bulanTitle} 2026.
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
          <br /><br /><br />
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
        lines={["DOMESTIK", "ARUS LALU LINTAS ANGKUTAN UDARA", `BANDARA : KALIMARAU | BULAN : ${bulanTitle} 2026 | Lembar : DAU - 01`]}
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
          <DAU01Row no={1}  rute="BPN-BEJ" op="Sriwijaya Air"              jadwal="BERJADWAL"        tipe="SJ 134 - SJ 552"   kap={130} dtg={10} brk={12} trt={0} tbj={0} dDew={1033} dAnak={125} dBayi={37} bDew={1337} bAnak={162} bBayi={67} tDew={40} tAnak={0} tBayi={0} bagDtg={9658}  bagBrk={14647} bagTrt={0} kgDtg={368}   kgBrk={1444}  kgTrt={0} />
          <DAU01Row no={2}  rute="UPG-BEJ" op="Sriwijaya Air"              jadwal="BERJADWAL"        tipe="SJ 553 - SJ 135"   kap={130} dtg={13} brk={11} trt={0} tbj={0} dDew={871}  dAnak={91}  dBayi={28} bDew={1237} bAnak={164} bBayi={48} tDew={35} tAnak={0} tBayi={0} bagDtg={10213} bagBrk={11234} bagTrt={0} kgDtg={405}   kgBrk={99}    kgTrt={0} />
          <DAU01Row no={3}  rute="BPN-BEJ" op="Air Asia"                   jadwal="BERJADWAL"        tipe="QZ 772 - QZ 773"   kap={180} dtg={13} brk={13} trt={0} tbj={0} dDew={1509} dAnak={188} dBayi={27} bDew={1984} bAnak={272} bBayi={22} tDew={0}  tAnak={0} tBayi={0} bagDtg={14827} bagBrk={17961} bagTrt={0} kgDtg={6443}  kgBrk={5909}  kgTrt={0} />
          <DAU01Row no={4}  rute="BPN-BEJ" op="Super Air Jet"              jadwal="BERJADWAL"        tipe="IU 580 - IU 579"   kap={180} dtg={29} brk={30} trt={0} tbj={0} dDew={4651} dAnak={96}  dBayi={53} bDew={5031} bAnak={164} bBayi={66} tDew={0}  tAnak={0} tBayi={0} bagDtg={22658} bagBrk={29198} bagTrt={0} kgDtg={3403}  kgBrk={5513}  kgTrt={0} />
          <DAU01Row no={5}  rute="SUB-BEJ" op="Super Air Jet"              jadwal="BERJADWAL"        tipe="IU 578 - IU 581"   kap={180} dtg={19} brk={18} trt={0} tbj={0} dDew={2900} dAnak={126} dBayi={59} bDew={3036} bAnak={176} bBayi={58} tDew={6}  tAnak={0} tBayi={0} bagDtg={21146} bagBrk={21460} bagTrt={0} kgDtg={4416}  kgBrk={1469}  kgTrt={0} />
          <DAU01Row no={6}  rute="SUB-BEJ" op="Batik Air"                  jadwal="BERJADWAL"        tipe="ID 6346 - ID 6347" kap={156} dtg={28} brk={28} trt={0} tbj={0} dDew={2648} dAnak={101} dBayi={35} bDew={3939} bAnak={208} bBayi={57} tDew={17} tAnak={0} tBayi={0} bagDtg={28271} bagBrk={34385} bagTrt={0} kgDtg={5091}  kgBrk={1761}  kgTrt={0} />
          <DAU01Row no={7}  rute="CGK-BEJ" op="Batik Air"                  jadwal="BERJADWAL"        tipe="ID 6430 - ID 6431" kap={156} dtg={25} brk={25} trt={0} tbj={0} dDew={2396} dAnak={55}  dBayi={40} bDew={3619} bAnak={119} bBayi={49} tDew={14} tAnak={0} tBayi={0} bagDtg={30445} bagBrk={33182} bagTrt={0} kgDtg={24933} kgBrk={10824} kgTrt={0} />
          <DAU01Row no={8}  rute="AAP-BEJ" op="Wings Air"                  jadwal="BERJADWAL"        tipe="IW 1484 - IW 1485" kap={72}  dtg={23} brk={23} trt={0} tbj={0} dDew={925}  dAnak={8}   dBayi={13} bDew={1181} bAnak={35}  bBayi={17} tDew={1}  tAnak={0} tBayi={0} bagDtg={1940}  bagBrk={3772}  bagTrt={0} kgDtg={450}   kgBrk={208}   kgTrt={0} />
          <DAU01Row no={9}  rute="RTU-BEJ" op="Smart Aviation"             jadwal="BERJADWAL"        tipe="C208B - C208B"     kap={12}  dtg={5}  brk={5}  trt={0} tbj={0} dDew={34}   dAnak={3}   dBayi={1}  bDew={40}   bAnak={2}   bBayi={4}  tDew={0}  tAnak={0} tBayi={0} bagDtg={323}   bagBrk={297}   bagTrt={0} kgDtg={0}     kgBrk={0}     kgTrt={0} />
          <DAU01Row no={10} rute="AAP-BEJ" op="Wings Air"                  jadwal="BERJADWAL"        tipe="IW 1486 - IW 1487" kap={72}  dtg={8}  brk={8}  trt={0} tbj={0} dDew={194}  dAnak={7}   dBayi={2}  bDew={501}  bAnak={18}  bBayi={5}  tDew={0}  tAnak={0} tBayi={0} bagDtg={537}   bagBrk={2127}  bagTrt={0} kgDtg={50}    kgBrk={31}    kgTrt={0} />
          <DAU01Row no={11} rute="BPN-BEJ" op="Wings Air"                  jadwal="BERJADWAL"        tipe="IW 1360 - IW 1365" kap={72}  dtg={6}  brk={0}  trt={0} tbj={0} dDew={215}  dAnak={11}  dBayi={1}  bDew={0}    bAnak={0}   bBayi={0}  tDew={0}  tAnak={0} tBayi={0} bagDtg={648}   bagBrk={0}     bagTrt={0} kgDtg={160}   kgBrk={0}     kgTrt={0} />
          <DAU01Row no={12} rute="BPN-BEJ" op="Wings Air"                  jadwal="BERJADWAL"        tipe="IW 1364 - IW 1361" kap={72}  dtg={0}  brk={7}  trt={0} tbj={0} dDew={0}    dAnak={0}   dBayi={0}  bDew={477}  bAnak={17}  bBayi={6}  tDew={0}  tAnak={0} tBayi={0} bagDtg={0}     bagBrk={2405}  bagTrt={0} kgDtg={50}    kgBrk={0}     kgTrt={0} />
          <DAU01Row no={13} rute="TRK-BEJ" op="PT. ASI PUJIASTUTI AVIATION" jadwal="TIDAK BERJADWAL" tipe="C208B - C208B"     kap={12}  dtg={1}  brk={1}  trt={0} tbj={0} dDew={0}    dAnak={0}   dBayi={0}  bDew={5}    bAnak={0}   bBayi={0}  tDew={0}  tAnak={0} tBayi={0} bagDtg={0}     bagBrk={15}    bagTrt={0} kgDtg={0}     kgBrk={0}     kgTrt={0} />
          <DAU01Row no={14} rute="BPN-BEJ" op="Sriwijaya Air"              jadwal="BERJADWAL"        tipe="SJ 134 - SJ 552"   kap={130} dtg={1}  brk={1}  trt={0} tbj={0} dDew={107}  dAnak={21}  dBayi={5}  bDew={114}  bAnak={15}  bBayi={3}  tDew={5}  tAnak={0} tBayi={0} bagDtg={1116}  bagBrk={1507}  bagTrt={0} kgDtg={31}    kgBrk={0}     kgTrt={0} />
          <DAU01Row no={15} rute="BPN-BEJ" op="Wings Air"                  jadwal="BERJADWAL"        tipe="IW 1380 - IW 1367" kap={72}  dtg={1}  brk={0}  trt={0} tbj={0} dDew={68}   dAnak={1}   dBayi={0}  bDew={0}    bAnak={0}   bBayi={0}  tDew={0}  tAnak={0} tBayi={0} bagDtg={162}   bagBrk={0}     bagTrt={0} kgDtg={0}     kgBrk={0}     kgTrt={0} />
          <DAU01Row no={16} rute="BPN-BEJ" op="Air Asia"                   jadwal="BERJADWAL"        tipe="QZ 982 - QZ 983"   kap={180} dtg={1}  brk={1}  trt={0} tbj={0} dDew={118}  dAnak={23}  dBayi={0}  bDew={151}  bAnak={28}  bBayi={1}  tDew={0}  tAnak={0} tBayi={0} bagDtg={1135}  bagBrk={1260}  bagTrt={0} kgDtg={0}     kgBrk={0}     kgTrt={0} />
          <DAU01Row no={17} rute="BPN-BEJ" op="Super Air Jet"              jadwal="BERJADWAL"        tipe="IU 578 - IU 581"   kap={180} dtg={9}  brk={11} trt={0} tbj={0} dDew={1490} dAnak={28}  dBayi={15} bDew={1698} bAnak={40}  bBayi={21} tDew={0}  tAnak={0} tBayi={0} bagDtg={8781}  bagBrk={10300} bagTrt={0} kgDtg={6063}  kgBrk={712}   kgTrt={0} />
          <tr style={{ fontWeight: "bold", backgroundColor: "#e6e6e6" }}>
            <Td colSpan={5}>TOTAL</Td>
            <Td>1986</Td>
            <Td>192</Td><Td>194</Td><Td>0</Td><Td>0</Td>
            <Td>19159</Td><Td>884</Td><Td>316</Td>
            <Td>24350</Td><Td>1420</Td><Td>424</Td>
            <Td>118</Td><Td>0</Td><Td>0</Td>
            <Td>151860</Td><Td>183750</Td><Td>0</Td>
            <Td>51813</Td><Td>28020</Td><Td>0</Td>
          </tr>
        </tbody>
      </DataTable>

      <SignatureArea
        left={<>
          <p style={{ margin: 0 }}>Mengetahui :<br />Kepala Kantor Unit Penyelenggara<br />Bandar Udara Kelas I Kalimarau,</p>
          <br /><br /><br />
          <p style={{ margin: 0 }}><strong><u>{namaKepala}</u></strong><br />NIP. {nipKepala}</p>
        </>}
        right={<>
          <p style={{ margin: 0 }}>Berau, 02 {bulanLabel} 2026<br />Kasi Pelayanan dan Kerjasama,</p>
          <br /><br /><br />
          <p style={{ margin: 0 }}><strong><u>{namaKasi}</u></strong><br />NIP. {nipKasi}</p>
        </>}
      />

      <PageBreak />

      {/* DAU-02 */}
      <ReportHeader
        title="KEMENTERIAN PERHUBUNGAN"
        lines={["ANGKUTAN UDARA SECARA TOTAL", `Lembar: DAU- 02 | BANDARA : KALIMARAU | BULAN : ${bulanTitle} 2026`]}
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
            <Td>205</Td><Td>205</Td><Td>0</Td><Td>410</Td>
            <Td>20359</Td><Td>26194</Td><Td>0</Td><Td>46553</Td>
            <Td>151860</Td><Td>183750</Td><Td>335610</Td>
            <Td>51813</Td><Td>28020</Td><Td>79833</Td>
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
          <br /><br /><br />
          <p style={{ margin: 0 }}><strong><u>{namaKepala}</u></strong><br />NIP. {nipKepala}</p>
        </>}
        right={<>
          <p style={{ margin: 0 }}>Berau, 02 {bulanLabel} 2026<br />Kasi Pelayanan dan Kerjasama,</p>
          <br /><br /><br />
          <p style={{ margin: 0 }}><strong><u>{namaKasi}</u></strong><br />NIP. {nipKasi}</p>
        </>}
      />

      <PageBreak />

      {/* DAU-03 */}
      <ReportHeader
        title="KEMENTERIAN PERHUBUNGAN"
        lines={["ANGKUTAN UDARA MENURUT ASAL/TUJUAN", `DOMESTIK | Lembar: DAU- 03 | BANDARA : KALIMARAU | BULAN : ${bulanTitle} 2026`]}
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
          {[
            [1,"BPN - BEJ",69,74,143,9689,11544,21233,57869,75771,133640,16437,13628,30065],
            [2,"UPG - BEJ",13,11,24,990,1449,2439,10213,11234,21447,405,99,504],
            [3,"SUB - BEJ",47,46,93,5869,7474,13343,49417,55845,105262,9507,3230,12737],
            [4,"CGK - BEJ",25,25,50,2491,3787,6278,30445,33182,63627,24933,10824,35757],
            [5,"AAP - BEJ",31,31,62,1149,1757,2906,2477,5899,8376,500,239,739],
            [6,"RTU - BEJ",5,5,10,38,46,84,323,297,620,0,0,0],
            [7,"TRK - BEJ",1,1,2,0,5,5,0,15,15,0,0,0],
            [8,"BPN - BEJ",1,1,2,133,132,265,1116,1507,2623,31,0,31],
          ].map(([no,rute,...vals]) => (
            <tr key={no as number}>
              <Td>{no}</Td>
              <Td style={{ textAlign: "left" }}>{rute}</Td>
              {(vals as number[]).map((v, i) => <Td key={i}>{v}</Td>)}
            </tr>
          ))}
          <tr style={{ fontWeight: "bold", backgroundColor: "#e6e6e6" }}>
            <Td colSpan={2}>TOTAL</Td>
            <Td>192</Td><Td>194</Td><Td>386</Td>
            <Td>20359</Td><Td>26194</Td><Td>46553</Td>
            <Td>151860</Td><Td>183750</Td><Td>335610</Td>
            <Td>51813</Td><Td>28020</Td><Td>79833</Td>
          </tr>
        </tbody>
      </DataTable>

      <SignatureArea
        left={<>
          <p style={{ margin: 0 }}>Mengetahui :<br />Kepala Kantor Unit Penyelenggara<br />Bandar Udara Kelas I Kalimarau,</p>
          <br /><br /><br />
          <p style={{ margin: 0 }}><strong><u>{namaKepala}</u></strong><br />NIP. {nipKepala}</p>
        </>}
        right={<>
          <p style={{ margin: 0 }}>Berau, 02 {bulanLabel} 2026<br />Kasi Pelayanan dan Kerjasama,</p>
          <br /><br /><br />
          <p style={{ margin: 0 }}><strong><u>{namaKasi}</u></strong><br />NIP. {nipKasi}</p>
        </>}
      />

      <PageBreak />

      {/* DAU-04 */}
      <ReportHeader
        title="KEMENTERIAN PERHUBUNGAN"
        lines={["DATA ANGKUTAN UDARA MENURUT AIRLINE/OPERATOR", `DOMESTIK | Lembar: DAU- 04 | BANDARA : KALIMARAU | BULAN : ${bulanTitle} 2026`]}
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
          {[
            [1,"Sriwijaya Air",24,24,48,2318,3147,80,5545,20987,27388,0,48375,804,1543,0,2347],
            [2,"Air Asia",14,14,28,1865,2458,0,4323,15962,19221,0,35183,6443,5909,0,12352],
            [3,"Super Air Jet",57,59,116,9418,10290,6,19714,52585,60958,0,113543,13882,7694,0,21576],
            [4,"Batik Air",53,53,106,5275,7991,31,13297,58716,67567,0,126283,30024,12585,0,42609],
            [5,"Wings Air",38,38,76,1445,2257,1,3703,3287,8304,0,11591,660,289,0,949],
            [6,"Smart Aviation",5,5,10,38,46,0,84,323,297,0,620,0,0,0,0],
            [7,"PT. ASI PUJIASTUTI AVIATION",1,1,2,0,5,0,5,0,15,0,15,0,0,0,0],
          ].map(([no, op, ...vals]) => (
            <tr key={no as number}>
              <Td>{no}</Td>
              <Td style={{ textAlign: "left" }}>{op}</Td>
              {(vals as number[]).map((v, i) => <Td key={i}>{v}</Td>)}
            </tr>
          ))}
          <tr style={{ fontWeight: "bold", backgroundColor: "#e6e6e6" }}>
            <Td colSpan={2}>TOTAL</Td>
            <Td>192</Td><Td>194</Td><Td>386</Td>
            <Td>20359</Td><Td>26194</Td><Td>118</Td><Td>46671</Td>
            <Td>151860</Td><Td>183750</Td><Td>0</Td><Td>335610</Td>
            <Td>51813</Td><Td>28020</Td><Td>0</Td><Td>79833</Td>
          </tr>
        </tbody>
      </DataTable>

      <SignatureArea
        left={<>
          <p style={{ margin: 0 }}>Mengetahui :<br />Kepala Kantor Unit Penyelenggara<br />Bandar Udara Kelas I Kalimarau,</p>
          <br /><br /><br />
          <p style={{ margin: 0 }}><strong><u>{namaKepala}</u></strong><br />NIP. {nipKepala}</p>
        </>}
        right={<>
          <p style={{ margin: 0 }}>Berau, 02 {bulanLabel} 2026<br />Kasi Pelayanan dan Kerjasama,</p>
          <br /><br /><br />
          <p style={{ margin: 0 }}><strong><u>{namaKasi}</u></strong><br />NIP. {nipKasi}</p>
        </>}
      />

      <PageBreak />

      {/* DAU-05 */}
      <ReportHeader
        title="KEMENTERIAN PERHUBUNGAN"
        lines={[
          "DOMESTIK",
          `DATA ANGKUTAN UDARA MENURUT AIRLINE/OPERATOR | Lembar: DAU- 05 | BANDARA : KALIMARAU | BULAN : ${bulanTitle} 2026`,
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
            <Td>01-maret-26</Td><Td>06.30 s/d 17:00</Td><Td>192</Td>
            <Td>01-maret-26</Td><Td>06.30 s/d 17:00</Td><Td>194</Td>
          </tr>
        </tbody>
      </DataTable>

      <SignatureArea
        left={<>
          <p style={{ margin: 0 }}>Mengetahui :<br />Kepala Kantor Unit Penyelenggara<br />Bandar Udara Kelas I Kalimarau,</p>
          <br /><br /><br />
          <p style={{ margin: 0 }}><strong><u>{namaKepala}</u></strong><br />NIP. {nipKepala}</p>
        </>}
        right={<>
          <p style={{ margin: 0 }}>Berau, 02 {bulanLabel} 2026<br />Kasi Pelayanan dan Kerjasama,</p>
          <br /><br /><br />
          <p style={{ margin: 0 }}><strong><u>{namaKasi}</u></strong><br />NIP. {nipKasi}</p>
        </>}
      />

      <PageBreak />

      {/* DAU-06 */}
      <ReportHeader
        title="KEMENTERIAN PERHUBUNGAN"
        lines={["LALU LINTAS ANGKUTAN KARGO", `DOMESTIK | Lembar: DAU- 06 | BANDARA : KALIMARAU | BULAN : ${bulanTitle} 2026`]}
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
          {[
            [1,"SRIWIJAYA AIR","SPAREPART DOCUMENT","SN Cargo, CDA","BPN/BEJ",419,"",1444,""],
            [2,"SRIWIJAYA AIR","SPAREPART, DOCUMEN DLL","SN Cargo, CDA","UPG/BEJ",405,"",99,""],
            [3,"AIR ASIA","SPAREPART, DOCUMEN DLL","SN Cargo, CDA","BPN/BEJ",6443,"",5909,""],
            [4,"SUPER AIR JET","SPAREPART DOCUMENT","SN Cargo, CDA","BPN/BEJ",9466,"",6225,""],
            [5,"SUPER AIR JET","SPAREPART DOCUMENT","SN Cargo, CDA","SUB/BEJ",4416,"",1469,""],
            [6,"WINGS AIR","SPAREPART","SN Cargo, CDA","APP/BEJ",500,"",239,""],
            [7,"WINGS AIR","SPAREPART","SN Cargo, CDA","BPN/BEJ",160,"",50,""],
            [8,"BATIK","SPAREPART DOCUMENT","SN Cargo, CDA","SUB/BEJ",5091,"",1761,""],
            [9,"BATIK","SPAREPART DOCUMENT","SN Cargo, CDA","CGK/BEJ",24933,"",10824,""],
          ].map(([no, op, komoditi, ekspedisi, asal, dtgKg, dtgUsd, brkKg, brkUsd]) => (
            <tr key={no as number}>
              <Td>{no}</Td>
              <Td style={{ textAlign: "left" }}>{op}</Td>
              <Td style={{ textAlign: "left" }}>{komoditi}</Td>
              <Td style={{ textAlign: "left" }}>{ekspedisi}</Td>
              <Td>{asal}</Td>
              <Td>{dtgKg}</Td><Td>{dtgUsd}</Td>
              <Td>{brkKg}</Td><Td>{brkUsd}</Td>
            </tr>
          ))}
          <tr style={{ fontWeight: "bold", backgroundColor: "#e6e6e6" }}>
            <Td colSpan={5}>TOTAL</Td>
            <Td>51833</Td><Td>0</Td>
            <Td>28020</Td><Td>0</Td>
          </tr>
        </tbody>
      </DataTable>

      <SignatureArea
        left={<>
          <p style={{ margin: 0 }}>Mengetahui :<br />Kepala Kantor Unit Penyelenggara<br />Bandar Udara Kelas I Kalimarau,</p>
          <br /><br /><br />
          <p style={{ margin: 0 }}><strong><u>{namaKepala}</u></strong><br />NIP. {nipKepala}</p>
        </>}
        right={<>
          <p style={{ margin: 0 }}>Berau, 02 {bulanLabel} 2026<br />Kasi Pelayanan dan Kerjasama,</p>
          <br /><br /><br />
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
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40, textAlign: "center", width: "100%" }}>
      <div style={{ width: "45%" }}>{left}</div>
      <div style={{ width: "45%" }}>{right}</div>
    </div>
  );
}

function PageBreak() {
  return <div style={{ pageBreakBefore: "always", marginTop: 40 }} />;
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
