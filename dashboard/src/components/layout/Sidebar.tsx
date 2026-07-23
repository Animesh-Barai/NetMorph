import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Activity, 
  Shield, 
  Hash, 
  Settings, 
  History, 
  ChevronLeft, 
  ChevronRight, 
  Terminal,
  CircleDot,
  LucideIcon
} from "lucide-react";
import WorkspaceSwitcher from "../WorkspaceSwitcher";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeRuleCount?: number;
}

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  shortcut: string;
  badge?: number;
}

interface NavCategory {
  category: string;
  items: NavItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, activeRuleCount = 0 }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navCategories: NavCategory[] = [
    {
      category: "TRAFFIC & SIGNALS",
      items: [
        { id: "logs", label: "Network Stream", icon: Activity, shortcut: "1" },
        { id: "history", label: "Request History", icon: History, shortcut: "2" },
      ]
    },
    {
      category: "RULES & TRANSFORMS",
      items: [
        { id: "rules", label: "Rule Manager", icon: Shield, badge: activeRuleCount > 0 ? activeRuleCount : undefined, shortcut: "3" },
        { id: "rewrite", label: "Content Rewrites", icon: Hash, shortcut: "4" },
      ]
    },
    {
      category: "CONFIGURATION",
      items: [
        { id: "settings", label: "Proxy Settings", icon: Settings, shortcut: "5" },
      ]
    }
  ];

  return (
    <aside 
      className={cn(
        "h-full bg-[#09090b] flex flex-col p-3 sm:p-4 border-r border-[#27272a] shrink-0 z-30 select-none transition-all duration-200 relative",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-5 w-6 h-6 rounded-md bg-[#18181b] border border-[#27272a] text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 flex items-center justify-center shadow-sm transition-colors z-40"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* DevTool Brand Header */}
      <div className={cn("flex items-center gap-3 mb-5 px-1 py-1 group cursor-pointer", isCollapsed && "justify-center")}>
        <div className="w-8 h-8 rounded bg-[#18181b] border border-[#27272a] flex items-center justify-center shrink-0 text-zinc-100 font-mono font-bold text-sm">
          <Terminal className="w-4 h-4 text-zinc-200" />
        </div>

        {!isCollapsed && (
          <div className="flex flex-col min-w-0">
            <span className="font-mono text-sm font-bold text-zinc-100 tracking-tight leading-tight">
              NetMorph Proxy
            </span>
            <span className="text-xs font-mono text-zinc-500 tracking-wider uppercase">
              v1.1.0-GOLD
            </span>
          </div>
        )}
      </div>

      {/* Workspace Switcher */}
      {!isCollapsed && (
        <div className="mb-4 pb-3 border-b border-[#18181b]">
          <WorkspaceSwitcher />
        </div>
      )}

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto space-y-5 no-scrollbar py-1">
        {navCategories.map((cat, catIdx) => (
          <div key={catIdx} className="space-y-1.5">
            {!isCollapsed && (
              <div className="px-2.5 text-xs font-mono font-semibold uppercase tracking-wider text-zinc-500">
                {cat.category}
              </div>
            )}

            <div className="space-y-1">
              {cat.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-md text-xs sm:text-sm font-mono transition-colors group relative border",
                      isActive
                        ? "bg-[#18181b] text-zinc-100 font-bold border-[#27272a] border-l-2 border-l-primary"
                        : "bg-transparent border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-[#121215]",
                      isCollapsed && "justify-center px-0 py-2.5"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon
                        className={cn(
                          "w-4 h-4 shrink-0 transition-colors",
                          isActive ? "text-primary" : "text-zinc-400 group-hover:text-zinc-200"
                        )}
                      />
                      {!isCollapsed && <span className="font-mono text-xs sm:text-sm">{item.label}</span>}
                    </div>

                    {!isCollapsed && (
                      <div className="flex items-center gap-1.5">
                        {item.badge !== undefined && (
                          <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-zinc-800 text-zinc-200 border border-zinc-700">
                            {item.badge}
                          </span>
                        )}
                        <span className="text-xs font-mono text-zinc-500 hidden group-hover:inline">
                          [{item.shortcut}]
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* DevTool System Footer */}
      <div className={cn(
        "mt-auto p-2.5 bg-[#121215] border border-[#27272a] rounded-md text-xs font-mono text-zinc-300 space-y-1",
        isCollapsed && "p-1.5 text-center"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CircleDot className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            {!isCollapsed && <span className="font-bold text-zinc-200">LISTEN 8080</span>}
          </div>
          {!isCollapsed && <span className="text-xs text-zinc-400 font-bold">MITM</span>}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
