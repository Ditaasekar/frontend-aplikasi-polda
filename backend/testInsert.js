require('dotenv').config();
const mongoose = require('mongoose');
const Laporan = require('./models/Laporan'); // path relatif dari folder backend

(async () => {
  try {
    console.log('🚀 Memulai test insert...');
    console.log('📁 Menggunakan model dari: ./models/Laporan');

    // Ambil dari .env
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI belum diatur di file .env');
    }

    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Atlas connected ke database aplikasi_polda');

    // Data contoh
    const laporanTest = new Laporan({
      noLp: "LP001",
      nama: "John Doe",
      noIdentitas: "1234567890",
      kewarganegaraan: "Indonesia",
      jenisKelamin: "Laki-laki",
      tempatLahir: "Jakarta",
      tanggalLahir: "1990-01-01",
      pekerjaan: "Karyawan",
      agama: "Islam",
      alamat: "Jl. Test No. 123",
      noTelepon: "081234567890",
      hariKejadian: "Senin",
      tanggalKejadian: "2024-01-15",
      pukulJam: "14",
      pukulMenit: "30",
      zonaWaktu: "WIB",
      tempatKejadian: "Jakarta Pusat",
      apaYangTerjadi: "Test kejadian untuk memastikan schema berfungsi",
      siapaTerlapor: "Test Terlapor",
      terlaporNama: "Jane Doe",
      terlaporKorporasi: false,
      korbanNama: "Victim Test",
      korbanKorporasi: false
    });

    console.log('💾 Menyimpan data ke database...');
    const result = await laporanTest.save();
    console.log('✅ Data berhasil disimpan:', result._id);

    const count = await Laporan.countDocuments();
    console.log('📊 Total dokumen di collection laporans:', count);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Koneksi database ditutup');
  }
})();
