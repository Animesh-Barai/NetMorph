import React, { useEffect, useState } from "react";
import { Search, Monitor, Power, Command, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "../ui/ToastContainer";

interface HeaderProps {
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
}

const Header: React.FC<HeaderProps> = ({ searchQuery = "", setSearchQuery }) => {
  const [apiOnline, setApiOnline] = useState<boolean>(true);
  const [proxyEnabled, setProxyEnabled] = useState<boolean>(true);
  const { addToast } = useToast();

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch("http://localhost:8000/settings");
        if (res.ok) {
          setApiOnline(true);
        } else {
          setApiOnline(false);
        }
      } catch {
        setApiOnline(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const toggleProxyState = () => {
    const newState = !proxyEnabled;
    setProxyEnabled(newState);
    if (newState) {
      addToast("Proxy Gateway Active", "Port 8080 intercepting traffic", "info");
    } else {
      addToast("Bypass Mode Enabled", "Traffic bypassing proxy rules", "info");
    }
  };

  return (
    <header className="h-14 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-[#09090b] border-b border-[#27272a] z-20 sticky top-0 select-none min-w-0 w-full gap-4 font-mono">
      {/* DevTool Status Bar */}
      <div className="flex items-center gap-3 text-xs sm:text-sm shrink min-w-0">
        <div className="flex items-center gap-2 px-2.5 py-1 bg-[#141417] border border-[#27272a] rounded-md text-zinc-200 text-xs sm:text-sm shrink-0 font-medium">
          <Monitor className="w-4 h-4 text-zinc-400 shrink-0" />
          <span>127.0.0.1:8080</span>
        </div>
        
        <span className="text-zinc-600 hidden sm:inline">/</span>

        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-[#141417] border border-[#27272a] rounded-md text-zinc-400 text-xs sm:text-sm shrink-0">
          <span>UPSTREAM:</span>
          <span className="text-zinc-100 font-bold">DIRECT</span>
        </div>

        <span className="text-zinc-600 hidden md:inline">/</span>

        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-[#141417] border border-[#27272a] rounded-md text-xs sm:text-sm shrink-0">
          <CircleDot className={cn("w-3.5 h-3.5 shrink-0", apiOnline ? "text-emerald-400" : "text-rose-400")} />
          <span className={cn("font-bold text-xs", apiOnline ? "text-emerald-400" : "text-rose-400")}>
            {apiOnline ? "API ONLINE" : "API OFFLINE"}
          </span>
        </div>
      </div>

      {/* DevTool Filter & Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {setSearchQuery && (
          <div className="relative shrink min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter (URL, method, status)..." 
              className="h-9 w-36 sm:w-48 md:w-60 bg-[#141417] border border-[#27272a] rounded-md pl-9 pr-9 text-xs sm:text-sm font-mono focus:outline-none focus:border-zinc-400 transition-colors placeholder:text-zinc-500 text-zinc-100"
            />
            {searchQuery ? (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400 hover:text-zinc-100 p-0.5"
                title="Clear Filter"
              >
                ✕
              </button>
            ) : (
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden lg:flex items-center text-xs font-mono text-zinc-500">
                <Command className="w-3 h-3 mr-0.5" />
                <span>K</span>
              </div>
            )}
          </div>
        )}

        <button
          onClick={toggleProxyState}
          className={cn(
            "h-9 px-3.5 flex items-center gap-2 rounded-md font-mono text-xs sm:text-sm font-bold tracking-wider transition-colors border shrink-0 cursor-pointer",
            proxyEnabled 
              ? "bg-emerald-950/50 text-emerald-400 border-emerald-800/50 hover:bg-emerald-900/40" 
              : "bg-[#18181b] text-zinc-400 border-[#27272a] hover:text-zinc-200"
          )}
          title="Toggle Proxy Gateway"
        >
          <Power className="w-3.5 h-3.5 shrink-0" />
          <span>{proxyEnabled ? "PROXY ACTIVE" : "BYPASS"}</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
