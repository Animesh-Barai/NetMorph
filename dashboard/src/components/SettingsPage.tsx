import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Shield, Server, Database, Save, RotateCcw, Monitor, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SettingsPage: React.FC = () => {
  const [port, setPort] = useState(8080);
  const [strategy, setStrategy] = useState("DIRECT");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch("http://localhost:8000/settings");
      const data = await res.json();
      setPort(data.proxy_port);
      setStrategy(data.upstream_strategy);
    } catch (e) {
      console.error("Failed to load settings");
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
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
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight mb-1 uppercase">Platform Configuration</h2>
          <p className="text-sm text-muted-foreground font-mono text-[10px] uppercase tracking-widest opacity-60">System core parameters</p>
        </div>
        {saved && (
           <div className="flex items-center gap-2 text-green-500 font-mono text-[10px] uppercase tracking-widest animate-in fade-in slide-in-from-right-4">
              <CheckCircle2 className="w-4 h-4" /> CONFIGURATION PERSISTED
           </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Proxy Control */}
        <Card className="bg-surface-low border-none shadow-2xl rounded-sm">
          <CardHeader className="border-b border-surface-high/50 pb-4">
            <div className="flex items-center gap-3">
              <Server className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-mono tracking-widest uppercase">Proxy Control</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 block">Proxy Port</label>
                  <Input 
                    value={port} 
                    onChange={(e) => setPort(parseInt(e.target.value) || 8080)}
                    className="font-mono text-xs max-w-[200px]" 
                  />
               </div>
               <div>
                  <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 block">Upstream Strategy</label>
                  <div className="flex gap-2">
                    {["DIRECT", "SYSTEM", "MITM-GATEWAY"].map((s) => (
                      <Badge 
                        key={s}
                        onClick={() => setStrategy(s)}
                        className={cn(
                          "border-none rounded-none text-[9px] font-bold py-1 px-3 cursor-pointer transition-all",
                          strategy === s ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-surface-high/20 text-muted-foreground hover:bg-surface-high/40"
                        )}
                      >
                        {s}
                      </Badge>
                    ))}
                  </div>
               </div>
            </div>
            <Button 
              disabled={loading}
              onClick={handleSave}
              className="w-full tracking-widest text-[11px]"
            >
               {loading ? "SYNCING..." : <><Save className="w-3 h-3 mr-2" /> SAVE & PERSIST CONFIG</>}
            </Button>
          </CardContent>
        </Card>

        {/* Security & Access */}
        <Card className="bg-surface-low border-none shadow-2xl rounded-sm">
          <CardHeader className="border-b border-surface-high/50 pb-4">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-green-500" />
              <CardTitle className="text-sm font-mono tracking-widest uppercase">Security & Access</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
             <div className="flex items-center justify-between p-3 bg-surface-base rounded-sm">
                <div className="flex items-center gap-3">
                  <Monitor className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-bold font-mono">Local-First Authorization</p>
                    <p className="text-[10px] text-muted-foreground">Encryption via local keychain</p>
                  </div>
                </div>
                <Badge className="bg-green-500/10 text-green-500 border-none font-mono text-[9px]">ACTIVE</Badge>
             </div>
             <p className="text-[10px] text-muted-foreground italic text-center opacity-40">Security policy managed by NetMorph Core v1.1.0-GOLD</p>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="bg-surface-low border-none shadow-2xl rounded-sm">
          <CardHeader className="border-b border-surface-high/50 pb-4">
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-mono tracking-widest uppercase">Persistence Layer</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-surface-base rounded-sm text-center border border-primary/5">
                   <p className="text-[9px] font-mono text-muted-foreground uppercase mb-1">DB Format</p>
                   <p className="text-xs font-bold text-primary">SQLITE-3</p>
                </div>
                <div className="p-4 bg-surface-base rounded-sm text-center border border-primary/5">
                   <p className="text-[9px] font-mono text-muted-foreground uppercase mb-1">State Size</p>
                   <p className="text-xs font-bold text-primary">~1.2 MB</p>
                </div>
             </div>
             <Button variant="ghost" className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/5 text-[10px] tracking-widest uppercase font-bold">
                <RotateCcw className="w-3 h-3 mr-2" /> CLEAR CACHE & REBUILD INDEX
             </Button>
          </CardContent>
        </Card>

        {/* UI Preferences */}
        <Card className="bg-surface-low border-none shadow-2xl rounded-sm opacity-60 grayscale-[0.5]">
            <CardHeader className="border-b border-surface-high/50 pb-4">
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-sm font-mono tracking-widest uppercase">UI Preferences</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
               <div>
                  <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 block">Theme Engine</label>
                  <div className="bg-surface-base p-2 rounded-sm flex gap-2">
                     <div className="flex-1 h-8 bg-surface-lowest flex items-center justify-center text-[10px] font-bold border border-primary text-primary">DARK (GOLD)</div>
                     <div className="flex-1 h-8 bg-white/5 flex items-center justify-center text-[10px] font-bold opacity-20">LIGHT</div>
                  </div>
               </div>
               <p className="text-[8px] text-center font-mono uppercase tracking-[0.2em] opacity-30 mt-4">Vite HMR Active</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
