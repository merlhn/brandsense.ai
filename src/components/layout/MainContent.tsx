import { Project } from "../../lib/types";
import { KeywordAnalysis } from "../KeywordAnalysis";
import { BrandIdentity } from "../BrandIdentity";
import { SentimentAnalysis } from "../SentimentAnalysis";
import { Profile } from "../Profile";
import { ProjectSettings } from "../ProjectSettings";
import { AccountSettings } from "../AccountSettings";

interface MainContentProps {
  activeItem: string;
  selectedProject: Project | null;
  onNavigate?: (screen: string) => void;
  onDeleteProject?: () => void;
}

export function MainContent({
  activeItem,
  selectedProject,
  onNavigate,
  onDeleteProject
}: MainContentProps) {
  if (!selectedProject) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-foreground tracking-tight mb-2 text-[18px] font-medium">
            No Project Selected
          </h3>
          <p className="text-muted-foreground tracking-tight text-[15px]">
            Please select a project to view the dashboard.
          </p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
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
        if (!selectedProject) {
          return (
            <div className="min-h-screen bg-background flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📁</div>
                <h1 className="text-2xl font-bold text-foreground mb-2">No Project Selected</h1>
                <p className="text-muted-foreground mb-4">
                  Please create a project first to view its settings.
                </p>
                <button
                  onClick={() => onNavigate?.('onboarding-brand')}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Create Project
                </button>
              </div>
            </div>
          );
        }
        return (
          <ProjectSettings 
            onNavigate={onNavigate} 
            onDeleteProject={onDeleteProject}
            selectedProject={selectedProject}
          />
        );
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
