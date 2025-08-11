import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoPolda from '../assets/logo-polda.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === 'user@example.com' && password === 'password') {
      navigate('/dashboard');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
     <div className="min-h-screen flex items-center justify-center bg-gray-200 relative px-4">
      {/* Background Logo */}
      <div
        className="absolute opacity-50 w-[500px] h-[500px] bg-center bg-no-repeat bg-cover"
        style={{
          backgroundImage: `url(${logoPolda})`, // Menggunakan gambar yang diimpor
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      ></div>

      {/* Form Container */}
      <div className="w-full max-w-md z-10 bg-white bg-opacity-70 p-8 rounded-lg shadow-xl">
        <h2 className="text-center text-4xl font-bold text-indigo-900 mb-4">Login</h2>
        <p className="text-center text-gray-700 mb-6">Please enter your login detail to sign in</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-800 text-white py-2 rounded-md hover:bg-indigo-900 transition duration-200"
          >
            Log in
          </button>
        </form>
      </div>
    </div>
  );
}
