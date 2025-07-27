import './globals.css';
import React from 'react';
import { AuthProvider } from '../lib/auth/AuthProvider';
import { AuthModalProvider } from '../context/AuthModalContext';
import AuthModal from '../components/AuthModal';

export const metadata = {
  title: 'OZ Listings – Project Intake Form',
  description: 'Submit project details to generate a professional OM / PPM backed by OZ Listings.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-gray-50 text-gray-900 min-h-screen antialiased">
        <AuthProvider>
          <AuthModalProvider>
            {children}
            <AuthModal />
          </AuthModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
} 