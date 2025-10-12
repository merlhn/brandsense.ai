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

const dashboards = [
  { id: "identity", label: "Brand Identity", icon: Fingerprint },
  { id: "sentiment", label: "Sentiment Analysis", icon: MessageSquare },
  { id: "keyword", label: "Keyword Analysis", icon: BarChart3 },
];

const accountItems = [
  { id: "profile", label: "Profile", icon: User },
  { id: "account-settings", label: "Settings", icon: Settings },
];

const projectItems = [
  { id: "project-settings", label: "Project Settings", icon: Settings },
];

export function DashboardLayout({ onNavigate }: DashboardLayoutProps) {
  const [activeItem, setActiveItem] = useState("identity");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDataCorruptionDialog, setShowDataCorruptionDialog] = useState(false);
  const [userEmail, setUserEmail] = useState(storage.getUserEmail() || '');
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
      if (email) {
        setUserEmail(email);
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
          const backendProjectIds = new Set(backendProjects.map((p: any) => p.id));
          
          // Find projects that exist in localStorage but not in backend
          const invalidProjects = localProjects.filter(p => !backendProjectIds.has(p.id));
          
          if (invalidProjects.length > 0) {
            console.log(`🧹 Found ${invalidProjects.length} invalid projects, cleaning up...`);
            invalidProjects.forEach(p => {
              console.log(`  - Removing: ${p.name} (${p.id})`);
              storage.deleteProject(p.id);
            });
            
            // Refresh project list
            const updatedProjects = storage.getAllProjects();
            setProjects(updatedProjects);
            
            // Update selected project if it was deleted
            if (selectedProject && invalidProjects.some(p => p.id === selectedProject.id)) {
              if (updatedProjects.length > 0) {
                setSelectedProject(updatedProjects[0]);
                storage.setCurrentProject(updatedProjects[0]);
              } else {
                setSelectedProject(null);
                storage.clearCurrentProject();
              }
            }
          } else {
            console.log('✅ All local projects are valid');
          }
        }
      } catch (error) {
        console.error('⚠️ Failed to validate projects:', error);
      }
    };

    validateProjects();
  }, []); // Run once on mount
  
  // Persist selected project when it changes
  useEffect(() => {
    if (selectedProject) {
      storage.setCurrentProject(selectedProject);
    }
  }, [selectedProject]);

  // Auto-dismiss onboarding banner when data becomes ready
  useEffect(() => {
    if (selectedProject?.dataStatus === 'ready' && showOnboardingBanner) {
      // Wait a bit to let the user see the success state
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
      const updatedProjects = storage.getAllProjects();
      setProjects(updatedProjects);
      if (updatedProjects.length > 0) {
        setSelectedProject(updatedProjects[0]);
        storage.setCurrentProject(updatedProjects[0]);
      } else {
        setSelectedProject(null);
        storage.clearCurrentProject();
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
          let errorData: any = {};
          try {
            errorData = await response.json();
          } catch (e) {
            // Response is not JSON
            errorData = { error: response.statusText || 'Network error' };
          }
          console.error('❌ Failed to fetch project data:', response.status, errorData);
          
          // Handle 404 - Project not found in backend
          if (response.status === 404) {
            console.log('🧹 Project not found in backend, removing from localStorage:', selectedProject.id);
            toast.error('Project Not Found', {
              description: 'This project no longer exists. It has been removed.'
            });
            
            storage.deleteProject(selectedProject.id);
            
            // Reload projects
            const updatedProjects = storage.getAllProjects();
            setProjects(updatedProjects);
            
            // Select first valid project
            if (updatedProjects.length > 0) {
              setSelectedProject(updatedProjects[0]);
              storage.setCurrentProject(updatedProjects[0]);
            } else {
              setSelectedProject(null);
              storage.clearCurrentProject();
            }
            return;
          }
          
          // Check if UUID error
          const errorString = JSON.stringify(errorData);
          const isUUIDError = 
            errorData.details?.includes('uuid') || 
            errorData.details?.includes('UUID') ||
            errorData.details?.includes('22P02') ||
            errorData.error?.includes('uuid') ||
            errorData.error?.includes('UUID') ||
            errorData.error?.includes('22P02') ||
            errorString.includes('uuid') ||
            errorString.includes('UUID') ||
            errorString.includes('22P02');
          
          if (isUUIDError) {
            console.log('🧹 Removing legacy project with invalid UUID:', selectedProject.id);
            storage.deleteProject(selectedProject.id);
            
            // Reload projects
            const updatedProjects = storage.getAllProjects();
            setProjects(updatedProjects);
            
            // Select first valid project if available
            if (updatedProjects.length > 0) {
              setSelectedProject(updatedProjects[0]);
              storage.setCurrentProject(updatedProjects[0]);
            } else {
              setSelectedProject(null);
              storage.clearCurrentProject();
            }
          }
          return;
        }
        
        // Parse successful response
        let data;
        try {
          data = await response.json();
          console.log('✅ Project data fetched successfully:', data);
        } catch (e) {
          console.error('❌ Failed to parse project data as JSON:', e);
          return;
        }
        
        // Update local storage with backend data
        if (data.data) {
          const previousStatus = selectedProject.dataStatus;
          
          storage.updateProjectData(selectedProject.id, data.data);
          
          // Update project status
          if (data.project.data_status) {
            storage.updateProjectStatus(selectedProject.id, data.project.data_status);
          }
          
          // Refresh selected project
          const updatedProject = storage.getProject(selectedProject.id);
          if (updatedProject) {
            setSelectedProject(updatedProject);
            
            // Show success toast when status changes from processing to ready
            if (previousStatus === 'processing' && data.project.data_status === 'ready') {
              console.log('✅ Analysis complete! Data is ready.');
              toast.success('Analysis Complete', {
                description: `${selectedProject.name} brand data is now ready!`
              });
            }
          }
        }
      } catch (error: any) {
        console.error('❌ Error fetching project data:', error);
      }
    };
    
    // ONLY poll for updates if project is processing
    // Don't fetch on initial load - only when actively processing
    let pollInterval: NodeJS.Timeout | null = null;
    
    if (selectedProject.dataStatus === 'processing') {
      console.log('🔄 Project is processing - starting automatic polling every 3 seconds...');
      
      // Initial fetch when processing starts
      fetchProjectData();
      
      // Then poll every 3 seconds
      pollInterval = setInterval(() => {
        console.log('🔄 Polling for project updates...');
        fetchProjectData();
      }, 3000);
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
      // Validate project ID is a UUID before making API call
      if (!storage.isValidUUID(selectedProject.id)) {
        console.error('🚨 Invalid project UUID format:', selectedProject.id);
        throw new Error('Invalid UUID format - legacy project needs to be removed');
      }
      
      storage.markProjectRefreshing(selectedProject.id);
      
      console.log("🔄 Starting dashboard refresh for:", selectedProject.name);
      
      const accessToken = storage.getAccessToken();
      if (!accessToken) {
        logger.error('No access token during refresh - redirecting to sign in');
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
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            projectId: selectedProject.id,
          }),
        }
      );
      
      // Check if response is OK before trying to parse JSON
      if (!response.ok) {
        let errorMessage = `Failed to refresh (${response.status})`;
        try {
          const data = await response.json();
          errorMessage = data.error || data.message || errorMessage;
        } catch (e) {
          // Response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      // Parse successful response
      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error('Failed to parse refresh response as JSON:', e);
        throw new Error('Invalid response from server');
      }
      
      console.log("✅ Refresh started, waiting for analysis...");
      toast.success('Dashboard refresh started', {
        description: 'Analyzing brand data with ChatGPT...'
      });
      
      // Update status to processing
      storage.updateProjectStatus(selectedProject.id, 'processing');
      const updatedProject = storage.getProject(selectedProject.id);
      if (updatedProject) {
        setSelectedProject(updatedProject);
      }
      
    } catch (error: any) {
      console.error("❌ Refresh error:", error);
      
      // Check if this is a legacy project with invalid UUID
      const errorString = JSON.stringify(error);
      const isUUIDError = 
        error.message?.includes('uuid') || 
        error.message?.includes('UUID') ||
        error.message?.includes('22P02') || // PostgreSQL invalid UUID error code
        error.message?.includes('Project not found') ||
        errorString.includes('uuid') ||
        errorString.includes('UUID') ||
        errorString.includes('22P02');
      
      if (isUUIDError) {
        console.log('🧹 Removing legacy project with invalid UUID:', selectedProject.id);
        toast.error('Invalid project removed', {
          description: 'Legacy project with invalid ID was cleaned up.'
        });
        storage.deleteProject(selectedProject.id);
        
        // Reload projects
        const updatedProjects = storage.getAllProjects();
        setProjects(updatedProjects);
        
        // Select first valid project if available
        if (updatedProjects.length > 0) {
          setSelectedProject(updatedProjects[0]);
          storage.setCurrentProject(updatedProjects[0]);
        } else {
          setSelectedProject(null);
          storage.clearCurrentProject();
        }
      } else {
        // Show user-friendly error message
        const errorMessage = error.message || 'Unknown error occurred';
        toast.error('Failed to refresh dashboard', {
          description: errorMessage.includes('Network') 
            ? 'Network connection failed. Please check your internet connection.' 
            : errorMessage
        });
        storage.updateProjectStatus(selectedProject.id, 'error', errorMessage);
      }
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
      
      // Clear all projects data but keep auth token
      storage.clearAllAndRestoreAuth(accessToken);
      
      // Reload projects from backend
      console.log('📡 Fetching fresh projects from backend...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cf9a9609/projects`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to load projects from server');
      }
      
      const data = await response.json();
      const backendProjects = data.projects || [];
      
      console.log(`✅ Loaded ${backendProjects.length} projects from backend`);
      
      if (backendProjects.length === 0) {
        toast.warning('No Projects Found', {
          description: 'Create a new project to get started.'
        });
        setProjects([]);
        setSelectedProject(null);
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
    
    // Select first project or set to null
    if (updatedProjects.length > 0) {
      setSelectedProject(updatedProjects[0]);
      storage.setCurrentProject(updatedProjects[0]);
    } else {
      // No projects left
      setSelectedProject(null);
    }
    
    // Navigate back to identity dashboard
    setActiveItem("identity");
  };

  // Handle case when no project is selected
  if (!selectedProject) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
            <Binoculars className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-foreground mb-3">No Projects Yet</h2>
          <p className="text-muted-foreground mb-8">
            Create your first project to start monitoring your brand's visibility in ChatGPT
          </p>
          <button
            onClick={() => onNavigate?.(SCREENS.CREATE_PROJECT)}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all duration-150 inline-flex items-center gap-2"
          >
            <span className="tracking-tight font-medium">Create Your First Project</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Get project data from selected project (guaranteed to exist after the check above)
  const brandName = selectedProject.name;
  const marketLabel = selectedProject.market;
  const language = selectedProject.language;
  const timeFrame = selectedProject.timeframe || 'Last 3 months';
  const aiModel = selectedProject.aiModel || 'GPT-4o';

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
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sidebar-foreground tracking-tight truncate text-[14px] font-medium">
                  Brand Sense
                </h3>
              </div>
            </div>
          </div>

          <Separator className="mb-3 bg-sidebar-border" />

          <div className="space-y-2">
            <p className="text-sidebar-foreground/50 tracking-tight uppercase text-[10px] font-medium px-1">
              Project Name
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full px-3 py-2.5 rounded-lg bg-sidebar-accent border border-sidebar-border hover:border-primary/30 transition-all duration-150 group">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sidebar-foreground tracking-tight truncate text-[13px] font-medium">
                        {brandName} · {marketLabel}
                      </p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-sidebar-foreground/50 group-hover:text-sidebar-foreground transition-colors shrink-0 ml-2" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="start" 
                className="w-[208px] bg-popover border-border"
              >
                {projects.map((project) => (
                  <DropdownMenuItem
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className="cursor-pointer"
                  >
                    <div className="flex-1">
                      <p className="text-[14px] font-medium tracking-tight">{project.name} · {project.market}</p>
                    </div>
                    {selectedProject?.id === project.id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary ml-2" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Project Settings - Directly below dropdown */}
          <nav className="space-y-0.5 mt-3">
            {projectItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              const isHovered = hoveredItem === item.id;

              return (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveItem(item.id)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`
                    w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px]
                    transition-all duration-150 relative group
                    ${isActive 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                    }
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeProjectTab"
                      className="absolute inset-0 bg-sidebar-accent rounded-lg border border-sidebar-border/50"
                      transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10 shrink-0" />
                  <span className="relative z-10 tracking-tight truncate font-medium">{item.label}</span>
                  <ChevronRight 
                    className={`
                      w-3.5 h-3.5 ml-auto relative z-10 shrink-0
                      transition-all duration-150
                      ${isActive || isHovered ? "opacity-70 translate-x-0" : "opacity-0 -translate-x-1"}
                    `}
                  />
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          {/* Dashboards */}
          <div className="mb-6">
            <p className="px-2 mb-2 text-sidebar-foreground/50 tracking-tight uppercase text-[10px] font-medium">
              Dashboards
            </p>
            <nav className="space-y-0.5">
              {dashboards.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.id;
                const isHovered = hoveredItem === item.id;

                return (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveItem(item.id)}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`
                      w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg
                      transition-all duration-150 relative group text-[13px]
                      ${isActive 
                        ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                      }
                    `}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-sidebar-accent rounded-lg border border-sidebar-border/50"
                        transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
                      />
                    )}
                    <Icon className="w-4 h-4 relative z-10 shrink-0" />
                    <span className="relative z-10 tracking-tight truncate font-medium">
                      {item.label}
                    </span>
                    <ChevronRight 
                      className={`
                        w-3.5 h-3.5 ml-auto relative z-10 shrink-0
                        transition-all duration-150
                        ${isActive || isHovered ? "opacity-70 translate-x-0" : "opacity-0 -translate-x-1"}
                      `}
                    />
                  </motion.button>
                );
              })}
            </nav>
          </div>

        </div>

        {/* User Profile & Account Section - Bottom */}
        <div className="mt-auto border-t border-sidebar-border p-3">
          {/* User Info */}
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <span className="text-primary tracking-tight text-[12px] font-medium">
                {(() => {
                  if (userEmail) {
                    const localPart = userEmail.split('@')[0];
                    const parts = localPart.split('.');
                    if (parts.length >= 2) {
                      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
                    }
                    return localPart.substring(0, 2).toUpperCase();
                  }
                  return 'US';
                })()}
              </span>
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sidebar-foreground tracking-tight truncate text-[13px] font-medium">
                {userEmail || 'Sign in to continue'}
              </p>
            </div>
          </div>
          
          {/* Account Menu Items */}
          <nav className="space-y-0.5">
            {accountItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              const isHovered = hoveredItem === item.id;

              return (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveItem(item.id)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`
                    w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px]
                    transition-all duration-150 relative group
                    ${isActive 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                    }
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeAccountTab"
                      className="absolute inset-0 bg-sidebar-accent rounded-lg border border-sidebar-border/50"
                      transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10 shrink-0" />
                  <span className="relative z-10 tracking-tight truncate font-medium">{item.label}</span>
                  <ChevronRight 
                    className={`
                      w-3.5 h-3.5 ml-auto relative z-10 shrink-0
                      transition-all duration-150
                      ${isActive || isHovered ? "opacity-70 translate-x-0" : "opacity-0 -translate-x-1"}
                    `}
                  />
                </motion.button>
              );
            })}
            
            {/* Logout Button */}
            <button
              onClick={() => setShowLogoutDialog(true)}
              onMouseEnter={() => setHoveredItem('logout')}
              onMouseLeave={() => setHoveredItem(null)}
              className="
                w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px]
                text-sidebar-foreground/70 hover:text-destructive
                hover:bg-destructive/10 transition-all duration-150 group
              "
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span className="tracking-tight truncate font-medium">Log Out</span>
              <ChevronRight 
                className={`
                  w-3.5 h-3.5 ml-auto shrink-0
                  transition-all duration-150
                  ${hoveredItem === 'logout' ? "opacity-70 translate-x-0" : "opacity-0 -translate-x-1"}
                `}
              />
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative">
        
        {/* Top Navigation Bar - Only show for dashboards, not for account pages */}
        {activeItem !== 'profile' && activeItem !== 'account-settings' && activeItem !== 'project-settings' && (
          <header className="h-[72px] border-b border-border bg-background sticky top-0 z-10">
            <div className="h-full px-8 flex items-center justify-between">
              <div>
                <h1 className="text-foreground tracking-tight text-[20px] font-medium">
                  {dashboards.find(d => d.id === activeItem)?.label}
                </h1>
              </div>
              <div className="flex items-center gap-4">
                {selectedProject?.lastRefreshAt && (
                  <div className="text-muted-foreground tracking-tight text-[13px]">
                    Last updated: {new Date(selectedProject.lastRefreshAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                )}
                <button 
                  onClick={() => setShowFeedbackDialog(true)}
                  className="px-4 py-2 rounded-lg bg-card border border-border text-foreground hover:bg-secondary/80 transition-all duration-150 tracking-tight flex items-center gap-2 text-[14px] font-medium"
                >
                  <MessageSquare className="w-4 h-4" />
                  Share Feedback
                </button>
                <div className="relative">
                  <button 
                    onClick={handleRefresh}
                    disabled={isRefreshing || !selectedProject}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-150 tracking-tight disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-[14px] font-medium"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh Dashboard'}
                  </button>
                  {/* Pulse indicator when data is pending/processing */}
                  {(selectedProject?.dataStatus === 'pending' || selectedProject?.dataStatus === 'processing') && !isRefreshing && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vercel-green opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-vercel-green"></span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Onboarding Banner - Show when data is pending/processing and banner not dismissed */}
        {showOnboardingBanner && 
         (selectedProject?.dataStatus === 'pending' || selectedProject?.dataStatus === 'processing') &&
         activeItem !== 'profile' && 
         activeItem !== 'account-settings' && 
         activeItem !== 'project-settings' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-8 mt-8 mb-0"
          >
            <div className="relative overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 backdrop-blur-sm">
              <div className="px-6 py-4 flex items-center gap-4">
                {/* Icon */}
                <div className="shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-foreground tracking-tight text-[15px] font-medium">
                      {selectedProject?.dataStatus === 'processing' 
                        ? 'Your Analysis is Being Processed'
                        : 'Welcome to Brand Sense!'}
                    </h3>
                    {selectedProject?.dataStatus === 'processing' && (
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '300ms' }} />
                      </div>
                    )}
                  </div>
                  <p className="text-muted-foreground tracking-tight text-[13px]">
                    {selectedProject?.dataStatus === 'processing' 
                      ? 'ChatGPT is analyzing your brand data. This usually takes 2-3 minutes. Click Refresh to check if your data is ready.'
                      : 'Your brand analysis will be ready in a few minutes. Click the Refresh Dashboard button to load your data when ready.'}
                  </p>
                </div>

                {/* CTA */}
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="shrink-0 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-150 tracking-tight disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-[14px] font-medium group"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-300'}`} />
                  {isRefreshing ? 'Checking...' : 'Refresh Now'}
                  {!isRefreshing && <ArrowRight className="w-4 h-4" />}
                </button>

                {/* Dismiss Button */}
                <button
                  onClick={dismissOnboardingBanner}
                  className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-150"
                  aria-label="Dismiss banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Animated gradient border effect */}
              <div className="absolute inset-0 rounded-lg border border-primary/20 pointer-events-none" />
            </div>
          </motion.div>
        )}

        {/* Dashboard Content */}
        <div className={activeItem === 'profile' || activeItem === 'account-settings' || activeItem === 'project-settings' ? '' : 'p-8'}>
          <div className={activeItem === 'profile' || activeItem === 'account-settings' || activeItem === 'project-settings' ? '' : 'max-w-[1400px] mx-auto space-y-8'}>
            {/* Project Data Details - Only show for dashboards */}
            {activeItem !== 'profile' && activeItem !== 'account-settings' && activeItem !== 'project-settings' && (
              <div className="grid grid-cols-5 gap-3">
                <div className="px-3 py-2 rounded-lg border border-border/50 bg-card/50">
                  <p className="text-muted-foreground/60 mb-0.5 tracking-tight text-[11px]">Brand Name</p>
                  <p className="text-foreground tracking-tight text-[13px] font-medium">{brandName}</p>
                </div>
                <div className="px-3 py-2 rounded-lg border border-border/50 bg-card/50">
                  <p className="text-muted-foreground/60 mb-0.5 tracking-tight text-[11px]">Analyzed Market</p>
                  <p className="text-foreground tracking-tight text-[13px] font-medium">{marketLabel}</p>
                </div>
                <div className="px-3 py-2 rounded-lg border border-border/50 bg-card/50">
                  <p className="text-muted-foreground/60 mb-0.5 tracking-tight text-[11px]">Audience Language</p>
                  <p className="text-foreground tracking-tight text-[13px] font-medium">{language}</p>
                </div>
                <div className="px-3 py-2 rounded-lg border border-border/50 bg-card/50">
                  <p className="text-muted-foreground/60 mb-0.5 tracking-tight text-[11px]">Report Timeframe</p>
                  <p className="text-foreground tracking-tight text-[13px] font-medium">{timeFrame}</p>
                </div>
                <div className="px-3 py-2 rounded-lg border border-border/50 bg-card/50">
                  <p className="text-muted-foreground/60 mb-0.5 tracking-tight text-[11px]">AI Model</p>
                  <p className="text-foreground tracking-tight text-[13px] font-medium">{aiModel}</p>
                </div>
              </div>
            )}



            {/* Dashboard Specific Content */}
            {activeItem === "keyword" && (
              <KeywordAnalysis 
                project={selectedProject}
              />
            )}
            {activeItem === "identity" && (
              <BrandIdentity 
                project={selectedProject}
              />
            )}
            {activeItem === "sentiment" && (
              <SentimentAnalysis 
                project={selectedProject}
              />
            )}
            {activeItem === "profile" && (
              <Profile onNavigate={onNavigate} />
            )}
            {activeItem === "account-settings" && (
              <AccountSettings onNavigate={onNavigate} />
            )}
            {activeItem === "project-settings" && (
              <ProjectSettings 
                onNavigate={onNavigate}
                selectedProject={selectedProject}
                onDeleteProject={handleProjectDeleted}
              />
            )}
          </div>
        </div>
      </main>

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

      {/* Feedback Dialog */}
      <FeedbackDialog 
        open={showFeedbackDialog}
        onOpenChange={setShowFeedbackDialog}
      />

      {/* Data Corruption Recovery Dialog */}
      <AlertDialog open={showDataCorruptionDialog} onOpenChange={setShowDataCorruptionDialog}>
        <AlertDialogContent className="bg-card border-destructive">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Data Corruption Detected</AlertDialogTitle>
            <AlertDialogDescription className="text-foreground/80">
              Multiple projects are showing incorrect data. This usually happens when:
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
            <AlertDialogCancel className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDataRecovery}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Clear & Reload Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toast Notifications */}
      <Toaster position="bottom-right" />
    </div>
  );
}