import React, { useState, useEffect } from "react";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import LogViewer from "./components/LogViewer";
import RuleManager, { Rule } from "./components/RuleManager";
import AddRuleModal from "./components/AddRuleModal";
import HistoryPage from "./components/HistoryPage";
import RewritesPage from "./components/RewritesPage";
import SettingsPage from "./components/SettingsPage";
import { ToastProvider } from "./components/ui/ToastContainer";

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState("logs");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [prefillPattern, setPrefillPattern] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRuleCount, setActiveRuleCount] = useState(0);

  const fetchActiveRuleCount = async () => {
    try {
      const res = await fetch("http://localhost:8000/rules");
      const rules = await res.json();
      if (Array.isArray(rules)) {
        setActiveRuleCount(rules.filter((r: any) => r.is_active).length);
      }
    } catch {
      // API Offline
    }
  };

  useEffect(() => {
    fetchActiveRuleCount();
  }, [refreshKey, activeTab]);

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleCreateRuleFromLog = (pattern: string) => {
    setEditingRule(null);
    setPrefillPattern(pattern);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "1") setActiveTab("logs");
      if (e.key === "2") setActiveTab("history");
      if (e.key === "3") setActiveTab("rules");
      if (e.key === "4") setActiveTab("rewrite");
      if (e.key === "5") setActiveTab("settings");
      if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        setEditingRule(null);
        setPrefillPattern("");
        setIsModalOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex relative h-screen w-full bg-[#0c0c0e] overflow-hidden text-zinc-200 font-mono selection:bg-zinc-800 selection:text-zinc-100 min-w-0">
      {/* Navigation Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        activeRuleCount={activeRuleCount}
      />

      {/* DevTool Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full bg-[#0c0c0e] relative overflow-x-hidden">
        <Header 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        
        <main className="flex-1 overflow-y-auto bg-transparent p-4 sm:p-6 min-w-0">
          <div className="h-full flex flex-col min-w-0">
            {/* View 1: Live Network Log Stream */}
            {activeTab === "logs" && (
              <div className="flex-1 flex flex-col min-w-0 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-mono font-bold text-zinc-100 uppercase tracking-tight">Live Network Stream</h2>
                    <p className="text-xs sm:text-sm text-zinc-400 font-mono">Real-time HTTP/HTTPS traffic inspector</p>
                  </div>
                  <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-zinc-400 bg-[#141417] px-3 py-1.5 rounded-md border border-[#27272a]">
                    <span>Keys: <kbd className="px-1.5 py-0.5 bg-[#27272a] text-zinc-200 font-bold rounded">1-5</kbd> tabs</span>
                    <span>•</span>
                    <span><kbd className="px-1.5 py-0.5 bg-[#27272a] text-zinc-200 font-bold rounded">N</kbd> new rule</span>
                  </div>
                </div>
                
                <LogViewer 
                  searchFilter={searchQuery}
                  onCreateRule={handleCreateRuleFromLog}
                />
              </div>
            )}

            {/* View 2: History */}
            {activeTab === "history" && (
              <div className="flex-1 flex flex-col min-w-0">
                <HistoryPage 
                  searchFilter={searchQuery}
                  onCreateRule={handleCreateRuleFromLog}
                />
              </div>
            )}

            {/* View 3: Rule Manager */}
            {activeTab === "rules" && (
              <div className="flex-1 flex flex-col min-w-0 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-mono font-bold text-zinc-100 uppercase tracking-tight font-mono">Rule Interceptor Manager</h2>
                    <p className="text-xs sm:text-sm text-zinc-400 font-mono">Redirects, header modifications, response mocks & script hooks</p>
                  </div>
                  <button 
                    onClick={() => {
                      setEditingRule(null);
                      setPrefillPattern("");
                      setIsModalOpen(true);
                    }}
                    className="h-9 px-4 bg-[#27272a] text-zinc-100 font-mono font-bold text-xs sm:text-sm rounded-md hover:bg-[#3f3f46] transition-colors border border-[#3f3f46] flex items-center gap-2 cursor-pointer"
                  >
                    + New Rule
                  </button>
                </div>

                <RuleManager 
                  key={refreshKey}
                  searchFilter={searchQuery}
                  onEdit={(rule) => {
                    setEditingRule(rule);
                    setPrefillPattern("");
                    setIsModalOpen(true);
                  }} 
                  onCreateNew={() => {
                    setEditingRule(null);
                    setPrefillPattern("");
                    setIsModalOpen(true);
                  }}
                />
              </div>
            )}

            {/* View 4: Content Rewrites */}
            {activeTab === "rewrite" && (
              <div className="flex-1 flex flex-col min-w-0">
                <RewritesPage searchFilter={searchQuery} />
              </div>
            )}

            {/* View 5: Settings */}
            {activeTab === "settings" && (
              <div className="flex-1 flex flex-col min-w-0">
                <SettingsPage />
              </div>
            )}
          </div>
        </main>

        {/* Create / Edit Rule Modal */}
        <AddRuleModal 
          open={isModalOpen} 
          onOpenChange={setIsModalOpen} 
          onSuccess={handleSuccess}
          editData={editingRule}
          prefillPattern={prefillPattern}
        />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;
