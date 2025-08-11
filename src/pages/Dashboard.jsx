import React, { useState } from "react";
import logoPolda from "../assets/logo-polda.png";
import PenyelidikanForm from "./PenyelidikanForm"; // import komponen form

export default function Dashboard() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const menuItems = [
    { name: "Dashboard", icon: "📊" },
    { name: "DIR RES. SIBER", icon: "📁" },
    { name: "Input Data", icon: "📈" },
    { name: "Preview Surat", icon: "📄" },
  ];

  const dirResSiberOptions = [
    { key: "penyelidikan", label: "Surat Penyelidikan" },
    { key: "penyidikan", label: "Surat Penyidikan" },
  ];

  function handleSelectCategory(key) {
    setSelectedCategory(key);
    setActiveMenu("Input Data");
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="bg-white w-64 px-6 py-8 flex flex-col">
        <h1 className="text-xl font-bold text-blue-900 mb-10">e-Perkaba PMJ</h1>
        <h3 className="font-semibold text-gray-700 mb-4">Menu</h3>

        <nav className="flex flex-col space-y-3">
          {menuItems.map(({ name, icon }) => (
            <button
              key={name}
              onClick={() => setActiveMenu(name)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md border font-semibold text-sm
                ${
                  activeMenu === name
                    ? "bg-blue-900 text-white border-blue-900"
                    : "border border-pink-300 text-pink-500 hover:bg-pink-50"
                }`}
            >
              <span>{icon}</span>
              <span>{name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden bg-blue-900 text-white p-8 flex flex-col">
        {/* Background image transparan */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `url(${logoPolda})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "contain",
          }}
        ></div>

        {/* Konten utama */}
        <div className="relative z-10 flex flex-col flex-1">
          {/* Header - Profile */}
          <div className="absolute top-6 right-6 flex items-center space-x-3 z-20">
            <div className="text-right">
              <div className="font-bold">Karina</div>
              <div className="text-xs text-blue-300">Administrator</div>
            </div>
            <img
              src="https://i.pravatar.cc/40?img=47"
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
          </div>

          {/* Title */}
          <h2 className="text-lg font-bold mb-6 z-20">{activeMenu}</h2>

          {/* Konten berdasarkan menu */}
          {activeMenu === "DIR RES. SIBER" && (
            <div className="flex justify-center space-x-12 mt-20">
              {dirResSiberOptions.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleSelectCategory(key)}
                  className="border border-pink-400 text-pink-600 font-semibold rounded-md px-6 py-3 hover:bg-pink-50 transition"
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {activeMenu === "Input Data" && (
            <>
              <div className="mb-6 p-3 bg-blue-800 rounded-md font-semibold w-48">
                Kategori Surat:{" "}
                {selectedCategory === "penyelidikan"
                  ? "Surat Penyelidikan"
                  : selectedCategory === "penyidikan"
                  ? "Surat Penyidikan"
                  : "Belum dipilih"}
              </div>

              {/* Render form sesuai kategori */}
              {selectedCategory === "penyelidikan" && <PenyelidikanForm />}

              {selectedCategory === "penyidikan" && (
                <p>Form Penyidikan belum tersedia</p>
              )}

              {!selectedCategory && <p>Silakan pilih kategori terlebih dahulu.</p>}
            </>
          )}

          {activeMenu === "Dashboard" && <p>Selamat datang di Dashboard</p>}

          {activeMenu === "Preview Surat" && (
            <p>Preview Surat akan ditampilkan di sini.</p>
          )}
        </div>
      </div>
    </div>
  );
}
