import { useState } from "react";
import { motion } from "motion/react";
import { 
  BarChart3, 
  MessageSquare,
  Settings,
  User,
  ChevronRight,
  Binoculars,
  LogOut,
  Fingerprint
} from "lucide-react";
import { Project } from "../../lib/types";
import { storage } from "../../lib/storage";

interface SidebarProps {
  activeItem: string;
  setActiveItem: (item: string) => void;
  hoveredItem: string | null;
  setHoveredItem: (item: string | null) => void;
  userEmail: string;
  onLogout: () => void;
  projects: Project[];
  selectedProject: Project | null;
  onProjectSelect: (project: Project) => void;
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

export function Sidebar({
  activeItem,
  setActiveItem,
  hoveredItem,
  setHoveredItem,
  userEmail,
  onLogout,
  projects,
  selectedProject,
  onProjectSelect
}: SidebarProps) {
  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Binoculars className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-foreground tracking-tight text-[15px] font-semibold">
              Brand Sense
            </h1>
            <p className="text-muted-foreground tracking-tight text-[11px]">
              Brand Monitoring
            </p>
          </div>
        </div>
      </div>

      {/* Project Selector */}
      <div className="p-4 border-b border-border/50">
        <div className="space-y-2">
          <p className="text-muted-foreground tracking-tight text-[11px] font-medium uppercase">
            Current Project
          </p>
          {selectedProject ? (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-foreground tracking-tight text-[13px] font-medium truncate">
                {selectedProject.name}
              </p>
              <p className="text-muted-foreground tracking-tight text-[11px]">
                {selectedProject.market} • {selectedProject.language}
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-muted-foreground tracking-tight text-[13px]">
                No project selected
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        {/* Dashboard Items */}
        <div className="p-4">
          <p className="text-muted-foreground tracking-tight text-[11px] font-medium uppercase mb-3">
            Dashboard
          </p>
          <nav className="space-y-0.5">
            {dashboards.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveItem(item.id)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`
                    w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all duration-150
                    ${isActive 
                      ? 'bg-primary/10 text-primary border border-primary/20' 
                      : 'text-sidebar-foreground/70 hover:text-foreground hover:bg-secondary/80'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="tracking-tight truncate font-medium">
                    {item.label}
                  </span>
                  <ChevronRight 
                    className={`
                      w-3.5 h-3.5 ml-auto shrink-0 transition-all duration-150
                      ${hoveredItem === item.id ? "opacity-70 translate-x-0" : "opacity-0 -translate-x-1"}
                    `}
                  />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Project Items */}
        {selectedProject && (
          <div className="p-4 border-t border-border/50">
            <p className="text-muted-foreground tracking-tight text-[11px] font-medium uppercase mb-3">
              Project
            </p>
            <nav className="space-y-0.5">
              {projectItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveItem(item.id)}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`
                      w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all duration-150
                      ${isActive 
                        ? 'bg-primary/10 text-primary border border-primary/20' 
                        : 'text-sidebar-foreground/70 hover:text-foreground hover:bg-secondary/80'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="tracking-tight truncate font-medium">
                      {item.label}
                    </span>
                    <ChevronRight 
                      className={`
                        w-3.5 h-3.5 ml-auto shrink-0 transition-all duration-150
                        ${hoveredItem === item.id ? "opacity-70 translate-x-0" : "opacity-0 -translate-x-1"}
                      `}
                    />
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Account Items */}
        <div className="p-4 border-t border-border/50">
          <p className="text-muted-foreground tracking-tight text-[11px] font-medium uppercase mb-3">
            Account
          </p>
          <nav className="space-y-0.5">
            {accountItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveItem(item.id)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`
                    w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all duration-150
                    ${isActive 
                      ? 'bg-primary/10 text-primary border border-primary/20' 
                      : 'text-sidebar-foreground/70 hover:text-foreground hover:bg-secondary/80'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="tracking-tight truncate font-medium">
                    {item.label}</span>
                  <ChevronRight 
                    className={`
                      w-3.5 h-3.5 ml-auto shrink-0 transition-all duration-150
                      ${hoveredItem === item.id ? "opacity-70 translate-x-0" : "opacity-0 -translate-x-1"}
                    `}
                  />
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <span className="text-primary tracking-tight text-[12px] font-semibold">
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
        
        <nav className="mt-3">
          <button
            onClick={onLogout}
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
    </div>
  );
}
