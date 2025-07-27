'use client';

import { useAuth } from '../../lib/auth/AuthProvider';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      loadProjects();
    }
  }, [user, loading, router]);

  const loadProjects = async () => {
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

  const handleEditProject = (project) => {
    // For now, we'll just redirect to the form
    // In the future, we could pass the project ID to load specific data
    router.push('/form');
  };

  const handleCreateNewProject = async () => {
    try {
      // Create a new draft project
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

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#1e88e5] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to home
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user.email}</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCreateNewProject}
              className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              New Project
            </button>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Projects List */}
        {loadingProjects ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-3"></div>
            <span className="text-gray-600">Loading projects...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">No projects yet</h3>
              <p className="text-gray-600 mb-6">
                Get started by creating your first project submission.
              </p>
              <button
                onClick={() => router.push('/form')}
                className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Create First Project
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.project_id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
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

                <div className="flex space-x-2">
                                     <button
                     onClick={() => handleEditProject(project)}
                     className="flex-1 px-4 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                   >
                     {project.submission_status === 'submitted' ? 'View' : 'Continue Editing'}
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 