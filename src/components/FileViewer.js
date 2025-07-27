import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function FileViewer({ file, onClose }) {
  const [loading, setLoading] = useState(true);
  const [fileUrl, setFileUrl] = useState(null);
  const [error, setError] = useState(null);

  // Get file extension
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
  const isPdf = fileExtension === 'pdf';

  React.useEffect(() => {
    const getFileUrl = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.storage
          .from('oz-projects-docs')
          .createSignedUrl(file.path, 60); // 60 seconds expiry

        if (error) {
          console.error('Error getting file URL:', error);
          setError('Failed to load file');
        } else {
          setFileUrl(data.signedUrl);
        }
      } catch (err) {
        console.error('Error getting file URL:', err);
        setError('Failed to load file');
      } finally {
        setLoading(false);
      }
    };

    getFileUrl();
  }, [file.path]);

  const handleDownload = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('oz-projects-docs')
        .createSignedUrl(file.path, 60);

      if (error) {
        console.error('Error getting download URL:', error);
        alert('Failed to download file');
        return;
      }

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading file:', err);
      alert('Failed to download file');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] w-full mx-4">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Error Loading File</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
            >
              Try Download Instead
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] w-full mx-4 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{file.name}</h3>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {isImage ? (
            <div className="flex justify-center">
              <img
                src={fileUrl}
                alt={file.name}
                className="max-w-full max-h-full object-contain"
                onError={() => setError('Failed to load image')}
              />
            </div>
          ) : isPdf ? (
            <div className="w-full h-full">
              <iframe
                src={fileUrl}
                className="w-full h-full min-h-[500px]"
                title={file.name}
                onError={() => setError('Failed to load PDF')}
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600 mb-4">Preview not available for this file type</p>
              <button
                type="button"
                onClick={handleDownload}
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                Download File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 