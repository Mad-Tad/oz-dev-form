"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "../lib/supabase/client";
import { useAuthModal } from "../context/AuthModalContext";
import { X } from "lucide-react";

export default function AuthModal() {
  const { isOpen, closeModal, modalContent } = useAuthModal();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const supabase = createClient();

  const { title, description } = modalContent;

  // Close modal when user is authenticated
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        closeModal();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, closeModal]);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const password = `${email}_password`;

    // Try to sign in first
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      if (signInError.message === "Invalid login credentials") {
        // If sign-in fails, try to sign up.
        // With email confirmation disabled, this will also sign the user in.
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
            // No email confirmation required
          },
        });

        if (signUpError) {
          setError(signUpError.message);
        } else {
          // On successful sign-up, the onAuthStateChange listener in AuthProvider
          // will fire with 'SIGNED_IN' and handle the redirect.
          // We just need to indicate success locally.
          handleSuccess();
        }
      } else {
        setError(signInError.message);
      }
    } else {
      // Successful sign-in
      handleSuccess();
    }

    setLoading(false);
  };

  const handleGoogleAuth = () => {
    const width = 600;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      "/auth/google",
      "supabase-auth",
      `width=${width},height=${height},left=${left},top=${top}`,
    );
  };

  const handleSuccess = () => {
    closeModal();
    // The AuthProvider will handle the redirect on SIGNED_IN event
  };

  const handleClose = () => {
    setError(null);
    setMessage(null);
    setName("");
    setEmail("");
    closeModal();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="auth-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-md"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="relative max-h-[98vh] w-full max-w-sm overflow-y-auto rounded-xl bg-white p-4 shadow-2xl md:max-w-md md:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>

              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900">
                  {title}
                </h2>
                <div className="text-md mt-2 space-y-2 text-gray-600">
                  {description.split("\n").map((line, idx) => {
                    // Add more blank lines before first benefit point (🔐)
                    if (line.includes("🔐")) {
                      return (
                        <p key={idx} className="mt-12">
                          {line}
                        </p>
                      );
                    }
                    // Keep second benefit point (✨) close to first
                    if (line.includes("✨")) {
                      return (
                        <p key={idx} className="mt-1">
                          {line}
                        </p>
                      );
                    }
                    return <p key={idx}>{line}</p>;
                  })}
                </div>
              </div>

              {error && (
                <p className="mt-4 text-center text-red-500">{error}</p>
              )}
              {message && (
                <p className="mt-4 text-center text-green-500">{message}</p>
              )}

              <div className="mt-6">
                <button
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 48 48">
                    <path
                      fill="#FFC107"
                      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24 s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                    />
                    <path
                      fill="#FF3D00"
                      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                    />
                    <path
                      fill="#4CAF50"
                      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                    />
                    <path
                      fill="#1976D2"
                      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.089,5.571 l6.19,5.238C39.988,36.46,44,31.1,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                    />
                  </svg>
                  Continue with Google
                </button>
              </div>

              <div className="my-6 flex items-center gap-4">
                <div className="h-px w-full bg-gray-200"></div>
                <span className="text-sm text-gray-500">
                  OR
                </span>
                <div className="h-px w-full bg-gray-200"></div>
              </div>

              <form onSubmit={handleEmailAuth}>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mb-3 w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 w-full rounded-lg bg-gray-800 px-4 py-3 font-semibold text-white transition hover:bg-gray-900 disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Continue with Email"}
                </button>
              </form>

              {/* Terms & Conditions Agreement - At bottom of popup */}
              <div className="mt-4 text-center text-xs text-gray-500">
                <p>
                  By continuing, you agree to our{" "}
                  <a
                    href="/terms"
                    className="text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Terms & Conditions
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy"
                    className="text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 