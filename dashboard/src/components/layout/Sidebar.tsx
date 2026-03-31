import React from "react";
import { cn } from "@/lib/utils";
import { Activity, Shield, Hash, Settings, LayoutDashboard, History } from "lucide-react";
import WorkspaceSwitcher from "../WorkspaceSwitcher";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const items = [
    { id: "logs", label: "Live Logs", icon: Activity },
    { id: "history", label: "History", icon: History },
    { id: "rules", label: "Rule Manager", icon: Shield },
    { id: "rewrite", label: "Rewrites", icon: Hash },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="w-64 h-full bg-surface-lowest flex flex-col p-4 border-r border-surface-lowest transition-colors">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-8 h-8 rounded-sm pulse-gradient flex items-center justify-center ambient-shadow">
          <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
        </div>
        <h1 className="font-display text-xl font-bold tracking-tight text-foreground uppercase italic letter-spacing-tight">
          NetMorph
        </h1>
      </div>

      <WorkspaceSwitcher />

      <nav className="flex-1 mt-6 space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 transition-colors group text-sm font-medium relative",
              activeTab === item.id
                ? "text-foreground font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {activeTab === item.id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-3/5 bg-primary rounded-r-full shadow-[0_0_10px_var(--color-primary)]" />
            )}
            <item.icon
              className={cn(
                "w-4 h-4 transition-colors",
                activeTab === item.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )}
            />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto px-4 py-3 bg-surface-lowest rounded-sm">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted-foreground font-mono">PROXY ACTIVE</span>
        </div>
        <span className="text-[10px] text-muted-foreground/60 font-mono tracking-wider">
          v1.1.0-GOLD
        </span>
      </div>
    </div>
  );
};

export default Sidebar;
