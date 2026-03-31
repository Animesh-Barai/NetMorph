import React, { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import LogViewer from "./components/LogViewer";
import RuleManager from "./components/RuleManager";
import AddRuleModal from "./components/AddRuleModal";
import HistoryPage from "./components/HistoryPage";
import RewritesPage from "./components/RewritesPage";
import SettingsPage from "./components/SettingsPage";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState("logs");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingRule, setEditingRule] = useState<any>(null);

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex relative h-screen w-full bg-background overflow-hidden text-foreground selection:bg-primary/30">
      {/* The Pulse Ribbon */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary via-tertiary to-primary opacity-80 z-50 animate-pulse" />
      
      {/* Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-surface-dim">
        <Header />
        
        <main className="flex-1 overflow-auto bg-transparent">
          <div className="h-full flex flex-col p-8 pt-6">
            {activeTab === "logs" && (
              <div className="flex-1 flex flex-col">
                <div className="mb-6">
                  <h2 className="font-display text-2xl font-bold tracking-tight mb-1 uppercase">Network Pulse</h2>
                  <p className="text-sm text-muted-foreground font-mono text-[10px] uppercase tracking-widest opacity-60">Real-time signal monitoring</p>
                </div>
                
                <LogViewer />
              </div>
            )}

            {activeTab === "rules" && (
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="font-display text-2xl font-bold tracking-tight mb-1 uppercase">Command Rules</h2>
                    <p className="text-sm text-muted-foreground font-mono text-[10px] uppercase tracking-widest opacity-60">Interceptor configuration</p>
                  </div>
                  <button 
                    onClick={() => {
                      setEditingRule(null);
                      setIsModalOpen(true);
                    }}
                    className="h-10 px-6 bg-primary text-primary-foreground font-bold text-xs tracking-wider rounded-sm hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20"
                  >
                    CREATE NEW RULE
                  </button>
                </div>

                <RuleManager 
                  key={refreshKey} 
                  onEdit={(rule) => {
                    setEditingRule(rule);
                    setIsModalOpen(true);
                  }} 
                />
                
                <AddRuleModal 
                  open={isModalOpen} 
                  onOpenChange={setIsModalOpen} 
                  onSuccess={handleSuccess}
                  editData={editingRule}
                />
              </div>
            )}

            {activeTab === "history" && (
              <HistoryPage />
            )}

            {activeTab === "rewrite" && (
              <RewritesPage />
            )}

            {activeTab === "settings" && (
              <SettingsPage />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
