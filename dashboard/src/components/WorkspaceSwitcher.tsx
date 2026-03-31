import React, { useState, useEffect, useRef } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Plus, Layout, Download, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Workspace {
  id: string;
  name: string;
  is_active: boolean;
}

const WorkspaceSwitcher: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchWorkspaces = async () => {
    try {
      const res = await fetch("http://localhost:8000/workspaces");
      const data = await res.json();
      setWorkspaces(data);
      const active = data.find((w: Workspace) => w.is_active);
      if (active) setActiveId(active.id);
    } catch (e) {
      console.error("Failed to load workspaces");
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleSwitch = async (id: string) => {
    if (!id) return;
    try {
      await fetch(`http://localhost:8000/workspaces/${id}/activate`, { method: "POST" });
      setActiveId(id);
      window.location.reload();
    } catch (e) {
      console.error("Failed to switch workspace");
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) {
      setIsAdding(false);
      return;
    }
    try {
      await fetch("http://localhost:8000/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() })
      });
      setNewName("");
      setIsAdding(false);
      fetchWorkspaces();
    } catch (e) {
      console.error("Failed to create workspace");
    }
  };

  const handleExport = async () => {
    if (!activeId) return;
    try {
      const res = await fetch(`http://localhost:8000/workspaces/${activeId}/export`);
      const bundle = await res.json();
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `netmorph-${activeId}.json`;
      a.click();
    } catch (e) {
      console.error("Export failed");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const bundle = JSON.parse(event.target?.result as string);
        await fetch("http://localhost:8000/workspaces/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bundle)
        });
        fetchWorkspaces();
        alert("Workspace imported successfully!");
      } catch (err) {
        alert("Import failed: Invalid file format");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="px-2 mb-8">
      <div className="flex items-center justify-between mb-2">
        <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest opacity-60">Project Orbit</label>
        <div className="flex items-center gap-2">
          <button onClick={() => fileInputRef.current?.click()} title="Import Workspace" className="text-muted-foreground hover:text-primary transition-colors">
            <Upload className="w-3 h-3" />
          </button>
          <button onClick={handleExport} title="Export Active Workspace" className="text-muted-foreground hover:text-primary transition-colors">
            <Download className="w-3 h-3" />
          </button>
          <button onClick={() => setIsAdding(true)} title="New Workspace" className="text-muted-foreground hover:text-primary transition-colors border-l border-surface-high pl-2">
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="mb-2 flex gap-1">
          <Input 
            autoFocus
            size={1} 
            className="h-7 text-[10px] bg-surface-base border-none font-mono" 
            placeholder="workspace_id"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            onBlur={() => !newName && setIsAdding(false)}
          />
          <Button size="icon" className="h-7 w-7 bg-primary text-white" onClick={handleCreate}>
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImport} 
        className="hidden" 
        accept=".json"
      />
      
      <Select value={activeId} onValueChange={(val) => handleSwitch(val || "")}>
        <SelectTrigger className="w-full bg-surface-base border-none h-9 rounded-sm focus:ring-0 focus:ring-offset-0 shadow-lg shadow-black/10">
          <div className="flex items-center gap-2 overflow-hidden">
            <Layout className="w-3 h-3 text-primary shrink-0" />
            <SelectValue placeholder="Select Workspace" className="text-xs truncate" />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-surface-high border-surface-base rounded-sm shadow-2xl">
          {workspaces.map((w) => (
            <SelectItem 
              key={w.id} 
              value={w.id}
              className="text-xs focus:bg-primary/10 focus:text-primary cursor-pointer py-2"
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  w.is_active ? "bg-primary animate-pulse" : "bg-muted-foreground/20"
                )} />
                {w.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default WorkspaceSwitcher;
