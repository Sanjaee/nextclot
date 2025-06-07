import React, { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, Loader2, AlertTriangle, Home } from "lucide-react";

// --- Komponen Pembantu ---

// Komponen untuk Ikon Perawatan Pakaian (SVG) agar bersih & tajam
const WashIcons = () => (
  <div className="flex justify-center items-center space-x-3 text-gray-800 my-4">
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 6a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-4.586a1 1 0 0 1-.707-.293L12 13.414l-3.707 3.293A1 1 0 0 1 7.586 17H3a1 1 0 0 1-1-1V6z"></path>
      <path d="M12 13.5V10c0-2 2-3.5 3-3.5"></path>
    </svg>
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12l10 10L22 12 12 2 2 12z"></path>
      <path d="M2 2l20 20"></path>
    </svg>
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <circle cx="12" cy="12" r="2.5"></circle>
    </svg>
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 14h18v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4z"></path>
      <path d="M8 14V8a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v6"></path>
      <circle cx="12" cy="15" r="1"></circle>
    </svg>
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M2 2l20 20"></path>
    </svg>
  </div>
);

// Komponen baru untuk menampilkan material
const Materials = () => (
  <div className="text-center w-full border-t border-gray-200 pt-3 mt-4">
    <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">
      MATERIAL
    </p>
    <p className="text-sm text-gray-800 mt-1">
      Cotton CVC, Polyester Blend, Elastane
    </p>
  </div>
);

// --- Interface & URL ---

interface PublicProfile {
  name: string;
}

const FRONTEND_BASE_URL = "https://zascript.com";
// Definisikan URL API di sini agar bisa diakses di lingkungan browser
const API_BASE_URL = "https://zascript.com";

// --- Komponen Utama Halaman ---

export default function PublicQrPage() {
  const { toast } = useToast();

  const [uuid, setUuid] = useState<string | null>(null);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const tagRef = useRef<HTMLDivElement>(null);

  // Mengambil UUID dari URL path secara manual
  useEffect(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      const parts = path.split("/");
      const id = parts.pop() || parts.pop(); // handle trailing slash
      if (id && id.toLowerCase() !== "public") {
        setUuid(id);
      } else {
        setError("ID Profil tidak valid atau tidak ditemukan di URL.");
        setLoading(false);
      }
    }
  }, []);

  // Memuat script eksternal untuk konversi HTML ke Gambar
  useEffect(() => {
    const scriptId = "html-to-image-script";
    if (document.getElementById(scriptId)) return; // Script sudah ada

    const script = document.createElement("script");
    script.id = scriptId;
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Hapus script saat komponen di-unmount
      const scriptElement = document.getElementById(scriptId);
      if (scriptElement && document.head.contains(scriptElement)) {
        document.head.removeChild(scriptElement);
      }
    };
  }, []);

  const scanUrl = uuid ? `${FRONTEND_BASE_URL}/scan/${uuid}` : "";
  const qrCodeApiUrl = scanUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
        scanUrl
      )}&margin=0&ecc=H&qzone=1`
    : "";

  useEffect(() => {
    if (uuid) {
      const fetchProfile = async () => {
        setLoading(true);
        try {
          // FIX: Menggunakan variabel API_BASE_URL, bukan process.env
          const response = await fetch(`${API_BASE_URL}/api/public/qr/${uuid}`);
          const result = await response.json();

          if (response.ok && result.success) {
            setProfile(result.data);
            document.title = `Label Digital - ${result.data.name}`; // Set judul halaman
          } else {
            setError(
              result.error ||
                "Profil tidak ditemukan atau belum dipublikasikan."
            );
          }
        } catch (err) {
          console.error("Fetch error:", err);
          setError("Gagal memuat profil. Silakan coba lagi nanti.");
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [uuid]);

  const handleDownload = useCallback(() => {
    if (!tagRef.current || isDownloading) return;

    setIsDownloading(true);
    const htmlToImage = (window as any).htmlToImage;
    if (htmlToImage) {
      htmlToImage
        .toPng(tagRef.current, {
          pixelRatio: 2.5, // Resolusi lebih tinggi
          backgroundColor: "#ffffff",
        })
        .then((dataUrl: string) => {
          const link = document.createElement("a");
          link.download = `tag-${
            profile?.name.replace(/\s+/g, "-").toLowerCase() || "zascript"
          }.png`;
          link.href = dataUrl;
          link.click();
          toast({
            title: "Sukses!",
            description: "Gambar tag berhasil diunduh.",
          });
        })
        .catch((err: any) => {
          console.error("oops, something went wrong!", err);
          toast({
            title: "Gagal Mengunduh",
            description: "Terjadi kesalahan saat membuat gambar.",
            variant: "destructive",
          });
        })
        .finally(() => {
          setIsDownloading(false);
        });
    } else {
      setIsDownloading(false);
      toast({
        title: "Script Belum Siap",
        description: "Silakan coba beberapa saat lagi.",
        variant: "destructive",
      });
    }
  }, [tagRef, profile, toast, isDownloading]);

  // Tampilan Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-200">
        <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
      </div>
    );
  }

  // Tampilan Error
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-200 p-4">
        <div className="w-full max-w-sm text-center p-8 bg-white shadow-lg rounded-lg">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-semibold mt-4">Terjadi Kesalahan</h2>
          <p className="text-gray-600 mt-2">{error}</p>
          <Button onClick={() => (window.location.href = "/")} className="mt-6">
            <Home className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-300 font-sans p-4">
      {/* Komponen Tag Pakaian */}
      <div
        ref={tagRef}
        className="bg-white text-black w-[300px] p-5 shadow-lg flex flex-col items-center text-center"
        style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
      >
        <h2
          className="text-2xl tracking-wider"
          style={{ fontFamily: "'Brush Script MT', cursive" }}
        >
          Zacloth
        </h2>
        <p className="text-xs font-light tracking-widest text-gray-600">
          AUTHENTIC DIGITAL TAG
        </p>
        <div className="my-5 border-t border-b border-gray-200 w-full py-4">
          <p className="text-xl font-bold tracking-wider">{profile.name}</p>
          <p className="text-xs font-medium text-gray-700 mt-1 uppercase tracking-wider">
            Tangible Craft, Digital Soul
          </p>
        </div>

        {qrCodeApiUrl ? (
          <img
            src={qrCodeApiUrl}
            alt={`QR Code for ${profile.name}`}
            className="w-[150px] h-[150px]"
          />
        ) : (
          <div className="w-[150px] h-[150px] flex items-center justify-center bg-gray-100">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}

        <p className="text-xs font-mono mt-2 text-gray-500">{uuid}</p>
        <WashIcons />
        <p className="text-[10px] leading-tight text-gray-500">
          Hand Wash. Do Not Bleach. Tumble Dry Normal, Low Heat. Iron Low Heat.
          Do Not Dryclean.
          <br />
          This is a digital identity, handle with care.
        </p>
        {/* Penambahan Komponen Material */}
        <Materials />
      </div>

      {/* Tombol Aksi */}
      <div className="mt-6 w-full max-w-[300px]">
        <Button
          onClick={handleDownload}
          className="w-full"
          disabled={isDownloading}
        >
          {isDownloading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {isDownloading ? "Memproses..." : "Unduh Gambar Tag"}
        </Button>
      </div>
    </div>
  );
}
