'use client';

import { useAuth } from '../lib/auth/AuthProvider';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthModal } from '../context/AuthModalContext';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const { openModal } = useAuthModal();
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;
    
    setLoadingProjects(true);
    try {
      const { data, error } = await supabase
        .from('oz_projects_test')
        .select('*')
        .eq('submitted_by_email', user.email)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading projects:', error);
      } else {
        setProjects(data || []);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleCreateNewProject = async () => {
    try {
      const projectId = crypto.randomUUID();
      const { error } = await supabase
        .from('oz_projects_test')
        .insert({
          project_id: projectId,
          submitted_by_name: user.user_metadata?.full_name || user.email,
          submitted_by_email: user.email,
          submitted_by_id: user.id,
          submission_status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error creating new project:', error);
      } else {
        console.log('New project created with ID:', projectId);
        router.push('/form');
      }
    } catch (error) {
      console.error('Error creating new project:', error);
    }
  };

  const handleEditProject = (project) => {
    router.push('/form');
  };

  const handleSignOut = async () => {
    await signOut();
  };

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
              {user ? (
                <>
                  <span className="text-sm text-gray-600">
                    Welcome, {user.user_metadata?.full_name || user.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => openModal({ redirectTo: '/form' })}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {user ? (
        // Logged in user - Dashboard view
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Projects</h1>
            <p className="text-gray-600">Manage your project submissions and create new ones.</p>
          </div>

          <div className="mb-8">
            <button
              onClick={handleCreateNewProject}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Start New Project
            </button>
          </div>

          {loadingProjects ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your projects...</p>
            </div>
          ) : projects.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <div
                  key={project.project_id}
                  className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow"
                >
                  {/* Image placeholder */}
                  <div className="h-40 bg-gray-100 flex items-center justify-center rounded-md mb-6">
                    <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {project.project_name || 'Untitled Project'}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      project.submission_status === 'submitted' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {project.submission_status || 'draft'}
                    </span>
                  </div>
                  
                  {project.tagline && (
                    <p className="text-gray-600 text-sm mb-4">{project.tagline}</p>
                  )}
                  
                  <div className="text-xs text-gray-500 mb-4">
                    <p>Created: {new Date(project.created_at).toLocaleDateString()}</p>
                    {project.updated_at && (
                      <p>Updated: {new Date(project.updated_at).toLocaleDateString()}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleEditProject(project)}
                    className="w-full px-4 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {project.submission_status === 'submitted' ? 'View' : 'Continue Editing'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-6">Get started by creating your first project.</p>
              <button
                onClick={handleCreateNewProject}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Create Your First Project
              </button>
            </div>
          )}
        </div>
      ) : (
        // Not logged in - Landing page
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
                onClick={() => openModal({ redirectTo: '/form' })}
                className="px-8 py-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg font-semibold"
              >
                Sign in to Add Project
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
      )}

    </div>
  );
} 