import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit3, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Rule {
  id: string;
  name: string;
  match_type: string;
  pattern: string;
  is_active: boolean;
  actions: any[];
}

interface RuleManagerProps {
  onEdit: (rule: Rule) => void;
}

const RuleManager: React.FC<RuleManagerProps> = ({ onEdit }) => {
  const [rules, setRules] = useState<Rule[]>([]);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await fetch("http://localhost:8000/rules");
      const data = await res.json();
      setRules(data);
    } catch (e) {
      console.error("API OFFLINE");
    }
  };

  const toggleRule = async (id: string) => {
    await fetch(`http://localhost:8000/rules/${id}/toggle`, { method: "POST" });
    fetchRules();
  };

  const deleteRule = async (id: string) => {
    await fetch(`http://localhost:8000/rules/${id}`, { method: "DELETE" });
    fetchRules();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rules.map((rule) => (
        <Card key={rule.id} className="bg-surface-low border-none p-5 rounded-sm flex flex-col group hover:bg-surface-high transition-all border-l-2 border-l-transparent hover:border-l-primary/40 shadow-xl shadow-black/20">
          <div className="flex items-start justify-between mb-4">
            <div className="flex flex-col">
              <h3 className="font-display font-bold text-lg text-foreground tracking-tight line-clamp-1">{rule.name}</h3>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline" className="rounded-none text-[9px] font-mono border-none bg-surface-lowest text-muted-foreground uppercase">{rule.match_type}</Badge>
                {rule.actions.map((a: { type: string }, i: number) => (
                  <Badge key={i} variant="outline" className="rounded-none text-[9px] font-mono border-none bg-primary/10 text-primary uppercase">{a.type}</Badge>
                ))}
              </div>
            </div>
            <Switch 
              checked={rule.is_active} 
              onCheckedChange={() => toggleRule(rule.id)}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          <div className="flex-1 bg-surface-lowest/50 rounded-sm p-3 mb-4 font-mono text-[11px] text-muted-foreground break-all">
            {rule.pattern}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-surface-high/50 group-hover:border-primary/10 transition-colors">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => deleteRule(rule.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
                title="Delete Rule"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onEdit(rule)}
                className="text-muted-foreground hover:text-primary transition-colors" 
                title="Edit Rule"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            <ShieldCheck className={cn("w-5 h-5", rule.is_active ? "text-primary" : "text-muted-foreground/20")} />
          </div>
        </Card>
      ))}

      {rules.length === 0 && (
         <div className="col-span-full h-40 border-2 border-dashed border-surface-high rounded-sm flex items-center justify-center text-muted-foreground/20 italic text-xs font-mono">
            NO ACTIVE INTERCEPTORS
         </div>
      )}
    </div>
  );
};

export default RuleManager;
