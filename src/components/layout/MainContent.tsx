import { Project } from "../../lib/types";
import { KeywordAnalysis } from "../KeywordAnalysis";
import { BrandIdentity } from "../BrandIdentity";
import { SentimentAnalysis } from "../SentimentAnalysis";
import { Profile } from "../Profile";
import { ProjectSettings } from "../ProjectSettings";
import { AccountSettings } from "../AccountSettings";

interface MainContentProps {
  activeItem: string;
  selectedProject: Project;
  onNavigate?: (screen: string) => void;
  onDeleteProject?: () => void;
}

export function MainContent({
  activeItem,
  selectedProject,
  onNavigate,
  onDeleteProject
}: MainContentProps) {
  console.log('🔍 MainContent - activeItem:', activeItem);
  console.log('🔍 MainContent - selectedProject:', selectedProject ? 'Present' : 'Missing');
  console.log('🔍 MainContent - selectedProject ID:', selectedProject?.id);

  const renderContent = () => {
    console.log('🔍 MainContent - Rendering content for activeItem:', activeItem);
    switch (activeItem) {
      case 'identity':
        return <BrandIdentity project={selectedProject} />;
      case 'sentiment':
        return <SentimentAnalysis project={selectedProject} />;
      case 'keyword':
        return <KeywordAnalysis project={selectedProject} />;
      case 'profile':
        return <Profile onNavigate={onNavigate} />;
      case 'account-settings':
        return <AccountSettings onNavigate={onNavigate} />;
      case 'project-settings':
        console.log('🔍 MainContent - Rendering ProjectSettings');
        try {
          return (
            <ProjectSettings 
              onNavigate={onNavigate} 
              onDeleteProject={onDeleteProject}
              selectedProject={selectedProject}
            />
          );
        } catch (error) {
          console.error('❌ MainContent - Error rendering ProjectSettings:', error);
          return (
            <div className="min-h-screen bg-background flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Error Loading Project Settings</h1>
                <p className="text-muted-foreground mb-4">
                  There was an error loading the project settings page.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Reload Page
                </button>
              </div>
            </div>
          );
        }
      default:
        return <BrandIdentity project={selectedProject} />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className={activeItem === 'profile' || activeItem === 'account-settings' || activeItem === 'project-settings' ? '' : 'p-8'}>
        <div className={activeItem === 'profile' || activeItem === 'account-settings' || activeItem === 'project-settings' ? '' : 'max-w-[1400px] mx-auto space-y-8'}>
          {/* Project Data Details - Only show for dashboards */}
          {activeItem !== 'profile' && activeItem !== 'account-settings' && activeItem !== 'project-settings' && (
            <div className="grid grid-cols-5 gap-3">
              <div className="px-3 py-2 rounded-lg border border-border/50 bg-card/50">
                <p className="text-muted-foreground/60 mb-0.5 tracking-tight text-[11px]">Brand Name</p>
                <p className="text-foreground tracking-tight text-[13px] font-medium">{selectedProject.name}</p>
              </div>
              <div className="px-3 py-2 rounded-lg border border-border/50 bg-card/50">
                <p className="text-muted-foreground/60 mb-0.5 tracking-tight text-[11px]">Analyzed Market</p>
                <p className="text-foreground tracking-tight text-[13px] font-medium">{selectedProject.market}</p>
              </div>
              <div className="px-3 py-2 rounded-lg border border-border/50 bg-card/50">
                <p className="text-muted-foreground/60 mb-0.5 tracking-tight text-[11px]">Audience Language</p>
                <p className="text-foreground tracking-tight text-[13px] font-medium">{selectedProject.language}</p>
              </div>
              <div className="px-3 py-2 rounded-lg border border-border/50 bg-card/50">
                <p className="text-muted-foreground/60 mb-0.5 tracking-tight text-[11px]">Report Timeframe</p>
                <p className="text-foreground tracking-tight text-[13px] font-medium">{selectedProject.timeframe}</p>
              </div>
              <div className="px-3 py-2 rounded-lg border border-border/50 bg-card/50">
                <p className="text-muted-foreground/60 mb-0.5 tracking-tight text-[11px]">AI Model</p>
                <p className="text-foreground tracking-tight text-[13px] font-medium">{selectedProject.aiModel}</p>
              </div>
            </div>
          )}
          
          {/* Main Content */}
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
