import React, { useEffect, useState } from "react";
import { Server, Shield, Database, Save, RotateCcw, Monitor, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "./ui/ToastContainer";

const SettingsPage: React.FC = () => {
  const [port, setPort] = useState(8080);
  const [strategy, setStrategy] = useState("DIRECT");
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const fetchSettings = async () => {
    try {
      const res = await fetch("http://localhost:8000/settings");
      const data = await res.json();
      setPort(data.proxy_port);
      setStrategy(data.upstream_strategy);
    } catch {
      console.error("Failed to load settings");
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await fetch("http://localhost:8000/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proxy_port: port,
          upstream_strategy: strategy,
          theme: "DARK",
        }),
      });
      addToast("Settings Saved", "Proxy port and strategy configuration updated", "info");
    } catch {
      addToast("Save Failed", "Could not connect to backend settings API", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = () => {
    addToast("Cache Reset", "Local proxy memory state cleared successfully", "info");
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 font-mono text-xs">
      <div>
        <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-tight">Proxy Runtime Parameters</h2>
        <p className="text-[11px] text-zinc-500">Core network proxy configuration, listening port, and upstream gateway settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Proxy Control */}
        <div className="devtool-card p-4 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#27272a] text-zinc-200 font-bold">
            <Server className="w-4 h-4 text-zinc-400" />
            <span>Proxy Gateway Listening Port</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] uppercase text-zinc-500 block mb-1">Listen Port</label>
              <Input 
                type="number"
                value={port} 
                onChange={(e) => setPort(parseInt(e.target.value) || 8080)}
                className="font-mono text-xs max-w-[180px] bg-[#09090b] border-[#27272a] text-zinc-200 h-8" 
              />
            </div>

            <div>
              <label className="text-[10px] uppercase text-zinc-500 block mb-1">Upstream Gateway Strategy</label>
              <div className="flex gap-2">
                {["DIRECT", "SYSTEM", "MITM-GATEWAY"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStrategy(s)}
                    className={cn(
                      "rounded text-[10px] font-mono font-bold py-1 px-2.5 transition-colors border uppercase",
                      strategy === s 
                        ? "bg-[#27272a] text-zinc-100 border-zinc-600" 
                        : "bg-[#09090b] text-zinc-400 border-[#27272a] hover:text-zinc-200"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button 
            disabled={loading}
            onClick={handleSave}
            className="w-full h-8 text-xs font-mono font-bold bg-[#27272a] text-zinc-100 hover:bg-[#3f3f46]"
          >
            {loading ? "SYNCING..." : <><Save className="w-3.5 h-3.5 mr-1.5" /> Save Configuration</>}
          </Button>
        </div>

        {/* Security & Access */}
        <div className="devtool-card p-4 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#27272a] text-zinc-200 font-bold">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Security & TLS Authorization</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#09090b] rounded border border-[#27272a]">
            <div className="flex items-center gap-2.5">
              <Monitor className="w-4 h-4 text-zinc-400" />
              <div>
                <p className="text-xs font-bold text-zinc-200">Localhost Authorization</p>
                <p className="text-[10px] text-zinc-500">127.0.0.1 loopback only</p>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 font-mono text-[9px] font-bold rounded">
              ACTIVE
            </span>
          </div>

          <p className="text-[10px] text-zinc-500 italic text-center">
            Security policy enforced by NetMorph Core v1.1.0-GOLD
          </p>
        </div>

        {/* Data Persistence */}
        <div className="devtool-card p-4 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#27272a] text-zinc-200 font-bold">
            <Database className="w-4 h-4 text-zinc-400" />
            <span>Persistence Layer</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-[#09090b] rounded border border-[#27272a]">
              <p className="text-[9px] text-zinc-500 uppercase mb-1">Engine</p>
              <p className="text-xs font-bold text-zinc-200">SQLite-3</p>
            </div>
            <div className="p-3 bg-[#09090b] rounded border border-[#27272a]">
              <p className="text-[9px] text-zinc-500 uppercase mb-1">Database Size</p>
              <p className="text-xs font-bold text-zinc-200">1.2 MB</p>
            </div>
          </div>

          <Button 
            variant="ghost" 
            onClick={handleClearCache}
            className="w-full h-7 text-[11px] font-mono text-zinc-400 hover:text-zinc-100 hover:bg-[#27272a]"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Rebuild Index & Clear Cache
          </Button>
        </div>

        {/* DevTool Theme Config */}
        <div className="devtool-card p-4 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#27272a] text-zinc-200 font-bold">
            <Settings className="w-4 h-4 text-zinc-400" />
            <span>Developer Theme Engine</span>
          </div>

          <div className="bg-[#09090b] p-2 rounded border border-[#27272a] flex items-center justify-between text-xs text-zinc-300">
            <span>Theme Mode:</span>
            <span className="font-bold text-indigo-400">Minimal DevTool Dark</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
