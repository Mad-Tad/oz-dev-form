'use client';

import { createContext, useContext, useState, useCallback } from 'react';

const AuthModalContext = createContext({
  isOpen: false,
  openModal: () => {},
  closeModal: () => {},
  modalContent: {
    title: '',
    description: '',
    redirectTo: '/',
  },
});

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
}

export function AuthModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: 'Access a Curated Marketplace',
    description: 'Join our platform to view detailed information on investment opportunities.\n\n🔐 Password-free login\n✨ One-time signup, lifetime access',
    redirectTo: '/',
    onClose: null,
  });

  const openModal = useCallback((content = {}) => {
    setModalContent((prev) => ({ ...prev, ...content }));
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    if (modalContent.onClose) {
      modalContent.onClose();
    }
    setIsOpen(false);
    // Reset to default after animation
    setTimeout(() => {
      setModalContent({
        title: 'Access a Curated Marketplace',
        description: 'Join our platform to view detailed information on investment opportunities.\n\n🔐 Password-free login\n✨ One-time signup, lifetime access',
        redirectTo: '/',
        onClose: null,
      });
    }, 300);
  }, [modalContent]);

  return (
    <AuthModalContext.Provider value={{ isOpen, openModal, closeModal, modalContent }}>
      {children}
    </AuthModalContext.Provider>
  );
} 