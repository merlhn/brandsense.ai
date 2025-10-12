import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { toast } from "sonner@2.0.3";
import { refreshProjectData } from "../lib/api";
import { FeedbackDialog } from "./FeedbackDialog";
import { Sidebar } from "./layout/Sidebar";
import { Header } from "./layout/Header";
import { MainContent } from "./layout/MainContent";
import { storage } from "../lib/storage";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { logger } from "../lib/logger";
import { SCREENS } from "../lib/constants";
import { Project } from "../lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Toaster } from "./ui/sonner";

interface DashboardLayoutProps {
  onNavigate?: (screen: string) => void;
}

export function DashboardLayout({ onNavigate }: DashboardLayoutProps) {
  const [activeItem, setActiveItem] = useState("identity");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDataCorruptionDialog, setShowDataCorruptionDialog] = useState(false);
  const [userEmail, setUserEmail] = useState(() => {
    const email = storage.getUserEmail();
    console.log('🔍 DashboardLayout - Initial userEmail:', email);
    return email || '';
  });
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(() => {
    // Only show banner if user hasn't dismissed it before
    const dismissed = localStorage.getItem('onboarding_banner_dismissed');
    return !dismissed;
  });
  
  // Load projects from storage
  const [projects, setProjects] = useState(() => storage.getAllProjects());
  
  const [selectedProject, setSelectedProject] = useState(() => {
    const currentProject = storage.getCurrentProject();
    
    if (currentProject) {
      return currentProject;
    }
    
    // If no valid project selected but projects exist, select first one
    const allProjects = storage.getAllProjects();
    if (allProjects.length > 0) {
      storage.setCurrentProject(allProjects[0]);
      return allProjects[0];
    }
    
    // No projects at all - will need to create one
    return null;
  });

  // Authentication guard - redirect to sign in if no access token
  useEffect(() => {
    const accessToken = storage.getAccessToken();
    
    if (!accessToken) {
      logger.security('No access token found in DashboardLayout, redirecting to sign in');
      toast.error('Session Expired', {
        description: 'Please sign in again to continue.'
      });
      onNavigate?.(SCREENS.SIGN_IN);
    }
  }, [onNavigate]);

  // Email değişikliklerini dinle
  useEffect(() => {
    const handleStorageChange = () => {
      const email = storage.getUserEmail();
      console.log('🔄 Storage change detected - userEmail:', email);
      if (email) {
        setUserEmail(email);
        console.log('✅ UserEmail updated to:', email);
      } else {
        console.log('⚠️ No email found in storage');
      }
    };

    // Storage değişikliklerini dinle
    window.addEventListener('storage', handleStorageChange);
    
    // Component mount olduğunda da kontrol et
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Projects değişikliklerini dinle
  useEffect(() => {
    const handleProjectsChange = () => {
      const allProjects = storage.getAllProjects();
      const currentProject = storage.getCurrentProject();
      
      console.log('🔄 Projects updated in storage, refreshing dashboard...');
      console.log(`   Total projects: ${allProjects.length}`);
      console.log(`   Current project: ${currentProject?.name || 'None'}`);
      
      // Update projects state
      setProjects(allProjects);
      
      // Update selected project if it changed
      if (currentProject && currentProject.id !== selectedProject?.id) {
        setSelectedProject(currentProject);
      }
    };

    // Storage değişikliklerini dinle
    window.addEventListener('storage', handleProjectsChange);
    
    // Component mount olduğunda da kontrol et
    handleProjectsChange();

    return () => {
      window.removeEventListener('storage', handleProjectsChange);
    };
  }, [selectedProject]);

  // Listen for data recovery trigger from child components
  useEffect(() => {
    const handleDataRecoveryTrigger = () => {
      console.log('📡 Data recovery triggered from child component');
      setShowDataCorruptionDialog(true);
    };

    window.addEventListener('trigger-data-recovery', handleDataRecoveryTrigger);
    
    return () => {
      window.removeEventListener('trigger-data-recovery', handleDataRecoveryTrigger);
    };
  }, []);

  // Validate projects exist in backend on mount
  useEffect(() => {
    const validateProjects = async () => {
      const accessToken = storage.getAccessToken();
      if (!accessToken) {
        // This shouldn't happen due to auth guard above, but just in case
        logger.warning('No access token during project validation');
        return;
      }

      const localProjects = storage.getAllProjects();
      if (localProjects.length === 0) {
        console.log('📍 No local projects to validate');
        return;
      }

      console.log('🔍 Validating projects against backend...');
      
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-cf9a9609/projects`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const backendProjects = data.projects || [];
          
          console.log(`✅ Backend has ${backendProjects.length} projects`);
          
          // Check if any local projects are missing from backend
          const localProjectIds = localProjects.map(p => p.id);
          const backendProjectIds = backendProjects.map((p: any) => p.id);
          
          const missingProjects = localProjectIds.filter(id => !backendProjectIds.includes(id));
          
          if (missingProjects.length > 0) {
            console.log(`⚠️ Found ${missingProjects.length} local projects not in backend:`, missingProjects);
            
            // Remove missing projects from local storage
            missingProjects.forEach(id => {
              storage.deleteProject(id);
              console.log(`🗑️ Removed missing project: ${id}`);
            });
            
            // Update projects state
            const updatedProjects = storage.getAllProjects();
            setProjects(updatedProjects);
            
            // Update selected project if it was deleted
            if (selectedProject && missingProjects.includes(selectedProject.id)) {
              if (updatedProjects.length > 0) {
                storage.setCurrentProject(updatedProjects[0]);
                setSelectedProject(updatedProjects[0]);
              } else {
                storage.clearCurrentProject();
                setSelectedProject(null);
              }
            }
          }
        } else {
          console.log('⚠️ Could not validate projects with backend');
        }
      } catch (error) {
        console.log('⚠️ Error validating projects:', error);
      }
    };

    validateProjects();
  }, []);

  // Auto-dismiss onboarding banner after 2 seconds if data is ready
  useEffect(() => {
    if (selectedProject?.dataStatus === 'ready' && showOnboardingBanner) {
      const timer = setTimeout(() => {
        dismissOnboardingBanner();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [selectedProject?.dataStatus, showOnboardingBanner]);

  // Fetch project data from backend
  useEffect(() => {
    if (!selectedProject) return;
    
    // Validate UUID before making API call
    if (!storage.isValidUUID(selectedProject.id)) {
      console.error('🚨 Selected project has invalid UUID:', selectedProject.id);
      storage.deleteProject(selectedProject.id);
      
      // Update projects state
      const updatedProjects = storage.getAllProjects();
      setProjects(updatedProjects);
      
      if (updatedProjects.length > 0) {
        storage.setCurrentProject(updatedProjects[0]);
        setSelectedProject(updatedProjects[0]);
      } else {
        storage.clearCurrentProject();
        setSelectedProject(null);
      }
      return;
    }
    
    const fetchProjectData = async () => {
      try {
        const accessToken = storage.getAccessToken();
        if (!accessToken) {
          logger.warning('No access token during project data fetch');
          onNavigate?.(SCREENS.SIGN_IN);
          return;
        }
        
        console.log(`📡 Fetching project data for: ${selectedProject.id}`);
        
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-cf9a9609/projects/${selectedProject.id}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error('❌ Failed to fetch project data:', errorData);
          
          // Check if it's a 404 (project not found)
          if (response.status === 404) {
            console.log('🗑️ Project not found in backend, removing from local storage');
            storage.deleteProject(selectedProject.id);
            
            // Update projects state
            const updatedProjects = storage.getAllProjects();
            setProjects(updatedProjects);
            
            if (updatedProjects.length > 0) {
              storage.setCurrentProject(updatedProjects[0]);
              setSelectedProject(updatedProjects[0]);
            } else {
              storage.clearCurrentProject();
              setSelectedProject(null);
            }
            return;
          }
          
          // Check if UUID error
          const errorString = JSON.stringify(errorData);
          const isUUIDError = 
            errorString.includes('invalid input syntax for type uuid') ||
            errorString.includes('Invalid UUID') ||
            errorString.includes('uuid') ||
            errorString.includes('UUID');
            
          if (isUUIDError) {
            console.error('🚨 UUID error detected, removing project:', selectedProject.id);
            storage.deleteProject(selectedProject.id);
            
            // Update projects state
            const updatedProjects = storage.getAllProjects();
            setProjects(updatedProjects);
            
            if (updatedProjects.length > 0) {
              storage.setCurrentProject(updatedProjects[0]);
              setSelectedProject(updatedProjects[0]);
            } else {
              storage.clearCurrentProject();
              setSelectedProject(null);
            }
          }
          return;
        }
        
        // Parse successful response
        let data;
        try {
          data = await response.json();
        } catch (e) {
          console.error('❌ Failed to parse project data as JSON:', e);
          return;
        }
        
        // Update local storage with backend data
        if (data.data) {
          const previousStatus = selectedProject.dataStatus;
          const updatedProject = {
            ...selectedProject,
            data: data.data,
            dataStatus: data.data_status || 'ready',
            lastRefreshAt: data.last_refreshed_at || new Date().toISOString(),
          };
          
          storage.saveProject(updatedProject);
          setSelectedProject(updatedProject);
          
          // Show success toast if status changed from processing to ready
          if (previousStatus === 'processing' && updatedProject.dataStatus === 'ready') {
            toast.success('Analysis Complete!', {
              description: 'Your brand analysis is ready. Dashboard has been updated.',
              duration: 5000,
            });
          }
        }
      } catch (error) {
        console.error('❌ Error fetching project data:', error);
      }
    };

    // Only fetch if project has no data or is processing
    if (!selectedProject.data || selectedProject.dataStatus === 'processing') {
      fetchProjectData();
    }

    // Set up polling for processing projects
    let pollInterval: NodeJS.Timeout | null = null;
    
    if (selectedProject.dataStatus === 'processing') {
      console.log('🔄 Setting up polling for processing project...');
      pollInterval = setInterval(() => {
        console.log('🔄 Polling for project data...');
        fetchProjectData();
      }, 10000); // Poll every 10 seconds
    }
    
    return () => {
      if (pollInterval) {
        console.log('⏹️ Stopping polling');
        clearInterval(pollInterval);
      }
    };
  }, [selectedProject?.id, selectedProject?.dataStatus]);

  // Define all handlers before early returns
  const handleRefresh = async () => {
    if (!selectedProject || isRefreshing) return;
    
    setIsRefreshing(true);
    
    try {
      // Mark project as refreshing
      const refreshingProject = {
        ...selectedProject,
        dataStatus: 'processing' as const,
        lastRefreshAt: new Date().toISOString(),
      };
      
      storage.saveProject(refreshingProject);
      setSelectedProject(refreshingProject);
      
      const accessToken = storage.getAccessToken();
      if (!accessToken) {
        toast.error('Session Expired', {
          description: 'Please sign in again to continue.'
        });
        onNavigate?.(SCREENS.SIGN_IN);
        return;
      }
      
      // Call backend API to refresh project
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cf9a9609/projects/refresh`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectId: selectedProject.id,
            brandName: selectedProject.name,
            market: selectedProject.market,
            language: selectedProject.language,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Refresh failed:', errorData);
        toast.error('Refresh Failed', {
          description: errorData.error || 'Could not refresh project data. Please try again.'
        });
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success('Refresh Started', {
          description: 'Your brand analysis is being updated. This usually takes 2-3 minutes.'
        });
        
        // Start polling for updates
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-cf9a9609/projects/${selectedProject.id}`,
              {
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                },
              }
            );
            
            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              
              if (statusData.data_status === 'ready') {
                clearInterval(pollInterval);
                
                // Update project with new data
                const updatedProject = {
                  ...selectedProject,
                  data: statusData.data,
                  dataStatus: 'ready',
                  lastRefreshAt: statusData.last_refreshed_at || new Date().toISOString(),
                };
                
                storage.saveProject(updatedProject);
                setSelectedProject(updatedProject);
                
                toast.success('Analysis Complete!', {
                  description: 'Your brand analysis has been updated successfully.'
                });
              }
            }
          } catch (error) {
            console.error('❌ Error polling for updates:', error);
          }
        }, 10000); // Poll every 10 seconds
        
        // Stop polling after 5 minutes
        setTimeout(() => {
          clearInterval(pollInterval);
        }, 300000);
      }
    } catch (error) {
      console.error('❌ Error during refresh:', error);
      toast.error('Refresh Failed', {
        description: 'Could not refresh project data. Please try again.'
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDataRecovery = async () => {
    console.log('🔧 Starting emergency data recovery...');
    
    try {
      const accessToken = storage.getAccessToken();
      if (!accessToken) {
        toast.error('Session Expired', {
          description: 'Please sign in again to recover data.'
        });
        onNavigate?.(SCREENS.SIGN_IN);
        return;
      }
      
      toast.info('Recovering Data', {
        description: 'Clearing corrupted data and reloading from server...'
      });
      
      // Clear all local storage
      storage.clearAll();
      
      // Fetch fresh data from backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cf9a9609/projects`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch projects from backend');
      }

      const data = await response.json();
      const backendProjects = data.projects || [];
      
      if (backendProjects.length === 0) {
        toast.info('No Projects Found', {
          description: 'No projects found in your account. Please create a new project.'
        });
        setShowDataCorruptionDialog(false);
        return;
      }
      
      // Convert backend format to frontend format
      const convertedProjects: Project[] = backendProjects.map((p: any) => ({
        id: p.id,
        name: p.name,
        market: p.market,
        language: p.language,
        timeframe: p.timeframe || 'Last 3 months',
        aiModel: p.ai_model || 'Chat GPT 4',
        createdAt: p.created_at,
        lastRefreshAt: p.last_refreshed_at || null,
        dataStatus: p.data_status || 'pending',
        data: null, // Will be loaded on demand
      }));
      
      // Save to storage
      storage.syncProjectsFromBackend(convertedProjects);
      
      // Update UI
      setProjects(convertedProjects);
      setSelectedProject(convertedProjects[0]);
      storage.setCurrentProject(convertedProjects[0]);
      
      toast.success('Data Recovered', {
        description: `Successfully loaded ${convertedProjects.length} project(s).`
      });
      
      setShowDataCorruptionDialog(false);
      
    } catch (error: any) {
      console.error('❌ Data recovery failed:', error);
      toast.error('Recovery Failed', {
        description: error.message || 'Please try signing out and in again.'
      });
    }
  };

  const dismissOnboardingBanner = () => {
    localStorage.setItem('onboarding_banner_dismissed', 'true');
    setShowOnboardingBanner(false);
  };

  const confirmLogout = () => {
    // Clear all storage data
    storage.clearAll();
    
    // Navigate back to landing page
    setShowLogoutDialog(false);
    onNavigate?.(SCREENS.LANDING);
  };
  
  const handleProjectDeleted = () => {
    // Reload projects from storage after deletion
    const updatedProjects = storage.getAllProjects();
    setProjects(updatedProjects);
    
    if (updatedProjects.length > 0) {
      // Select first project
      storage.setCurrentProject(updatedProjects[0]);
      setSelectedProject(updatedProjects[0]);
    } else {
      // No projects left, clear selection
      storage.clearCurrentProject();
      setSelectedProject(null);
    }
  };

  // Handle case when no project is selected
  if (!selectedProject) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
            <Binoculars className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-foreground tracking-tight mb-2 text-[18px] font-medium">
            No Project Selected
          </h3>
          <p className="text-muted-foreground tracking-tight text-[15px] mb-6">
            Please select a project to view the dashboard.
          </p>
          <button
            onClick={() => onNavigate?.(SCREENS.ONBOARDING_BRAND)}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Create Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar
        activeItem={activeItem}
        setActiveItem={setActiveItem}
        hoveredItem={hoveredItem}
        setHoveredItem={setHoveredItem}
        userEmail={userEmail}
        onLogout={() => setShowLogoutDialog(true)}
        projects={projects}
        selectedProject={selectedProject}
        onProjectSelect={(project) => {
          storage.setCurrentProject(project);
          setSelectedProject(project);
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header
          selectedProject={selectedProject}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
          onShowFeedback={() => setShowFeedbackDialog(true)}
          onShowDataRecovery={() => setShowDataCorruptionDialog(true)}
          showOnboardingBanner={showOnboardingBanner}
          onDismissOnboarding={dismissOnboardingBanner}
        />

        {/* Main Content */}
        <MainContent
          activeItem={activeItem}
          selectedProject={selectedProject}
          onNavigate={onNavigate}
          onDeleteProject={handleProjectDeleted}
        />
      </div>

      {/* Feedback Dialog */}
      <FeedbackDialog
        open={showFeedbackDialog}
        onOpenChange={setShowFeedbackDialog}
      />

      {/* Data Corruption Recovery Dialog */}
      <AlertDialog open={showDataCorruptionDialog} onOpenChange={setShowDataCorruptionDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Data Recovery Required</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              We detected corrupted data in your local storage. This can happen when:
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>LocalStorage has corrupt cached data</li>
                <li>Backend returned mismatched project data</li>
                <li>Session data is out of sync</li>
              </ul>
              <p className="mt-4 text-foreground/90">
                Would you like to <strong className="text-primary">clear all cached data</strong> and reload fresh data from the server?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-card border-border hover:bg-secondary/80">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDataRecovery}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Recover Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Log out of Brand Sense?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              You will be signed out of your account and redirected to the landing page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-card border-border hover:bg-secondary/80">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Log Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  );
}
