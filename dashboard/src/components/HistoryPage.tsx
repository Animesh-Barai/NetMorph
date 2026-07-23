import React, { useState, useEffect } from "react";
import { Search, History, Trash2, Copy, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import LogDetailsDrawer, { SelectedLogDetails } from "./LogDetailsDrawer";
import ConfirmModal from "./ui/ConfirmModal";
import { useToast } from "./ui/ToastContainer";

interface TrafficLog {
  id: string;
  method: string;
  url: string;
  status: number;
  content_type: string;
  latency: number;
  timestamp: string;
  rule_id?: string;
  overhead?: number;
  request_headers?: Record<string, string>;
  response_headers?: Record<string, string>;
  request_body?: string;
  response_body?: string;
}

const MOCK_HISTORICAL_LOGS: TrafficLog[] = [
  {
    id: "hist-01",
    method: "POST",
    url: "https://auth.company.com/oauth/v2/token",
    status: 200,
    content_type: "application/json",
    latency: 18,
    timestamp: new Date(Date.now() - 300000).toISOString(),
    overhead: 2.15,
    request_headers: { "Content-Type": "application/json" },
    response_headers: { "X-Auth-Scope": "full" },
    request_body: '{"grant_type": "client_credentials"}',
    response_body: '{"access_token": "token_abc123"}'
  },
  {
    id: "hist-02",
    method: "GET",
    url: "https://api.company.com/v1/user/profile",
    status: 200,
    content_type: "application/json",
    latency: 12,
    timestamp: new Date(Date.now() - 600000).toISOString(),
    overhead: 0.85,
    request_headers: { "Authorization": "Bearer token_abc123" },
    response_headers: { "Cache-Control": "max-age=60" },
    request_body: "",
    response_body: '{"name": "Dev User", "role": "admin"}'
  },
  {
    id: "hist-03",
    method: "PUT",
    url: "https://api.company.com/v1/user/settings",
    status: 204,
    content_type: "application/json",
    latency: 25,
    timestamp: new Date(Date.now() - 1200000).toISOString(),
    overhead: 1.10,
    request_headers: { "Content-Type": "application/json" },
    response_headers: {},
    request_body: '{"notifications": false}',
    response_body: ""
  },
  {
    id: "hist-04",
    method: "DELETE",
    url: "https://api.company.com/v1/session/expired",
    status: 404,
    content_type: "application/json",
    latency: 45,
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    overhead: 8.50,
    request_headers: { "Authorization": "Bearer invalid" },
    response_headers: {},
    request_body: "",
    response_body: '{"error": "Session Not Found"}'
  }
];

interface HistoryPageProps {
  searchFilter?: string;
  onCreateRule?: (pattern: string) => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ searchFilter = "", onCreateRule }) => {
  const [logs, setLogs] = useState<TrafficLog[]>([]);
  const [filterMethod, setFilterMethod] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchUrl, setSearchUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<SelectedLogDetails | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  const { addToast } = useToast();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterMethod !== "ALL") params.append("method", filterMethod);
      if (filterStatus !== "ALL") params.append("status", filterStatus);
      
      const effectiveSearch = searchFilter || searchUrl;
      if (effectiveSearch) params.append("url", effectiveSearch);

      const res = await fetch(`http://localhost:8000/logs?limit=50&${params.toString()}`);
      if (!res.ok) throw new Error("API Offline");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setLogs(data);
        return;
      }
      setLogs(MOCK_HISTORICAL_LOGS);
    } catch (e) {
      setLogs(MOCK_HISTORICAL_LOGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 300);
    return () => clearTimeout(timer);
  }, [filterMethod, filterStatus, searchUrl, searchFilter]);

  const copyUrl = (e: React.MouseEvent, id: string, url: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleClearConfirm = async () => {
    try {
      await fetch("http://localhost:8000/logs", { method: "DELETE" });
    } catch {
      // offline fallback
    }
    setLogs([]);
    addToast("History Cleared", "Request history cleared", "info");
  };

  return (
    <div className="flex flex-col h-full bg-[#0c0c0e] p-4 sm:p-5 rounded-md border border-[#27272a] shadow-sm w-full min-w-0 font-mono text-xs sm:text-sm">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2.5">
          <History className="w-5 h-5 text-zinc-300" />
          <h2 className="text-base sm:text-lg font-bold text-zinc-100 uppercase tracking-tight">Request History Forensics</h2>
        </div>

        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setIsConfirmClearOpen(true)}
          className="h-8 px-3 text-xs sm:text-sm font-mono text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/40 cursor-pointer"
        >
          <Trash2 className="w-4 h-4 mr-1.5" /> Clear History
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4 bg-[#141417] p-3 sm:p-4 rounded-md border border-[#27272a]">
        <div className="relative col-span-1 sm:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input 
            placeholder="Filter URL pattern..." 
            value={searchUrl}
            onChange={(e) => setSearchUrl(e.target.value)}
            className="h-8 sm:h-9 pl-9 bg-[#09090b] border-[#27272a] text-xs sm:text-sm font-mono"
          />
        </div>

        <Select value={filterMethod} onValueChange={(val) => setFilterMethod(val || "ALL")}>
          <SelectTrigger className="h-8 sm:h-9 bg-[#09090b] border-[#27272a] text-xs sm:text-sm font-mono">
            <SelectValue placeholder="Method" />
          </SelectTrigger>
          <SelectContent className="bg-[#18181b] border-[#27272a] text-xs sm:text-sm font-mono">
            <SelectItem value="ALL">ALL METHODS</SelectItem>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val || "ALL")}>
          <SelectTrigger className="h-8 sm:h-9 bg-[#09090b] border-[#27272a] text-xs sm:text-sm font-mono">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#18181b] border-[#27272a] text-xs sm:text-sm font-mono">
            <SelectItem value="ALL">ALL STATUS</SelectItem>
            <SelectItem value="200">200 OK</SelectItem>
            <SelectItem value="201">201 CREATED</SelectItem>
            <SelectItem value="400">400 BAD REQ</SelectItem>
            <SelectItem value="401">401 UNAUTH</SelectItem>
            <SelectItem value="404">404 NOT FOUND</SelectItem>
            <SelectItem value="500">500 SERVER ERR</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table Container */}
      <div className="flex-1 bg-[#09090b] rounded-md overflow-x-auto overflow-y-auto no-scrollbar border border-[#27272a] w-full min-w-0">
        <Table className="min-w-[700px] w-full text-xs sm:text-sm">
          <TableHeader className="bg-[#141417] sticky top-0 z-10 border-b border-[#27272a]">
            <TableRow className="border-none hover:bg-transparent">
              <th className="px-4 py-2.5 text-left text-xs font-mono text-zinc-400 w-24">Method</th>
              <th className="px-4 py-2.5 text-left text-xs font-mono text-zinc-400">URL Target</th>
              <th className="px-4 py-2.5 text-left text-xs font-mono text-zinc-400 w-32">Status</th>
              <th className="px-4 py-2.5 text-right text-xs font-mono text-zinc-400 w-28">Latency</th>
              <th className="px-4 py-2.5 text-right text-xs font-mono text-zinc-400 w-32">Time</th>
              <th className="w-10"></th>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16 text-zinc-400 font-mono text-xs sm:text-sm">
                  Loading traffic history...
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16 text-zinc-500 font-mono text-xs sm:text-sm italic">
                  No historical records match current filters.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log, idx) => (
                <TableRow 
                  key={log.id} 
                  onClick={() => setSelectedLog(log)}
                  className={cn(
                    "border-b border-[#18181b] hover:bg-[#1c1c21] cursor-pointer transition-colors text-xs sm:text-sm font-mono",
                    idx % 2 === 0 ? "bg-[#0c0c0e]" : "bg-[#111114]"
                  )}
                >
                  <TableCell className="px-4 py-2.5 whitespace-nowrap">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-xs font-mono font-bold uppercase",
                      log.method === "GET" && "badge-get",
                      log.method === "POST" && "badge-post",
                      log.method === "PUT" && "badge-put",
                      log.method === "DELETE" && "badge-delete"
                    )}>
                      {log.method}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-2.5 max-w-[160px] sm:max-w-[260px] md:max-w-[380px] lg:max-w-[500px] truncate font-mono text-xs sm:text-sm text-zinc-200 hover:text-indigo-400 transition-colors font-medium">
                    {log.url}
                  </TableCell>

                  <TableCell className="px-4 py-2.5 font-mono text-xs sm:text-sm whitespace-nowrap font-bold">
                    <span className={cn(
                      log.status >= 200 && log.status < 300 ? "text-emerald-400" :
                      log.status >= 400 ? "text-rose-400" : "text-amber-400"
                    )}>
                      {log.status}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-2.5 text-right font-mono text-xs sm:text-sm text-zinc-300 whitespace-nowrap font-semibold">
                    {log.overhead !== undefined ? `${log.overhead.toFixed(2)} ms` : "-"}
                  </TableCell>

                  <TableCell className="px-4 py-2.5 text-right text-xs font-mono text-zinc-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </TableCell>

                  <TableCell className="pr-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => copyUrl(e, log.id, log.url)}
                        className="p-1 text-zinc-400 hover:text-zinc-100 rounded hover:bg-[#27272a]"
                        title="Copy URL"
                      >
                        {copiedId === log.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Drawer */}
      <LogDetailsDrawer
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
        onCreateRule={onCreateRule}
      />

      {/* Confirm Wipe Modal */}
      <ConfirmModal
        open={isConfirmClearOpen}
        onOpenChange={setIsConfirmClearOpen}
        title="Clear Traffic History"
        description="Are you sure you want to delete all stored traffic logs?"
        confirmText="Clear History"
        onConfirm={handleClearConfirm}
      />
    </div>
  );
};

export default HistoryPage;
