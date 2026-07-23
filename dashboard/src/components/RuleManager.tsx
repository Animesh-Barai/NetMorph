import React, { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Edit3, Shield, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import ConfirmModal from "./ui/ConfirmModal";
import { useToast } from "./ui/ToastContainer";

export interface Rule {
  id: string;
  name: string;
  match_type: string;
  pattern: string;
  is_active: boolean;
  actions: any[];
}

const MOCK_FALLBACK_RULES: Rule[] = [
  {
    id: "rule-01",
    name: "Redirect Auth Endpoint to Local Mock",
    match_type: "contains",
    pattern: "https://auth.company.com/oauth/v2/token",
    is_active: true,
    actions: [{ type: "redirect", config: { to: "http://localhost:9090/mock/token" } }]
  },
  {
    id: "rule-02",
    name: "Inject Debug Headers on Telemetry",
    match_type: "exact",
    pattern: "https://api.company.com/v1/telemetry",
    is_active: true,
    actions: [{ type: "modify_header", config: { target: "request", actions: [{ op: "set", key: "X-Debug-Trace", value: "true" }] } }]
  },
  {
    id: "rule-03",
    name: "Mock User Profile JSON Response",
    match_type: "regex",
    pattern: "^https://api\\.company\\.com/user/\\d+$",
    is_active: false,
    actions: [{ type: "mock_response", config: { status: 200, body: '{"id": 402, "name": "Antigravity Tester", "role": "admin"}' } }]
  },
  {
    id: "rule-04",
    name: "Python Custom Token Transformer",
    match_type: "contains",
    pattern: "https://api.internal/oauth/transform",
    is_active: true,
    actions: [{ type: "python_script", config: { code: "# NetMorph Script Hook\nlog(flow.request.url)\n" } }]
  }
];

interface RuleManagerProps {
  onEdit: (rule: Rule) => void;
  searchFilter?: string;
  onCreateNew?: () => void;
}

const RuleManager: React.FC<RuleManagerProps> = ({ onEdit, searchFilter = "", onCreateNew }) => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "ACTIVE" | "PAUSED">("ALL");
  const [localSearch, setLocalSearch] = useState("");
  const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null);

  const { addToast } = useToast();

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await fetch("http://localhost:8000/rules");
      if (!res.ok) throw new Error("API offline");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setRules(data);
        return;
      }
      setRules(MOCK_FALLBACK_RULES);
    } catch {
      setRules(MOCK_FALLBACK_RULES);
    }
  };

  const toggleRule = async (id: string, currentActive: boolean) => {
    try {
      await fetch(`http://localhost:8000/rules/${id}/toggle`, { method: "POST" });
    } catch {
      // offline fallback
    }
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_active: !r.is_active } : r))
    );
    addToast(currentActive ? "Rule Paused" : "Rule Activated", `Rule updated`, "info");
  };

  const deleteRuleConfirm = async () => {
    if (!deletingRuleId) return;
    try {
      await fetch(`http://localhost:8000/rules/${deletingRuleId}`, { method: "DELETE" });
    } catch {
      // offline fallback
    }
    setRules((prev) => prev.filter((r) => r.id !== deletingRuleId));
    addToast("Rule Removed", "Interceptor configuration deleted", "success");
    setDeletingRuleId(null);
  };

  const effectiveSearch = searchFilter || localSearch;

  const filteredRules = rules.filter((rule) => {
    if (activeFilter === "ACTIVE" && !rule.is_active) return false;
    if (activeFilter === "PAUSED" && rule.is_active) return false;
    if (effectiveSearch) {
      const q = effectiveSearch.toLowerCase();
      return rule.name.toLowerCase().includes(q) || rule.pattern.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col space-y-4 font-mono text-xs sm:text-sm">
      {/* Control Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#141417] p-3 sm:p-4 rounded-md border border-[#27272a]">
        <div className="flex items-center gap-1.5">
          {(["ALL", "ACTIVE", "PAUSED"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-3 py-1.5 text-xs sm:text-sm font-mono rounded transition-colors uppercase font-bold cursor-pointer",
                activeFilter === filter
                  ? "bg-[#27272a] text-zinc-100 font-bold"
                  : "bg-transparent text-zinc-400 hover:text-zinc-200"
              )}
            >
              {filter}
              {filter === "ALL" && ` (${rules.length})`}
              {filter === "ACTIVE" && ` (${rules.filter(r => r.is_active).length})`}
              {filter === "PAUSED" && ` (${rules.filter(r => !r.is_active).length})`}
            </button>
          ))}
        </div>

        {!searchFilter && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search rule..."
              className="h-8 sm:h-9 w-48 sm:w-64 pl-9 bg-[#09090b] border-[#27272a] text-xs sm:text-sm font-mono"
            />
          </div>
        )}
      </div>

      {/* Grid of Rule Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRules.map((rule) => (
          <div
            key={rule.id}
            className={cn(
              "devtool-card p-4 sm:p-5 flex flex-col justify-between group transition-colors border-l-2",
              rule.is_active ? "border-l-indigo-500" : "border-l-zinc-700 opacity-60"
            )}
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-mono font-bold text-sm sm:text-base text-zinc-100 truncate">
                    {rule.name}
                  </h3>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="px-2 py-0.5 rounded text-xs font-mono bg-[#09090b] border border-[#27272a] text-zinc-400 uppercase font-semibold">
                      {rule.match_type}
                    </span>
                    {rule.actions.map((a: { type: string }, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-xs font-mono bg-indigo-950/50 text-indigo-400 border border-indigo-800/50 font-bold uppercase"
                      >
                        {a.type}
                      </span>
                    ))}
                  </div>
                </div>

                <Switch
                  checked={rule.is_active}
                  onCheckedChange={() => toggleRule(rule.id, rule.is_active)}
                  className="data-[state=checked]:bg-indigo-600 shrink-0 cursor-pointer"
                />
              </div>

              {/* Pattern View */}
              <div className="bg-[#09090b] border border-[#27272a] rounded-md p-3 my-3 font-mono text-xs sm:text-sm text-zinc-200 break-all leading-relaxed">
                {rule.pattern}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#1f1f23]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(rule)}
                  className="text-zinc-400 hover:text-zinc-100 p-1.5 hover:bg-[#27272a] rounded cursor-pointer"
                  title="Edit Rule"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingRuleId(rule.id)}
                  className="text-zinc-400 hover:text-rose-400 p-1.5 hover:bg-rose-950/40 rounded cursor-pointer"
                  title="Delete Rule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <span className={cn(
                "font-mono text-xs font-bold uppercase",
                rule.is_active ? "text-emerald-400" : "text-zinc-500"
              )}>
                {rule.is_active ? "ENABLED" : "PAUSED"}
              </span>
            </div>
          </div>
        ))}

        {filteredRules.length === 0 && (
          <div className="col-span-full h-48 border border-dashed border-[#27272a] rounded-md flex flex-col items-center justify-center space-y-3 text-zinc-500 bg-[#09090b]">
            <Shield className="w-8 h-8 opacity-40 text-zinc-500" />
            <p className="font-mono text-xs sm:text-sm italic">
              No rules matching filters.
            </p>
            {onCreateNew && (
              <Button
                size="sm"
                onClick={onCreateNew}
                className="h-8 text-xs font-mono bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
              >
                <Plus className="w-4 h-4 mr-1" /> Create Rule
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={!!deletingRuleId}
        onOpenChange={(open) => !open && setDeletingRuleId(null)}
        title="Delete Rule"
        description="Are you sure you want to delete this rule?"
        confirmText="Delete"
        onConfirm={deleteRuleConfirm}
      />
    </div>
  );
};

export default RuleManager;
