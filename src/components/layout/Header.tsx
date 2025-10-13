import { useState } from "react";
import { motion } from "motion/react";
import { RefreshCw, ChevronDown, X, Sparkles } from "lucide-react";
import { Project } from "../../lib/types";

interface HeaderProps {
  selectedProject: Project | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  onShowFeedback: () => void;
  onShowDataRecovery: () => void;
  showOnboardingBanner: boolean;
  onDismissOnboarding: () => void;
}

export function Header({
  selectedProject,
  isRefreshing,
  onRefresh,
  onShowFeedback,
  onShowDataRecovery,
  showOnboardingBanner,
  onDismissOnboarding
}: HeaderProps) {
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  return (
    <>
      {/* Header */}
      <header className="bg-card border-b border-border/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 flex items-center justify-center">
              {/* Placeholder for alignment */}
            </div>
            <div>
              <h2 className="text-foreground tracking-tight text-[14px] font-semibold">
                {selectedProject ? selectedProject.name : 'Dashboard'}
              </h2>
            {selectedProject && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-[10px]">•</span>
                <span className="text-[10px]">{selectedProject.market}</span>
                <span className="text-[10px]">•</span>
                <span className="text-[10px]">{selectedProject.language}</span>
              </div>
            )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onShowFeedback}
              className="px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors text-[13px]"
            >
              Feedback
            </button>
            
            {selectedProject && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors text-[13px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Onboarding Banner */}
      {showOnboardingBanner && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/5 border-b border-primary/20 px-6 py-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-foreground tracking-tight mb-1 text-[15px] font-medium">
                Welcome to Brand Sense! 🎉
              </h3>
              <p className="text-muted-foreground tracking-tight text-[13px] leading-relaxed mb-3">
                Your brand analysis is being prepared. This usually takes 2-3 minutes. 
                You can explore the dashboard while we work, or check back in a few minutes.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={onRefresh}
                  className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors text-[13px] flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Check Status
                </button>
                <button
                  onClick={onShowFeedback}
                  className="px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors text-[13px]"
                >
                  Get Help
                </button>
              </div>
            </div>
            <button
              onClick={onDismissOnboarding}
              className="w-6 h-6 rounded-lg bg-secondary/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
}
