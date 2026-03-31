import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

const RewritesPage: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [search, setSearch] = useState("");

  const fetchRewrites = async () => {
    try {
      const res = await fetch("http://localhost:8000/rules");
      const allRules: Rule[] = await res.json();
      // Filter for rules that involve content modification
      const rewriteRules = allRules.filter(r => 
        r.actions.some(a => ["python_script", "mock_response", "modify_header"].includes(a.type))
      );
      setRules(rewriteRules);
    } catch (e) {
      console.error("Failed to load rewrites");
    }
  };

  useEffect(() => {
    fetchRewrites();
  }, []);

  const filteredRules = rules.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.pattern.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight mb-1 uppercase">Signal Evolution</h2>
          <p className="text-sm text-muted-foreground font-mono text-[10px] uppercase tracking-widest opacity-60">High-fidelity content transformation</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
          <Input 
            className="pl-10 bg-surface-base border-none h-10 text-xs font-mono" 
            placeholder="Search transforms..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredRules.map((rule) => {
          const hasScript = rule.actions.some(a => a.type === "python_script");
          const hasMock = rule.actions.some(a => a.type === "mock_response");

          return (
            <Card key={rule.id} className="bg-surface-low border-none p-6 rounded-sm flex items-center justify-between group hover:bg-surface-high transition-all shadow-xl shadow-black/10 border-l-2 border-l-transparent hover:border-l-primary/40">
              <div className="flex items-center gap-6">
                <div className={cn(
                  "w-12 h-12 rounded-sm flex items-center justify-center shadow-inner",
                  hasScript ? "bg-amber-500/10 text-amber-500" : "bg-primary/10 text-primary"
                )}>
                  {hasScript ? <Code2 className="w-6 h-6" /> : hasMock ? <FileJson className="w-6 h-6" /> : <Hash className="w-6 h-6" />}
                </div>
                
                <div>
                  <h3 className="font-bold text-lg tracking-tight mb-1">{rule.name}</h3>
                  <div className="flex items-center gap-3">
                    <code className="text-[10px] font-mono text-muted-foreground bg-surface-lowest px-2 py-0.5 rounded-none">{rule.pattern}</code>
                    <div className="flex gap-1">
                      {rule.actions.map((a, i) => (
                        <Badge key={i} variant="outline" className="rounded-none text-[8px] font-mono border-none bg-surface-base text-primary uppercase h-4 px-1.5">{a.type}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                 <div className="text-right">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1 opacity-40">Status</p>
                    <Badge className={cn(
                      "rounded-none font-mono text-[10px] border-none uppercase",
                      rule.is_active ? "bg-green-500/10 text-green-500" : "bg-muted-foreground/10 text-muted-foreground"
                    )}>
                      {rule.is_active ? "Live" : "Paused"}
                    </Badge>
                 </div>
              </div>
            </Card>
          );
        })}

        {filteredRules.length === 0 && (
          <div className="h-64 border-2 border-dashed border-surface-high rounded-sm flex flex-col items-center justify-center text-muted-foreground/20 italic text-xs font-mono space-y-4">
             <Hash className="w-12 h-12 opacity-5" />
             <p>NO CONTENT TRANSFORMS DEFINED IN THIS WORKSPACE</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewritesPage;
