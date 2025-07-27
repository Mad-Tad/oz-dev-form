import React, { useState, useEffect } from 'react';
import FormInput from './FormInput';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/auth/AuthProvider';
import FormRecoveryNotification from './FormRecoveryNotification';
import FileDropzone from './FileDropzone';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-'); // Replace multiple - with single -
}

const FIELD_GROUPS = [
  {
    title: 'Basic Information',
    fields: [
      { name: 'project_name', label: 'Project Name', required: true },
      { name: 'tagline', label: 'Tagline', required: true },
      { name: 'executive_summary', label: 'Executive Summary', type: 'textarea', required: true },
      {
        name: 'property_type',
        label: 'Property Type',
        required: true,
        suggestions: ['Multifamily', 'Office', 'Retail', 'Industrial', 'Hospitality', 'Mixed-Use'],
      },
      {
        name: 'status',
        label: 'Status',
        required: true,
        suggestions: ['Planned', 'Under Construction', 'Stabilized', 'For Sale'],
      },
    ],
  },
  {
    title: 'Location',
    fields: [
      { name: 'address', label: 'Address', required: true },
      { name: 'city', label: 'City', required: true },
      { name: 'state', label: 'State', required: true },
      { name: 'zip_code', label: 'ZIP Code', type: 'number', required: true },
    ],
  },
  {
    title: 'Physical Specs',
    fields: [
      { name: 'total_units', label: 'Total Units', type: 'number', required: true },
      { name: 'total_bedrooms', label: 'Total Bedrooms', type: 'number', required: true },
      { name: 'total_sf_gross', label: 'Total SF Gross', type: 'number', required: true },
      { name: 'site_acres', label: 'Site Acres', type: 'number', required: true },
      { name: 'stories', label: 'Stories', type: 'number', required: true },
      { name: 'parking_spaces', label: 'Parking Spaces', required: true },
      { name: 'building_description', label: 'Building Description', type: 'textarea', required: true },
      {
        name: 'construction_type',
        label: 'Construction Type',
        required: true,
        suggestions: ['Wood Frame', 'Steel', 'Concrete', 'Modular'],
      },
    ],
  },
  {
    title: 'Financials',
    fields: [
      { name: 'total_cost', label: 'Total Cost ($)', type: 'number', required: true },
      { name: 'minimum_investment', label: 'Minimum Investment ($)', type: 'number', required: true },
      { name: 'preferred_return', label: 'Preferred Return (%)', type: 'number', required: true },
      { name: 'projected_irr_5yr', label: 'Projected IRR (5 Year) %', required: true },
      { name: 'hold_period_years', label: 'Hold Period (Years)', type: 'number', required: true },
      { name: 'management_fee_annual', label: 'Management Fee Annual (%)', type: 'number', required: true },
      { name: 'sponsor_promote', label: 'Sponsor Promote (%)', type: 'number', required: true },
    ],
  },
  {
    title: 'Timeline',
    fields: [
      { name: 'groundbreaking_date', label: 'Groundbreaking Date', type: 'date', required: true },
      { name: 'construction_start', label: 'Construction Start', type: 'date', required: true },
      { name: 'construction_completion', label: 'Construction Completion', type: 'date', required: true },
      { name: 'occupancy_start', label: 'Occupancy Start', type: 'date', required: true },
      { name: 'stabilization_date', label: 'Stabilization Date', type: 'date', required: true },
    ],
  },
  {
    title: 'Team & Fund',
    fields: [
      { name: 'fund_name', label: 'Fund Name', required: true },
      { name: 'fund_manager', label: 'Fund Manager', required: true },
      { name: 'sponsor_name', label: 'Sponsor Name', required: true },
      { name: 'developer_name', label: 'Developer Name', required: true },
      { name: 'contractor_name', label: 'Contractor Name', required: true },
      {
        name: 'fund_type',
        label: 'Fund Type',
        required: true,
        suggestions: ['Single-Asset', 'Multi-Asset'],
      },
    ],
  },
];

// Function to fetch uploaded files from storage
const fetchUploadedFiles = async (projectId) => {
  if (!projectId || projectId === 'temp') return [];
  
  try {
    const { data, error } = await supabase.storage
      .from('oz-projects-docs')
      .list(projectId);
    
    if (error) {
      console.error('Error fetching uploaded files:', error);
      return [];
    }
    
    return data.map(file => ({
      name: file.name,
      path: `${projectId}/${file.name}`
    }));
  } catch (error) {
    console.error('Error fetching uploaded files:', error);
    return [];
  }
};

// localStorage functions for current step tracking
const getStoredStep = (projectId) => {
  if (typeof window === 'undefined') return 0;
  const stored = localStorage.getItem(`oz_form_step_${projectId}`);
  return stored ? parseInt(stored, 10) : 0;
};

const setStoredStep = (projectId, step) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`oz_form_step_${projectId}`, step.toString());
};

const clearStoredStep = (projectId) => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`oz_form_step_${projectId}`);
};

// We no longer track draft page number in the DB. localStorage already stores currentStep.

export default function ProjectIntakeForm() {
  const { user } = useAuth();
  const initialState = FIELD_GROUPS.reduce((acc, group) => {
    group.fields.forEach((f) => {
      acc[f.name] = '';
    });
    return acc;
  }, {});

  const [formState, setFormState] = useState(initialState);
  const [uploadedFiles, setUploadedFiles] = useState([]); // store uploads for step 0 validation
  const [currentStep, setCurrentStep] = useState(0);
  const [savedStep, setSavedStep] = useState(0);
  const totalSteps = FIELD_GROUPS.length + 1; // +1 for the upload step
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showRecoveryNotification, setShowRecoveryNotification] = useState(false);
  const [savingBeforeNavigation, setSavingBeforeNavigation] = useState(false);

  // Load existing form data for the user
  useEffect(() => {
    const loadFormData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('oz_projects_test')
          .select('*')
          .eq('submitted_by_email', user.email)
          .eq('submission_status', 'draft')
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error loading form data:', error);
        } else if (data && data.length > 0) {
          const existingProject = data[0];
          setFormState(existingProject);
          // Use localStorage for current step, fallback to database
          const storedStep = getStoredStep(existingProject.project_id);
          const stepToUse = storedStep;
          setCurrentStep(stepToUse);
          setSavedStep(stepToUse);
          // Fetch uploaded files from storage
          const files = await fetchUploadedFiles(existingProject.project_id);
          setUploadedFiles(files);
          setSubmitted(false);
          // Show notification that form was recovered
          setShowRecoveryNotification(true);
        } else {
          // Create initial draft entry if no existing draft found
          const projectId = crypto.randomUUID();
          const initialDraft = {
            project_id: projectId,
            submitted_by_name: user.user_metadata?.full_name || user.email,
            submitted_by_email: user.email,
            submitted_by_id: user.id,
            submission_status: 'draft',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const { error: createError } = await supabase
            .from('oz_projects_test')
            .insert(initialDraft);

          if (createError) {
            console.error('Error creating initial draft:', createError);
          } else {
            console.log('Initial draft created with project_id:', projectId);
            setFormState(prev => ({ ...prev, project_id: projectId }));
          }
        }
      } catch (error) {
        console.error('Error loading form data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFormData();
  }, [user]);

  // Auto-save form data as user types
  useEffect(() => {
    if (!user || loading) return;

    const saveTimeout = setTimeout(async () => {
      // Always save if we have a project_id, even if form is empty
      if (formState.project_id || Object.values(formState).some(value => value !== '')) {
        setSaving(true);
        try {
          // Generate a project_id if it doesn't exist
          const projectId = formState.project_id || crypto.randomUUID();
          
          console.log('Auto-saving form data:', { projectId, hasData: Object.values(formState).some(value => value !== '') });
          
          const { error } = await supabase
            .from('oz_projects_test')
            .upsert({
              project_id: projectId,
              submitted_by_name: user.user_metadata?.full_name || user.email,
              submitted_by_email: user.email,
              submitted_by_id: user.id,
              submission_status: 'draft',
              updated_at: new Date().toISOString(),
              ...formState,
              project_id: projectId, // Ensure project_id is set
            }, {
              onConflict: 'project_id'
            });

          if (error) {
            console.error('Error auto-saving:', error);
          } else {
            console.log('Auto-save successful for project_id:', projectId);
            // Update local state with the project_id if it was generated
            if (!formState.project_id) {
              setFormState(prev => ({ ...prev, project_id: projectId }));
            }
          }
        } catch (error) {
          console.error('Error auto-saving:', error);
        } finally {
          setSaving(false);
        }
      }
    }, 2000); // Save after 2 seconds of inactivity

    return () => clearTimeout(saveTimeout);
  }, [formState, user, loading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep = () => {
    // Step 0 is the upload step
    if (currentStep === 0) {
      return true;
    }
    const group = FIELD_GROUPS[currentStep - 1]; // shift by 1
    const missing = group.fields.filter((f) => f.required && !formState[f.name]);
    if (missing.length) {
      alert(`Please fill: ${missing.map((f) => f.label).join(', ')}`);
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateStep()) return;
    const nextStep = Math.min(currentStep + 1, totalSteps - 1);
    setCurrentStep(nextStep);
    setStoredStep(formState.project_id, nextStep);
    // no submission_status update needed
  };

  const handleBack = async () => {
    const prevStep = Math.max(currentStep - 1, 0);
    setCurrentStep(prevStep);
    setStoredStep(formState.project_id, prevStep);
    // no submission_status update needed
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    if (!user) {
      alert('Please sign in to submit your project.');
      return;
    }

    // Prepare payload
    const uuid = crypto.randomUUID();
    const numericFields = [
      'zip_code',
      'total_units',
      'total_bedrooms',
      'total_sf_gross',
      'site_acres',
      'stories',
      'total_cost',
      'minimum_investment',
      'preferred_return',
      'projected_irr_5yr',
      'hold_period_years',
      'management_fee_annual',
      'sponsor_promote',
    ];

    const payload = {
      project_id: uuid,
      submitted_by_name: user.user_metadata?.full_name || user.email,
      submitted_by_email: user.email,
      submitted_by_id: user.id,
      project_slug: slugify(formState.project_name),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      submission_status: 'submitted',
      ...formState,
    };

    // Convert numeric strings to numbers
    numericFields.forEach((key) => {
      if (payload[key] !== '' && payload[key] !== undefined) {
        const num = parseFloat(payload[key]);
        payload[key] = isNaN(num) ? null : num;
      }
    });

    // Insert into Supabase
    const { error } = await supabase.from('oz_projects_test').insert(payload);

    if (error) {
      console.error('Supabase insert error:', error);
      alert('Error saving project: ' + error.message);
      return;
    }

    setSubmitted(true);
    clearStoredStep(formState.project_id); // Clear step tracking on submission
    // nothing to clear
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <div className="w-12 h-12 border-4 border-[#1e88e5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your form...</p>
        <p className="text-sm text-gray-500 mt-2">Checking for saved progress...</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center animate-fade-in">
        <h2 className="text-2xl font-bold mb-4 text-primary-600">Thank you!</h2>
        <p>Your project details have been received. Our team will review and follow up shortly.</p>
      </div>
    );
  }

  const progressPercent = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Recovery Notification */}
      <FormRecoveryNotification 
        show={showRecoveryNotification} 
        onClose={() => setShowRecoveryNotification(false)} 
      />
      
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={async () => {
            // Save current form data before navigating
            if (user && Object.values(formState).some(value => value !== '')) {
              setSavingBeforeNavigation(true);
              try {
                const projectId = formState.project_id || crypto.randomUUID();
                const { error } = await supabase
                  .from('oz_projects_test')
                  .upsert({
                    project_id: projectId,
                    submitted_by_name: user.user_metadata?.full_name || user.email,
                    submitted_by_email: user.email,
                    submitted_by_id: user.id,
                    submission_status: 'draft',
                    updated_at: new Date().toISOString(),
                    ...formState,
                    project_id: projectId,
                  }, {
                    onConflict: 'project_id'
                  });
              } catch (error) {
                console.error('Error saving before navigation:', error);
              } finally {
                setSavingBeforeNavigation(false);
              }
            }
            window.location.href = '/dashboard';
          }}
          disabled={savingBeforeNavigation}
          className="text-gray-600 hover:text-gray-800 flex items-center disabled:opacity-50"
        >
          {savingBeforeNavigation ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </>
          )}
        </button>
        <div className="flex items-center space-x-4">
          {(saving || savingBeforeNavigation) && (
            <div className="flex items-center text-sm text-gray-500">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2"></div>
              {savingBeforeNavigation ? 'Saving before navigation...' : 'Saving...'}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 bg-white shadow-lg rounded-lg animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold font-brand">Project Intake Form</h1>
        </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm font-medium text-gray-600 mb-1">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div
              key={idx}
              className={`flex-1 text-center ${idx === currentStep ? 'text-primary-600' : ''}`}
            >
              {idx + 1}
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full">
          <div
            className="h-2 bg-primary-600 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Current Step Fields */}
      {(() => {
        // Upload step
        if (currentStep === 0) {
          return (
            <fieldset className="mb-6">
              <legend className="text-xl font-semibold mb-4 text-primary-700 border-b border-primary-200 pb-2">
                Project Documents
              </legend>
              <FileDropzone
                projectId={formState.project_id || 'temp'}
                initialFiles={uploadedFiles}
                onUploadComplete={(files) => {
                  const newFiles = [...uploadedFiles, ...files];
                  setUploadedFiles(newFiles);
                }}
              />
              {uploadedFiles.length > 0 && (
                <p className="mt-4 text-sm text-gray-600">
                  {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} uploaded. You can upload more or proceed to the next step.
                </p>
              )}
              {uploadedFiles.length === 0 && (
                <p className="mt-4 text-sm text-gray-500">
                  Document upload is optional. You can proceed without uploading files.
                </p>
              )}
            </fieldset>
          );
        }

        const group = FIELD_GROUPS[currentStep - 1]; // shift index
        return (
          <fieldset key={group.title} className="mb-6">
            <legend className="text-xl font-semibold mb-4 text-primary-700 border-b border-primary-200 pb-2">
              {group.title}
            </legend>
            <div className="grid md:grid-cols-2 gap-6">
              {group.fields.map((field) => (
                <FormInput
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  type={field.type}
                  value={formState[field.name]}
                  onChange={handleChange}
                  required={field.required}
                  suggestions={field.suggestions}
                />
              ))}
            </div>
          </fieldset>
        );
      })()}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        {currentStep > 0 && (
          <button
            type="button"
            onClick={handleBack}
            className="px-6 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Back
          </button>
        )}
        {currentStep < totalSteps - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="ml-auto px-6 py-2 rounded-md bg-primary-600 hover:bg-primary-700 text-white font-semibold"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            className="ml-auto px-6 py-2 rounded-md bg-primary-600 hover:bg-primary-700 text-white font-semibold"
          >
            Submit Project
          </button>
        )}
      </div>
    </form>
  </div>
  );
} 