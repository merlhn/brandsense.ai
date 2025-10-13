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
  Fingerprint,
  Plus,
  Search,
  ChevronDown,
  ChevronUp
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
  onCreateProject: () => void;
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
  onProjectSelect,
  onCreateProject
}: SidebarProps) {
  // Search and pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);
  
  // Filter projects based on search term
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.market.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Show first 5 projects by default, or all if showAll is true
  const visibleProjects = showAll ? filteredProjects : filteredProjects.slice(0, 5);
  const hasMoreProjects = filteredProjects.length > 5;
  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Binoculars className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-foreground tracking-tight text-[14px] font-semibold">
              Brand Sense
            </h1>
            <p className="text-muted-foreground tracking-tight text-[10px]">
              Brand Monitoring
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Project Selector */}
        <div className="p-3 border-b border-border/50">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
            <p className="text-muted-foreground tracking-tight text-[10px] font-medium uppercase">
              Projects ({projects.length})
            </p>
              <button
                onClick={onCreateProject}
                className="h-5 px-2 text-[10px] bg-primary/10 text-primary border border-primary/20 rounded hover:bg-primary/20 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                New
              </button>
            </div>
            
            {/* Search Input - Only show if more than 5 projects */}
            {projects.length > 5 && (
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-[11px] bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/40"
                />
              </div>
            )}
            
            {/* Project List with max height and scroll */}
            <div className="max-h-56 overflow-y-auto space-y-0.5">
              {visibleProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => onProjectSelect(project)}
                  className={`
                    w-full flex items-center gap-1.5 px-1.5 py-1.5 rounded-lg text-[11px] transition-all items-center
                    ${selectedProject?.id === project.id
                      ? 'bg-primary/10 text-primary border border-primary/20' 
                      : 'text-sidebar-foreground/70 hover:text-foreground hover:bg-secondary/80'
                    }
                  `}
                >
                  <div className="w-2 h-2 rounded-full bg-primary/60" />
                  <span className="truncate font-medium">{project.name}</span>
                  <span className="text-[9px] text-muted-foreground ml-auto">
                    {project.market}
                  </span>
                </button>
              ))}
            </div>
            
            {/* Show More/Less Button */}
            {hasMoreProjects && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full flex items-center justify-center gap-1 px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-md transition-colors"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="w-3 h-3" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    +{filteredProjects.length - 5} More
                  </>
                )}
              </button>
            )}
            
            {/* Empty State */}
            {projects.length === 0 && (
              <div className="p-2 rounded-lg bg-muted/50 border border-border">
                <p className="text-muted-foreground tracking-tight text-[11px]">
                  No projects yet
                </p>
              </div>
            )}
            
            {/* No Search Results */}
            {projects.length > 0 && filteredProjects.length === 0 && searchTerm && (
              <div className="p-2 rounded-lg bg-muted/50 border border-border">
                <p className="text-muted-foreground tracking-tight text-[11px]">
                  No projects found for "{searchTerm}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Items */}
        <div className="p-3">
          <p className="text-muted-foreground tracking-tight text-[10px] font-medium uppercase mb-2">
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
                    w-full flex items-center gap-1.5 px-1.5 py-1.5 rounded-lg text-[12px] transition-all duration-150 items-center
                    ${isActive 
                      ? 'bg-primary/10 text-primary border border-primary/20' 
                      : 'text-sidebar-foreground/70 hover:text-foreground hover:bg-secondary/80'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 shrink-0 flex-shrink-0" />
                  <span className="tracking-tight truncate font-medium">
                    {item.label}
                  </span>
                  <ChevronRight 
                    className={`
                      w-3.5 h-3.5 ml-auto shrink-0 flex-shrink-0 transition-all duration-150
                      ${hoveredItem === item.id ? "opacity-70 translate-x-0" : "opacity-0 -translate-x-1"}
                    `}
                  />
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sticky Bottom Section - PROJECT & ACCOUNT - Her zaman görünür */}
      <div className="sticky bottom-0 bg-card border-t border-border/50">
        {/* PROJECT Section */}
        {selectedProject && (
          <div className="p-3 border-b border-border/30">
          <p className="text-muted-foreground tracking-tight text-[10px] font-medium uppercase mb-2">
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
                      w-full flex items-center gap-1.5 px-1.5 py-1.5 rounded-lg text-[12px] transition-all duration-150 items-center
                      ${isActive 
                        ? 'bg-primary/10 text-primary border border-primary/20' 
                        : 'text-sidebar-foreground/70 hover:text-foreground hover:bg-secondary/80'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 shrink-0 flex-shrink-0" />
                    <span className="tracking-tight truncate font-medium">
                      {item.label}
                    </span>
                    <ChevronRight 
                      className={`
                        w-3.5 h-3.5 ml-auto shrink-0 flex-shrink-0 transition-all duration-150
                        ${hoveredItem === item.id ? "opacity-70 translate-x-0" : "opacity-0 -translate-x-1"}
                      `}
                    />
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* ACCOUNT Section */}
        <div className="p-3">
        <p className="text-muted-foreground tracking-tight text-[10px] font-medium uppercase mb-2">
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
                  w-full flex items-center gap-1.5 px-1.5 py-1.5 rounded-lg text-[12px] transition-all duration-150 items-center
                  ${isActive 
                    ? 'bg-primary/10 text-primary border border-primary/20' 
                    : 'text-sidebar-foreground/70 hover:text-foreground hover:bg-secondary/80'
                  }
                `}
              >
                <Icon className="w-4 h-4 shrink-0 flex-shrink-0" />
                <span className="tracking-tight truncate font-medium">
                  {item.label}</span>
                <ChevronRight 
                  className={`
                    w-3.5 h-3.5 ml-auto shrink-0 flex-shrink-0 transition-all duration-150
                    ${hoveredItem === item.id ? "opacity-70 translate-x-0" : "opacity-0 -translate-x-1"}
                  `}
                />
              </button>
            );
          })}
          
          {/* Logout Button - Aynı nav container'ında */}
          <button
            onClick={onLogout}
            onMouseEnter={() => setHoveredItem('logout')}
            onMouseLeave={() => setHoveredItem(null)}
            className="
              w-full flex items-center gap-1.5 px-1.5 py-1.5 rounded-lg text-[12px]
              text-sidebar-foreground/70 hover:text-destructive
              hover:bg-destructive/10 transition-all duration-150 group items-center
            "
          >
            <LogOut className="w-4 h-4 shrink-0 flex-shrink-0" />
            <span className="tracking-tight truncate font-medium">Log Out</span>
            <ChevronRight 
              className={`
                w-3.5 h-3.5 ml-auto shrink-0 flex-shrink-0
                transition-all duration-150
                ${hoveredItem === 'logout' ? "opacity-70 translate-x-0" : "opacity-0 -translate-x-1"}
              `}
            />
          </button>
        </nav>
        
        {/* User Info Component - En altta */}
        <div className="mt-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 border border-border/50">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <span className="text-primary tracking-tight text-[11px] font-semibold">
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
              <p className="text-sidebar-foreground tracking-tight truncate text-[12px] font-medium">
                {userEmail || 'Sign in to continue'}
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
