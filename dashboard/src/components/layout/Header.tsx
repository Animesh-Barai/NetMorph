import React from "react";
import { Search, Bell, Monitor, Cloud } from "lucide-react";

const Header: React.FC = () => {
  return (
    <header className="h-16 flex items-center justify-between px-8 bg-surface-lowest">
      <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Monitor className="w-4 h-4" />
            <span className="text-xs font-mono">127.0.0.1:8080</span>
          </div>
          <div className="h-4 w-px bg-surface-high" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <Cloud className="w-4 h-4" />
            <span className="text-xs font-mono">UPSTREAM: DIRECT</span>
          </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search traffic..." 
            className="h-9 w-64 bg-surface-base border-none rounded-sm pl-10 pr-4 text-xs focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40"
          />
        </div>
        <div className="h-9 w-9 flex items-center justify-center bg-surface-high rounded-sm text-foreground hover:bg-surface-bright cursor-pointer transition-colors">
          <Bell className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
};

export default Header;
