import { useState } from "react";
import { motion } from "motion/react";
import { Globe, MessageSquare, FileText, Calendar, RefreshCw, Cpu, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Project } from "../lib/types";
import { storage } from "../lib/storage";
import { API_CONFIG } from "../lib/api";
import { toast } from "sonner@2.0.3";

interface ProjectSettingsProps {
  onNavigate?: (screen: string) => void;
  onDeleteProject?: () => void;
  onProjectUpdated?: (project: Project) => void;
  selectedProject: Project;
}

const markets = [
  { value: "turkey", label: "Türkiye" },
  { value: "usa", label: "United States" },
  { value: "uk", label: "United Kingdom" },
  { value: "germany", label: "Germany" },
  { value: "france", label: "France" },
  { value: "spain", label: "Spain" },
  { value: "italy", label: "Italy" },
  { value: "japan", label: "Japan" },
  { value: "china", label: "China" },
  { value: "brazil", label: "Brazil" },
];

const languages = [
  { value: "turkish", label: "Turkish" },
  { value: "english", label: "English" },
  { value: "german", label: "German" },
  { value: "french", label: "French" },
  { value: "spanish", label: "Spanish" },
  { value: "italian", label: "Italian" },
  { value: "japanese", label: "Japanese" },
  { value: "chinese", label: "Chinese" },
  { value: "portuguese", label: "Portuguese" },
];

export function ProjectSettings({ onNavigate, onDeleteProject, onProjectUpdated, selectedProject }: ProjectSettingsProps) {
  console.log('🔍 ProjectSettings - Component mounted');
  console.log('🔍 ProjectSettings - selectedProject:', selectedProject ? 'Present' : 'Missing');
  console.log('🔍 ProjectSettings - selectedProject ID:', selectedProject?.id);
  console.log('🔍 ProjectSettings - selectedProject name:', selectedProject?.name);
  
  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Project Settings is now read-only - no editing state needed

  // No form data initialization needed for read-only view


  // Convert market and language from display format to select values for display
  const marketValueMap: Record<string, string> = {
    "Türkiye": "turkey",
    "United States": "usa",
    "United Kingdom": "uk",
    "Germany": "germany",
    "France": "france",
    "Spain": "spain",
    "Italy": "italy",
    "Japan": "japan",
    "China": "china",
    "Brazil": "brazil"
  };
  
  const languageValueMap: Record<string, string> = {
    "Turkish": "turkish",
    "English": "english",
    "German": "german",
    "French": "french",
    "Spanish": "spanish",
    "Italian": "italian",
    "Japanese": "japanese",
    "Chinese": "chinese",
    "Portuguese": "portuguese"
  };

  // Read-only project details
  const brandName = selectedProject?.name || "Nike";
  const market = selectedProject ? (marketValueMap[selectedProject.market] || "turkey") : "turkey";
  const language = selectedProject ? (languageValueMap[selectedProject.language] || "turkish") : "turkish";
  const description = selectedProject?.description || 
    `Comprehensive brand monitoring and sentiment analysis for ${selectedProject?.name || "Nike"} in the ${selectedProject?.market || "Turkish market"}.`;
  
  const createdDate = selectedProject?.createdAt 
    ? new Date(selectedProject.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : "January 15, 2025";
  const lastUpdated = selectedProject?.lastRefreshAt 
    ? new Date(selectedProject.lastRefreshAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : "February 28, 2025";
  const aiModel = selectedProject?.aiModel || "GPT-4o";

  // No save function needed for read-only view

  // No cancel function needed for read-only view

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    
    try {
      // Show loading state
      setIsDeleting(true);
      
      // 1. HARD DELETE from backend first
      const accessToken = storage.getAccessToken();
      if (!accessToken) {
        toast.error('Session expired. Please sign in again.');
        setIsDeleting(false);
        return;
      }
      
      console.log('🗑️ Hard deleting project from backend...');
      console.log('   Project ID:', selectedProject.id);
      console.log('   Project Name:', selectedProject.name);
      
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECTS.GET(selectedProject.id)}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Backend delete failed:', response.status, errorData);
        
        // Handle 404 - project already deleted from backend
        if (response.status === 404) {
          console.log('⚠️ Project already deleted from backend, cleaning localStorage...');
          toast.info('Project already deleted', {
            description: 'Removing from local storage...'
          });
        } else {
          throw new Error(errorData.error || errorData.message || 'Failed to delete project from backend');
        }
      } else {
        console.log('✅ Project deleted from backend successfully');
      }
      
      // 2. Delete from localStorage
      console.log('🧹 Removing project from localStorage...');
      storage.deleteProject(selectedProject.id);
      
      // 3. Get remaining projects
      const remainingProjects = storage.getAllProjects();
      console.log(`   Remaining projects: ${remainingProjects.length}`);
      
      // 4. If there are remaining projects, select the first one
      if (remainingProjects.length > 0) {
        storage.setCurrentProject(remainingProjects[0]);
      }
      
      // 5. Reset confirmation input
      setDeleteConfirmation("");
      
      // 6. Show success message
      toast.success('Project Deleted', {
        description: `"${selectedProject.name}" has been permanently deleted.`
      });
      
      console.log('✅ Hard delete complete');
      
      // 7. Call parent handler which will reload projects and navigate
      setIsDeleting(false);
      onDeleteProject?.();
      
    } catch (error: any) {
      console.error('❌ Error during hard delete:', error);
      setIsDeleting(false);
      
      toast.error('Delete Failed', {
        description: error.message || 'Could not delete project. Please try again.'
      });
      
      // Don't close dialog on error - user can retry
    }
  };

  return (
    <div className="min-h-full bg-background relative">
      {/* Loading Overlay - Block all interaction during delete */}
      {isDeleting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-lg p-8 flex flex-col items-center gap-4"
          >
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            <div className="text-center">
              <h3 className="text-foreground tracking-tight mb-1">Deleting Project</h3>
              <p className="text-muted-foreground tracking-tight">
                Removing project from database...
              </p>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Header */}
      <div className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-foreground tracking-tight mb-1">Project Settings</h1>
              <p className="text-muted-foreground tracking-tight">
                View your project configuration and details
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="space-y-8">
          {/* Project Information */}
          <section className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-foreground tracking-tight mb-1">Project Information</h2>
                <p className="text-muted-foreground tracking-tight">
                  View your project details and configuration
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Brand Name & Market - Combined Display */}
              <div className="space-y-2">
                <Label className="text-foreground">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Project Name
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="brandName" className="text-muted-foreground">
                      Brand Name
                    </Label>
                    <div className="h-11 px-4 rounded-md bg-input-background border border-border flex items-center text-foreground">
                      {brandName}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="market" className="text-muted-foreground">
                      Market
                    </Label>
                    <div className="h-11 px-4 rounded-md bg-input-background border border-border flex items-center text-foreground">
                      {markets.find(m => m.value === market)?.label || "Türkiye"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Language */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-foreground">
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    Language
                  </Label>
                  <div className="h-11 px-4 rounded-md bg-input-background border border-border flex items-center text-foreground">
                    {languages.find(l => l.value === language)?.label || "Turkish"}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">
                  Description
                </Label>
                <div className="min-h-[100px] px-4 py-3 rounded-md bg-input-background border border-border text-foreground">
                  {description}
                </div>
              </div>
            </div>
          </section>

          {/* Project Details */}
          <section className="bg-card border border-border rounded-lg p-6">
            <div className="mb-6">
              <h2 className="text-foreground tracking-tight mb-1">Project Details</h2>
              <p className="text-muted-foreground tracking-tight">
                Read-only information about your project
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Created Date
                </Label>
                <div className="h-11 px-4 rounded-md bg-input-background border border-border flex items-center text-muted-foreground">
                  {createdDate}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Last Updated
                </Label>
                <div className="h-11 px-4 rounded-md bg-input-background border border-border flex items-center text-muted-foreground">
                  {lastUpdated}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  AI Model
                </Label>
                <div className="h-11 px-4 rounded-md bg-input-background border border-border flex items-center text-muted-foreground">
                  {aiModel}
                </div>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="bg-card border border-destructive/50 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-destructive tracking-tight mb-1">Danger Zone</h2>
                <p className="text-muted-foreground tracking-tight mb-6">
                  Irreversible and destructive actions
                </p>

                <div className="flex items-start justify-between border border-border rounded-lg p-4">
                  <div>
                    <h3 className="text-foreground tracking-tight mb-1">Delete this project</h3>
                    <p className="text-muted-foreground tracking-tight">
                      <span className="text-destructive font-medium">Hard delete</span> - Once deleted, there is no going back. 
                      All project data and ChatGPT analysis will be permanently removed from the database.
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="ml-4 h-9 px-4 bg-card border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-1.5" />
                        Delete Project
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-foreground">
                          Permanently delete "{brandName} - {markets.find(m => m.value === market)?.label}"?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                          ⚠️ This is a <span className="text-destructive font-medium">hard delete</span> and cannot be undone. 
                          This will permanently delete your project and remove all associated data 
                          from our servers, including all ChatGPT analysis results.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      
                      <div className="space-y-2 pt-4">
                        <Label htmlFor="deleteConfirmation" className="text-foreground tracking-tight">
                          To confirm, type <span className="text-destructive font-medium">delete</span> below:
                        </Label>
                        <Input
                          id="deleteConfirmation"
                          value={deleteConfirmation}
                          onChange={(e) => setDeleteConfirmation(e.target.value)}
                          placeholder="Type 'delete' to confirm"
                          className="h-11 bg-input-background border-border"
                          autoComplete="off"
                        />
                      </div>
                      
                      <AlertDialogFooter>
                        <AlertDialogCancel 
                          className="bg-card border-border hover:bg-secondary/80"
                          onClick={() => setDeleteConfirmation("")}
                        >
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteProject}
                          disabled={deleteConfirmation !== "delete"}
                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Delete Project
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      
    </div>
  );
}
