import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600">404 - Page Not Found</h1>
        <p className="text-gray-700 mt-4">The page you're looking for doesn't exist.</p>
        <Link to="/" className="text-indigo-700 hover:underline mt-6 inline-block">Go to Login</Link>
      </div>
    </div>
  );
}
