import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';  // Halaman setelah login
import NotFound from './pages/NotFound';    // Halaman jika halaman tidak ditemukan

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />           {/* Halaman Login */}
        <Route path="/dashboard" element={<Dashboard />} /> {/* Halaman Dashboard */}
        <Route path="*" element={<NotFound />} />        {/* Halaman Not Found */}
      </Routes>
    </Router>
  );
}

export default App;
