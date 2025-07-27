'use client';

import dynamic from 'next/dynamic';
import { useAuth } from '../../lib/auth/AuthProvider';
import { useEffect, useState } from 'react';
import LoginModal from '../../components/LoginModal';

const ProjectIntakeForm = dynamic(() => import('../../components/ProjectIntakeForm'), { ssr: false });

export default function FormPage() {
  const { user, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setShowLoginModal(true);
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#1e88e5] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Authentication Required
            </h1>
            <p className="text-gray-600 mb-6">
              Please sign in to access the project intake form.
            </p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              Sign In
            </button>
          </div>
        </div>
        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)}
          redirectTo="/form"
        />
      </>
    );
  }

  return (
    <main className="py-12">
      <ProjectIntakeForm />
    </main>
  );
} 