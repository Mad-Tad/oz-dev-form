'use client';

import { useAuth } from '../lib/auth/AuthProvider';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginModal from '../components/LoginModal';
import { useState } from 'react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/form');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#1e88e5] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">OZ Listings</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center flex-1 py-12">
        <div className="max-w-2xl mx-auto text-center px-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            OZ Listings Project Intake Form
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Submit your project details to generate a professional OM / PPM backed by OZ Listings.
          </p>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Get Started
            </h2>
            
            <p className="text-gray-600 mb-6">
              Sign in to access the project intake form. Your progress will be saved automatically, 
              and you can return to edit your submission at any time.
            </p>

            <button
              onClick={() => setShowLoginModal(true)}
              className="px-8 py-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg font-semibold"
            >
              Sign In & Start Form
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-500">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Secure & Private</h3>
              <p>Your data is protected with enterprise-grade security</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Auto-Save</h3>
              <p>Your progress is automatically saved as you work</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Professional Output</h3>
              <p>Generate polished OM/PPM documents instantly</p>
            </div>
          </div>
        </div>
      </div>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        redirectTo="/form"
      />
    </div>
  );
} 