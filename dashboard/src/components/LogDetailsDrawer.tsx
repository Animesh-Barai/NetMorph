import React, { useState } from "react";
import { X, Copy, Check, ShieldPlus, ArrowUpRight, ArrowDownLeft, Clock, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import CodeEditor from "./ui/CodeEditor";

export interface SelectedLogDetails {
  id: string;
  method: string;
  url: string;
  path?: string;
  status?: number;
  type?: string;
  timestamp: string;
  overhead?: number;
  latency?: number;
  request_headers?: Record<string, string>;
  response_headers?: Record<string, string>;
  request_body?: string;
  response_body?: string;
  query_params?: Record<string, string>;
}

interface LogDetailsDrawerProps {
  log: SelectedLogDetails | null;
  onClose: () => void;
  onCreateRule?: (pattern: string) => void;
}

const LogDetailsDrawer: React.FC<LogDetailsDrawerProps> = ({ log, onClose, onCreateRule }) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  if (!log) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const formattedReqBody = () => {
    if (!log.request_body) return "No request body payload";
    try {
      return JSON.stringify(JSON.parse(log.request_body), null, 2);
    } catch {
      return log.request_body;
    }
  };

  const formattedResBody = () => {
    if (!log.response_body) return "No response body payload";
    try {
      return JSON.stringify(JSON.parse(log.response_body), null, 2);
    } catch {
      return log.response_body;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl h-full bg-surface-low border-l border-surface-high/60 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 glass-panel"
      >
        {/* Top Bar */}
        <div className="p-6 border-b border-surface-high/40 flex items-start justify-between gap-4 bg-surface-lowest/40">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs font-mono font-bold uppercase border-none px-2.5 py-0.5",
                  log.method === "GET" && "bg-blue-500/10 text-blue-400",
                  log.method === "POST" && "bg-emerald-500/10 text-emerald-400",
                  log.method === "PUT" && "bg-amber-500/10 text-amber-400",
                  log.method === "DELETE" && "bg-rose-500/10 text-rose-400"
                )}
              >
                {log.method}
              </Badge>

              {log.status && (
                <Badge 
                  variant="outline"
                  className={cn(
                    "text-xs font-mono font-bold border-none px-2.5 py-0.5",
                    log.status >= 200 && log.status < 300 && "bg-emerald-500/10 text-emerald-400",
                    log.status >= 300 && log.status < 400 && "bg-purple-500/10 text-purple-400",
                    log.status >= 400 && "bg-rose-500/10 text-rose-400"
                  )}
                >
                  {log.status} {log.status >= 200 && log.status < 300 ? "OK" : log.status >= 400 ? "ERR" : ""}
                </Badge>
              )}

              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                ID: {log.id.substring(0, 8)}
              </span>
            </div>

            <div className="flex items-center gap-2 group">
              <span className="font-mono text-xs text-foreground font-semibold break-all leading-tight">
                {log.url || log.path}
              </span>
              <button 
                onClick={() => copyToClipboard(log.url || log.path || "")}
                className="text-muted-foreground hover:text-primary transition-colors p-1"
                title="Copy Full URL"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-sm hover:bg-surface-high text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Toolbar */}
        <div className="px-6 py-3 bg-surface-base/60 border-b border-surface-high/30 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-primary/70" /> {log.timestamp}
            </span>
            {log.overhead !== undefined && (
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Tax: {log.overhead.toFixed(2)}ms
              </span>
            )}
          </div>

          {onCreateRule && (
            <Button 
              size="sm"
              onClick={() => onCreateRule(log.url || log.path || "")}
              className="h-8 text-xs font-mono tracking-wider bg-primary/20 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/40 shadow-sm transition-all"
            >
              <ShieldPlus className="w-3.5 h-3.5 mr-1.5" /> CREATE RULE
            </Button>
          )}
        </div>

        {/* Tabs Content */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="bg-surface-base border border-surface-high/40 p-1 mb-4 grid grid-cols-4 rounded-sm">
              <TabsTrigger value="overview" className="text-xs font-mono uppercase tracking-wider">Overview</TabsTrigger>
              <TabsTrigger value="req_headers" className="text-xs font-mono uppercase tracking-wider">Req Headers</TabsTrigger>
              <TabsTrigger value="res_headers" className="text-xs font-mono uppercase tracking-wider">Res Headers</TabsTrigger>
              <TabsTrigger value="payload" className="text-xs font-mono uppercase tracking-wider">Payload</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto space-y-4 no-scrollbar">
              <TabsContent value="overview" className="space-y-4 mt-0">
                <div className="p-4 bg-surface-base/50 rounded-sm border border-surface-high/30 space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-primary">Target Metadata</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">HTTP Method</span>
                      <span className="text-foreground font-bold">{log.method}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Content Type</span>
                      <span className="text-foreground font-bold">{log.type || "application/json"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Status Code</span>
                      <span className="text-foreground font-bold">{log.status || "200"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Proxy Latency</span>
                      <span className="text-foreground font-bold">{log.overhead ? `${log.overhead.toFixed(2)}ms` : "< 1ms"}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-surface-base/50 rounded-sm border border-surface-high/30 space-y-2">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-primary">Full Request URL</h4>
                  <div className="p-3 bg-surface-lowest font-mono text-xs break-all text-primary/90 rounded-sm border border-surface-high/20">
                    {log.url || log.path}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="req_headers" className="space-y-2 mt-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                    <ArrowUpRight className="w-3.5 h-3.5 text-primary" /> Request Headers
                  </span>
                </div>
                {log.request_headers && Object.keys(log.request_headers).length > 0 ? (
                  <div className="divide-y divide-surface-high/30 border border-surface-high/30 rounded-sm bg-surface-base/40">
                    {Object.entries(log.request_headers).map(([k, v]) => (
                      <div key={k} className="p-3 flex items-start gap-4 font-mono text-xs">
                        <span className="w-1/3 text-muted-foreground font-bold break-all">{k}</span>
                        <span className="flex-1 text-foreground break-all">{v}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs font-mono text-muted-foreground/40 italic bg-surface-base/30 rounded-sm">
                    No custom request headers recorded
                  </div>
                )}
              </TabsContent>

              <TabsContent value="res_headers" className="space-y-2 mt-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                    <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" /> Response Headers
                  </span>
                </div>
                {log.response_headers && Object.keys(log.response_headers).length > 0 ? (
                  <div className="divide-y divide-surface-high/30 border border-surface-high/30 rounded-sm bg-surface-base/40">
                    {Object.entries(log.response_headers).map(([k, v]) => (
                      <div key={k} className="p-3 flex items-start gap-4 font-mono text-xs">
                        <span className="w-1/3 text-muted-foreground font-bold break-all">{k}</span>
                        <span className="flex-1 text-foreground break-all">{v}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs font-mono text-muted-foreground/40 italic bg-surface-base/30 rounded-sm">
                    No custom response headers recorded
                  </div>
                )}
              </TabsContent>

              <TabsContent value="payload" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-muted-foreground uppercase">Request Body</span>
                  <CodeEditor 
                    height="140px"
                    value={formattedReqBody()}
                    readOnly
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-xs font-mono font-bold text-muted-foreground uppercase">Response Body</span>
                  <CodeEditor 
                    height="200px"
                    value={formattedResBody()}
                    readOnly
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default LogDetailsDrawer;
