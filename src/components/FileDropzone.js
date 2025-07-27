import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/auth/AuthProvider';

/**
 * A simple drag-and-drop upload area that stores files in the `oz-projects-docs` bucket
 * under a folder named by the provided `projectId`.
 *
 * NOTE: Ensure you have created a public bucket named `project_files` in Supabase
 * and granted authenticated users "insert" permissions.
 */
export default function FileDropzone({ projectId, onUploadComplete, initialFiles = [] }) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState(initialFiles);
  const { user } = useAuth();

  const handleFiles = async (fileList) => {
    if (!fileList?.length) return;

    // Check if user is authenticated
    if (!user) {
      alert('Please sign in to upload files.');
      return;
    }

    setUploading(true);
    const newUploads = [];

    for (const file of fileList) {
      // Use the original file name; prepend projectId to create a folder-like path
      const filePath = `${projectId}/${file.name}`;
      
      // Get current session to ensure we're authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        alert('Authentication error. Please sign in again.');
        return;
      }
      
      // Refresh session if needed
      if (session.expires_at && new Date(session.expires_at * 1000) < new Date()) {
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError || !refreshedSession) {
          console.error('Session refresh error:', refreshError);
          alert('Session expired. Please sign in again.');
          return;
        }
      }
      
      const { error } = await supabase.storage
        .from('oz-projects-docs')
        .upload(filePath, file, {
          upsert: true, // allow re-uploads / replaces
          contentType: file.type,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        if (error.message.includes('row-level security policy')) {
          alert(`Authentication issue: ${error.message}. Please try signing out and back in.`);
        } else {
          alert(`Failed to upload ${file.name}: ${error.message}`);
        }
      } else {
        newUploads.push({ name: file.name, path: filePath });
      }
    }

    // Update local state & notify parent
    setUploadedFiles((prev) => [...prev, ...newUploads]);
    setUploading(false);

    if (onUploadComplete) {
      onUploadComplete(newUploads);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { files } = e.dataTransfer || {};
    handleFiles(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleInputChange = (e) => {
    handleFiles(e.target.files);
    // reset input so the same file can be selected again if needed
    e.target.value = '';
  };

  return (
    <div className="flex flex-col items-center">
      <label
        htmlFor="file-input"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 text-gray-600 cursor-pointer hover:border-primary-500 transition-colors"
        style={{ minHeight: '180px' }}
      >
        {uploading ? (
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border-4 border-gray-300 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Uploading…</span>
          </div>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mb-2 text-primary-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-center text-sm">
              Drag & drop files here or <span className="text-primary-600 underline">browse</span>
            </p>
          </>
        )}
        <input
          id="file-input"
          type="file"
          multiple
          className="hidden"
          onChange={handleInputChange}
        />
      </label>

      {uploadedFiles.length > 0 && (
        <ul className="mt-4 w-full text-sm list-disc list-inside text-gray-700">
          {uploadedFiles.map((f) => (
            <li key={f.path}>{f.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
} 