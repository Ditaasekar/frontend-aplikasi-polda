import React, { useState } from "react";
import jsPDF from 'jspdf';
// Ensure this path is 100% correct relative to this file's location
// This path is correct for src/pages/penyelidikanform.jsx accessing src/assets/logo-polda.png
import logoPolda from "../assets/logo-polda.png"; 
import html2canvas from 'html2canvas';

// --- HELPER FUNCTIONS (DEFINED GLOBALLY AT THE TOP OF THE FILE) ---
// These functions will be accessible by all components within this file.
const formatDate = (dateString) => {
  if (!dateString) return '[DD/MM/YYYY]'; 
  try {
    const [year, month, day] = dateString.split('-');
    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`; 
  } catch (e) {
    return dateString; 
  }
};

const formatFullDate = (dateString) => {
  if (!dateString) return '___________, __ __________ ____';
  try {
    const date = new Date(dateString);
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  } catch (e) {
    return dateString;
  }
};

const cleanStringForDisplay = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/\$/g, ''); // Remove all '$' characters
};

const createPlaceholder = (length) => {
  return '_'.repeat(length); // Using underscore for placeholder
};
// --- END HELPER FUNCTIONS ---


export default function PenyelidikanForm() {
  const [step, setStep] = useState(0); // Start from step 0 for surat type selection
  const [jenisSurat, setJenisSurat] = useState(''); // 'laporan_polisi' or 'sp_lidik'
  const [formData, setFormData] = useState({
    // --- Laporan Polisi (LP) Fields ---
    // Step 1 (LP)
    noLp: "",
    nama: "",
    noIdentitas: "",
    kewarganegaraan: "",
    jenisKelamin: "",
    // Step 2 (LP)
    tempatLahir: "",
    tanggalLahir: "",
    pekerjaan: "",
    agama: "",
    alamat: "",
    noTelepon: "",
    // Step 3 (LP)
    hariKejadian: "",
    tanggalKejadian: "",
    pukulJam: "",
    pukulMenit: "",
    zonaWaktu: "WIB",
    tempatKejadian: "",
    apaYangTerjadi: "",
    // Step 4 (LP)
    siapaTerlapor: "",
    terlaporNama: "",
    terlaporNoIdentitas: "",
    terlaporKewarganegaraan: "",
    terlaporSuku: "",
    terlaporJenisKelamin: "",
    terlaporTempatLahir: "",
    terlaporTanggalLahir: "",
    terlaporUmurTahun: "",
    terlaporUmurBulan: "",
    terlaporUmurHari: "",
    terlaporPekerjaan: "",
    terlaporAgama: "",
    terlaporAlamat: "",
    terlaporNoTelp: "",
    terlaporMediaSosial: "",
    terlaporKorporasi: false,
    // Step 5 (LP) - korban
    korbanNama: "",
    korbanNoIdentitas: "",
    korbanKewarganegaraan: "",
    korbanSuku: "",
    korbanJenisKelamin: "", 
    korbanTempatLahir: "",
    korbanTanggalLahir: "",
    korbanUmurTahun: "",
    korbanUmurBulan: "",
    korbanUmurHari: "",
    korbanPekerjaan: "",
    korbanAgama: "",
    korbanAlamat: "",
    korbanNoTelp: "",
    korbanMediaSosial: "",
    korbanKorporasi: false,
    // Kapan dilaporkan (LP Step 5)
    kapanDilaporkanHari: "",
    kapanDilaporkanTanggal: "",
    kapanDilaporkanJam: "",
    kapanDilaporkanMenit: "",
    kapanDilaporkanZonaWaktu: "WIB",
    // Pasal yang dipilih (LP Step 6)
    selectedPasal: [],
    //  Tindak pidana apa (LP Step 7)
    tindakPidana: "",
    //  Saksi (LP Step 8)
    saksi: [],
    // Barang Bukti (LP Step 9)
    barangBukti: "",
    // Uraian singkat yang dilaporkan (LP Step 10)
    uraianSingkat: "",
    isAnonymous: false,

    // --- SP Lidik Fields ---
    includeSpLidik: false, // Flag to include SP Lidik
    spLidikNomor: "", // Nomor SP Lidik
    spLidikNamaPenyidik1: "", // Nama Penyidik 1 di SP Lidik
    spLidikPangkatNrp1: "", // Pangkat/NRP Penyidik 1 di SP Lidik
    spLidikNamaPenyidik2: "", // Nama Penyidik 2 di SP Lidik
    spLidikPangkatNrp2: "", // Pangkat/NRP Penyidik 2 di SP Lidik
    spLidikNamaPenyidik3: "", // Nama Penyidik 3 di SP Lidik
    spLidikPangkatNrp3: "", // Pangkat/NRP Penyidik 3 di SP Lidik

    // --- SP Gas Lidik Fields (BARU) ---
    includeSpGasLidik: false, // Flag baru untuk menyertakan SP Gas Lidik
    spGasLidikNomor: "",
    spGasLidikNamaPenyidik1: "",
    spGasLidikPangkatNrp1: "",
    spGasLidikNamaPenyidik2: "",
    spGasLidikPangkatNrp2: "",
    spGasLidikNamaPenyidik3: "",
    spGasLidikPangkatNrp3: "",
    spGasLidikTindakPidana: "", 
    spGasLidikPasal: "",
    spGasLidikKapanDitemukanHari: "",
    spGasLidikKapanDitemukanTanggal: "",
    spGasLidikKapanDitemukanJam: "",
    spGasLidikKapanDitemukanMenit: "",
    spGasLidikTempatDitemukan: "",

    // --- Common Fields for Signatures (filled in Step 11 now) ---
    namaPenyidik: "", // Nama untuk Yang Menerima Laporan (Penyidik) & TTD SP Lidik
    pangkatPenyidik: "",
    nrpPenyidik: "",
    namaPiketSiaga: "", // Nama untuk Piket Siaga
    pangkatNrpPiketSiaga: "", // Pangkat NRP untuk Piket Siaga (full string: BRIPDA NRP 12345)
  });

  const [currentSaksi, setCurrentSaksi] = useState({
    nama: '',
    noIdentitas: '',
    kewarganegaraan: '',
    suku: '',
    jenisKelamin: '',
    tempatLahir: '',
    tanggalLahir: '',
    umurTahun: '',
    umurBulan: '',
    umurHari: '',
    pekerjaan: '',
    agama: '',
    alamat: '',
    noTelp: '',
    mediaSosial: '',
  });
  const [errors, setErrors] = useState({});
 
  // Daftar pasal yang tersedia
  const availablePasal = [
    { id: "pasal_45_27_1", text: "Pasal 45 Jo. Pasal 27 ayat (1)" },
    { id: "pasal_45_27_2", text: "Pasal 45 Jo. Pasal 27 ayat (2)" },
    { id: "pasal_45_27a", text: "Pasal 45 Jo. Pasal 27A" },
    { id: "pasal_45_27b_1", text: "Pasal 45 Jo. Pasal 27B ayat (1)" },
    { id: "pasal_45_27b_2", text: "Pasal 45 Jo. Pasal 27B ayat (2)" },
    { id: "pasal_45a_28_1", text: "Pasal 45A Jo. Pasal 28 ayat (1)" },
    { id: "pasal_45a_28_2", text: "Pasal 45A Jo. Pasal 28 ayat (2)" },
    { id: "pasal_45a_29_1", text: "Pasal 45A Jo. Pasal 29 ayat (1)" },
    { id: "pasal_45b_29", text: "Pasal 45B Jo. Pasal 29" },
    { id: "pasal_46_30_1", text: "Pasal 46 Jo. Pasal 30 ayat (1)" },
    { id: "pasal_46_30_2", text: "Pasal 46 Jo. Pasal 30 ayat (2)" },
    { id: "pasal_47_31_1", text: "Pasal 47 Jo. Pasal 31 ayat (1)" },
    { id: "pasal_47_31_2", text: "Pasal 47 Jo. Pasal 31 ayat (2)" },
    { id: "pasal_48_32_1", text: "Pasal 48 Jo. Pasal 32 ayat (1)" },
    { id: "pasal_48_32_2", text: "Pasal 48 Jo. Pasal 32 ayat (2)" },
    { id: "pasal_48_32_3", text: "Pasal 48 Jo. Pasal 32 ayat (3)" },
    { id: "pasal_49_33", text: "Pasal 49 Jo. Pasal 33" },
    { id: "pasal_50_34_1", text: "Pasal 50 Jo. Pasal 34 ayat (1)" },
    { id: "pasal_51_35", text: "Pasal 51 Jo. Pasal 35" },
    { id: "pasal_51_36", text: "Pasal 51 Jo. Pasal 36" },
  ];

  // Validation functions for each step
  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.noLp) newErrors.noLp = "Nomor LP wajib diisi";
    if (!formData.nama) newErrors.nama = "Nama wajib diisi";
    if (!formData.noIdentitas) newErrors.noIdentitas = "No. Identitas wajib diisi";
    if (!formData.kewarganegaraan) newErrors.kewarganegaraan = "Pilih kewarganegaraan";
    if (!formData.jenisKelamin) newErrors.jenisKelamin = "Pilih jenis kelamin";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.tempatLahir) newErrors.tempatLahir = "Tempat lahir wajib diisi";
    if (!formData.tanggalLahir) newErrors.tanggalLahir = "Tanggal lahir wajib diisi";
    if (!formData.pekerjaan) newErrors.pekerjaan = "Pekerjaan wajib diisi";
    if (!formData.agama) newErrors.agama = "Agama wajib dipilih";
    if (!formData.alamat) newErrors.alamat = "Alamat wajib diisi";
    if (!formData.noTelepon) newErrors.noTelepon = "No. telepon wajib diisi";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.hariKejadian) newErrors.hariKejadian = "Hari kejadian wajib diisi";
    if (!formData.tanggalKejadian) newErrors.tanggalKejadian = "Tanggal kejadian wajib diisi";
    if (!formData.pukulJam) newErrors.pukulJam = "Jam wajib diisi";
    if (!formData.pukulMenit) newErrors.pukulMenit = "Menit wajib dipilih";
    if (!formData.zonaWaktu) newErrors.zonaWaktu = "Zona waktu wajib dipilih";
    if (!formData.tempatKejadian) newErrors.tempatKejadian = "Tempat kejadian wajib diisi";
    if (!formData.apaYangTerjadi) newErrors.apaYangTerjadi = "Harap jelaskan apa yang terjadi";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = () => {
    const newErrors = {};
    if (!formData.siapaTerlapor) newErrors.siapaTerlapor = "Pilih siapa yang terlapor";
    if (formData.siapaTerlapor === "Terlapor") {
      if (!formData.terlaporNama) newErrors.terlaporNama = "Nama/Alias wajib diisi";
      if (!formData.terlaporNoIdentitas) newErrors.terlaporNoIdentitas = "No. Identitas wajib diisi";
      if (!formData.terlaporKewarganegaraan) newErrors.terlaporKewarganegaraan = "Pilih kewarganegaraan";
      if (!formData.terlaporSuku) newErrors.terlaporSuku = "Suku wajib diisi";
      if (!formData.terlaporJenisKelamin) newErrors.terlaporJenisKelamin = "Pilih jenis kelamin";
      if (!formData.terlaporTempatLahir) newErrors.terlaporTempatLahir = "Tempat lahir wajib diisi";
      if (!formData.terlaporTanggalLahir) newErrors.terlaporTanggalLahir = "Tanggal lahir wajib diisi";
      if (!formData.terlaporUmurTahun) newErrors.terlaporUmurTahun = "Umur Tahun wajib diisi";
      if (!formData.terlaporPekerjaan) newErrors.terlaporPekerjaan = "Pekerjaan wajib diisi";
      if (!formData.terlaporAgama) newErrors.terlaporAgama = "Pilih agama";
      if (!formData.terlaporAlamat) newErrors.terlaporAlamat = "Alamat wajib diisi";
      if (!formData.terlaporNoTelp) newErrors.terlaporNoTelp = "No. Telp wajib diisi";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep5 = () => {
    const newErrors = {};
    if (!formData.korbanNama) newErrors.korbanNama = "Nama/Alias wajib diisi";
    if (!formData.korbanNoIdentitas) newErrors.korbanNoIdentitas = "No. Identitas wajib diisi";
    if (!formData.korbanKewarganegaraan) newErrors.korbanKewarganegaraan = "Pilih kewarganegaraan";
    if (!formData.korbanSuku) newErrors.korbanSuku = "Suku wajib diisi";
    if (!formData.korbanJenisKelamin) newErrors.korbanJenisKelamin = "Pilih jenis kelamin"; 
    if (!formData.korbanTempatLahir) newErrors.korbanTempatLahir = "Tempat lahir wajib diisi";
    if (!formData.korbanTanggalLahir) newErrors.korbanTanggalLahir = "Tanggal lahir wajib diisi";
    if (!formData.korbanUmurTahun) newErrors.korbanUmurTahun = "Umur Tahun wajib diisi";
    if (!formData.korbanPekerjaan) newErrors.korbanPekerjaan = "Pekerjaan wajib diisi";
    if (!formData.korbanAgama) newErrors.korbanAgama = "Agama wajib dipilih"; 
    if (!formData.korbanAlamat) newErrors.korbanAlamat = "Alamat wajib diisi"; 
    if (!formData.korbanNoTelp) newErrors.korbanNoTelp = "No. Telp wajib diisi";
    if (!formData.kapanDilaporkanHari) newErrors.kapanDilaporkanHari = "Hari wajib diisi";
    if (!formData.kapanDilaporkanTanggal) newErrors.kapanDilaporkanTanggal = "Tanggal wajib diisi";
    if (!formData.kapanDilaporkanJam) newErrors.kapanDilaporkanJam = "Jam wajib diisi";
    if (!formData.kapanDilaporkanMenit) newErrors.kapanDilaporkanMenit = "Menit wajib diisi";
    if (!formData.kapanDilaporkanZonaWaktu) newErrors.kapanDilaporkanZonaWaktu = "Zona waktu wajib dipilih";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
   const validateStep6 = () => { 
    const newErrors = {}; 
    if (formData.selectedPasal.length === 0) { newErrors.selectedPasal = "Minimal pilih satu pasal"; } setErrors(newErrors); 
    return Object.keys(newErrors).length === 0; 
  };
   const validateStep7 = () => { 
    const newErrors = {}; 
    if (!formData.tindakPidana) { newErrors.tindakPidana = "Uraian tindak pidana wajib diisi."; } 
    setErrors(newErrors); return Object.keys(newErrors).length === 0; 
  };
   const validateStep8 = () => {
    const newErrors = {};
    if (formData.saksi.length === 0) {
      newErrors.saksi = "Minimal harus ada satu saksi yang ditambahkan.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
   const validateStep9 = () => {
    const newErrors = {};
    if (!formData.barangBukti) {
    newErrors.barangBukti = "Barang bukti wajib diisi.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
    const validateStep10 = () => {
      const newErrors = {};
      if (!formData.uraianSingkat) {
      newErrors.uraianSingkat = "Uraian singkat wajib diisi.";
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };
    // New Validation for Step 11 (LP Preview with Signatures)
  const validateStep11 = () => { // Updated to Step 11
    const newErrors = {};
    if (!formData.noLp) newErrors.noLp = "Nomor LP wajib diisi di preview ini."; // Add validation for noLp here too
    if (!formData.namaPenyidik) newErrors.namaPenyidik = "Nama Penyidik harus diisi.";
    if (!formData.pangkatPenyidik) newErrors.pangkatPenyidik = "Pangkat Penyidik harus diisi.";
    if (!formData.nrpPenyidik) newErrors.nrpPenyidik = "NRP Penyidik harus diisi.";
    // Only validate Piket Siaga if Laporan Polisi is the primary document
    if (jenisSurat === 'laporan_polisi' && (!formData.namaPiketSiaga || !formData.pangkatNrpPiketSiaga)) {
      if (!formData.namaPiketSiaga) newErrors.namaPiketSiaga = "Nama Piket Siaga harus diisi.";
      if (!formData.pangkatNrpPiketSiaga) newErrors.pangkatNrpPiketSiaga = "Pangkat dan NRP Piket Siaga harus diisi.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

    // Validation for SP Lidik fields (Step 12)
  const validateStep12 = () => { 
    const newErrors = {};
    if (formData.includeSpLidik) {
      if (!formData.spLidikNomor) newErrors.spLidikNomor = "Nomor SP Lidik wajib diisi.";
      if (!formData.spLidikNamaPenyidik1) newErrors.spLidikNamaPenyidik1 = "Nama Penyidik 1 wajib diisi.";
      if (!formData.spLidikPangkatNrp1) newErrors.spLidikPangkatNrp1 = "Pangkat/NRP Penyidik 1 wajib diisi.";
      // You can add more specific validations for spLidikNamaPenyidik2/3 etc.
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validation for SP Gas Lidik fields (NEW Step 14)
  const validateStep14 = () => {
    const newErrors = {};
    if (formData.includeSpGasLidik) {
      if (!formData.spGasLidikNomor) newErrors.spGasLidikNomor = "Nomor SP Gas Lidik wajib diisi.";
      if (!formData.spGasLidikNamaPenyidik1) newErrors.spGasLidikNamaPenyidik1 = "Nama Penyidik 1 (SP Gas Lidik) wajib diisi.";
      if (!formData.spGasLidikPangkatNrp1) newErrors.spGasLidikPangkatNrp1 = "Pangkat/NRP Penyidik 1 (SP Gas Lidik) wajib diisi.";
      if (!formData.spGasLidikTindakPidana) newErrors.spGasLidikTindakPidana = "Tindak Pidana (SP Gas Lidik) wajib diisi.";
      if (!formData.spGasLidikPasal) newErrors.spGasLidikPasal = "Pasal (SP Gas Lidik) wajib diisi.";
      if (!formData.spGasLidikKapanDitemukanHari) newErrors.spGasLidikKapanDitemukanHari = "Hari ditemukan wajib diisi.";
      if (!formData.spGasLidikKapanDitemukanTanggal) newErrors.spGasLidikKapanDitemukanTanggal = "Tanggal ditemukan wajib diisi.";
      if (!formData.spGasLidikKapanDitemukanJam) newErrors.spGasLidikKapanDitemukanJam = "Jam ditemukan wajib diisi.";
      if (!formData.spGasLidikKapanDitemukanMenit) newErrors.spGasLidikKapanDitemukanMenit = "Menit ditemukan wajib diisi.";
      if (!formData.spGasLidikTempatDitemukan) newErrors.spGasLidikTempatDitemukan = "Tempat ditemukan wajib diisi.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

    // Validation for final combined preview (Step 13 now 15) - No specific new fields here, just a check.
  const validateStep15 = () => {
    // This step is mostly for preview, no new essential inputs here.
    return true; 
  };
 
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

    const handlePasalChange = (e) => {
    const { id, checked } = e.target;
    setFormData(prev => {
        const newSelectedPasal = [...prev.selectedPasal];
        if (checked && !newSelectedPasal.includes(id)) {
            newSelectedPasal.push(id);
        } else if (!checked) {
            const index = newSelectedPasal.indexOf(id);
            if (index > -1) {
                newSelectedPasal.splice(index, 1); 
            }
        }
        return { ...prev, selectedPasal: newSelectedPasal };
    });
  };

  // Fungsi untuk mengubah data saksi yang sedang diketik di form kecil
  const handleSaksiChange = (e) => {
    const { name, value } = e.target;
    setCurrentSaksi(prev => ({ ...prev, [name]: value }));
  };

  // Fungsi untuk tombol "+ Tambah Saksi ke Daftar"
  const handleAddSaksi = (e) => {
    e.preventDefault();
    if (!currentSaksi.nama) {
      alert("Nama saksi tidak boleh kosong.");
      return;
    }
    setFormData(prev => ({ ...prev, saksi: [...prev.saksi, currentSaksi] }));
    
    // Kosongkan kembali form saksi untuk input berikutnya
    setCurrentSaksi({
        nama: '',
        noIdentitas: '',
        kewarganegaraan: '',
        suku: '',
        jenisKelamin: '',
        tempatLahir: '',
        tanggalLahir: '',
        umurTahun: '',
        umurBulan: '',
        umurHari: '',
        pekerjaan: '',
        agama: '',
        alamat: '',
        noTelp: '',
        mediaSosial: '',
    });
  };

const handleDownloadPDF = async () => { 
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4' 
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  // --- Capture Laporan Polisi ---
  const lpInput = document.getElementById('surat-laporan-polisi-preview');
  // Capture LP only if it's the chosen main type or if it exists for combined PDF
  if (lpInput && jenisSurat === 'laporan_polisi') { 
    try {
      const lpCanvas = await html2canvas(lpInput, { scale: 3, useCORS: true, allowTaint: true });
      const lpImgData = lpCanvas.toDataURL('image/jpeg', 1.0);
      const lpImgHeight = pdfWidth * (lpCanvas.height / lpCanvas.width);

      if (lpImgHeight > pdfHeight) {
          const lpFinalWidth = pdfHeight / (lpCanvas.height / lpCanvas.width);
          pdf.addImage(lpImgData, 'JPEG', (pdfWidth - lpFinalWidth) / 2, 0, lpFinalWidth, pdfHeight);
      } else {
          const xOffset = (pdfWidth - pdfWidth) / 2; 
          const yOffset = (pdfHeight - lpImgHeight) / 2; 
          pdf.addImage(lpImgData, 'JPEG', xOffset, yOffset, pdfWidth, lpImgHeight);
      }
    } catch (err) {
      console.error("Error generating LP PDF:", err);
      alert("Terjadi kesalahan saat membuat PDF Laporan Polisi. Mohon coba lagi.");
      return; 
    }
  } else if (jenisSurat === 'laporan_polisi' && !lpInput) {
    alert("Elemen Laporan Polisi untuk di-download tidak ditemukan!");
    return;
  }

  // --- Capture SP Lidik (if included) ---
  if (formData.includeSpLidik) {
    const spLidikInput = document.getElementById('surat-sp-lidik-preview');
    if (spLidikInput) {
      try {
        // Only add a new page if LP was already added
        if (jenisSurat === 'laporan_polisi') { 
            pdf.addPage(); 
        }
        const spLidikCanvas = await html2canvas(spLidikInput, { scale: 3, useCORS: true, allowTaint: true });
        const spLidikImgData = spLidikCanvas.toDataURL('image/jpeg', 1.0);
        const spLidikImgHeight = pdfWidth * (spLidikCanvas.height / spLidikCanvas.width);

        if (spLidikImgHeight > pdfHeight) {
            const spLidikFinalWidth = pdfHeight / (spLidikCanvas.height / spLidikCanvas.width);
            pdf.addImage(spLidikImgData, 'JPEG', (pdfWidth - spLidikFinalWidth) / 2, 0, spLidikFinalWidth, pdfHeight);
        } else {
            const yOffset = (pdfHeight - spLidikImgHeight) / 2; 
            pdf.addImage(spLidikImgData, 'JPEG', 0, yOffset, pdfWidth, spLidikImgHeight);
        }
      } catch (err) {
        console.error("Error generating SP Lidik PDF:", err);
        alert("Terjadi kesalahan saat membuat PDF SP Lidik. Mohon coba lagi.");
      }
    } else {
      console.warn("Elemen SP Lidik untuk di-download tidak ditemukan, meskipun opsi disertakan!");
    }
  }

  // --- Capture SP Gas Lidik (if included) ---
  if (formData.includeSpGasLidik) {
    const spGasLidikInput = document.getElementById('surat-sp-gas-lidik-preview');
    if (spGasLidikInput) {
      try {
        // Only add a new page if LP or SP Lidik was already added
        if (jenisSurat === 'laporan_polisi' || formData.includeSpLidik) { 
            pdf.addPage(); 
        }
        const spGasLidikCanvas = await html2canvas(spGasLidikInput, { scale: 3, useCORS: true, allowTaint: true });
        const spGasLidikImgData = spGasLidikCanvas.toDataURL('image/jpeg', 1.0);
        const spGasLidikImgHeight = pdfWidth * (spGasLidikCanvas.height / spGasLidikCanvas.width);

        if (spGasLidikImgHeight > pdfHeight) {
            const spGasLidikFinalWidth = pdfHeight / (spGasLidikCanvas.height / spGasLidikCanvas.width);
            pdf.addImage(spGasLidikImgData, 'JPEG', (pdfWidth - spGasLidikFinalWidth) / 2, 0, spGasLidikFinalWidth, pdfHeight);
        } else {
            const yOffset = (pdfHeight - spGasLidikImgHeight) / 2; 
            pdf.addImage(spGasLidikImgData, 'JPEG', 0, yOffset, pdfWidth, spGasLidikImgHeight);
        }
      } catch (err) {
        console.error("Error generating SP Gas Lidik PDF:", err);
        alert("Terjadi kesalahan saat membuat PDF SP Gas Lidik. Mohon coba lagi.");
      }
    } else {
      console.warn("Elemen SP Gas Lidik untuk di-download tidak ditemukan, meskipun opsi disertakan!");
    }
  }
  
  pdf.save(`Laporan-Gabungan-${formData.noLp || 'dokumen'}.pdf`);
  await saveToDatabase(formData);
};


  const handleNext = (e) => {
    e.preventDefault();
    if (step === 0) { // Step 0 for surat type selection
      if (!jenisSurat) {
        setErrors({ jenisSurat: "Pilih jenis surat terlebih dahulu" });
        return;
      }
      setErrors({});
      setStep(1); // Proceed to LP form steps
    } else if (step === 1 && validateStep1()) {
      setErrors({});
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setErrors({});
      setStep(3);
    } else if (step === 3 && validateStep3()) {
      setErrors({});
      setStep(4);
    } else if (step === 4 && validateStep4()) {
      setErrors({});
      setStep(5);
    } else if (step === 5 && validateStep5()) {
      setErrors({});
      setStep(6);
    } else if (step === 6 && validateStep6()) {
      const selectedPasalText = formData.selectedPasal
        .map(id => {
          const pasal = availablePasal.find(p => p.id === id);
          return pasal ? pasal.text : '';
        })
        .join(' dan ');

      setFormData(prev => ({
        ...prev,
        tindakPidana: selectedPasalText ? `sebagaimana dimaksud dalam ${selectedPasalText}` : ''
      }));
      setErrors({});
      setStep(7); 
    } else if (step === 7 && validateStep7()) {
      setErrors({});
      setStep(8);
    } else if (step === 8 && validateStep8()) {
      setErrors({});
      setStep(9); 
    } else if (step === 9 && validateStep9()) {
      setErrors({});
      setStep(10);
    } else if (step === 10 && validateStep10()) {
      setErrors({});
      setStep(11); // After all LP data, go to LP preview step
    } else if (step === 11 && validateStep11()) { // From LP preview, now validate signatures before going to SP Lidik option step
      setErrors({});
      setStep(12);
    } else if (step === 12 && formData.includeSpLidik && validateStep12()) { // If SP Lidik included, validate its fields and move to SP Gas Lidik step
      setErrors({});
      setStep(14); // Go to SP Gas Lidik step
    } else if (step === 12 && !formData.includeSpLidik) { // If SP Lidik not included, skip its input and go to SP Gas Lidik step
        setErrors({});
        setStep(14); // Go to SP Gas Lidik step
    } else if (step === 14 && formData.includeSpGasLidik && validateStep14()) { // If SP Gas Lidik included, validate its fields and move to final preview
      setErrors({});
      setStep(15); // Go to final combined preview step
    } else if (step === 14 && !formData.includeSpGasLidik) { // If SP Gas Lidik not included, skip its input and go to final preview
        setErrors({});
        setStep(15); // Go to final combined preview step
    } else if (step === 15 && validateStep15()) { // Validation for final combined preview - just a check
      setErrors({});
      // This is the last step before actual download, no 'Next' from here.
      // The Download button will be handled separately.
    }
  };

  const handleBack = (e) => {
    e.preventDefault();
    setErrors({});
    if (step === 0) return; // Cannot go back from step 0 (initial selection)
    if (step === 11) { // From LP Preview, go back to LP data (step 10)
        setStep(10);
    } else if (step === 12) { // From SP Lidik input/option step, go back to LP Preview (step 11)
        setStep(11);
    } else if (step === 14) { // Dari SP Gas Lidik input/option step, kembali ke SP Lidik
      if (formData.includeSpLidik) {
        setStep(12);
      } else {
        setStep(11);
      }
    } else if (step === 15) { // Dari pratinjau gabungan akhir
        // Kembali ke input SP Gas Lidik jika disertakan, jika tidak ke Pratinjau SP Lidik (atau LP jika SP Lidik tidak ada)
        if (formData.includeSpGasLidik) {
            setStep(14);
        } else if (formData.includeSpLidik) {
            setStep(12);
        } else {
            setStep(11);
        }
    } else { // Normal back for other steps
        setStep(step - 1);
    }
  };
  const handleSubmit = (e) => { 
    e.preventDefault(); // This is crucial for form submission
    handleNext(e); 
  };
  // Tambahkan function save ke database
const saveToDatabase = async (formDataToSave) => {
  try {
    console.log('🔄 Saving to database...');
    
    const response = await fetch('https://backend-aplikasi-polda-production.up.railway.app/api/laporan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        noLp: formDataToSave.noLp,
        nama: formDataToSave.nama,
        noIdentitas: formDataToSave.noIdentitas,
        kewarganegaraan: formDataToSave.kewarganegaraan,
        jenisKelamin: formDataToSave.jenisKelamin,
        tempatLahir: formDataToSave.tempatLahir,
        tanggalLahir: formDataToSave.tanggalLahir,
        pekerjaan: formDataToSave.pekerjaan,
        agama: formDataToSave.agama,
        alamat: formDataToSave.alamat,
        noTelepon: formDataToSave.noTelepon,
        hariKejadian: formDataToSave.hariKejadian,
        tanggalKejadian: formDataToSave.tanggalKejadian,
        pukulJam: formDataToSave.pukulJam,
        pukulMenit: formDataToSave.pukulMenit,
        zonaWaktu: formDataToSave.zonaWaktu,
        tempatKejadian: formDataToSave.tempatKejadian,
        apaYangTerjadi: formDataToSave.apaYangTerjadi,
        siapaTerlapor: formDataToSave.siapaTerlapor,
        terlaporNama: formDataToSave.terlaporNama,
        korbanNama: formDataToSave.korbanNama
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Data berhasil disimpan:', result);
      alert('✅ Data laporan berhasil disimpan ke database!');
      return result;
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Error saving to database:', error);
    alert('❌ Terjadi kesalahan saat menyimpan data. PDF tetap berhasil didownload.');
  }
};
  
  // Membagi daftar pasal menjadi dua kolom
  const middleIndex = Math.ceil(availablePasal.length / 2);
  const firstColumnPasal = availablePasal.slice(0, middleIndex);
  const secondColumnPasal = availablePasal.slice(middleIndex);


  return (
    <div className="flex justify-center mt-10">
      <form
        onSubmit={handleSubmit}
        className="bg-indigo-800 p-8 rounded-md max-w-md w-full space-y-6 text-indigo-900"
      >
        <h3 className="text-white text-center font-semibold text-xl mb-6">FORMULIR LAPORAN</h3>

        {/* Dynamic Header for Steps */}
        {step >=1 && step <=10 && (
          <div
            className="bg-white text-indigo-900 font-semibold rounded-xl px-4 py-2 text-center select-none mb-6"
            style={{ marginTop: "-0.25rem" }}
          >
            {step === 1 || step === 2 ? 'Yang Dilaporkan:' : 
             step === 3 || step === 4 || step === 5 ? 'Peristiwa Yang diLaporkan:' :
             step === 6 ? 'PASAL:' :
             step === 7 ? 'TINDAK PIDANA:' :
             step === 8 ? 'NAMA DAN ALAMAT SAKSI - SAKSI:' :
             step === 9 ? 'BARANG BUKTI:' :
             'URAIAN SINGKAT YANG DI LAPORKAN:'
            }
          </div>
        )}
        {step === 11 && (
            <div className="bg-white text-indigo-900 font-semibold rounded-xl px-4 py-2 text-center select-none mb-6">
                PREVIEW SURAT LAPORAN POLISI
            </div>
        )}
        {step === 12 && (
            <div className="bg-white text-indigo-900 font-semibold rounded-xl px-4 py-2 text-center select-none mb-6">
                PENGISIAN DATA SURAT SP LIDIK
            </div>
        )}
        {step === 14 && (
            <div className="bg-white text-indigo-900 font-semibold rounded-xl px-4 py-2 text-center select-none mb-6">
                PENGISIAN DATA SURAT SP GAS LIDIK
            </div>
        )}
        {step === 15 && (
            <div className="bg-white text-indigo-900 font-semibold rounded-xl px-4 py-2 text-center select-none mb-6">
                PREVIEW SURAT GABUNGAN
            </div>
        )}

        {/* Step 0: Pilih Jenis Surat */}
        {step === 0 && (
          <>
            <div className="flex flex-col space-y-4">
              <button
                type="button"
                onClick={() => { setJenisSurat('laporan_polisi'); setStep(1); }} // Directly set step 1
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded py-2"
              >
                Laporan Polisi (Model B)
              </button>
              {/* NOTE: SP Lidik data entry will be optional after LP data is filled */}
              <p className="text-gray-300 text-center text-sm">SP Lidik dan SP Gas Lidik akan diisi setelah Laporan Polisi.</p>
            </div>
            {errors.jenisSurat && <p className="text-red-400 text-sm mt-1">{errors.jenisSurat}</p>}
          </>
        )}

        {/* Step 1 (Laporan Polisi) */}
        {step === 1 && (
          <>
            <div>
              <label className="block mb-1 text-white font-semibold">No Lp</label>
              <input
                type="text"
                name="noLp"
                value={formData.noLp}
                onChange={handleChange}
                placeholder="Wajib diisi"
                className={`w-full px-3 py-2 rounded ${errors.noLp ? "border border-red-500" : ""}`}
              />
              {errors.noLp && <p className="text-red-400 text-sm mt-1">{errors.noLp}</p>}
            </div>

            <div>
              <label className="block mb-1 text-white font-semibold">Nama</label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                placeholder="Wajib diisi huruf kapital"
                style={{ textTransform: "uppercase" }}
                className={`w-full px-3 py-2 rounded ${errors.nama ? "border border-red-500" : ""}`}
              />
              {errors.nama && <p className="text-red-400 text-sm mt-1">{errors.nama}</p>}
            </div>

            <div>
              <label className="block mb-1 text-white font-semibold">No. Identitas</label>
              <input
                type="text"
                name="noIdentitas"
                value={formData.noIdentitas}
                onChange={handleChange}
                placeholder="Wajib diisi"
                className={`w-full px-3 py-2 rounded ${errors.noIdentitas ? "border border-red-500" : ""}`}
              />
              {errors.noIdentitas && <p className="text-red-400 text-sm mt-1">{errors.noIdentitas}</p>}
            </div>

            <div>
              <label className="block mb-1 text-white font-semibold">Kewarganegaraan</label>
              <select
                name="kewarganegaraan"
                value={formData.kewarganegaraan}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded text-indigo-900 ${errors.kewarganegaraan ? "border border-red-500" : ""}`}
              >
                <option value="">Pilih</option>
                <option value="WNI">WNI</option>
                <option value="WNA">WNA</option>
              </select>
              {errors.kewarganegaraan && <p className="text-red-400 text-sm mt-1">{errors.kewarganegaraan}</p>}
            </div>

            <div>
              <label className="block mb-1 text-white font-semibold">Jenis Kelamin</label>
              <select
                name="jenisKelamin"
                value={formData.jenisKelamin}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded text-indigo-900 ${errors.jenisKelamin ? "border border-red-500" : ""}`}
              >
                <option value="">Pilih</option>
                <option value="Laki-Laki">Laki - Laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
              {errors.jenisKelamin && <p className="text-red-400 text-sm mt-1">{errors.jenisKelamin}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded py-2"
            >
              Next
            </button>
          </>
        )}

        {/* Step 2 (Laporan Polisi) */}
        {step === 2 && (
          <>
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block mb-1 text-white font-semibold">Tempat Lahir</label>
                <input
                  type="text"
                  name="tempatLahir"
                  value={formData.tempatLahir}
                  onChange={handleChange}
                  placeholder="Masukkan tempat lahir"
                  className={`w-full px-3 py-2 rounded ${errors.tempatLahir ? "border border-red-500" : ""}`}
                />
                {errors.tempatLahir && <p className="text-red-400 text-sm mt-1">{errors.tempatLahir}</p>}
              </div>

              <div className="flex-1">
                <label className="block mb-1 text-white font-semibold">Tanggal Lahir</label>
                <input
                  type="date"
                  name="tanggalLahir"
                  value={formData.tanggalLahir}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded ${errors.tanggalLahir ? "border border-red-500" : ""}`}
                />
                {errors.tanggalLahir && <p className="text-red-400 text-sm mt-1">{errors.tanggalLahir}</p>}
              </div>
            </div>

            <div>
              <label className="block mb-1 text-white font-semibold">Pekerjaan</label>
              <input
                type="text"
                name="pekerjaan"
                value={formData.pekerjaan}
                onChange={handleChange}
                placeholder="Masukkan pekerjaan"
                className={`w-full px-3 py-2 rounded ${errors.pekerjaan ? "border border-red-500" : ""}`}
              />
              {errors.pekerjaan && <p className="text-red-400 text-sm mt-1">{errors.pekerjaan}</p>}
            </div>

            <div>
              <label className="block mb-1 text-white font-semibold">Agama</label>
              <select
                name="agama"
                value={formData.agama}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded text-indigo-900 ${errors.agama ? "border border-red-500" : ""}`}
              >
                <option value="">Pilih</option>
                <option value="Islam">Islam</option>
                <option value="Katolik">Katolik</option>
                <option value="Protestan">Protestan</option>
                <option value="Hindu">Hindu</option>
                <option value="Budha">Budha</option>
              </select>
              {errors.agama && <p className="text-red-400 text-sm mt-1">{errors.agama}</p>}
            </div>

            <div>
              <label className="block mb-1 text-white font-semibold">Alamat</label>
              <textarea
                name="alamat"
                value={formData.alamat}
                onChange={handleChange}
                placeholder="Masukkan alamat lengkap"
                rows={3}
                className={`w-full px-3 py-2 rounded resize-none ${errors.alamat ? "border border-red-500" : ""}`}
              />
              {errors.alamat && <p className="text-red-400 text-sm mt-1">{errors.alamat}</p>}
            </div>

            <div>
              <label className="block mb-1 text-white font-semibold">No. Telepon</label>
              <input
                type="text"
                name="noTelepon"
                value={formData.noTelepon}
                onChange={handleChange}
                placeholder="Masukkan nomor telepon"
                className={`w-full px-3 py-2 rounded ${errors.noTelepon ? "border border-red-500" : ""}`}
              />
              {errors.noTelepon && <p className="text-red-400 text-sm mt-1">{errors.noTelepon}</p>}
            </div>

            <div className="flex justify-between space-x-4">
              <button
                onClick={handleBack}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded py-2"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded py-2"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Step 3 (Laporan Polisi) */}
        {step === 3 && (
          <>
            <div className="flex space-x-4 mb-4">
              <div className="flex-1">
                <label className="block mb-1 text-white font-semibold">Hari Kejadian</label>
                <input
                  type="text"
                  name="hariKejadian"
                  value={formData.hariKejadian}
                  onChange={handleChange}
                  placeholder="Masukkan hari kejadian"
                  className={`w-full px-3 py-2 rounded ${errors.hariKejadian ? "border border-red-500" : ""}`}
                />
                {errors.hariKejadian && <p className="text-red-400 text-sm mt-1">{errors.hariKejadian}</p>}
              </div>

              <div className="flex-1">
                <label className="block mb-1 text-white font-semibold">Tanggal Kejadian</label>
                <input
                  type="date"
                  name="tanggalKejadian"
                  value={formData.tanggalKejadian}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded ${errors.tanggalKejadian ? "border border-red-500" : ""}`}
                />
                {errors.tanggalKejadian && <p className="text-red-400 text-sm mt-1">{errors.tanggalKejadian}</p>}
              </div>
            </div>

            <div className="flex space-x-4 mb-4">
              <div className="flex-1">
                <label className="block mb-1 text-white font-semibold">Pukul (Jam)</label>
                <input
                  type="number"
                  name="pukulJam"
                  value={formData.pukulJam}
                  onChange={handleChange}
                  min="0"
                  max="23"
                  placeholder="00 - 23"
                  className={`w-full px-3 py-2 rounded ${errors.pukulJam ? "border border-red-500" : ""}`}
                />
                {errors.pukulJam && <p className="text-red-400 text-sm mt-1">{errors.pukulJam}</p>}
              </div>

              <div className="flex-1">
                <label className="block mb-1 text-white font-semibold">Pukul (Menit)</label>
                <select
                  name="pukulMenit"
                  value={formData.pukulMenit}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded ${errors.pukulMenit ? "border border-red-500" : ""}`}
                >
                  <option value="">Pilih menit</option>
                  <option value="00">00</option>
                  <option value="30">30</option>
                </select>
                {errors.pukulMenit && <p className="text-red-400 text-sm mt-1">{errors.pukulMenit}</p>}
              </div>

              <div className="flex-1">
                <label className="block mb-1 text-white font-semibold">Zona Waktu</label>
                <select
                  name="zonaWaktu"
                  value={formData.zonaWaktu}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded ${errors.zonaWaktu ? "border border-red-500" : ""}`}
                >
                  <option value="WIB">WIB</option>
                  <option value="WITA">WITA</option>
                  <option value="WIT">WIT</option>
                </select>
                {errors.zonaWaktu && <p className="text-red-400 text-sm mt-1">{errors.zonaWaktu}</p>}
              </div>
            </div>

            <div>
              <label className="block mb-1 text-white font-semibold">Tempat Kejadian</label>
              <input
                type="text"
                name="tempatKejadian"
                value={formData.tempatKejadian}
                onChange={handleChange}
                placeholder="Nama jalan, kec, kab/kota, provinsi"
                className={`w-full px-3 py-2 rounded ${errors.tempatKejadian ? "border border-red-500" : ""}`}
              />
              {errors.tempatKejadian && <p className="text-red-400 text-sm mt-1">{errors.tempatKejadian}</p>}
            </div>

            <div>
              <label className="block mb-1 text-white font-semibold">Apa yang terjadi</label>
              <textarea
                name="apaYangTerjadi"
                value={formData.apaYangTerjadi}
                onChange={handleChange}
                placeholder="Jelaskan Apa yang Terjadi"
                rows={4}
                className={`w-full px-3 py-2 rounded resize-none ${errors.apaYangTerjadi ? "border border-red-500" : ""}`}
              />
              {errors.apaYangTerjadi && <p className="text-red-400 text-sm mt-1">{errors.apaYangTerjadi}</p>}
            </div>

            <div className="flex justify-between space-x-4">
              <button
                onClick={handleBack}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded py-2"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded py-2"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Step 4 (Laporan Polisi) */}
        {step === 4 && (
          <>
            <div>
              <label className="block mb-1 text-white font-semibold">Siapa yang Terlapor</label>
              <select
                name="siapaTerlapor"
                value={formData.siapaTerlapor}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded text-indigo-900 ${errors.siapaTerlapor ? "border border-red-500" : ""}`}
              >
                <option value="">Pilih</option>
                <option value="Dalam Lidik">Dalam Lidik</option>
                <option value="Terlapor">Terlapor</option>
              </select>
              {errors.siapaTerlapor && <p className="text-red-400 text-sm mt-1">{errors.siapaTerlapor}</p>}
            </div>

            {formData.siapaTerlapor === "Terlapor" && (
              <>
                {/* Terlapor fields */}
                <div>
                  <label className="block mb-1 text-white font-semibold">Nama / Alias</label>
                  <input
                    type="text"
                    name="terlaporNama"
                    value={formData.terlaporNama}
                    onChange={handleChange}
                    placeholder="Nama atau alias"
                    className={`w-full px-3 py-2 rounded ${errors.terlaporNama ? "border border-red-500" : ""}`}
                  />
                  {errors.terlaporNama && <p className="text-red-400 text-sm mt-1">{errors.terlaporNama}</p>}
                </div>
                <div>
                  <label className="block mb-1 text-white font-semibold">No. Identitas</label>
                  <input
                    type="text"
                    name="terlaporNoIdentitas"
                    value={formData.terlaporNoIdentitas}
                    onChange={handleChange}
                    placeholder="No. Identitas"
                    className={`w-full px-3 py-2 rounded ${errors.terlaporNoIdentitas ? "border border-red-500" : ""}`}
                  />
                  {errors.terlaporNoIdentitas && <p className="text-red-400 text-sm mt-1">{errors.terlaporNoIdentitas}</p>}
                </div>

                <div>
                  <label className="block mb-1 text-white font-semibold">Kewarganegaraan</label>
                  <select
                    name="terlaporKewarganegaraan"
                    value={formData.terlaporKewarganegaraan}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded text-indigo-900 ${errors.terlaporKewarganegaraan ? "border border-red-500" : ""}`}
                  >
                    <option value="">Pilih</option>
                    <option value="WNI">WNI</option>
                    <option value="WNA">WNA</option>
                  </select>
                  {errors.terlaporKewarganegaraan && <p className="text-red-400 text-sm mt-1">{errors.terlaporKewarganegaraan}</p>}
                </div>

                <div>
                  <label className="block mb-1 text-white font-semibold">Suku</label>
                  <input
                    type="text"
                    name="terlaporSuku"
                    value={formData.terlaporSuku}
                    onChange={handleChange}
                    placeholder="Suku"
                    className={`w-full px-3 py-2 rounded ${errors.terlaporSuku ? "border border-red-500" : ""}`}
                  />
                  {errors.terlaporSuku && <p className="text-red-400 text-sm mt-1">{errors.terlaporSuku}</p>}
                </div>

                <div>
                  <label className="block mb-1 text-white font-semibold">Jenis Kelamin</label>
                  <select
                    name="terlaporJenisKelamin"
                    value={formData.terlaporJenisKelamin}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded text-indigo-900 ${errors.terlaporJenisKelamin ? "border border-red-500" : ""}`}
                  >
                    <option value="">Pilih</option>
                    <option value="Laki-Laki">Laki - Laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                  {errors.terlaporJenisKelamin && <p className="text-red-400 text-sm mt-1">{errors.terlaporJenisKelamin}</p>}
                </div>

                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block mb-1 text-white font-semibold">Tempat Lahir</label>
                    <input
                      type="text"
                      name="terlaporTempatLahir"
                      value={formData.terlaporTempatLahir}
                      onChange={handleChange}
                      placeholder="Tempat lahir"
                      className={`w-full px-3 py-2 rounded ${errors.terlaporTempatLahir ? "border border-red-500" : ""}`}
                    />
                    {errors.terlaporTempatLahir && <p className="text-red-400 text-sm mt-1">{errors.terlaporTempatLahir}</p>}
                  </div>

                  <div className="flex-1">
                    <label className="block mb-1 text-white font-semibold">Tanggal Lahir</label>
                    <input
                      type="date"
                      name="terlaporTanggalLahir"
                      value={formData.terlaporTanggalLahir}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded ${errors.terlaporTanggalLahir ? "border border-red-500" : ""}`}
                    />
                    {errors.terlaporTanggalLahir && <p className="text-red-400 text-sm mt-1">{errors.terlaporTanggalLahir}</p>}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block mb-1 text-white font-semibold">Umur Tahun</label>
                    <input
                      type="number"
                      name="terlaporUmurTahun"
                      value={formData.terlaporUmurTahun}
                      onChange={handleChange}
                      min="0"
                      placeholder="Tahun"
                      className={`w-full px-3 py-2 rounded ${errors.terlaporUmurTahun ? "border border-red-500" : ""}`}
                    />
                    {errors.terlaporUmurTahun && <p className="text-red-400 text-sm mt-1">{errors.terlaporUmurTahun}</p>}
                  </div>
                  <div className="flex-1">
                    <label className="block mb-1 text-white font-semibold">Umur Bulan</label>
                    <input
                      type="number"
                      name="terlaporUmurBulan"
                      value={formData.terlaporUmurBulan}
                      onChange={handleChange}
                      min="0"
                      max="11"
                      placeholder="Bulan"
                      className="w-full px-3 py-2 rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block mb-1 text-white font-semibold">Umur Hari</label>
                    <input
                      type="number"
                      name="terlaporUmurHari"
                      value={formData.terlaporUmurHari}
                      onChange={handleChange}
                      min="0"
                      max="30"
                      placeholder="Hari"
                      className="w-full px-3 py-2 rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-white font-semibold">Pekerjaan</label>
                  <input
                    type="text"
                    name="terlaporPekerjaan"
                    value={formData.terlaporPekerjaan}
                    onChange={handleChange}
                    placeholder="Pekerjaan"
                    className={`w-full px-3 py-2 rounded ${errors.terlaporPekerjaan ? "border border-red-500" : ""}`}
                  />
                  {errors.terlaporPekerjaan && <p className="text-red-400 text-sm mt-1">{errors.terlaporPekerjaan}</p>}
                </div>

                <div>
                  <label className="block mb-1 text-white font-semibold">Agama</label>
                  <select
                    name="terlaporAgama"
                    value={formData.terlaporAgama}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded text-indigo-900 ${errors.terlaporAgama ? "border border-red-500" : ""}`}
                  >
                    <option value="">Pilih</option>
                    <option value="Islam">Islam</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Protestan">Protestan</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Budha">Budha</option>
                  </select>
                  {errors.terlaporAgama && <p className="text-red-400 text-sm mt-1">{errors.terlaporAgama}</p>}
                </div>

                <div>
                  <label className="block mb-1 text-white font-semibold">Alamat</label>
                  <textarea
                    name="terlaporAlamat"
                    value={formData.terlaporAlamat}
                    onChange={handleChange}
                    placeholder="Alamat lengkap"
                    rows={3}
                    className={`w-full px-3 py-2 rounded resize-none ${errors.terlaporAlamat ? "border border-red-500" : ""}`}
                  />
                  {errors.terlaporAlamat && <p className="text-red-400 text-sm mt-1">{errors.terlaporAlamat}</p>}
                </div>

                <div>
                  <label className="block mb-1 text-white font-semibold">No. Telepon</label>
                  <input
                    type="text"
                    name="terlaporNoTelp"
                    value={formData.terlaporNoTelp}
                    onChange={handleChange}
                    placeholder="No. telepon"
                    className={`w-full px-3 py-2 rounded ${errors.terlaporNoTelp ? "border border-red-500" : ""}`}
                  />
                  {errors.terlaporNoTelp && <p className="text-red-400 text-sm mt-1">{errors.terlaporNoTelp}</p>}
                </div>

                <div>
                  <label className="block mb-1 text-white font-semibold">Akun Media Sosial (Platform)</label>
                  <input
                    type="text"
                    name="terlaporMediaSosial"
                    value={formData.terlaporMediaSosial}
                    onChange={handleChange}
                    placeholder="Contoh: Instagram, Facebook, Twitter"
                    className="w-full px-3 py-2 rounded"
                  />
                </div>

                <div className="flex items-center space-x-2 mt-4">
                  <input
                    type="checkbox"
                    id="terlaporKorporasi"
                    name="terlaporKorporasi"
                    checked={formData.terlaporKorporasi}
                    onChange={handleChange}
                    className="rounded"
                  />
                  <label htmlFor="terlaporKorporasi" className="text-white font-semibold">
                    KORPORASI
                  </label>
                </div>
              </>
            )}

            <div className="flex justify-between space-x-4 mt-6">
              <button
                onClick={handleBack}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded py-2"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded py-2"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Step 5 (Laporan Polisi) */}
        {step === 5 && (
          <>
            <div className="mb-4">
              <p className="text-white font-semibold mb-2">Siapa Korban:</p>

              <div>
                <label className="block mb-1 text-white font-semibold">Nama / Alias</label>
                <input
                  type="text"
                  name="korbanNama"
                  value={formData.korbanNama}
                  onChange={handleChange}
                  placeholder="Nama atau alias"
                  className={`w-full px-3 py-2 rounded ${errors.korbanNama ? "border border-red-500" : ""}`}
                />
                {errors.korbanNama && <p className="text-red-400 text-sm mt-1">{errors.korbanNama}</p>}
              </div>

              <div>
                <label className="block mb-1 text-white font-semibold">No. Identitas</label>
                <input
                  type="text"
                  name="korbanNoIdentitas"
                  value={formData.korbanNoIdentitas}
                  onChange={handleChange}
                  placeholder="No. Identitas"
                  className={`w-full px-3 py-2 rounded ${errors.korbanNoIdentitas ? "border border-red-500" : ""}`}
                />
                {errors.korbanNoIdentitas && <p className="text-red-400 text-sm mt-1">{errors.korbanNoIdentitas}</p>}
              </div>

              <div>
                <label className="block mb-1 text-white font-semibold">Kewarganegaraan</label>
                <select
                  name="korbanKewarganegaraan"
                  value={formData.korbanKewarganegaraan}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded text-indigo-900 ${errors.korbanKewarganegaraan ? "border border-red-500" : ""}`}
                >
                  <option value="">Pilih</option>
                  <option value="WNI">WNI</option>
                  <option value="WNA">WNA</option>
                </select>
                {errors.korbanKewarganegaraan && <p className="text-red-400 text-sm mt-1">{errors.korbanKewarganegaraan}</p>}
              </div>

              <div>
                <label className="block mb-1 text-white font-semibold">Suku</label>
                <input
                  type="text"
                  name="korbanSuku"
                  value={formData.korbanSuku}
                  onChange={handleChange}
                  placeholder="Suku"
                  className={`w-full px-3 py-2 rounded ${errors.korbanSuku ? "border border-red-500" : ""}`}
                />
                {errors.korbanSuku && <p className="text-red-400 text-sm mt-1">{errors.korbanSuku}</p>}
              </div>

              <div>
                <label className="block mb-1 text-white font-semibold">Jenis Kelamin</label>
                <select
                  name="korbanJenisKelamin"
                  value={formData.korbanJenisKelamin}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded text-indigo-900 ${errors.korbanJenisKelamin ? "border border-red-500" : ""}`}
                >
                  <option value="">Pilih</option>
                  <option value="Laki-Laki">Laki - Laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
                {errors.korbanJenisKelamin && <p className="text-red-400 text-sm mt-1">{errors.korbanJenisKelamin}</p>}
              </div>

              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block mb-1 text-white font-semibold">Tempat Lahir</label>
                  <input
                    type="text"
                    name="korbanTempatLahir"
                    value={formData.korbanTempatLahir}
                    onChange={handleChange}
                    placeholder="Tempat lahir"
                    className={`w-full px-3 py-2 rounded ${errors.korbanTempatLahir ? "border border-red-500" : ""}`}
                  />
                  {errors.korbanTempatLahir && <p className="text-red-400 text-sm mt-1">{errors.korbanTempatLahir}</p>}
                </div>

                <div className="flex-1">
                  <label className="block mb-1 text-white font-semibold">Tanggal Lahir</label>
                  <input
                    type="date"
                    name="korbanTanggalLahir"
                    value={formData.korbanTanggalLahir}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded ${errors.korbanTanggalLahir ? "border border-red-500" : ""}`}
                  />
                  {errors.korbanTanggalLahir && <p className="text-red-400 text-sm mt-1">{errors.korbanTanggalLahir}</p>}
                </div>
              </div>

              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block mb-1 text-white font-semibold">Umur Tahun</label>
                  <input
                    type="number"
                    name="korbanUmurTahun"
                    value={formData.korbanUmurTahun}
                    onChange={handleChange}
                    min="0"
                    placeholder="Tahun"
                    className={`w-full px-3 py-2 rounded ${errors.korbanUmurTahun ? "border border-red-500" : ""}`}
                  />
                  {errors.korbanUmurTahun && <p className="text-red-400 text-sm mt-1">{errors.korbanUmurTahun}</p>}
                </div>
                <div className="flex-1">
                  <label className="block mb-1 text-white font-semibold">Umur Bulan</label>
                  <input
                    type="number"
                    name="korbanUmurBulan"
                    value={formData.korbanUmurBulan}
                    onChange={handleChange}
                    min="0"
                    max="11"
                    placeholder="Bulan"
                    className="w-full px-3 py-2 rounded"
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 text-white font-semibold">Umur Hari</label>
                  <input
                    type="number"
                    name="korbanUmurHari"
                    value={formData.korbanUmurHari}
                    onChange={handleChange}
                    min="0"
                    max="30"
                    placeholder="Hari"
                    className="w-full px-3 py-2 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-white font-semibold">Pekerjaan</label>
                <input
                  type="text"
                  name="korbanPekerjaan"
                  value={formData.korbanPekerjaan}
                  onChange={handleChange}
                  placeholder="Pekerjaan"
                  className={`w-full px-3 py-2 rounded ${errors.korbanPekerjaan ? "border border-red-500" : ""}`}
                />
                {errors.korbanPekerjaan && <p className="text-red-400 text-sm mt-1">{errors.korbanPekerjaan}</p>}
              </div>

              <div>
                <label className="block mb-1 text-white font-semibold">Agama</label>
                <select
                  name="korbanAgama"
                  value={formData.korbanAgama}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded text-indigo-900 ${errors.korbanAgama ? "border border-red-500" : ""}`}
                >
                  <option value="">Pilih</option>
                  <option value="Islam">Islam</option>
                  <option value="Katolik">Katolik</option>
                  <option value="Protestan">Protestan</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Budha">Budha</option>
                </select>
                {errors.korbanAgama && <p className="text-red-400 text-sm mt-1">{errors.korbanAgama}</p>}
              </div>

              <div>
                <label className="block mb-1 text-white font-semibold">Alamat</label>
                <textarea
                  name="korbanAlamat"
                  value={formData.korbanAlamat}
                  onChange={handleChange}
                  placeholder="Alamat lengkap"
                  rows={3}
                  className={`w-full px-3 py-2 rounded resize-none ${errors.korbanAlamat ? "border border-red-500" : ""}`}
                />
                {errors.korbanAlamat && <p className="text-red-400 text-sm mt-1">{errors.korbanAlamat}</p>}
              </div>

              <div>
                <label className="block mb-1 text-white font-semibold">No. Telepon</label>
                <input
                  type="text"
                  name="korbanNoTelp"
                  value={formData.korbanNoTelp}
                  onChange={handleChange}
                  placeholder="No. telepon"
                  className={`w-full px-3 py-2 rounded ${errors.korbanNoTelp ? "border border-red-500" : ""}`}
                />
                {errors.korbanNoTelp && <p className="text-red-400 text-sm mt-1">{errors.korbanNoTelp}</p>}
              </div>

              <div>
                <label className="block mb-1 text-white font-semibold">Akun Media Sosial (Platform)</label>
                <input
                  type="text"
                  name="korbanMediaSosial"
                  value={formData.korbanMediaSosial}
                  onChange={handleChange}
                  placeholder="Contoh: Instagram, Facebook, Twitter"
                  className="w-full px-3 py-2 rounded"
                />
              </div>

              <div className="flex items-center space-x-2 mt-4">
                <input
                  type="checkbox"
                  id="korbanKorporasi"
                  name="korbanKorporasi"
                  checked={formData.korbanKorporasi}
                  onChange={handleChange}
                  className="rounded"
                />
                <label htmlFor="korbanKorporasi" className="text-white font-semibold">
                  KORPORASI
                </label>
              </div>
            </div>

            <div className="mt-8">
              <p className="text-white font-semibold mb-2">Kapan Dilaporkan:</p>
              <div className="flex space-x-4 mb-4">
                <div className="flex-1">
                  <label className="block mb-1 text-white font-semibold">Hari</label>
                  <input
                    type="text"
                    name="kapanDilaporkanHari"
                    value={formData.kapanDilaporkanHari}
                    onChange={handleChange}
                    placeholder="Hari"
                    className={`w-full px-3 py-2 rounded ${errors.kapanDilaporkanHari ? "border border-red-500" : ""}`}
                  />
                  {errors.kapanDilaporkanHari && <p className="text-red-400 text-sm mt-1">{errors.kapanDilaporkanHari}</p>}
                </div>

                <div className="flex-1">
                  <label className="block mb-1 text-white font-semibold">Tanggal</label>
                  <input
                    type="date"
                    name="kapanDilaporkanTanggal"
                    value={formData.kapanDilaporkanTanggal}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded ${errors.kapanDilaporkanTanggal ? "border border-red-500" : ""}`}
                  />
                  {errors.kapanDilaporkanTanggal && <p className="text-red-400 text-sm mt-1">{errors.kapanDilaporkanTanggal}</p>}
                </div>
              </div>

              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block mb-1 text-white font-semibold">Pukul (Jam)</label>
                  <input
                    type="number"
                    name="kapanDilaporkanJam"
                    value={formData.kapanDilaporkanJam}
                    onChange={handleChange}
                    min="0"
                    max="23"
                    placeholder="00 - 23"
                    className={`w-full px-3 py-2 rounded ${errors.kapanDilaporkanJam ? "border border-red-500" : ""}`}
                  />
                  {errors.kapanDilaporkanJam && <p className="text-red-400 text-sm mt-1">{errors.kapanDilaporkanJam}</p>}
                </div>

                <div className="flex-1">
                  <label className="block mb-1 text-white font-semibold">Pukul (Menit)</label>
                  <select
                    name="kapanDilaporkanMenit"
                    value={formData.kapanDilaporkanMenit}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded ${errors.kapanDilaporkanMenit ? "border border-red-500" : ""}`}
                  >
                    <option value="">Pilih menit</option>
                    <option value="00">00</option>
                    <option value="30">30</option>
                  </select>
                  {errors.kapanDilaporkanMenit && <p className="text-red-400 text-sm mt-1">{errors.kapanDilaporkanMenit}</p>}
                </div>

                <div className="flex-1">
                  <label className="block mb-1 text-white font-semibold">Zona Waktu</label>
                  <select
                    name="kapanDilaporkanZonaWaktu"
                    value={formData.kapanDilaporkanZonaWaktu}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded ${errors.kapanDilaporkanZonaWaktu ? "border border-red-500" : ""}`}
                  >
                    <option value="WIB">WIB</option>
                    <option value="WITA">WITA</option>
                    <option value="WIT">WIT</option>
                  </select>
                  {errors.kapanDilaporkanZonaWaktu && <p className="text-red-400 text-sm mt-1">{errors.kapanDilaporkanZonaWaktu}</p>}
                </div>
              </div>
            </div>


            <div className="flex justify-between space-x-4 mt-6">
              <button
                onClick={handleBack}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded py-2"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded py-2"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Step 6 (Laporan Polisi) */}
        {step === 6 && (
            <>
                {/* REMOVED: Duplicated header here */}
                <div className="bg-gray-900 bg-opacity-50 p-4 rounded-lg">
                    <div className="flex space-x-8 text-white">
                        {/* Kolom Kiri */}
                        <div className="flex-1 space-y-2">
                            {firstColumnPasal.map(pasal => (
                                <div key={pasal.id} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={pasal.id}
                                        name={pasal.id}
                                        checked={formData.selectedPasal.includes(pasal.id)}
                                        onChange={handlePasalChange}
                                        className="mr-2"
                                    />
                                    <label htmlFor={pasal.id}>{pasal.text}</label>
                                </div>
                            ))}
                        </div>
                        {/* Kolom Kanan */}
                        <div className="flex-1 space-y-2">
                            {secondColumnPasal.map(pasal => (
                                <div key={pasal.id} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={pasal.id}
                                        name={pasal.id}
                                        checked={formData.selectedPasal.includes(pasal.id)}
                                        onChange={handlePasalChange}
                                        className="mr-2"
                                    />
                                    <label htmlFor={pasal.id}>{pasal.text}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tampilkan pasal yang dipilih */}
                <div className="mt-4 space-y-2">
                    <p className="text-white font-semibold">Pasal yang dipilih:</p>
                    {errors.selectedPasal && <p className="text-red-400 text-sm mt-1">{errors.selectedPasal}</p>}
                    <div className="flex flex-wrap gap-2">
                        {formData.selectedPasal.map(pasalId => {
                            const pasal = availablePasal.find(p => p.id === pasalId);
                            return (
                                <div key={pasalId} className="bg-gray-200 text-indigo-900 text-sm font-semibold px-3 py-1 rounded-full flex items-center">
                                    <span>{pasal ? pasal.text : ''}</span>
                                </div>
                            );
                        })}
                        {formData.selectedPasal.length === 0 && <p className="text-gray-400 text-sm">Belum ada pasal yang dipilih.</p>}
                    </div>
                </div>

                <div className="flex justify-between space-x-4 mt-6">
                    <button onClick={handleBack} className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded py-2"> Back </button>
                    <button type="submit" className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold rounded py-2"> Next </button>
                </div>
            </>
        )}
        {/* ### Step 7 (Laporan Polisi) ### */}
        {step === 7 && (
          <>
            {/* REMOVED: Duplicated header here */}
            <div>
              <textarea
                name="tindakPidana"
                value={formData.tindakPidana}
                onChange={handleChange}
                placeholder="Jelaskan tindak pidana yang terjadi..."
                rows={12}
                className={`w-full px-3 py-2 rounded resize-none bg-gray-200 text-indigo-900 placeholder-gray-500 ${errors.tindakPidana ? "border-2 border-red-500" : "border border-gray-400"}`}
              />
              {errors.tindakPidana && <p className="text-red-400 text-sm mt-1">{errors.tindakPidana}</p>}
            </div>

            <div className="flex justify-between space-x-4 mt-6">
              <button
                onClick={handleBack}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded py-2"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold rounded py-2"
              >
                Next
              </button>
            </div>
          </>
        )}
        {/* ### Step 8 (Laporan Polisi) ### */}
        {step === 8 && (
          <>
            {/* REMOVED: Duplicated header here */}

            {/* Menampilkan daftar saksi yang sudah ditambahkan */}
            <div className="mb-6 bg-gray-900 bg-opacity-50 p-4 rounded-lg space-y-2 max-h-40 overflow-y-auto">
              <h4 className="font-bold text-white">Daftar Saksi:</h4>
              {formData.saksi.length > 0 ? (
                <div className="text-white text-sm space-y-3">
                  {formData.saksi.map((saksi, index) => (
                    <p key={index} style={{ margin: '0' }}>
                      {index + 1}. Nama/Alias: {saksi.nama?.toUpperCase() || '[...]'}, No. Identitas: {cleanStringForDisplay(saksi.noIdentitas) || '[...]'}, Kewarganegaraan: {saksi.kewarganegaraan || '[...]'}, Suku: {cleanStringForDisplay(saksi.suku) || '[...]'}, Jenis Kelamin: {saksi.jenisKelamin || '[...]'}, Tempat/Tgl. Lahir: {cleanStringForDisplay(saksi.tempatLahir)?.toUpperCase() || '[...]'}, {saksi.tanggalLahir ? formatDate(saksi.tanggalLahir) : '[...]'}. Umur: {saksi.umurTahun || '00'} Tahun {saksi.umurBulan || '00'} Bulan {saksi.umurHari || '00'} Hari, Pekerjaan: {cleanStringForDisplay(saksi.pekerjaan)?.toUpperCase() || '[...]'}, Agama: {saksi.agama || '[...]'}, Alamat: {cleanStringForDisplay(saksi.alamat) || '[...]'}, No. Telp: {cleanStringForDisplay(saksi.noTelp) || '[...]'}, Akun Media Sosial: {cleanStringForDisplay(saksi.mediaSosial) || '[...]'}.
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 italic">Belum ada saksi.</p>
              )}
              {errors.saksi && <p className="text-red-400 text-sm mt-1">{errors.saksi}</p>}
            </div>

            {/* Form untuk menambah saksi baru */}
            <div className="space-y-4 border-t-2 border-gray-600 pt-4">
               <h4 className="font-bold text-white">Form Tambah Saksi:</h4>
               <div>
                  <label className="block mb-1 text-sm text-white">Nama / Alias</label>
                  <input type="text" name="nama" value={currentSaksi.nama} onChange={handleSaksiChange} className="w-full px-3 py-2 rounded text-indigo-900" />
               </div>
               <div>
                  <label className="block mb-1 text-sm text-white">No. Identitas</label>
                  <input type="text" name="noIdentitas" value={currentSaksi.noIdentitas} onChange={handleSaksiChange} className="w-full px-3 py-2 rounded text-indigo-900" />
               </div>
               <div>
                  <label className="block mb-1 text-sm text-white">Kewarganegaraan</label>
                  <select name="kewarganegaraan" value={currentSaksi.kewarganegaraan} onChange={handleSaksiChange} className="w-full px-3 py-2 rounded text-indigo-900">
                    <option value="">Pilih</option>
                    <option value="WNI">WNI</option>
                    <option value="WNA">WNA</option>
                  </select>
               </div>
               <div>
                  <label className="block mb-1 text-sm text-white">Suku</label>
                  <input type="text" name="suku" value={currentSaksi.suku} onChange={handleSaksiChange} className="w-full px-3 py-2 rounded text-indigo-900" />
               </div>
               <div>
                  <label className="block mb-1 text-sm text-white">Jenis Kelamin</label>
                  <select name="jenisKelamin" value={currentSaksi.jenisKelamin} onChange={handleSaksiChange} className="w-full px-3 py-2 rounded text-indigo-900">
                    <option value="">Pilih</option>
                    <option value="Laki-Laki">Laki - Laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
               </div>
               <div>
                  <label className="block mb-1 text-sm text-white">Tempat Lahir</label>
                  <input type="text" name="tempatLahir" value={currentSaksi.tempatLahir} onChange={handleSaksiChange} className="w-full px-3 py-2 rounded text-indigo-900" />
               </div>
               <div>
                  <label className="block mb-1 text-sm text-white">Tanggal Lahir</label>
                  <input type="date" name="tanggalLahir" value={currentSaksi.tanggalLahir} onChange={handleSaksiChange} className="w-full px-3 py-2 rounded text-indigo-900" />
               </div>
               <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block mb-1 text-sm text-white">Umur Tahun</label>
                    <input type="number" name="umurTahun" value={currentSaksi.umurTahun} onChange={handleSaksiChange} min="0" placeholder="Tahun" className="w-full px-3 py-2 rounded text-indigo-900" />
                  </div>
                  <div className="flex-1">
                    <label className="block mb-1 text-sm text-white">Umur Bulan</label>
                    <input type="number" name="umurBulan" value={currentSaksi.umurBulan} onChange={handleSaksiChange} min="0" max="11" placeholder="Bulan" className="w-full px-3 py-2 rounded" />
                  </div>
                  <div className="flex-1">
                    <label className="block mb-1 text-sm text-white">Umur Hari</label>
                    <input type="number" name="umurHari" value={currentSaksi.umurHari} onChange={handleSaksiChange} min="0" max="30" placeholder="Hari" className="w-full px-3 py-2 rounded" />
                  </div>
               </div>
               <div>
                  <label className="block mb-1 text-sm text-white">Pekerjaan</label>
                  <input type="text" name="pekerjaan" value={currentSaksi.pekerjaan} onChange={handleSaksiChange} className="w-full px-3 py-2 rounded text-indigo-900" />
               </div>
               <div>
                  <label className="block mb-1 text-sm text-white">Agama</label>
                  <select name="agama" value={currentSaksi.agama} onChange={handleSaksiChange} className="w-full px-3 py-2 rounded text-indigo-900">
                    <option value="">Pilih</option>
                    <option value="Islam">Islam</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Protestan">Protestan</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Budha">Budha</option>
                  </select>
               </div>
               <div>
                  <label className="block mb-1 text-sm text-white">Alamat</label>
                  <textarea name="alamat" value={currentSaksi.alamat} onChange={handleSaksiChange} rows={2} className="w-full px-3 py-2 rounded text-indigo-900 resize-none" />
               </div>
               <div>
                  <label className="block mb-1 text-sm text-white">No. Telp</label>
                  <input type="text" name="noTelp" value={currentSaksi.noTelp} onChange={handleSaksiChange} className="w-full px-3 py-2 rounded text-indigo-900" />
               </div>
               <div>
                  <label className="block mb-1 text-sm text-white">Media Sosial (Platform)</label>
                  <input type="text" name="mediaSosial" value={currentSaksi.mediaSosial} onChange={handleSaksiChange} placeholder="Contoh: Instagram, Facebook" className="w-full px-3 py-2 rounded text-indigo-900" />
               </div>
               
               <button type="button" onClick={handleAddSaksi} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded py-2">
                + Tambah Saksi
               </button>
            </div>

            {/* Tombol Navigasi Utama */}
            <div className="flex justify-between space-x-4 mt-8">
              <button type="button" onClick={handleBack} className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded py-2">
                Back
              </button>
              <button type="submit" className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold rounded py-2">
                Next
              </button>
            </div>
          </>
        )}
         {step === 9 && (
          <>
            {/* REMOVED: Duplicated header here */}

            <div>
              <textarea
                name="barangBukti"
                value={formData.barangBukti}
                onChange={handleChange}
                placeholder={"1. \n2. \n3. "}
                rows={12}
                className={`w-full px-3 py-2 rounded resize-none bg-gray-200 text-indigo-900 placeholder-gray-500 ${errors.barangBukti ? "border-2 border-red-500" : "border border-gray-400"}`}
              />
              {errors.barangBukti && <p className="text-red-400 text-sm mt-1">{errors.barangBukti}</p>}
            </div>

            <div className="flex justify-between space-x-4 mt-8">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded py-2"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold rounded py-2"
              >
                Next
              </button>
            </div>
          </>
        )}
        {/* ### TAMBAHKAN BLOK JSX BARU INI UNTUK STEP 10 ### */}
        {step === 10 && (
          <>
            {/* REMOVED: Duplicated header here */}
            
            {/* Tombol Anonymous */}
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({...prev, isAnonymous: !prev.isAnonymous}))}
                className={`px-4 py-2 text-sm rounded-full text-white font-bold flex items-center transition-colors duration-300 ${formData.isAnonymous ? 'bg-pink-600' : 'bg-gray-500'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
                Anonymous
              </button>
            </div>

            <div>
              <textarea
                name="uraianSingkat"
                value={formData.uraianSingkat}
                onChange={handleChange}
                placeholder="1. ...
2. ...
3. ..."
                rows={12}
                className={`w-full px-3 py-2 rounded resize-none bg-gray-200 text-indigo-900 placeholder-gray-500 ${errors.uraianSingkat ? "border-2 border-red-500" : ""}`}
              />
              {errors.uraianSingkat && <p className="text-red-400 text-sm mt-1">{errors.uraianSingkat}</p>}
            </div>

            <div className="flex justify-between space-x-4 mt-8">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded py-2"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold rounded py-2"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* NEW Step 11: Preview Laporan Polisi + Signature Inputs */}
        {step === 11 && jenisSurat === 'laporan_polisi' && (
            <>
              {/* Input for No. LP (repeat from Step 1 for live editing) */}
              <div className="mb-4 p-4 rounded-lg bg-gray-900 bg-opacity-50">
                <p className="text-white font-semibold mb-2 text-sm">Nomor Laporan Polisi (bisa diubah di sini):</p>
                <input
                  type="text"
                  name="noLp"
                  value={formData.noLp}
                  onChange={handleChange}
                  placeholder="Wajib diisi"
                  className={`w-full px-3 py-2 rounded text-indigo-900 ${errors.noLp ? "border border-red-500" : ""}`}
                />
                {errors.noLp && <p className="text-red-400 text-sm mt-1">{errors.noLp}</p>}
              </div>

              {/* Input for Signatures (moved from Step 13) */}
              <div className="mb-4 p-4 rounded-lg bg-gray-900 bg-opacity-50">
                  <p className="text-white font-semibold mb-2 text-sm">Informasi Tanda Tangan (Berlaku untuk Laporan Polisi):</p>
                  <div className="mb-2">
                      <label className="block mb-1 text-white font-semibold text-xs">Nama Penyidik (Yang Menerima Laporan):</label>
                      <input
                          type="text"
                          name="namaPenyidik"
                          value={formData.namaPenyidik}
                          onChange={handleChange}
                          placeholder="Nama Lengkap Penyidik"
                          className={`w-full px-2 py-1 rounded text-indigo-900 text-xs ${errors.namaPenyidik ? "border border-red-500" : ""}`}
                      />
                      {errors.namaPenyidik && <p className="text-red-400 text-sm mt-1">{errors.namaPenyidik}</p>}
                  </div>
                  <div className="flex space-x-4 mb-2">
                      <div className="flex-1">
                          <label className="block mb-1 text-white font-semibold text-xs">Pangkat:</label>
                          <input
                              type="text"
                              name="pangkatPenyidik"
                              value={formData.pangkatPenyidik}
                              onChange={handleChange}
                              placeholder="Contoh: IPTU"
                              className={`w-full px-2 py-1 rounded text-indigo-900 text-xs ${errors.pangkatPenyidik ? "border border-red-500" : ""}`}
                          />
                          {errors.pangkatPenyidik && <p className="text-red-400 text-sm mt-1">{errors.pangkatPenyidik}</p>}
                      </div>
                      <div className="flex-1">
                          <label className="block mb-1 text-white font-semibold text-xs">NRP:</label>
                          <input
                              type="text"
                              name="nrpPenyidik"
                              value={formData.nrpPenyidik}
                              onChange={handleChange}
                              placeholder="Contoh: 01234567"
                              className={`w-full px-2 py-1 rounded text-indigo-900 text-xs ${errors.nrpPenyidik ? "border border-red-500" : ""}`}
                          />
                          {errors.nrpPenyidik && <p className="text-red-400 text-sm mt-1">{errors.nrpPenyidik}</p>}
                      </div>
                  </div>
                  {/* Informasi Piket Siaga (hanya relevan jika Laporan Polisi adalah jenis surat utama) */}
                  {jenisSurat === 'laporan_polisi' && (
                      <>
                          <p className="text-white font-semibold mb-2 mt-4 text-sm">Informasi Piket Siaga:</p>
                          <div className="mb-2">
                              <label className="block mb-1 text-white font-semibold text-xs">Nama Piket Siaga:</label>
                              <input
                                  type="text"
                                  name="namaPiketSiaga"
                                  value={formData.namaPiketSiaga}
                                  onChange={handleChange}
                                  placeholder="Nama Lengkap Piket Siaga"
                                  className={`w-full px-2 py-1 rounded text-indigo-900 text-xs ${errors.namaPiketSiaga ? "border border-red-500" : ""}`}
                              />
                              {errors.namaPiketSiaga && <p className="text-red-400 text-sm mt-1">{errors.namaPiketSiaga}</p>}
                          </div>
                          <div className="mb-2">
                              <label className="block mb-1 text-white font-semibold text-xs">Pangkat dan NRP Piket Siaga:</label>
                              <input
                                  type="text"
                                  name="pangkatNrpPiketSiaga"
                                  value={formData.pangkatNrpPiketSiaga}
                                  onChange={handleChange}
                                  placeholder="Contoh: BRIPDA NRP 01234567"
                                  className={`w-full px-2 py-1 rounded text-indigo-900 text-xs ${errors.pangkatNrpPiketSiaga ? "border border-red-500" : ""}`}
                              />
                              {errors.pangkatNrpPiketSiaga && <p className="text-red-400 text-sm mt-1">{errors.pangkatNrpPiketSiaga}</p>}
                          </div>
                      </>
                  )}
              </div>

              {/* LP Preview Content */}<div id="surat-laporan-polisi-preview"
               className="bg-white text-black" style={{ fontFamily: 'Times New Roman, serif', padding: '10px 15px', fontSize: '0.48rem', lineHeight: '1.05', border: '1px solid #ccc', marginBottom: '20px' }}>
                
                {/* Header: KEPOLISIAN NEGARA ... PRO JUSTITIA */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5px', paddingLeft: '2px' }}>
                  <div style={{ textAlign: 'left', lineHeight: '1.0', flexGrow: 1 }}>
                    <p style={{ fontWeight: 'bold', fontSize: '0.55rem', margin: '0', lineHeight: '1.1', textDecoration: 'underline' }}>KEPOLISIAN NEGARA REPUBLIK INDONESIA</p>
                    <p style={{ fontWeight: 'bold', fontSize: '0.55rem', margin: '0', lineHeight: '1.1', textDecoration: 'underline' }}>DAERAH METRO JAYA</p>
                    <p style={{ fontWeight: 'bold', fontSize: '0.55rem', margin: '0', lineHeight: '1.1', textDecoration: 'underline' }}>SENTRA PELAYANAN KEPOLISIAN TERPADU</p>
                    <p style={{ fontWeight: 'bold', fontSize: '0.55rem', marginTop: '3px', margin: '0' }}>"PRO JUSTITIA"</p>
                  </div>
                  <div style={{ textAlign: 'right', lineHeight: '1.0', flexShrink: 0, marginLeft: '10px' }}>
                    <p style={{ fontWeight: 'bold', fontSize: '0.5rem', margin: '0' }}>S.I.1.32</p>
                    <p style={{ fontSize: '0.45rem', margin: '0' }}>Model B</p>
                    
                  </div>
                </div>

                {/* Logo Polda */}
               <div className="flex justify-center my-2">
                <img src={logoPolda} alt="Logo Polda" className="h-16 w-16 object-contain" />
               </div>

                {/* Judul Laporan Polisi */}
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                  <p style={{ fontWeight: 'bold', textDecoration: 'underline', fontSize: '0.6rem', margin: '0' }}>LAPORAN POLISI</p>
                  <p style={{ fontSize: '0.55rem', margin: '0' }}>Nomor: {formData.noLp || 'LP/B/.../SPKT.PMJ'}</p>
                </div>
                
                {/* Bagian YANG MELAPORKAN */}
                <p style={{ fontWeight: 'bold', marginBottom: '2px', fontSize: '0.6rem' }}>YANG MELAPORKAN :</p>
                <table style={{ width: '100%', marginBottom: '5px', fontSize: '0.5rem', tableLayout: 'fixed' }}>
                  <tbody>
                    <tr><td style={{ width: '20%', verticalAlign: 'top', padding: '0px 0' }}>1. Nama</td><td style={{ width: '80%', verticalAlign: 'top', padding: '0px 0' }}>: {formData.nama.toUpperCase() || '[NAMA/ALIAS]'}</td></tr>
                    <tr><td style={{ width: '20%', verticalAlign: 'top', padding: '0px 0' }}>2. No Identitas</td><td style={{ width: '80%', verticalAlign: 'top', padding: '0px 0' }}>: {cleanStringForDisplay(formData.noIdentitas) || '[NOMOR IDENTITAS]'}</td></tr>
                    <tr><td style={{ width: '20%', verticalAlign: 'top', padding: '0px 0' }}>3. Kewarganegaraan</td><td style={{ width: '80%', verticalAlign: 'top', padding: '0px 0' }}>: {formData.kewarganegaraan || '[WNI/WNA]'}</td></tr>
                    <tr><td style={{ width: '20%', verticalAlign: 'top', padding: '0px 0' }}>4. Jenis Kelamin</td><td style={{ width: '80%', verticalAlign: 'top', padding: '0px 0' }}>: {formData.jenisKelamin || '[Laki-Laki/Perempuan]'}</td></tr>
                    <tr><td style={{ width: '20%', verticalAlign: 'top', padding: '0px 0' }}>5. Tempat/Tgl Lahir</td><td style={{ width: '80%', verticalAlign: 'top', padding: '0px 0' }}>: {cleanStringForDisplay(formData.tempatLahir)?.toUpperCase() || '[TEMPAT]'}, {formData.tanggalLahir ? formatDate(formData.tanggalLahir) : '[TANGGAL/BLN/TAHUN]'}</td></tr>
                    <tr><td style={{ width: '20%', verticalAlign: 'top', padding: '0px 0' }}>6. Pekerjaan</td><td style={{ width: '80%', verticalAlign: 'top', padding: '0px 0' }}>: {cleanStringForDisplay(formData.pekerjaan)?.toUpperCase() || '[PEKERJAAN]'}</td></tr>
                    <tr><td style={{ width: '20%', verticalAlign: 'top', padding: '1px 0' }}>7. Agama</td><td style={{ width: '80%', verticalAlign: 'top', padding: '1px 0' }}>: {formData.agama || '[AGAMA]'}</td></tr>
                    <tr><td style={{ width: '20%', verticalAlign: 'top', padding: '1px 0' }}>8. Alamat</td><td style={{ width: '80%', verticalAlign: 'top', padding: '1px 0' }}>: {cleanStringForDisplay(formData.alamat) || '[ALAMAT]'}</td></tr>
                    <tr><td style={{ width: '20%', verticalAlign: 'top', padding: '1px 0' }}>9. Kontak</td><td style={{ width: '80%', verticalAlign: 'top', padding: '1px 0' }}>: {cleanStringForDisplay(formData.noTelepon) || '[NOMOR HP]'}{formData.mediaSosial ? ` / Akun Media Sosial: ${cleanStringForDisplay(formData.mediaSosial)}` : ''}</td></tr>
                  </tbody>
                </table>

                {/* Bagian PERISTIWA YANG DILAPORKAN */}
                <p style={{ fontWeight: 'bold', marginTop: '8px', marginBottom: '3px', fontSize: '0.6rem' }}>PERISTIWA YANG DILAPORKAN :</p>
                <table style={{ width: '100%', marginBottom: '8px', fontSize: '0.5rem', tableLayout: 'fixed' }}>
                  <tbody>
                    <tr><td style={{ width: '20%', verticalAlign: 'top', padding: '1px 0' }}>1. Waktu Kejadian</td><td style={{ verticalAlign: 'top', padding: '1px 0' }}>: Hari {formData.hariKejadian || '[HARI]'} Tanggal {formData.tanggalKejadian ? formatDate(formData.tanggalKejadian) : '[TANGGAL/BLN/TAHUN]'} Pukul {formData.pukulJam || 'HH'}.{formData.pukulMenit || 'MM'} {formData.zonaWaktu || '[WIB/WITA/WIT]'}.</td></tr>
                    <tr><td style={{ width: '20%', verticalAlign: 'top', padding: '1px 0' }}>2. Tempat Kejadian</td><td style={{ verticalAlign: 'top', padding: '1px 0' }}>: {cleanStringForDisplay(formData.tempatKejadian) || '[NAMA JALAN/KEC/KAB/KOTA/PROVINSI]'}</td></tr>
                    <tr>
                      <td style={{ width: '20%', verticalAlign: 'top', padding: '1px 0' }}>3. Apa Yang Terjadi</td>
                      <td style={{ verticalAlign: 'top', padding: '1px 0', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                        : {formData.apaYangTerjadi || '[URAIAN SINGKAT PERISTIWA YANG TERJADI]'}
                      </td>
                    </tr>
                    <tr><td style={{ width: '20%', verticalAlign: 'top', padding: '1px 0' }}>4. Siapa Terlapor</td><td style={{ verticalAlign: 'top', whiteSpace: 'normal', wordBreak: 'break-word', padding: '1px 0' }}>: {formData.siapaTerlapor === "Dalam Lidik" ? "DALAM LIDIK" :
                        `${(formData.terlaporNama || '[NAMA/ALIAS]').toUpperCase()} (No. Identitas: ${cleanStringForDisplay(formData.terlaporNoIdentitas) || '[NOMOR IDENTITAS]'}, Kewarganegaraan: ${formData.terlaporKewarganegaraan || '[WNI/WNA]'}, Suku: ${cleanStringForDisplay(formData.terlaporSuku) || '[SUKU]'}, Jenis Kelamin: ${formData.terlaporJenisKelamin || '[JENIS KELAMIN]'}, Tempat/Tgl. Lahir: ${cleanStringForDisplay(formData.terlaporTempatLahir) || '[TEMPAT LAHIR]'}, ${formData.terlaporTanggalLahir ? formatDate(formData.terlaporTanggalLahir) : '[TANGGAL/BLN/TAHUN]'}. Umur: ${formData.terlaporUmurTahun || '00'} Tahun ${formData.terlaporUmurBulan || '00'} Bulan ${formData.terlaporUmurHari || '00'} Hari, Pekerjaan: ${cleanStringForDisplay(formData.terlaporPekerjaan) || '[PEKERJAAN]'}, Agama: ${formData.terlaporAgama || '[AGAMA]'}, Alamat: ${cleanStringForDisplay(formData.terlaporAlamat) || '[ALAMAT]'}, No. Telp: ${cleanStringForDisplay(formData.terlaporNoTelp) || '[NOMOR HP]'}${formData.terlaporMediaSosial ? `, Akun Media Sosial: ${cleanStringForDisplay(formData.terlaporMediaSosial)}` : ''}${formData.terlaporKorporasi ? ` / (KORPORASI)` : ''}).`}
                    </td></tr>
                    <tr><td style={{ width: '20%', verticalAlign: 'top', padding: '1px 0' }}>5. Siapa Korban</td><td style={{ verticalAlign: 'top', whiteSpace: 'normal', wordBreak: 'break-word', padding: '1px 0' }}>: {formData.korbanNama.toUpperCase() || '[NAMA/ALIAS]'} (No. Identitas: ${cleanStringForDisplay(formData.korbanNoIdentitas) || '[NOMOR IDENTITAS]'}, Kewarganegaraan: ${formData.korbanKewarganegaraan || '[WNI/WNA]'}, Suku: ${cleanStringForDisplay(formData.korbanSuku) || '[SUKU]'}, Jenis Kelamin: ${formData.korbanJenisKelamin || '[JENIS KELAMIN]'}, Tempat/Tgl. Lahir: ${cleanStringForDisplay(formData.korbanTempatLahir) || '[TEMPAT LAHIR]'}, {formData.korbanTanggalLahir ? formatDate(formData.korbanTanggalLahir) : '[TANGGAL/BLN/TAHUN]'}. Umur: ${formData.korbanUmurTahun || '00'} Tahun ${formData.korbanUmurBulan || '00'} Bulan ${formData.korbanUmurHari || '00'} Hari, Pekerjaan: ${cleanStringForDisplay(formData.korbanPekerjaan) || '[PEKERJAAN]'}, Agama: ${formData.korbanAgama || '[AGAMA]'}, Alamat: ${cleanStringForDisplay(formData.korbanAlamat) || '[ALAMAT]'}, No. Telp: ${cleanStringForDisplay(formData.korbanNoTelp) || '[NOMOR HP]'}${formData.korbanMediaSosial ? `, Akun Media Sosial: ${cleanStringForDisplay(formData.korbanMediaSosial)}` : ''}${formData.korbanKorporasi ? ` / (KORPORASI)` : ''}).
                    </td></tr>
                    <tr><td style={{ width: '20%', verticalAlign: 'top', padding: '1px 0' }}>6. Kapan Dilaporkan</td><td style={{ verticalAlign: 'top', padding: '1px 0' }}>: Hari {formData.kapanDilaporkanHari || '[HARI]'} Tanggal {formData.kapanDilaporkanTanggal ? formatDate(formData.kapanDilaporkanTanggal) : '[TANGGAL/BLN/TAHUN]'}. Pukul {formData.pukulJam || 'HH'}.{formData.pukulMenit || 'MM'} {formData.zonaWaktu || '[WIB/WITA/WIT]'}.</td></tr>
                  </tbody>
                </table>


                {/* TABEL UTAMA (Tindak Pidana, Saksi, Barang Bukti, Uraian Singkat) */}
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', marginTop: '10px' }}>
                  <thead>
                    <tr>
                      <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center', fontWeight: 'bold', background: '#e0e0e0', width: '50%' }}>TINDAK PIDANA APA:</td>
                      <td style={{ border: '1px black solid', padding: '3px', textAlign: 'center', fontWeight: 'bold', background: '#e0e0e0', width: '50%' }}>NAMA DAN ALAMAT SAKSI-SAKSI:</td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ border: '1px solid black', padding: '5px', verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>
                        {formData.tindakPidana || `sebagaimana dimaksud dalam Pasal ${createPlaceholder(15)}`}
                      </td>
                      <td style={{ border: '1px solid black', padding: '5px', verticalAlign: 'top', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                        {Array.isArray(formData.saksi) && formData.saksi.length > 0 ? (
                          formData.saksi.map((saksi, index) => (
                            <p key={index} style={{ fontSize: '0.5rem', margin: '0', lineHeight: '1.05' }}>
                              {index + 1}. Nama/Alias: {saksi.nama?.toUpperCase() || '[NAMA/ALIAS]'}, No. Identitas: {cleanStringForDisplay(saksi.noIdentitas) || '[NOMOR IDENTITAS]'}, Kewarganegaraan: {saksi.kewarganegaraan || '[WNI / WNA]'}, Suku: {cleanStringForDisplay(saksi.suku) || '[SUKU]'}, Jenis Kelamin: {saksi.jenisKelamin || '[L / P]'}, Tempat/Tgl. Lahir: {cleanStringForDisplay(saksi.tempatLahir)?.toUpperCase() || '[TEMPAT]'}, {saksi.tanggalLahir ? formatDate(saksi.tanggalLahir) : '[DD/MM/YYYY]'}. Umur: {saksi.umurTahun || '00'} Tahun {saksi.umurBulan || '00'} Bulan {saksi.umurHari || '00'} Hari, Pekerjaan: {cleanStringForDisplay(saksi.pekerjaan)?.toUpperCase() || '[PEKERJAAN]'}, Agama: {saksi.agama || '[AGAMA]'}, Alamat: {cleanStringForDisplay(saksi.alamat) || '[ALAMAT]'}, No. Telp: {cleanStringForDisplay(saksi.noTelp) || '[NOMOR HP]'}{saksi.mediaSosial ? `, Akun Media Sosial: ${cleanStringForDisplay(saksi.mediaSosial)}` : ''}.
                            </p>
                          ))
                        ) : (
                          // Placeholder Saksi jika tidak ada data
                          <>
                            <p style={{ fontSize: '0.5rem', margin: '0', lineHeight: '1.05' }}>1. Nama/Alias: {createPlaceholder(15)}, No. Identitas: {createPlaceholder(15)},</p>
                            <p style={{ fontSize: '0.5rem', margin: '0', lineHeight: '1.05' }}>   Kewarganegaraan: {createPlaceholder(5)}, Suku: {createPlaceholder(8)}, Jenis Kelamin: {createPlaceholder(8)},</p>
                            <p style={{ fontSize: '0.5rem', margin: '0', lineHeight: '1.05' }}>   Tempat/Tgl. Lahir: {createPlaceholder(10)}, {createPlaceholder(10)}. Umur:</p>
                            <p style={{ fontSize: '0.5rem', margin: '0', lineHeight: '1.05' }}>   00 tahun 00 bulan 00 hari, pekerjaan {createPlaceholder(10)}, Agama: {createPlaceholder(10)},</p>
                            <p style={{ fontSize: '0.5rem', margin: '0', lineHeight: '1.05' }}>   Alamat: {createPlaceholder(10)}, Nomor Hp: {createPlaceholder(10)},</p>
                            <p style={{ fontSize: '0.5rem', margin: '0', lineHeight: '1.05' }}>   akun media sosial: {createPlaceholder(10)}.</p>
                            <p style={{ fontSize: '0.5rem', margin: '0', lineHeight: '1.05' }}>2. Nama/Alias: {createPlaceholder(15)}, No. Identitas: {createPlaceholder(15)},</p>
                            <p style={{ fontSize: '0.5rem', margin: '0', lineHeight: '1.05' }}>   Kewarganegaraan: {createPlaceholder(5)}, Suku: {createPlaceholder(8)}, Jenis Kelamin: {createPlaceholder(8)},</p>
                            <p style={{ fontSize: '0.5rem', margin: '0', lineHeight: '1.05' }}>   Tempat/Tgl. Lahir: {createPlaceholder(10)}, {createPlaceholder(10)}. Umur:</p>
                            <p style={{ fontSize: '0.5rem', margin: '0', lineHeight: '1.05' }}>   00 tahun 00 bulan 00 hari, pekerjaan {createPlaceholder(10)}, Agama: {createPlaceholder(10)},</p>
                            <p style={{ fontSize: '0.5rem', margin: '0', lineHeight: '1.05' }}>   Alamat: {createPlaceholder(10)}, Nomor Hp: {createPlaceholder(10)},</p>
                            <p style={{ fontSize: '0.5rem', margin: '0', lineHeight: '1.05' }}>   akun media sosial: {createPlaceholder(10)}.</p>
                          </>
                        )}
                      </td>
                    </tr>
                    <tr style={{ background: '#e0e0e0' }}>
                      <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center', fontWeight: 'bold' }}>BARANG BUKTI:</td>
                      <td style={{ border: '1px black solid', padding: '3px', textAlign: 'center', fontWeight: 'bold' }}>URAIAN SINGKAT YANG DILAPORKAN:</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid black', padding: '5px', verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>{formData.barangBukti || `1. ${createPlaceholder(10)}\n2. ${createPlaceholder(10)}\n3. ${createPlaceholder(10)}`}</td>
                      <td style={{ border: '1px solid black', padding: '5px', verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>{formData.uraianSingkat || `1. ${createPlaceholder(20)}\n2. ${createPlaceholder(20)}\n3. ${createPlaceholder(20)}`}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Bagian Pelapor dan Tanda Tangan */}
                <p style={{ marginTop: '10px', fontSize: '0.55rem', margin: '0 0 0 2px' }}>Pelapor atau pengadu memberikan keterangan, kemudian membubuhkan tandatangannya di bawah ini.</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px', marginRight: '50px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontWeight: 'bold', fontSize: '0.6rem', margin: '0' }}>Pelapor</p>
                    <p style={{ marginTop: '20px', fontSize: '0.55rem', margin: '0' }}>({formData.isAnonymous ? 'ANONYMOUS' : formData.nama.toUpperCase() || '[NAMA PELAPOR]' })</p>
                  </div>
                </div>

                {/* Bagian Tindakan yang Dilakukan */}
                <p style={{ fontWeight: 'bold', marginTop: '12px', fontSize: '0.6rem', margin: '0' }}>TINDAKAN YANG DILAKUKAN :</p>
                <ol style={{ listStyleType: 'decimal', marginLeft: '18px', fontSize: '0.55rem', lineHeight: '1.2', padding: '0', margin: '0 0 0 18px' }}>
                  <li style={{ margin: '0', padding: '0' }}>Membuat Laporan Polisi.</li>
                  <li style={{ margin: '0', padding: '0' }}>Membuat tanda bukti laporan.</li>
                  <li style={{ margin: '0', padding: '0' }}>Menerima barang bukti.</li>
                </ol>

                {/* Bagian Piket Siaga dan Yang Menerima Laporan (dengan Pangkat & NRP yang bisa diisi) */}
                {/* Revised layout for signatures to match screenshot better */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '30px', fontSize: '0.55rem', paddingRight: '15px' }}>
                    <div style={{ textAlign: 'center', width: '45%' }}>
                        <p style={{ margin: '0' }}>Piket Siaga</p>
                        {/* Placeholder for stamp */}
                        <div style={{ height: '35px', marginTop: '10px', marginBottom: '5px', background: '#f0f0f0', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.45rem', color: '#888' }}>
                            AREA CAP / STEMPEL
                        </div>
                        <p style={{ marginTop: '5px', fontSize: '0.6rem', margin: '0', textDecoration: 'underline' }}>{formData.namaPiketSiaga ? formData.namaPiketSiaga.toUpperCase() : createPlaceholder(20)}</p>
                        <p style={{ fontSize: '0.55rem', lineHeight: '1.05', margin: '0' }}>{formData.pangkatNrpPiketSiaga ? formData.pangkatNrpPiketSiaga.toUpperCase() : createPlaceholder(25)}</p>
                    </div>
                    <div style={{ textAlign: 'center', width: '45%' }}>
                        <p style={{ margin: '0' }}>Jakarta, {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        <p style={{ fontWeight: 'bold', marginTop: '4px', fontSize: '0.6rem', margin: '0' }}>Yang Menerima Laporan</p>
                        <p style={{ fontWeight: 'bold', fontSize: '0.6rem', margin: '0' }}>Penyelidik / Penyidik</p>
                        {/* Placeholder for stamp (optional, could be removed if only one stamp area needed) */}
                        <div style={{ height: '35px', marginTop: '10px', marginBottom: '5px', background: '#f0f0f0', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.45rem', color: '#888' }}>
                            AREA CAP / STEMPEL
                        </div>
                        <p style={{ marginTop: '5px', fontSize: '0.6rem', margin: '0', textDecoration: 'underline' }}>{formData.namaPenyidik ? formData.namaPenyidik.toUpperCase() : createPlaceholder(20)}</p>
                        <p style={{ fontSize: '0.55rem', lineHeight: '1.05', margin: '0' }}>
                            {formData.pangkatPenyidik ? formData.pangkatPenyidik.toUpperCase() : createPlaceholder(10)}
                            {' '}
                            {formData.nrpPenyidik ? 'NRP ' + formData.nrpPenyidik : createPlaceholder(10)}
                        </p>
                    </div>
                </div>
              </div>
              <div className="flex justify-between space-x-4 mt-8">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded py-2"
                >
                  Back (Edit Laporan Polisi)
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold rounded py-2"
                >
                  Next (Opsi SP Lidik)
                </button>
              </div>
            </>
        )}


        {/* Step 12: SP Lidik Input (Was 11) */}
        {step === 12 && (
          <>
            {/* REMOVED: Duplicated header here */}
            <div className="mb-4 p-4 rounded-lg bg-gray-900 bg-opacity-50">
                <p className="text-white font-semibold mb-2 text-sm">Sertakan Surat SP Lidik?</p>
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="includeSpLidik"
                    name="includeSpLidik"
                    checked={formData.includeSpLidik}
                    onChange={handleChange}
                    className="rounded"
                  />
                  <label htmlFor="includeSpLidik" className="text-white font-semibold text-sm">
                    Ya, saya ingin menyertakan Surat SP Lidik.
                  </label>
                </div>

                {formData.includeSpLidik && (
                  <>
                    <p className="text-white font-semibold mb-2 mt-4 text-sm">Detail Surat SP Lidik:</p>
                    <div className="mb-2">
                        <label className="block mb-1 text-white font-semibold text-xs">Nomor SP Lidik:</label>
                        <input
                            type="text"
                            name="spLidikNomor"
                            value={formData.spLidikNomor}
                            onChange={handleChange}
                            placeholder="Contoh: 0000/II/RES.1.24/2025/Ditreskrimsus"
                            className={`w-full px-2 py-1 rounded text-indigo-900 text-xs ${errors.spLidikNomor ? "border border-red-500" : ""}`}
                        />
                        {errors.spLidikNomor && <p className="text-red-400 text-sm mt-1">{errors.spLidikNomor}</p>}
                    </div>
                    {/* For the three Penyidik names/ranks in SP Lidik Kepada section */}
                    <p className="text-white font-semibold mb-2 mt-4 text-sm">Penyidik (Kepada SP Lidik):</p>
                    <div className="mb-2">
                        <label className="block mb-1 text-white font-semibold text-xs">Nama Penyidik 1:</label>
                        <input type="text" name="spLidikNamaPenyidik1" value={formData.spLidikNamaPenyidik1} onChange={handleChange} placeholder="Nama Lengkap Penyidik 1" className="w-full px-2 py-1 rounded text-indigo-900 text-xs"/>
                    </div>
                    <div className="mb-2">
                        <label className="block mb-1 text-white font-semibold text-xs">Pangkat/NRP Penyidik 1:</label>
                        <input type="text" name="spLidikPangkatNrp1" value={formData.spLidikPangkatNrp1} onChange={handleChange} placeholder="Contoh: IPTU NRP 12345678" className="w-full px-2 py-1 rounded text-indigo-900 text-xs"/>
                    </div>
                     <div className="mb-2">
                        <label className="block mb-1 text-white font-semibold text-xs">Nama Penyidik 2:</label>
                        <input type="text" name="spLidikNamaPenyidik2" value={formData.spLidikNamaPenyidik2} onChange={handleChange} placeholder="Nama Lengkap Penyidik 2" className="w-full px-2 py-1 rounded text-indigo-900 text-xs"/>
                    </div>
                    <div className="mb-2">
                        <label className="block mb-1 text-white font-semibold text-xs">Pangkat/NRP Penyidik 2:</label>
                        <input type="text" name="spLidikPangkatNrp2" value={formData.spLidikPangkatNrp2} onChange={handleChange} placeholder="Contoh: BRIPKA NRP 12345678" className="w-full px-2 py-1 rounded text-indigo-900 text-xs"/>
                    </div>
                     <div className="mb-2">
                        <label className="block mb-1 text-white font-semibold text-xs">Nama Penyidik 3:</label>
                        <input type="text" name="spLidikNamaPenyidik3" value={formData.spLidikNamaPenyidik3} onChange={handleChange} placeholder="Nama Lengkap Penyidik 3" className="w-full px-2 py-1 rounded text-indigo-900 text-xs"/>
                    </div>
                    <div className="mb-2">
                        <label className="block mb-1 text-white font-semibold text-xs">Pangkat/NRP Penyidik 3:</label>
                        <input type="text" name="spLidikPangkatNrp3" value={formData.spLidikPangkatNrp3} onChange={handleChange} placeholder="Contoh: BRIPDA NRP 12345678" className="w-full px-2 py-1 rounded text-indigo-900 text-xs"/>
                    </div>
                  </>
                )}
            </div>

            <div className="flex justify-between space-x-4 mt-6">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded py-2"
              >
                Back (Preview Laporan Polisi)
              </button>
              <button
                type="submit"
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold rounded py-2"
              >
                Next (Opsi SP Gas Lidik)
              </button>
            </div>
          </>
        )}
        
        {/* NEW Step 14: SP Gas Lidik Input */}
        {step === 14 && (
          <>
            <div className="mb-4 p-4 rounded-lg bg-gray-900 bg-opacity-50">
                <p className="text-white font-semibold mb-2 text-sm">Sertakan Surat SP Gas Lidik?</p>
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="includeSpGasLidik"
                    name="includeSpGasLidik"
                    checked={formData.includeSpGasLidik}
                    onChange={handleChange}
                    className="rounded"
                  />
                  <label htmlFor="includeSpGasLidik" className="text-white font-semibold text-sm">
                    Ya, saya ingin menyertakan Surat SP Gas Lidik.
                  </label>
                </div>

                {formData.includeSpGasLidik && (
                  <>
                    <p className="text-white font-semibold mb-2 mt-4 text-sm">Detail Surat SP Gas Lidik:</p>
                    <div className="mb-2">
                        <label className="block mb-1 text-white font-semibold text-xs">Nomor SP Gas Lidik:</label>
                        <input
                            type="text"
                            name="spGasLidikNomor"
                            value={formData.spGasLidikNomor}
                            onChange={handleChange}
                            placeholder="Contoh: 0000/II/RES.1.24/2025/Ditreskrimsus"
                            className={`w-full px-2 py-1 rounded text-indigo-900 text-xs ${errors.spGasLidikNomor ? "border border-red-500" : ""}`}
                        />
                        {errors.spGasLidikNomor && <p className="text-red-400 text-sm mt-1">{errors.spGasLidikNomor}</p>}
                    </div>
                    <div className="mb-2">
                        <label className="block mb-1 text-white font-semibold text-xs">Nama Penyidik 1:</label>
                        <input type="text" name="spGasLidikNamaPenyidik1" value={formData.spGasLidikNamaPenyidik1} onChange={handleChange} placeholder="Nama Lengkap Penyidik 1" className="w-full px-2 py-1 rounded text-indigo-900 text-xs"/>
                    </div>
                    <div className="mb-2">
                        <label className="block mb-1 text-white font-semibold text-xs">Pangkat/NRP Penyidik 1:</label>
                        <input type="text" name="spGasLidikPangkatNrp1" value={formData.spGasLidikPangkatNrp1} onChange={handleChange} placeholder="Contoh: IPTU NRP 12345678" className="w-full px-2 py-1 rounded text-indigo-900 text-xs"/>
                    </div>
                     <div className="mb-2">
                        <label className="block mb-1 text-white font-semibold text-xs">Nama Penyidik 2:</label>
                        <input type="text" name="spGasLidikNamaPenyidik2" value={formData.spGasLidikNamaPenyidik2} onChange={handleChange} placeholder="Nama Lengkap Penyidik 2" className="w-full px-2 py-1 rounded text-indigo-900 text-xs"/>
                    </div>
                    <div className="mb-2">
                        <label className="block mb-1 text-white font-semibold text-xs">Pangkat/NRP Penyidik 2:</label>
                        <input type="text" name="spGasLidikPangkatNrp2" value={formData.spGasLidikPangkatNrp2} onChange={handleChange} placeholder="Contoh: BRIPKA NRP 12345678" className="w-full px-2 py-1 rounded text-indigo-900 text-xs"/>
                    </div>
                     <div className="mb-2">
                        <label className="block mb-1 text-white font-semibold text-xs">Nama Penyidik 3:</label>
                        <input type="text" name="spGasLidikNamaPenyidik3" value={formData.spGasLidikNamaPenyidik3} onChange={handleChange} placeholder="Nama Lengkap Penyidik 3" className="w-full px-2 py-1 rounded text-indigo-900 text-xs"/>
                    </div>
                    <div className="mb-2">
                        <label className="block mb-1 text-white font-semibold text-xs">Pangkat/NRP Penyidik 3:</label>
                        <input type="text" name="spGasLidikPangkatNrp3" value={formData.spGasLidikPangkatNrp3} onChange={handleChange} placeholder="Contoh: BRIPDA NRP 12345678" className="w-full px-2 py-1 rounded text-indigo-900 text-xs"/>
                    </div>
                    <div className="mb-2">
                        <label className="block mb-1 text-white font-semibold text-xs">Tindak Pidana (SP Gas Lidik):</label>
                        <textarea name="spGasLidikTindakPidana" value={formData.spGasLidikTindakPidana} onChange={handleChange} placeholder="Contoh: sebagaimana dimaksud dalam Pasal 45 Jo. Pasal 27 ayat (1)" rows={2} className={`w-full px-2 py-1 rounded text-indigo-900 text-xs resize-none ${errors.spGasLidikTindakPidana ? "border border-red-500" : ""}`}/>
                        {errors.spGasLidikTindakPidana && <p className="text-red-400 text-sm mt-1">{errors.spGasLidikTindakPidana}</p>}
                    </div>
                    <div className="mb-2">
                        <label className="block mb-1 text-white font-semibold text-xs">Pasal (SP Gas Lidik):</label>
                        <input type="text" name="spGasLidikPasal" value={formData.spGasLidikPasal} onChange={handleChange} placeholder="Contoh: 45 Jo. Pasal 27 ayat (1)" className={`w-full px-2 py-1 rounded text-indigo-900 text-xs ${errors.spGasLidikPasal ? "border border-red-500" : ""}`}/>
                        {errors.spGasLidikPasal && <p className="text-red-400 text-sm mt-1">{errors.spGasLidikPasal}</p>}
                    </div>
                    <div className="flex space-x-4 mb-2">
                        <div className="flex-1">
                            <label className="block mb-1 text-white font-semibold text-xs">Hari Ditemukan:</label>
                            <input type="text" name="spGasLidikKapanDitemukanHari" value={formData.spGasLidikKapanDitemukanHari} onChange={handleChange} placeholder="Contoh: Senin" className={`w-full px-2 py-1 rounded text-indigo-900 text-xs ${errors.spGasLidikKapanDitemukanHari ? "border border-red-500" : ""}`}/>
                            {errors.spGasLidikKapanDitemukanHari && <p className="text-red-400 text-sm mt-1">{errors.spGasLidikKapanDitemukanHari}</p>}
                        </div>
                        <div className="flex-1">
                            <label className="block mb-1 text-white font-semibold text-xs">Tanggal Ditemukan:</label>
                            <input type="date" name="spGasLidikKapanDitemukanTanggal" value={formData.spGasLidikKapanDitemukanTanggal} onChange={handleChange} className={`w-full px-2 py-1 rounded text-indigo-900 text-xs ${errors.spGasLidikKapanDitemukanTanggal ? "border border-red-500" : ""}`}/>
                            {errors.spGasLidikKapanDitemukanTanggal && <p className="text-red-400 text-sm mt-1">{errors.spGasLidikKapanDitemukanTanggal}</p>}
                        </div>
                    </div>
                    <div className="flex space-x-4 mb-2">
                        <div className="flex-1">
                            <label className="block mb-1 text-white font-semibold text-xs">Jam Ditemukan:</label>
                            <input type="number" name="spGasLidikKapanDitemukanJam" value={formData.spGasLidikKapanDitemukanJam} onChange={handleChange} min="0" max="23" placeholder="HH" className={`w-full px-2 py-1 rounded text-indigo-900 text-xs ${errors.spGasLidikKapanDitemukanJam ? "border border-red-500" : ""}`}/>
                            {errors.spGasLidikKapanDitemukanJam && <p className="text-red-400 text-sm mt-1">{errors.spGasLidikKapanDitemukanJam}</p>}
                        </div>
                        <div className="flex-1">
                            <label className="block mb-1 text-white font-semibold text-xs">Menit Ditemukan:</label>
                            <input type="number" name="spGasLidikKapanDitemukanMenit" value={formData.spGasLidikKapanDitemukanMenit} onChange={handleChange} min="0" max="59" placeholder="MM" className={`w-full px-2 py-1 rounded text-indigo-900 text-xs ${errors.spGasLidikKapanDitemukanMenit ? "border border-red-500" : ""}`}/>
                            {errors.spGasLidikKapanDitemukanMenit && <p className="text-red-400 text-sm mt-1">{errors.spGasLidikKapanDitemukanMenit}</p>}
                        </div>
                    </div>
                    <div className="mb-2">
                        <label className="block mb-1 text-white font-semibold text-xs">Tempat Ditemukan:</label>
                        <textarea name="spGasLidikTempatDitemukan" value={formData.spGasLidikTempatDitemukan} onChange={handleChange} placeholder="Nama jalan, kec, kab/kota, provinsi" rows={2} className={`w-full px-2 py-1 rounded text-indigo-900 text-xs resize-none ${errors.spGasLidikTempatDitemukan ? "border border-red-500" : ""}`}/>
                        {errors.spGasLidikTempatDitemukan && <p className="text-red-400 text-sm mt-1">{errors.spGasLidikTempatDitemukan}</p>}
                    </div>
                  </>
                )}
            </div>

            <div className="flex justify-between space-x-4 mt-6">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded py-2"
              >
                Back (Opsi SP Lidik)
              </button>
              <button
                type="submit"
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold rounded py-2"
              >
                Next (Pratinjau Gabungan)
              </button>
            </div>
          </>
        )}


        {/* Step 15: Final Combined Preview & Download (Was 13) */}
        {step === 15 && (
          <>
            {/* REMOVED: Duplicated header here */}
            {/* Signature inputs are now in Step 11, so this section is removed or simplified */}
            <div className="mb-4 p-4 rounded-lg bg-gray-900 bg-opacity-50">
                <p className="text-white font-semibold mb-2 text-sm">Informasi Tanda Tangan sudah diisi pada Preview Laporan Polisi.</p>
            </div>

            {/* --- Preview Laporan Polisi (LP) --- */}
            {jenisSurat === 'laporan_polisi' && (
              <>
                <div className="bg-white text-indigo-900 font-semibold rounded-xl px-4 py-2 text-center select-none mb-4 mt-8">
                  PREVIEW SURAT LAPORAN POLISI
                </div>
                {/* LP Preview Content */}
                <div id="surat-laporan-polisi-preview" className="bg-white text-black" style={{ fontFamily: 'Times New Roman, serif', padding: '10px 15px', fontSize: '0.48rem', lineHeight: '1.05', border: '1px solid #ccc', marginBottom: '20px' }}>
                  
                  {/* Header: KEPOLISIAN NEGARA ... PRO JUSTITIA */}
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5px', paddingLeft: '2px' }}>
                  <div style={{ textAlign: 'left', lineHeight: '1.0', flexGrow: 1 }}>
                    <p style={{ fontWeight: 'bold', fontSize: '0.55rem', margin: '0', lineHeight: '1.1', textDecoration: 'underline' }}>KEPOLISIAN NEGARA REPUBLIK INDONESIA</p>
                    <p style={{ fontWeight: 'bold', fontSize: '0.55rem', margin: '0', lineHeight: '1.1', textDecoration: 'underline' }}>DAERAH METRO JAYA</p>
                    <p style={{ fontWeight: 'bold', fontSize: '0.55rem', margin: '0', lineHeight: '1.1', textDecoration: 'underline' }}>SENTRA PELAYANAN KEPOLISIAN TERPADU</p>
                    <p style={{ fontWeight: 'bold', fontSize: '0.55rem', marginTop: '3px', margin: '0' }}>"PRO JUSTITIA"</p>
                   </div>
                    <div style={{ textAlign: 'right', lineHeight: '1.0', flexShrink: 0, marginLeft: '10px' }}>
                      <p style={{ fontWeight: 'bold', fontSize: '0.5rem', margin: '0' }}>S.I.1.32</p>
                      <p style={{ fontSize: '0.45rem', margin: '0' }}>Model B</p>
                      
                    </div>
                  </div>

                  {/* Logo Polda */}
                  <div className="flex justify-center my-2">
                <img src={logoPolda} alt="Logo Polda" className="h-16 w-16 object-contain" />
                  </div>

                  {/* Judul Laporan Polisi */}
                  <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                    <p style={{ fontWeight: 'bold', textDecoration: 'underline', fontSize: '0.6rem', margin: '0' }}>LAPORAN POLISI</p>
                    <p style={{ fontSize: '0.55rem', margin: '0' }}>Nomor: {formData.noLp || 'LP/B/.../SPKT.PMJ'}</p>
                  </div>
                  
                  {/* Bagian YANG MELAPORKAN */}
                  <p style={{ fontWeight: 'bold', marginBottom: '2px', fontSize: '0.6rem' }}>YANG MELAPORKAN :</p>
                  <table style={{ width: '100%', marginBottom: '5px', fontSize: '0.5rem', tableLayout: 'fixed' }}>
                    <tbody>
                      <tr><td style={{ width: '20%', verticalAlign: 'top', padding: '0px 0' }}>1. Nama</td><td style={{ width: '80%', verticalAlign: 'top', padding: '0px 0' }}>: {formData.nama.toUpperCase() || '[NAMA/ALIAS]'}</td></tr>
                      <tr><td style={{ width: '20%', verticalAlign: 'top', padding: '0px 0' }}>2. No Identitas</td><td style={{ width: '80%', verticalAlign: 'top', padding: '0px 0' }}>: {cleanStringForDisplay(formData.noIdentitas) || '[NOMOR IDENTITAS]'}</td></tr>
                      <tr><td style={{ width: '20%', verticalAlign: 'top', padding: '0px 0' }}>3. Kewarganegaraan</td><td style={{ width: '80%', verticalAlign: 'top', padding: '0px 0' }}>: {formData.kewarganegaraan || '[WNI/WNA]'}</td></tr>
                      <tr><td style={{ width: '20%', verticalAlign: 'top', padding: '0px 0' }}>4. Jenis Kelamin</td><td style={{ width: '80%', verticalAlign: 'top', padding: '0px 0' }}>: {formData.jenisKelamin || '[Laki-Laki/Perempuan]'}</td></tr>
                      <tr><td style={{ width: '20%', verticalAlign: 'top', padding: '0px 0' }}>5. Tempat/Tgl Lahir</td><td style={{ width: '80%', verticalAlign: 'top', padding: '0px 0' }}>: {cleanStringForDisplay(formData.tempatLahir)?.toUpperCase() || '[TEMPAT]'}, {formData.tanggalLahir ? formatDate(formData.tanggalLahir) : '[TANGGAL/BLN/TAHUN]'}</td></tr>
                      <tr><td style={{ width: '20%', verticalAlign: 'top', padding: '0px 0' }}>6. Pekerjaan</td><td style={{ width: '80%', verticalAlign: 'top', padding: '0px 0' }}>: {cleanStringForDisplay(formData.pekerjaan)?.toUpperCase() || '[PEKERJAAN]'}</td></tr>
                      <tr><td style={{ width: '20%', verticalAlign: 'top', padding: '1px 0' }}>7. Agama</td><td style={{ width: '80%', verticalAlign: 'top', padding: '1px 0' }}>: {formData.agama || '[AGAMA]'}</td></tr>
                      <tr><td style={{ width: '20%', verticalAlign: 'top', padding: '1px 0' }}>8. Alamat</td><td style={{ width: '80%', verticalAlign: 'top', padding: '1px 0' }}>: {cleanStringForDisplay(formData.alamat) || '[ALAMAT]'}</td></tr>
                      <tr><td style={{ width: '20%', verticalAlign: 'top', padding: '1px 0' }}>9. Kontak</td><td style={{ width: '80%', verticalAlign: 'top', padding: '1px 0' }}>: {cleanStringForDisplay(formData.noTelepon) || '[NOMOR HP]'}{formData.mediaSosial ? ` / Akun Media Sosial: ${cleanStringForDisplay(formData.mediaSosial)}` : ''}</td></tr>
                    </tbody>
                  </table>

                  {/* Bagian PERISTIWA YANG DILAPORKAN */}
                  <p style={{ fontWeight: 'bold', marginTop: '8px', marginBottom: '3px', fontSize: '0.6rem' }}>PERISTIWA YANG DILAPORKAN :</p>
                  <table style={{ width: '100%', marginBottom: '8px', fontSize: '0.5rem', tableLayout: 'fixed' }}>
                    <tbody>
                      <tr><td style={{ width: '20%', verticalAlign: 'top', padding: '1px 0' }}>1. Waktu Kejadian</td><td style={{ verticalAlign: 'top', padding: '1px 0' }}>: Hari {formData.hariKejadian || '[HARI]'} Tanggal {formData.tanggalKejadian ? formatDate(formData.tanggalKejadian) : '[TANGGAL/BLN/TAHUN]'} Pukul {formData.pukulJam || 'HH'}.{formData.pukulMenit || 'MM'} {formData.zonaWaktu || '[WIB/WITA/WIT]'}.</td></tr>
                      <tr><td style={{ width: '20%', verticalAlign: 'top', padding: '1px 0' }}>2. Tempat Kejadian</td><td style={{ verticalAlign: 'top', padding: '1px 0' }}>: {cleanStringForDisplay(formData.tempatKejadian) || '[NAMA JALAN/KEC/KAB/KOTA/PROVINSI]'}</td></tr>
                      <tr>
                        <td style={{ width: '20%', verticalAlign: 'top', padding: '1px 0' }}>3. Apa Yang Terjadi</td>
                        <td style={{ verticalAlign: 'top', padding: '1px 0', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                          : {formData.apaYangTerjadi || '[URAIAN SINGKAT PERISTIWA YANG TERJADI]'}
                        </td>
                      </tr>
                      <tr><td style={{ width: '20%', verticalAlign: 'top', padding: '1px 0' }}>4. Siapa Terlapor</td><td style={{ verticalAlign: 'top', whiteSpace: 'normal', wordBreak: 'break-word', padding: '1px 0' }}>: {formData.siapaTerlapor === "Dalam Lidik" ? "DALAM LIDIK" :
                        `${(formData.terlaporNama || '[NAMA/ALIAS]').toUpperCase()} (No. Identitas: ${cleanStringForDisplay(formData.terlaporNoIdentitas) || '[NOMOR IDENTITAS]'}, Kewarganegaraan: ${formData.terlaporKewarganegaraan || '[WNI/WNA]'}, Suku: ${cleanStringForDisplay(formData.terlaporSuku) || '[SUKU]'}, Jenis Kelamin: ${formData.terlaporJenisKelamin || '[JENIS KELAMIN]'}, Tempat/Tgl. Lahir: ${cleanStringForDisplay(formData.terlaporTempatLahir) || '[TEMPAT LAHIR]'}, ${formData.terlaporTanggalLahir ? formatDate(formData.terlaporTanggalLahir) : '[TANGGAL/BLN/TAHUN]'}. Umur: ${formData.terlaporUmurTahun || '00'} Tahun ${formData.terlaporUmurBulan || '00'} Bulan ${formData.terlaporUmurHari || '00'} Hari, Pekerjaan: ${cleanStringForDisplay(formData.terlaporPekerjaan) || '[PEKERJAAN]'}, Agama: ${formData.terlaporAgama || '[AGAMA]'}, Alamat: ${cleanStringForDisplay(formData.terlaporAlamat) || '[ALAMAT]'}, No. Telp: ${cleanStringForDisplay(formData.terlaporNoTelp) || '[NOMOR HP]'}${formData.terlaporMediaSosial ? `, Akun Media Sosial: ${cleanStringForDisplay(formData.terlaporMediaSosial)}` : ''}${formData.terlaporKorporasi ? ` / (KORPORASI)` : ''}).`}
                    </td></tr>
                    <tr><td style={{ width: '20%', verticalAlign: 'top', padding: '1px 0' }}>5. Siapa Korban</td><td style={{ verticalAlign: 'top', whiteSpace: 'normal', wordBreak: 'break-word', padding: '1px 0' }}>: {formData.korbanNama.toUpperCase() || '[NAMA/ALIAS]'} (No. Identitas: ${cleanStringForDisplay(formData.korbanNoIdentitas) || '[NOMOR IDENTITAS]'}, Kewarganegaraan: ${formData.korbanKewarganegaraan || '[WNI/WNA]'}, Suku: ${cleanStringForDisplay(formData.korbanSuku) || '[SUKU]'}, Jenis Kelamin: ${formData.korbanJenisKelamin || '[JENIS KELAMIN]'}, Tempat/Tgl. Lahir: ${cleanStringForDisplay(formData.korbanTempatLahir) || '[TEMPAT LAHIR]'}, {formData.korbanTanggalLahir ? formatDate(formData.korbanTanggalLahir) : '[TANGGAL/BLN/TAHUN]'}. Umur: ${formData.korbanUmurTahun || '00'} Tahun ${formData.korbanUmurBulan || '00'} Bulan ${formData.korbanUmurHari || '00'} Hari, Pekerjaan: ${cleanStringForDisplay(formData.korbanPekerjaan) || '[PEKERJAAN]'}, Agama: ${formData.korbanAgama || '[AGAMA]'}, Alamat: ${cleanStringForDisplay(formData.korbanAlamat) || '[ALAMAT]'}, No. Telp: ${cleanStringForDisplay(formData.korbanNoTelp) || '[NOMOR HP]'}${formData.korbanMediaSosial ? `, Akun Media Sosial: ${cleanStringForDisplay(formData.korbanMediaSosial)}` : ''}${formData.korbanKorporasi ? ` / (KORPORASI)` : ''}).
                    </td></tr>
                    <tr><td style={{ width: '20%', verticalAlign: 'top', padding: '1px 0' }}>6. Kapan Dilaporkan</td><td style={{ verticalAlign: 'top', padding: '1px 0' }}>: Hari {formData.kapanDilaporkanHari || '[HARI]'} Tanggal {formData.kapanDilaporkanTanggal ? formatDate(formData.kapanDilaporkanTanggal) : '[TANGGAL/BLN/TAHUN]'}. Pukul {formData.pukulJam || 'HH'}.{formData.pukulMenit || 'MM'} {formData.zonaWaktu || '[WIB/WITA/WIT]'}.</td></tr>
                  </tbody>
                </table>


                {/* TABEL UTAMA (Tindak Pidana, Saksi, Barang Bukti, Uraian Singkat) */}
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', marginTop: '10px' }}>
                  <thead>
                    <tr>
                      <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center', fontWeight: 'bold', background: '#e0e0e0', width: '50%' }}>TINDAK PIDANA APA:</td>
                      <td style={{ border: '1px black solid', padding: '3px', textAlign: 'center', fontWeight: 'bold', background: '#e0e0e0', width: '50%' }}>NAMA DAN ALAMAT SAKSI-SAKSI:</td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ border: '1px solid black', padding: '5px', verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>
                        {formData.tindakPidana || `sebagaimana dimaksud dalam Pasal ${createPlaceholder(15)}`}
                      </td>
                      <td style={{ border: '1px solid black', padding: '5px', verticalAlign: 'top', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                        {Array.isArray(formData.saksi) && formData.saksi.length > 0 ? (
                          formData.saksi.map((saksi, index) => (
                            <p key={index} style={{ fontSize: '0.5rem', margin: '0', lineHeight: '1.05' }}>
                              {index + 1}. Nama/Alias: {saksi.nama?.toUpperCase() || '[NAMA/ALIAS]'}, No. Identitas: {cleanStringForDisplay(saksi.noIdentitas) || '[NOMOR IDENTITAS]'}, Kewarganegaraan: {saksi.kewarganegaraan || '[WNI / WNA]'}, Suku: {cleanStringForDisplay(saksi.suku) || '[SUKU]'}, Jenis Kelamin: {saksi.jenisKelamin || '[L / P]'}, Tempat/Tgl. Lahir: {cleanStringForDisplay(saksi.tempatLahir)?.toUpperCase() || '[TEMPAT]'}, {saksi.tanggalLahir ? formatDate(saksi.tanggalLahir) : '[DD/MM/YYYY]'}. Umur: {saksi.umurTahun || '00'} Tahun {saksi.umurBulan || '00'} Bulan {saksi.umurHari || '00'} Hari, Pekerjaan: {cleanStringForDisplay(saksi.pekerjaan)?.toUpperCase() || '[PEKERJAAN]'}, Agama: {saksi.agama || '[AGAMA]'}, Alamat: {cleanStringForDisplay(saksi.alamat) || '[ALAMAT]'}, No. Telp: {cleanStringForDisplay(saksi.noTelp) || '[NOMOR HP]'}{saksi.mediaSosial ? `, Akun Media Sosial: ${cleanStringForDisplay(saksi.mediaSosial)}` : ''}.
                            </p>
                          ))
                        ) : (
                          // Placeholder Saksi jika tidak ada data
                          <>
                            <p style={{ fontSize: '0.5rem', margin: '0', lineHeight: '1.05' }}>1. Nama/Alias: {createPlaceholder(15)}, No. Identitas: {createPlaceholder(15)},</p>
                            <p style={{ fontSize: '0.5rem', margin: '0', lineHeight: '1.05' }}>   Kewarganegaraan: {createPlaceholder(5)}, Suku: {createPlaceholder(8)}, Jenis Kelamin: {createPlaceholder(8)},</p>
                            <p style={{ fontSize: '0.5rem', margin: '0', lineHeight: '1.05' }}>   Tempat/Tgl. Lahir: {createPlaceholder(10)}, {createPlaceholder(10)}. Umur:</p>
                            <p style={{ fontSize: '0.5rem', margin: '0', lineHeight: '1.05' }}>   00 tahun 00 bulan 00 hari, pekerjaan {createPlaceholder(10)}, Agama: {createPlaceholder(10)},</p>
                            <p style={{ fontSize: '0.5rem', margin: '0', lineHeight: '1.05' }}>   Alamat: {createPlaceholder(10)}, Nomor Hp: {createPlaceholder(10)},</p>
                            <p style={{ fontSize: '0.5rem', margin: '0', lineHeight: '1.05' }}>   akun media sosial: {createPlaceholder(10)}.</p>
                            <p style={{ fontSize: '0.5rem', margin: '0', lineHeight: '1.05' }}>2. Nama/Alias: {createPlaceholder(15)}, No. Identitas: {createPlaceholder(15)},</p>
                            <p style={{ fontSize: '0.5rem', margin: '0', lineHeight: '1.05' }}>   Kewarganegaraan: {createPlaceholder(5)}, Suku: {createPlaceholder(8)}, Jenis Kelamin: {createPlaceholder(8)},</p>
                            <p style={{ fontSize: '0.5rem', margin: '0', lineHeight: '1.05' }}>   Tempat/Tgl. Lahir: {createPlaceholder(10)}, {createPlaceholder(10)}. Umur:</p>
                            <p style={{ fontSize: '0.5rem', margin: '0', lineHeight: '1.05' }}>   00 tahun 00 bulan 00 hari, pekerjaan {createPlaceholder(10)}, Agama: {createPlaceholder(10)},</p>
                            <p style={{ fontSize: '0.5rem', margin: '0', lineHeight: '1.05' }}>   Alamat: {createPlaceholder(10)}, Nomor Hp: {createPlaceholder(10)},</p>
                            <p style={{ fontSize: '0.5rem', margin: '0', lineHeight: '1.05' }}>   akun media sosial: {createPlaceholder(10)}.</p>
                          </>
                        )}
                      </td>
                    </tr>
                    <tr style={{ background: '#e0e0e0' }}>
                      <td style={{ border: '1px solid black', padding: '3px', textAlign: 'center', fontWeight: 'bold' }}>BARANG BUKTI:</td>
                      <td style={{ border: '1px black solid', padding: '3px', textAlign: 'center', fontWeight: 'bold' }}>URAIAN SINGKAT YANG DILAPORKAN:</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid black', padding: '5px', verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>{formData.barangBukti || `1. ${createPlaceholder(10)}\n2. ${createPlaceholder(10)}\n3. ${createPlaceholder(10)}`}</td>
                      <td style={{ border: '1px solid black', padding: '5px', verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>{formData.uraianSingkat || `1. ${createPlaceholder(20)}\n2. ${createPlaceholder(20)}\n3. ${createPlaceholder(20)}`}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Bagian Pelapor dan Tanda Tangan */}
                <p style={{ marginTop: '10px', fontSize: '0.55rem', margin: '0 0 0 2px' }}>Pelapor atau pengadu memberikan keterangan, kemudian membubuhkan tandatangannya di bawah ini.</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px', marginRight: '50px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontWeight: 'bold', fontSize: '0.6rem', margin: '0' }}>Pelapor</p>
                    <p style={{ marginTop: '20px', fontSize: '0.55rem', margin: '0' }}>({formData.isAnonymous ? 'ANONYMOUS' : formData.nama.toUpperCase() || '[NAMA PELAPOR]' })</p>
                  </div>
                </div>

                {/* Bagian Tindakan yang Dilakukan */}
                <p style={{ fontWeight: 'bold', marginTop: '12px', fontSize: '0.6rem', margin: '0' }}>TINDAKAN YANG DILAKUKAN :</p>
                <ol style={{ listStyleType: 'decimal', marginLeft: '18px', fontSize: '0.55rem', lineHeight: '1.2', padding: '0', margin: '0 0 0 18px' }}>
                  <li style={{ margin: '0', padding: '0' }}>Membuat Laporan Polisi.</li>
                  <li style={{ margin: '0', padding: '0' }}>Membuat tanda bukti laporan.</li>
                  <li style={{ margin: '0', padding: '0' }}>Menerima barang bukti.</li>
                </ol>

                {/* Bagian Piket Siaga dan Yang Menerima Laporan (dengan Pangkat & NRP yang bisa diisi) */}
                {/* Revised layout for signatures to match screenshot better */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '30px', fontSize: '0.55rem', paddingRight: '15px' }}>
                    <div style={{ textAlign: 'center', width: '45%' }}>
                        <p style={{ margin: '0' }}>Piket Siaga</p>
                        {/* Placeholder for stamp */}
                        <div style={{ height: '35px', marginTop: '10px', marginBottom: '5px', background: '#f0f0f0', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.45rem', color: '#888' }}>
                            AREA CAP / STEMPEL
                        </div>
                        <p style={{ marginTop: '5px', fontSize: '0.6rem', margin: '0', textDecoration: 'underline' }}>{formData.namaPiketSiaga ? formData.namaPiketSiaga.toUpperCase() : createPlaceholder(20)}</p>
                        <p style={{ fontSize: '0.55rem', lineHeight: '1.05', margin: '0' }}>{formData.pangkatNrpPiketSiaga ? formData.pangkatNrpPiketSiaga.toUpperCase() : createPlaceholder(25)}</p>
                    </div>
                    <div style={{ textAlign: 'center', width: '45%' }}>
                        <p style={{ margin: '0' }}>Jakarta, {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        <p style={{ fontWeight: 'bold', marginTop: '4px', fontSize: '0.6rem', margin: '0' }}>Yang Menerima Laporan</p>
                        <p style={{ fontWeight: 'bold', fontSize: '0.6rem', margin: '0' }}>Penyelidik / Penyidik</p>
                        {/* Placeholder for stamp (optional, could be removed if only one stamp area needed) */}
                        <div style={{ height: '35px', marginTop: '10px', marginBottom: '5px', background: '#f0f0f0', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.45rem', color: '#888' }}>
                            AREA CAP / STEMPEL
                        </div>
                        <p style={{ marginTop: '5px', fontSize: '0.6rem', margin: '0', textDecoration: 'underline' }}>{formData.namaPenyidik ? formData.namaPenyidik.toUpperCase() : createPlaceholder(20)}</p>
                        <p style={{ fontSize: '0.55rem', lineHeight: '1.05', margin: '0' }}>
                            {formData.pangkatPenyidik ? formData.pangkatPenyidik.toUpperCase() : createPlaceholder(10)}
                            {' '}
                            {formData.nrpPenyidik ? 'NRP ' + formData.nrpPenyidik : createPlaceholder(10)}
                        </p>
                    </div>
                </div>
              </div>
            </>
            )}

            {/* SP Lidik Preview (Conditional) */}
            {formData.includeSpLidik && (
              <>
                <div className="bg-white text-indigo-900 font-semibold rounded-xl px-4 py-2 text-center select-none mb-4 mt-8">
                  PREVIEW SURAT SP LIDIK
                </div>
                {/* SP Lidik Content */}
                <div id="surat-sp-lidik-preview" className="bg-white text-black" style={{ fontFamily: 'Times New Roman, serif', padding: '10px 15px', fontSize: '0.48rem', lineHeight: '1.05', border: '1px solid #ccc' }}>
                  
                  {/* Header SP Lidik */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5px', paddingLeft: '2px' }}>
                  <div style={{ textAlign: 'left', lineHeight: '1.0', flexGrow: 1 }}>
                    <p style={{ fontWeight: 'bold', fontSize: '0.55rem', margin: '0', lineHeight: '1.1', textDecoration: 'underline' }}>KEPOLISIAN NEGARA REPUBLIK INDONESIA</p>
                    <p style={{ fontWeight: 'bold', fontSize: '0.55rem', margin: '0', lineHeight: '1.1', textDecoration: 'underline' }}>DAERAH METRO JAYA</p>
                    <p style={{ fontWeight: 'bold', fontSize: '0.55rem', margin: '0', lineHeight: '1.1', textDecoration: 'underline' }}>SENTRA PELAYANAN KEPOLISIAN TERPADU</p>
                  </div>
                    <div style={{ textAlign: 'right', lineHeight: '1.0', flexShrink: 0, marginLeft: '10px' }}>
                      <p style={{ fontWeight: 'bold', fontSize: '0.5rem', margin: '0' }}>6.2.1.5</p>
                    </div>
                  </div>

                  {/* Logo Polda */}
                  <div className="flex justify-center my-2">
                    <img src={logoPolda} alt="Logo Polda" className="h-16 w-16 object-contain" />
                  </div>

                  <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                    <p style={{ fontWeight: 'bold', textDecoration: 'underline', fontSize: '0.6rem', margin: '0' }}>SURAT PERINTAH PENYELIDIKAN</p>
                    <p style={{ fontSize: '0.55rem', margin: '0' }}>NOMOR: SP.LIDIK/{formData.spLidikNomor || '[NOMOR SP]/[BULAN]/[TAHUN]/DITRESKRIMSUS'}</p>
                  </div>

                  <p style={{ margin: '0 0 5px 0', fontSize: '0.55rem' }}>Pertimbangan: bahwa untuk mencari suatu peristiwa yang diduga diduga pidana guna menentukan dapat tidaknya dilakukan penyelidikan, belum ditemukan tersangka (terlaku), barang bukti, penerangan perkara dan/atau orang atau benda yang terkait dengan tindak pidana tersebut.</p>

                  <p style={{ fontWeight: 'bold', margin: '0 0 2px 0', fontSize: '0.6rem' }}>Dasar :</p>
                  <ol style={{ listStyleType: 'decimal', marginLeft: '15px', fontSize: '0.55rem', lineHeight: '1.2', padding: '0', margin: '0 0 5px 15px' }}>
                    <li style={{ margin: '0', padding: '0' }}>Pasal 5, Pasal 7, Pasal 102, Pasal 103, Pasal 104 Undang-Undang Nomor 8 Tahun 1981 tentang Hukum Acara Pidana;</li>
                    <li style={{ margin: '0', padding: '0' }}>Undang-Undang Republik Indonesia Nomor 2 Tahun 2002 tentang Kepolisian Negara Republik Indonesia;</li>
                    <li style={{ margin: '0', padding: '0' }}>Undang-Undang Pasal 35, Pasal 36 Undang-Undang No. 1 Tahun 2024 Tentang Perubahan Kedua Atas Undang-Undang Nomor 11 Tahun 2008 Tentang Informasi dan Transaksi Elektronik (ITE);</li>
                    <li style={{ margin: '0', padding: '0' }}>Laporan sp lidik Nomor LI/POL/0000/{createPlaceholder(3)}/{createPlaceholder(3)}/{new Date().getFullYear() || '[TAHUN]'}/DITRESKRIMSUS tanggal {formData.kapanDilaporkanTanggal ? formatDate(formData.kapanDilaporkanTanggal) : '[DD/MM/YYYY]'} tentang: {formData.tindakPidana || '[TINDAK PIDANA]'}</li>
                  </ol>

                  <p style={{ textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline', margin: '10px 0 5px 0', fontSize: '0.6rem' }}>MEMERINTAHKAN</p>

                  <p style={{ fontWeight: 'bold', margin: '0 0 2px 0', fontSize: '0.6rem' }}>Kepada :</p>
                  <table style={{ width: '100%', marginBottom: '5px', fontSize: '0.55rem', tableLayout: 'fixed' }}>
                    <tbody>
                      <tr><td style={{ width: '5%', verticalAlign: 'top', padding: '1px 0' }}>1.</td><td style={{ width: '95%', verticalAlign: 'top', padding: '1px 0' }}>NAMA: {formData.spLidikNamaPenyidik1 ? formData.spLidikNamaPenyidik1.toUpperCase() : 'NAMA'}, PANGKAT/NRP: {formData.spLidikPangkatNrp1 ? formData.spLidikPangkatNrp1.toUpperCase() : 'PANGKAT/NRP'}</td></tr>
                      <tr><td style={{ width: '5%', verticalAlign: 'top', padding: '1px 0' }}>2.</td><td style={{ width: '95%', verticalAlign: 'top', padding: '1px 0' }}>NAMA: {formData.spLidikNamaPenyidik2 ? formData.spLidikNamaPenyidik2.toUpperCase() : 'NAMA'}, PANGKAT/NRP: {formData.spLidikPangkatNrp2 ? formData.spLidikPangkatNrp2.toUpperCase() : 'PANGKAT/NRP'}</td></tr>
                      <tr><td style={{ width: '5%', verticalAlign: 'top', padding: '1px 0' }}>3.</td><td style={{ width: '95%', verticalAlign: 'top', padding: '1px 0' }}>NAMA: {formData.spLidikNamaPenyidik3 ? formData.spLidikNamaPenyidik3.toUpperCase() : 'NAMA'}, PANGKAT/NRP: {formData.spLidikPangkatNrp3 ? formData.spLidikPangkatNrp3.toUpperCase() : 'PANGKAT/NRP'}</td></tr>
                    </tbody>
                  </table>

                  <p style={{ fontWeight: 'bold', margin: '10px 0 2px 0', fontSize: '0.6rem' }}>Untuk :</p>
                  <ol style={{ listStyleType: 'decimal', marginLeft: '15px', fontSize: '0.55rem', lineHeight: '1.2', padding: '0', margin: '0 0 5px 15px' }}>
                    <li style={{ margin: '0', padding: '0' }}>melakukan tugas penyelidikan terhadap dugaan terjadinya Tindak Pidana {formData.tindakPidana || createPlaceholder(20)} sebagaimana dimaksud dalam Laporan Polisi Nomor LP/B/{formData.noLp || createPlaceholder(5)}/{new Date().getFullYear() || '[TAHUN]'}/SPKT.PMJ tanggal {formData.tanggalKejadian ? formatDate(formData.tanggalKejadian) : '[DD/MM/YYYY]'} dan ditemukan pada hari {formData.hariKejadian || '[HARI]'} tanggal {formData.tanggalKejadian ? formatDate(formData.tanggalKejadian) : '[DD/MM/YYYY]'} pukul {formData.pukulJam || 'HH'}.{formData.pukulMenit || 'MM'} WIB di {cleanStringForDisplay(formData.tempatKejadian) || '[TEMPAT KEJADIAN]'}.</li>
                    <li style={{ margin: '0', padding: '0' }}>membuat rencana penyelidikan;</li>
                    <li style={{ margin: '0', padding: '0' }}>melaksanakan giat pengumpulan data dan alat bukti;</li>
                    <li style={{ margin: '0', padding: '0' }}>melakukan permintaan keterangan terhadap ahli, saksi, dan/atau pihak terkait;</li>
                    <li style={{ margin: '0', padding: '0' }}>melaksanakan perintah ini dengan seksama dan penuh rasa tanggung jawab serta segera melaporkannya kepada Atasan Penyidik.</li>
                  </ol>

                  <p style={{ fontWeight: 'bold', margin: '10px 0 2px 0', fontSize: '0.6rem' }}>Tembusan :</p>
                  <ol style={{ listStyleType: 'decimal', marginLeft: '15px', fontSize: '0.55rem', lineHeight: '1.2', padding: '0', margin: '0 0 5px 15px' }}>
                    <li style={{ margin: '0', padding: '0' }}>1. Arsip</li>
                  </ol>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', marginTop: '30px', fontSize: '0.55rem' }}>
                    <div style={{ textAlign: 'center', width: '45%' }}>
                      {/* This section usually not present in SP Lidik (Piket Siaga) */}
                    </div>
                    <div style={{ textAlign: 'center', width: '45%' }}>
                      <p style={{ margin: '0' }}>Jakarta, {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                      <p style={{ fontWeight: 'bold', marginTop: '5px', margin: '0' }}>ATAS NAMA KEPOLISIAN DAERAH METRO JAYA</p>
                      <p style={{ fontWeight: 'bold', margin: '0' }}>DIREKTUR RESERSE KRIMINAL KHUSUS</p>
                      <p style={{ marginTop: '20px', fontSize: '0.6rem', margin: '0' }}>{formData.namaPenyidik ? formData.namaPenyidik.toUpperCase() : 'NAMA PENYIDIK'}</p>
                      <p style={{ fontSize: '0.55rem', lineHeight: '1.05', margin: '0' }}>
                        {formData.pangkatPenyidik ? formData.pangkatPenyidik.toUpperCase() : 'PANGKAT'}
                        {' '}
                        {formData.nrpPenyidik ? 'NRP ' + formData.nrpPenyidik : 'NRP'}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* NEW SP Gas Lidik Preview (Conditional) */}
            {formData.includeSpGasLidik && (
              <>
                <div className="bg-white text-indigo-900 font-semibold rounded-xl px-4 py-2 text-center select-none mb-4 mt-8">
                  PREVIEW SURAT SP GAS LIDIK
                </div>
                {/* SP Gas Lidik Content */}
                <div id="surat-sp-gas-lidik-preview" className="bg-white text-black" style={{ fontFamily: 'Times New Roman, serif', padding: '10px 15px', fontSize: '0.48rem', lineHeight: '1.05', border: '1px solid #ccc' }}>
                  
                  {/* Header SP Gas Lidik */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5px', paddingLeft: '2px' }}>
                  <div style={{ textAlign: 'left', lineHeight: '1.0', flexGrow: 1 }}>
                    <p style={{ fontWeight: 'bold', fontSize: '0.55rem', margin: '0', lineHeight: '1.1', textDecoration: 'underline' }}>KEPOLISIAN NEGARA REPUBLIK INDONESIA</p>
                    <p style={{ fontWeight: 'bold', fontSize: '0.55rem', margin: '0', lineHeight: '1.1', textDecoration: 'underline' }}>DAERAH METRO JAYA</p>
                    <p style={{ fontWeight: 'bold', fontSize: '0.55rem', margin: '0', lineHeight: '1.1', textDecoration: 'underline' }}>SENTRA PELAYANAN KEPOLISIAN TERPADU</p>
                  </div>
                    <div style={{ textAlign: 'right', lineHeight: '1.0', flexShrink: 0, marginLeft: '10px' }}>
                      <p style={{ fontWeight: 'bold', fontSize: '0.5rem', margin: '0' }}>S-2.1.1</p>
                    </div>
                  </div>

                  {/* Logo Polda */}
                  <div className="flex justify-center my-2">
                   <img src={logoPolda} alt="Logo Polda" className="h-16 w-16 object-contain" />
                  </div>

                  <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                    <p style={{ fontWeight: 'bold', textDecoration: 'underline', fontSize: '0.6rem', margin: '0' }}>SURAT PERINTAH PENYELIDIKAN</p>
                    <p style={{ fontSize: '0.55rem', margin: '0' }}>NOMOR: SP.Gas Lidik{formData.spGasLidikNomor || '[NOMOR SP]/[BULAN]/[TAHUN]/Ditreskrimsus'}</p>
                  </div>

                  <p style={{ margin: '0 0 5px 0', fontSize: '0.55rem' }}>Pertimbangan : bahwa untuk mencari suatu peristiwa yang diduga pidana guna menentukan dapat tidaknya dilakukan penyelidikan, belum ditemukan tersangka (terlaku), barang bukti, pengembangan perkara dan/atau belum terpenuhinya alat bukti, maka perlu dikeluarkan surat perintah.</p>

                  <p style={{ fontWeight: 'bold', margin: '0 0 2px 0', fontSize: '0.6rem' }}>Dasar :</p>
                  <ol style={{ listStyleType: 'decimal', marginLeft: '15px', fontSize: '0.55rem', lineHeight: '1.2', padding: '0', margin: '0 0 5px 15px' }}>
                    <li style={{ margin: '0', padding: '0' }}>Pasal 4, Pasal 5, Pasal 9, Pasal 102, Pasal 103, Pasal 104 dan Pasal 108 Undang-Undang Nomor 8 Tahun 1981 tentang Hukum Acara Pidana;</li>
                    <li style={{ margin: '0', padding: '0' }}>Undang-Undang Republik Indonesia Nomor 2 Tahun 2002 tentang Kepolisian Negara Republik Indonesia;</li>
                    <li style={{ margin: '0', padding: '0' }}>Pasal 00 Undang-Undang Nomor 0 Tahun 0000 tentang ......;</li>
                    <li style={{ margin: '0', padding: '0' }}>Laporan [SP lidik] Nomor: [ LP/B/1234/VII/2025/Ditressiber ]* tanggal {formData.kapanDilaporkanTanggal ? formatDate(formData.kapanDilaporkanTanggal) : 'dd mm yyyy'} tentang: {formData.tindakPidana || '[TINDAK PIDANA]'}</li>
                  </ol>

                  <p style={{ textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline', margin: '10px 0 5px 0', fontSize: '0.6rem' }}>DIPERINTAHKAN</p>

                  <p style={{ fontWeight: 'bold', margin: '0 0 2px 0', fontSize: '0.6rem' }}>Kepada :</p>
                  <table style={{ width: '100%', marginBottom: '5px', fontSize: '0.55rem', tableLayout: 'fixed' }}>
                    <tbody>
                      <tr><td style={{ width: '5%', verticalAlign: 'top', padding: '1px 0' }}>1.</td><td style={{ width: '95%', verticalAlign: 'top', padding: '1px 0' }}>NAMA: {formData.spGasLidikNamaPenyidik1 ? formData.spGasLidikNamaPenyidik1.toUpperCase() : 'NAMA'}, PANGKAT/NRP: {formData.spGasLidikPangkatNrp1 ? formData.spGasLidikPangkatNrp1.toUpperCase() : 'PANGKAT/NRP'}</td></tr>
                      <tr><td style={{ width: '5%', verticalAlign: 'top', padding: '1px 0' }}>2.</td><td style={{ width: '95%', verticalAlign: 'top', padding: '1px 0' }}>NAMA: {formData.spGasLidikNamaPenyidik2 ? formData.spGasLidikNamaPenyidik2.toUpperCase() : 'NAMA'}, PANGKAT/NRP: {formData.spGasLidikPangkatNrp2 ? formData.spGasLidikPangkatNrp2.toUpperCase() : 'PANGKAT/NRP'}</td></tr>
                      <tr><td style={{ width: '5%', verticalAlign: 'top', padding: '1px 0' }}>3.</td><td style={{ width: '95%', verticalAlign: 'top', padding: '1px 0' }}>NAMA: {formData.spGasLidikNamaPenyidik3 ? formData.spGasLidikNamaPenyidik3.toUpperCase() : 'NAMA'}, PANGKAT/NRP: {formData.spGasLidikPangkatNrp3 ? formData.spGasLidikPangkatNrp3.toUpperCase() : 'PANGKAT/NRP'}</td></tr>
                    </tbody>
                  </table>

                  <p style={{ fontWeight: 'bold', margin: '10px 0 2px 0', fontSize: '0.6rem' }}>Untuk :</p>
                      <ol style={{ listStyleType: 'decimal', marginLeft: '15px', fontSize: '0.55rem', lineHeight: '1.2', padding: '0', margin: '0 0 5px 15px' }}>
                        <li style={{ margin: '0', padding: '0' }}>melakukan tugas penyelidikan terhadap dugaan terjadinya Tindak Pidana {formData.spGasLidikTindakPidana || '[tindak pidana]'} sebagaimana dimaksud dalam Pasal {formData.spGasLidikPasal || '[NOMOR PASAL]'} UU Nomor {createPlaceholder(5)} Tahun {new Date().getFullYear() || '[TAHUN]'} tentang [free text: perihal UU], yang terjadi di {cleanStringForDisplay(formData.spGasLidikTempatDitemukan) || '[free text: TKP]'}, pada hari {formData.spGasLidikKapanDitemukanHari || '[hari]'} tanggal {formData.spGasLidikKapanDitemukanTanggal ? formatDate(formData.spGasLidikKapanDitemukanTanggal) : '[dd] bulan [mm] tahun [yyyy]'} pukul {formData.spGasLidikKapanDitemukanJam || 'HH'}.{formData.spGasLidikKapanDitemukanMenit || 'MM'} WIB.</li>
                        <li style={{ margin: '0', padding: '0' }}>membuat rencana penyelidikan;</li>
                        <li style={{ margin: '0', padding: '0' }}>melakukan koordinasi dengan instansi atau pihak terkait;</li>
                        <li style={{ margin: '0', padding: '0' }}>surat perintah ini berlaku sejak tanggal dikeluarkan s.d. {(() => {
                          const today = new Date();
                          today.setMonth(today.getMonth() + 1);
                          return today.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
                        })()}</li>
                        <li style={{ margin: '0', padding: '0' }}>melaksanakan perintah ini dengan seksama dan penuh rasa tanggung jawab serta segera melaporkannya kepada Atasan Penyidik.</li>
                      </ol>

                  <p style={{ fontWeight: 'bold', margin: '10px 0 2px 0', fontSize: '0.6rem' }}>Selesai.</p>

                  <p style={{ fontWeight: 'bold', margin: '10px 0 2px 0', fontSize: '0.6rem' }}>Tembusan :</p>
                  <ol style={{ listStyleType: 'decimal', marginLeft: '15px', fontSize: '0.55rem', lineHeight: '1.2', padding: '0', margin: '0 0 5px 15px' }}>
                  <li style={{ margin: '0', padding: '0' }}>1. Arsip</li>
                  </ol>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '30px', fontSize: '0.55rem' }}>
                    <div style={{ textAlign: 'center', width: '45%' }}>
                      <p style={{ margin: '0' }}>Yang Menerima Perintah</p>
                      <p style={{ marginTop: '20px', fontSize: '0.6rem', margin: '0' }}>{formData.spGasLidikNamaPenyidik1 ? formData.spGasLidikNamaPenyidik1.toUpperCase() : 'NAMA'}</p>
                      <p style={{ fontSize: '0.55rem', lineHeight: '1.05', margin: '0' }}>
                        PANGKAT NRP {formData.spGasLidikPangkatNrp1 ? formData.spGasLidikPangkatNrp1.toUpperCase() : 'NRP'}
                      </p>
                    </div>
                    <div style={{ textAlign: 'center', width: '45%' }}>
                      <p style={{ margin: '0' }}>Jakarta, {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                      <p style={{ fontWeight: 'bold', marginTop: '5px', margin: '0' }}>ATAS NAMA KEPOLISIAN DAERAH METRO JAYA</p>
                      <p style={{ fontWeight: 'bold', margin: '0' }}>DIREKTUR RESERSE KRIMINAL KHUSUS</p>
                      <p style={{ marginTop: '20px', fontSize: '0.6rem', margin: '0' }}>{formData.namaPenyidik ? formData.namaPenyidik.toUpperCase() : 'NAMA PENYIDIK'}</p>
                      <p style={{ fontSize: '0.55rem', lineHeight: '1.05', margin: '0' }}>
                        {formData.pangkatPenyidik ? formData.pangkatPenyidik.toUpperCase() : 'PANGKAT'}
                        {' '}
                        {formData.nrpPenyidik ? 'NRP ' + formData.nrpPenyidik : 'NRP'}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Tombol Navigasi Final */}
            <div className="flex justify-between space-x-4 mt-8">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded py-2"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded py-2"
              >
                Download Gabungan PDF
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}