import React, { useEffect, useState } from "react";
import { Code2, FileJson, Search, Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface RuleAction {
  type: string;
  config: any;
}

interface Rule {
  id: string;
  name: string;
  match_type: string;
  pattern: string;
  actions: RuleAction[];
  is_active: boolean;
}

interface RewritesPageProps {
  searchFilter?: string;
}

const RewritesPage: React.FC<RewritesPageProps> = ({ searchFilter = "" }) => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [localSearch, setLocalSearch] = useState("");

  const fetchRewrites = async () => {
    try {
      const res = await fetch("http://localhost:8000/rules");
      const allRules: Rule[] = await res.json();
      const rewriteRules = allRules.filter(r => 
        r.actions.some(a => ["python_script", "mock_response", "modify_header"].includes(a.type))
      );
      setRules(rewriteRules);
    } catch {
      console.error("Failed to load rewrites");
    }
  };

  useEffect(() => {
    fetchRewrites();
  }, []);

  const effectiveSearch = searchFilter || localSearch;

  const filteredRules = rules.filter(r => 
    r.name.toLowerCase().includes(effectiveSearch.toLowerCase()) || 
    r.pattern.toLowerCase().includes(effectiveSearch.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col space-y-4 font-mono text-xs">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-tight">Content Rewrites & Transform Hooks</h2>
          <p className="text-[11px] text-zinc-500 font-mono">Payload script hooks, static response mocks & header modifications</p>
        </div>
        
        {!searchFilter && (
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <Input 
              className="pl-8 bg-[#141417] border-[#27272a] h-7 text-xs font-mono" 
              placeholder="Filter transforms..." 
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Grid of Transforms */}
      <div className="grid grid-cols-1 gap-3">
        {filteredRules.map((rule) => {
          const hasScript = rule.actions.some(a => a.type === "python_script");
          const hasMock = rule.actions.some(a => a.type === "mock_response");

          return (
            <div 
              key={rule.id} 
              className={cn(
                "devtool-card p-4 flex items-center justify-between group transition-colors border-l-2",
                rule.is_active ? "border-l-indigo-500" : "border-l-zinc-700 opacity-60"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-8 h-8 rounded flex items-center justify-center shrink-0 border border-[#27272a] text-zinc-300 bg-[#09090b]"
                )}>
                  {hasScript ? <Code2 className="w-4 h-4 text-amber-400" /> : hasMock ? <FileJson className="w-4 h-4 text-indigo-400" /> : <Hash className="w-4 h-4 text-emerald-400" />}
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-mono font-bold text-xs text-zinc-100">
                    {rule.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <code className="text-[11px] font-mono text-zinc-300 bg-[#09090b] px-2 py-0.5 rounded border border-[#27272a]">
                      {rule.pattern}
                    </code>
                    <div className="flex gap-1">
                      {rule.actions.map((a, i) => (
                        <span 
                          key={i} 
                          className="rounded text-[9px] font-mono border border-indigo-800/40 bg-indigo-950/40 text-indigo-400 font-bold uppercase px-1.5 py-0.2"
                        >
                          {a.type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <span className={cn(
                "font-mono text-[10px] font-bold uppercase",
                rule.is_active ? "text-emerald-400" : "text-zinc-500"
              )}>
                {rule.is_active ? "ENABLED" : "PAUSED"}
              </span>
            </div>
          );
        })}

        {filteredRules.length === 0 && (
          <div className="h-44 border border-dashed border-[#27272a] rounded flex flex-col items-center justify-center text-zinc-600 font-mono text-xs space-y-2 bg-[#09090b]">
            <Hash className="w-8 h-8 opacity-40 text-zinc-600" />
            <p className="italic">No custom transformations defined.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewritesPage;
