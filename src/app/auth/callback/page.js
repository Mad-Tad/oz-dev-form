'use client'

import { useEffect, useState, Suspense } from 'react'
import { motion } from 'framer-motion'

function AuthCallbackForm() {
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('Please wait while we authenticate your session...')

  useEffect(() => {
    const channel = new BroadcastChannel('auth-channel');
    
    const listener = (event) => {
      if (event.data === 'auth-complete') {
        window.close();
      }
    };

    channel.addEventListener('message', listener);

    // Fallback timer in case something goes wrong
    const timeout = setTimeout(() => {
      setMessage("If this window doesn't close automatically, please close it and try again.");
      setStatus('stuck');
    }, 10000); 

    return () => {
      channel.removeEventListener('message', listener);
      channel.close();
      clearTimeout(timeout);
    };
  }, []);

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-[#1e88e5] border-t-transparent rounded-full"
          />
        )
      case 'stuck':
        return (
            <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </motion.div>
        )
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full mx-auto p-8 text-center"
      >
        <div className="flex justify-center mb-6">
          {getIcon()}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Processing Authentication...
        </h1>
        
        <p className={`text-sm text-gray-500 dark:text-gray-400 mb-6`}>
          {message}
        </p>
        
      </motion.div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="w-12 h-12 border-4 border-[#1e88e5] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <AuthCallbackForm />
    </Suspense>
  )
} 