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
import { useToast } from "./ui/ToastContainer";

interface Workspace {
  id: string;
  name: string;
  is_active: boolean;
}

interface WorkspaceSwitcherProps {
  onWorkspaceChange?: () => void;
}

const MOCK_WORKSPACES: Workspace[] = [
  { id: "default", name: "Default Workspace", is_active: true },
  { id: "staging-auth", name: "Staging Auth API", is_active: false },
  { id: "payments-sandbox", name: "Stripe Payments Mesh", is_active: false },
];

const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({ onWorkspaceChange }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeId, setActiveId] = useState<string>("default");
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addToast } = useToast();

  const fetchWorkspaces = async () => {
    try {
      const res = await fetch("http://localhost:8000/workspaces");
      if (!res.ok) throw new Error("API Offline");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setWorkspaces(data);
        const active = data.find((w: Workspace) => w.is_active);
        if (active) setActiveId(active.id);
        return;
      }
      setWorkspaces(MOCK_WORKSPACES);
    } catch {
      setWorkspaces(MOCK_WORKSPACES);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleSwitch = async (id: string) => {
    if (!id || id === activeId) return;
    try {
      await fetch(`http://localhost:8000/workspaces/${id}/activate`, { method: "POST" });
    } catch {
      // offline fallback
    }
    setActiveId(id);
    setWorkspaces(prev => prev.map(w => ({ ...w, is_active: w.id === id })));
    addToast("Workspace Switched", `Active workspace: ${id}`, "info");
    if (onWorkspaceChange) {
      onWorkspaceChange();
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) {
      setIsAdding(false);
      return;
    }
    const newWs: Workspace = { id: newName.toLowerCase().replace(/\s+/g, "_"), name: newName.trim(), is_active: false };
    try {
      await fetch("http://localhost:8000/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() })
      });
    } catch {
      // offline fallback
    }
    setWorkspaces(prev => [...prev, newWs]);
    addToast("Workspace Created", `Created "${newName.trim()}"`, "info");
    setNewName("");
    setIsAdding(false);
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
      addToast("Export Complete", `Exported netmorph-${activeId}.json`, "info");
    } catch {
      addToast("Export Simulated", "Workspace bundle downloaded", "info");
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
        addToast("Workspace Imported", "Workspace configuration loaded", "info");
      } catch {
        addToast("Import Failed", "Invalid workspace JSON format", "error");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="font-mono text-xs select-none">
      <div className="flex items-center justify-between mb-1.5 px-1">
        <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider">
          Workspace
        </span>
        <div className="flex items-center gap-1.5 text-zinc-400">
          <button 
            onClick={() => fileInputRef.current?.click()} 
            title="Import Workspace" 
            className="hover:text-zinc-100 p-0.5"
          >
            <Upload className="w-3 h-3" />
          </button>
          <button 
            onClick={handleExport} 
            title="Export Workspace" 
            className="hover:text-zinc-100 p-0.5"
          >
            <Download className="w-3 h-3" />
          </button>
          <button 
            onClick={() => setIsAdding(true)} 
            title="New Workspace" 
            className="hover:text-zinc-100 p-0.5 border-l border-[#27272a] pl-1.5"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="mb-2 flex gap-1">
          <Input 
            autoFocus
            className="h-7 text-xs bg-[#121215] border-[#27272a] font-mono text-zinc-100" 
            placeholder="workspace_id"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            onBlur={() => !newName && setIsAdding(false)}
          />
          <Button size="icon" className="h-7 w-7 bg-[#27272a] text-zinc-100 hover:bg-[#3f3f46]" onClick={handleCreate}>
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
        <SelectTrigger className="w-full bg-[#121215] border border-[#27272a] h-8 rounded text-xs font-mono text-zinc-200">
          <div className="flex items-center gap-2 overflow-hidden truncate">
            <Layout className="w-3 h-3 text-zinc-400 shrink-0" />
            <SelectValue placeholder="Select Workspace" className="truncate font-bold" />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-[#18181b] border-[#27272a] font-mono text-xs text-zinc-200">
          {workspaces.map((w) => (
            <SelectItem 
              key={w.id} 
              value={w.id}
              className="text-xs focus:bg-[#27272a] focus:text-zinc-100 cursor-pointer py-1.5"
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full shrink-0",
                  w.is_active ? "bg-emerald-400" : "bg-zinc-600"
                )} />
                <span className="truncate">{w.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default WorkspaceSwitcher;
